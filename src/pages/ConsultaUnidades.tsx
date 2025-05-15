import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pencil, Trash2, Check, X, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

type Unidade = {
  id: string;
  unidade: string;
  created_at: string;
};

function ConsultaUnidades() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Unidade>>({});
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchUnidades();
  }, []);

  const fetchUnidades = async () => {
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .order('unidade');

      if (error) throw error;
      setUnidades(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao buscar unidades:', error);
      setError('Erro ao carregar os dados: ' + error.message);
    }
  };

  const startEditing = (unidade: Unidade) => {
    setEditingId(unidade.id);
    setEditForm(unidade);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.unidade) return;

    try {
      const { error } = await supabase
        .from('unidades')
        .update({ unidade: editForm.unidade })
        .eq('id', editingId);

      if (error) throw error;

      await fetchUnidades();
      setEditingId(null);
      setEditForm({});
      setError(null);
    } catch (error: any) {
      setError('Erro ao atualizar unidade: ' + error.message);
    }
  };

  const deleteUnidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;

    try {
      // First delete all related retornados records
      const { error: retornadosError } = await supabase
        .from('retornados')
        .delete()
        .eq('unidade_id', id);

      if (retornadosError) throw retornadosError;

      // Then delete the unidade
      const { error: unidadeError } = await supabase
        .from('unidades')
        .delete()
        .eq('id', id);

      if (unidadeError) throw unidadeError;

      await fetchUnidades();
      setError(null);
    } catch (error: any) {
      setError('Erro ao excluir unidade: ' + error.message);
    }
  };

  const exportToExcel = () => {
    // Define headers
    const headers = [
      'Unidade',
      'Data de Cadastro'
    ];

    const exportData = unidades.map(unidade => ({
      'Unidade': unidade.unidade,
      'Data de Cadastro': new Date(unidade.created_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Unidades');
    
    XLSX.writeFile(wb, 'unidades.xlsx');
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert the worksheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            setError('Arquivo vazio ou formato inválido');
            setIsImporting(false);
            return;
          }

          // Process each row and insert into database
          let importedCount = 0;
          let skippedCount = 0;
          for (const row of jsonData) {
            const unidadeNome = row['Unidade'];
            
            if (!unidadeNome) {
              skippedCount++;
              continue;
            }

            // Check if the unidade already exists
            const { data: existingUnidades } = await supabase
              .from('unidades')
              .select('id')
              .eq('unidade', unidadeNome);

            if (existingUnidades && existingUnidades.length > 0) {
              console.log(`Unidade já existe: ${unidadeNome}`);
              skippedCount++;
              continue;
            }

            // Insert the record
            const { error: insertError } = await supabase
              .from('unidades')
              .insert({ unidade: unidadeNome });

            if (insertError) {
              console.error(`Erro ao inserir unidade '${unidadeNome}':`, insertError);
              skippedCount++;
            } else {
              importedCount++;
            }
          }
          
          // Refresh data
          await fetchUnidades();
          alert(`Importação concluída! ${importedCount} unidades importadas, ${skippedCount} ignoradas.`);
          event.target.value = ''; // Reset the file input
        } catch (error: any) {
          console.error('Erro ao processar arquivo:', error);
          setError(`Erro ao processar arquivo: ${error.message}`);
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      setError(`Erro ao importar arquivo: ${error.message}`);
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Consulta de Unidades</h2>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <div className="relative">
              <input
                type="file"
                id="fileImport"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <button
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isImporting}
              >
                <Upload className="w-4 h-4" />
                {isImporting ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Unidade</th>
              <th className="px-6 py-3">Data de Cadastro</th>
              <th className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map((unidade) => (
              <tr key={unidade.id} className="bg-white border-b hover:bg-gray-50">
                {editingId === unidade.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        name="unidade"
                        value={editForm.unidade || ''}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {new Date(unidade.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">{unidade.unidade}</td>
                    <td className="px-6 py-4">
                      {new Date(unidade.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(unidade)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteUnidade(unidade.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConsultaUnidades;