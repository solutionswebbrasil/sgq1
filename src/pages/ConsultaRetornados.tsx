import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pencil, Trash2, Check, X, DollarSign, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

type Retornado = {
  id: string;
  id_cliente: number;
  toner_id: string;
  peso_retornado: number;
  unidade_id: string;
  destino_final: 'Descarte' | 'Garantia' | 'Estoque' | 'Uso Interno';
  created_at: string;
  toner: {
    modelo: string;
    peso_cheio: number;
    peso_vazio: number;
    impressoras_compativeis: string;
    cor: 'Black' | 'Cyan' | 'Magenta' | 'Yellow';
    area_impressa_iso: number;
    capacidade_folhas: number;
    tipo: 'Compatível' | 'Original';
    preco_folha: number;
  };
  unidade: {
    unidade: string;
  };
};

type EditFormData = {
  id_cliente: number;
  peso_retornado: number;
  destino_final: 'Descarte' | 'Garantia' | 'Estoque' | 'Uso Interno';
};

function ConsultaRetornados() {
  const [retornados, setRetornados] = useState<Retornado[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchRetornados();
  }, [startDate, endDate]);

  const fetchRetornados = async () => {
    try {
      let query = supabase
        .from('retornados')
        .select(`
          *,
          toner:toner_id (
            modelo,
            peso_cheio,
            peso_vazio,
            impressoras_compativeis,
            cor,
            area_impressa_iso,
            capacidade_folhas,
            tipo,
            preco_folha
          ),
          unidade:unidade_id (
            unidade
          )
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setRetornados(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao buscar retornados:', error);
      setError('Erro ao carregar os dados');
    }
  };

  const exportToExcel = () => {
    // Create the header row
    const headers = [
      'ID Cliente',
      'Modelo',
      'Peso Cheio', 
      'Impressoras Compatíveis',
      'Cor',
      'Área ISO',
      'Capacidade',
      'Tipo',
      'Peso Retornado',
      'Unidade',
      'Destino',
      'Valor Recuperado',
      'Data'
    ];

    // Create the data rows
    const exportData = retornados.map(retornado => ({
      'ID Cliente': retornado.id_cliente,
      'Modelo': retornado.toner.modelo,
      'Peso Cheio': retornado.toner.peso_cheio,
      'Impressoras Compatíveis': retornado.toner.impressoras_compativeis,
      'Cor': retornado.toner.cor,
      'Área ISO': `${retornado.toner.area_impressa_iso * 100}%`,
      'Capacidade': retornado.toner.capacidade_folhas,
      'Tipo': retornado.toner.tipo,
      'Peso Retornado': retornado.peso_retornado,
      'Unidade': retornado.unidade.unidade,
      'Destino': retornado.destino_final,
      'Valor Recuperado': retornado.destino_final === 'Estoque' ? 
        retornado.toner.preco_folha * 10000 : 0,
      'Data': new Date(retornado.created_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Retornados');
    
    const filename = startDate && endDate
      ? `retornados_${startDate}_a_${endDate}.xlsx`
      : 'retornados.xlsx';
    
    XLSX.writeFile(wb, filename);
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      setIsImporting(true);
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
          for (const row of jsonData) {
            // First, find the toner_id by modelo
            const { data: tonerData, error: tonerError } = await supabase
              .from('toners')
              .select('id')
              .eq('modelo', row['Modelo'])
              .single();

            if (tonerError) {
              console.error(`Erro ao buscar toner para modelo ${row['Modelo']}:`, tonerError);
              continue;
            }

            // Then find the unidade_id by unidade name
            const { data: unidadeData, error: unidadeError } = await supabase
              .from('unidades')
              .select('id')
              .eq('unidade', row['Unidade'])
              .single();

            if (unidadeError) {
              console.error(`Erro ao buscar unidade ${row['Unidade']}:`, unidadeError);
              continue;
            }

            // Insert the record
            const { error: insertError } = await supabase
              .from('retornados')
              .insert({
                id_cliente: row['ID Cliente'],
                toner_id: tonerData.id,
                peso_retornado: row['Peso Retornado'],
                unidade_id: unidadeData.id,
                destino_final: row['Destino']
              });

            if (insertError) {
              console.error('Erro ao inserir retornado:', insertError);
            }
          }
          
          // Refresh data
          await fetchRetornados();
          setIsImporting(false);
          event.target.value = ''; // Reset the file input
        } catch (error: any) {
          setError(`Erro ao processar arquivo: ${error.message}`);
          setIsImporting(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      setError(`Erro ao importar arquivo: ${error.message}`);
      setIsImporting(false);
    }
  };

  const startEditing = (retornado: Retornado) => {
    setEditingId(retornado.id);
    setEditForm({
      id_cliente: retornado.id_cliente,
      peso_retornado: retornado.peso_retornado,
      destino_final: retornado.destino_final,
    });
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
    setError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editForm) return;

    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'id_cliente' || name === 'peso_retornado' ? Number(value) : value,
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;

    try {
      const { error } = await supabase
        .from('retornados')
        .update({
          id_cliente: editForm.id_cliente,
          peso_retornado: editForm.peso_retornado,
          destino_final: editForm.destino_final,
        })
        .eq('id', editingId);

      if (error) throw error;

      await fetchRetornados();
      setEditingId(null);
      setEditForm(null);
      setError(null);
    } catch (error: any) {
      setError('Erro ao atualizar registro: ' + error.message);
    }
  };

  const deleteRetornado = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const { error } = await supabase
        .from('retornados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchRetornados();
      setError(null);
    } catch (error: any) {
      setError('Erro ao excluir registro: ' + error.message);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateRecoveredValue = (retornado: Retornado) => {
    if (retornado.destino_final === 'Estoque') {
      return retornado.toner.preco_folha * 10000;
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Consulta de Retornados</h2>
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isImporting}
              >
                <Upload className="w-4 h-4" />
                {isImporting ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">ID Cliente</th>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Peso Cheio</th>
              <th className="px-4 py-3">Impressoras</th>
              <th className="px-4 py-3">Cor</th>
              <th className="px-4 py-3">Área ISO</th>
              <th className="px-4 py-3">Capacidade</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Peso Retornado</th>
              <th className="px-4 py-3">Unidade</th>
              <th className="px-4 py-3">Destino</th>
              <th className="px-4 py-3">Valor Recuperado</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {retornados.map((retornado) => (
              <tr key={retornado.id} className="bg-white border-b hover:bg-gray-50">
                {editingId === retornado.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        name="id_cliente"
                        value={editForm?.id_cliente || ''}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{retornado.toner.modelo}</td>
                    <td className="px-4 py-3">{retornado.toner.peso_cheio}g</td>
                    <td className="px-4 py-3">{retornado.toner.impressoras_compativeis}</td>
                    <td className="px-4 py-3">{retornado.toner.cor}</td>
                    <td className="px-4 py-3">{retornado.toner.area_impressa_iso * 100}%</td>
                    <td className="px-4 py-3">{retornado.toner.capacidade_folhas}</td>
                    <td className="px-4 py-3">{retornado.toner.tipo}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        name="peso_retornado"
                        value={editForm?.peso_retornado || ''}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{retornado.unidade.unidade}</td>
                    <td className="px-4 py-3">
                      <select
                        name="destino_final"
                        value={editForm?.destino_final || ''}
                        onChange={handleEditChange}
                        className="w-32 px-2 py-1 border rounded"
                      >
                        <option value="Descarte">Descarte</option>
                        <option value="Garantia">Garantia</option>
                        <option value="Estoque">Estoque</option>
                        <option value="Uso Interno">Uso Interno</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {editForm?.destino_final === 'Estoque' ? (
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatCurrency(retornado.toner.preco_folha * 10000)}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">{formatDate(retornado.created_at)}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">{retornado.id_cliente}</td>
                    <td className="px-4 py-3">{retornado.toner.modelo}</td>
                    <td className="px-4 py-3">{retornado.toner.peso_cheio}g</td>
                    <td className="px-4 py-3">{retornado.toner.impressoras_compativeis}</td>
                    <td className="px-4 py-3">{retornado.toner.cor}</td>
                    <td className="px-4 py-3">{retornado.toner.area_impressa_iso * 100}%</td>
                    <td className="px-4 py-3">{retornado.toner.capacidade_folhas}</td>
                    <td className="px-4 py-3">{retornado.toner.tipo}</td>
                    <td className="px-4 py-3">{retornado.peso_retornado}g</td>
                    <td className="px-4 py-3">{retornado.unidade.unidade}</td>
                    <td className="px-4 py-3">{retornado.destino_final}</td>
                    <td className="px-4 py-3">
                      {retornado.destino_final === 'Estoque' ? (
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatCurrency(calculateRecoveredValue(retornado))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">{formatDate(retornado.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(retornado)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteRetornado(retornado.id)}
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

export default ConsultaRetornados;