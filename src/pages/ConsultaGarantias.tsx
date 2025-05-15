import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPasswordModal from '../components/AdminPasswordModal';
import { useAdminPassword } from '../hooks/useAdminPassword';
import * as XLSX from 'xlsx';

interface Garantia {
  id: string;
  solicitante: string;
  data_solicitacao: string;
  codigo_produto: string;
  numero_serie: string;
  tipo: string;
  nf_compra: string;
  nf_remessa: string;
  nf_devolucao: string;
  nf_compra_chave: string;
  nf_remessa_chave: string;
  nf_devolucao_chave: string;
  data_garantia: string;
  numero_ticket: string;
  status: string;
  fornecedor: string;
  quantidade: number;
  observacao_defeito: string;
  valor_total: number;
}

function ConsultaGarantias() {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGarantia, setEditingGarantia] = useState<Garantia | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedGarantiaId, setSelectedGarantiaId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyAdminPassword } = useAdminPassword();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGarantias();
  }, []);

  async function fetchGarantias() {
    try {
      const { data, error } = await supabase
        .from('garantias')
        .select('*')
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;
      setGarantias(data || []);
    } catch (error) {
      console.error('Error fetching garantias:', error);
      setError('Erro ao carregar garantias');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (garantia: Garantia) => {
    setEditingGarantia(garantia);
    setSelectedGarantiaId(garantia.id);
    setActionType('edit');
    setShowAdminModal(true);
  };

  const handleDelete = (id: string) => {
    setSelectedGarantiaId(id);
    setActionType('delete');
    setShowAdminModal(true);
  };

  const handleAdminPasswordVerified = async () => {
    if (actionType === 'edit' && selectedGarantiaId) {
      navigate(`/registro-garantias/${selectedGarantiaId}`);
    } else if (actionType === 'delete' && selectedGarantiaId) {
      try {
        const { error } = await supabase
          .from('garantias')
          .delete()
          .eq('id', selectedGarantiaId);

        if (error) throw error;
        fetchGarantias();
      } catch (error) {
        console.error('Error deleting garantia:', error);
        setError('Erro ao excluir garantia');
      }
    }
    setShowAdminModal(false);
    setSelectedGarantiaId(null);
    setActionType(null);
  };

  const exportToCSV = () => {
    // Define headers
    const headers = [
      'Solicitante',
      'Data Solicitação',
      'Código Produto',
      'Número Série',
      'Tipo',
      'NF Compra',
      'NF Remessa',
      'NF Devolução',
      'Data Garantia',
      'Número Ticket',
      'Status',
      'Fornecedor',
      'Quantidade',
      'Observação Defeito',
      'Valor Total'
    ];

    // Create data array for export
    const exportData = garantias.map(garantia => ({
      'Solicitante': garantia.solicitante || '',
      'Data Solicitação': garantia.data_solicitacao || '',
      'Código Produto': garantia.codigo_produto || '',
      'Número Série': garantia.numero_serie || '',
      'Tipo': garantia.tipo || '',
      'NF Compra': garantia.nf_compra || '',
      'NF Remessa': garantia.nf_remessa || '',
      'NF Devolução': garantia.nf_devolucao || '',
      'Data Garantia': garantia.data_garantia || '',
      'Número Ticket': garantia.numero_ticket || '',
      'Status': garantia.status || '',
      'Fornecedor': garantia.fornecedor || '',
      'Quantidade': garantia.quantidade || 0,
      'Observação Defeito': garantia.observacao_defeito || '',
      'Valor Total': garantia.valor_total || 0
    }));

    // Create worksheet with headers
    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    
    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Garantias');
    
    // Write to file and trigger download
    XLSX.writeFile(wb, 'garantias.xlsx');
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
          for (const row of jsonData) {
            // Map the data from Excel to the garantias table format
            const garantiaData = {
              solicitante: row['Solicitante'] || '',
              data_solicitacao: row['Data Solicitação'] || null,
              codigo_produto: row['Código Produto'] || '',
              numero_serie: row['Número Série'] || '',
              tipo: row['Tipo'] || null,
              nf_compra: row['NF Compra'] || '',
              nf_remessa: row['NF Remessa'] || '',
              nf_devolucao: row['NF Devolução'] || '',
              nf_compra_chave: row['Chave NF Compra'] || '',
              nf_remessa_chave: row['Chave NF Remessa'] || '',
              nf_devolucao_chave: row['Chave NF Devolução'] || '',
              data_garantia: row['Data Garantia'] || null,
              numero_ticket: row['Número Ticket'] || '',
              status: row['Status'] || 'Aberta',
              fornecedor: row['Fornecedor'] || '',
              quantidade: row['Quantidade'] || 1,
              observacao_defeito: row['Observação Defeito'] || '',
              valor_total: row['Valor Total'] || 0
            };

            // Insert the record
            const { error: insertError } = await supabase
              .from('garantias')
              .insert(garantiaData);

            if (insertError) {
              console.error('Erro ao inserir garantia:', insertError);
            }
          }
          
          // Refresh data
          await fetchGarantias();
          alert(`Importação concluída com sucesso! ${jsonData.length} registros importados.`);
        } catch (error: any) {
          console.error('Error processing file:', error);
          setError(`Erro ao processar arquivo: ${error.message}`);
        } finally {
          setIsImporting(false);
          event.target.value = ''; // Reset the file input
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      setError(`Erro ao importar arquivo: ${error.message}`);
      setIsImporting(false);
    }
  };

  const filteredGarantias = garantias.filter(garantia =>
    Object.values(garantia).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consulta de Garantias</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
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
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isImporting}
            >
              <Upload className="w-4 h-4 mr-2" />
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

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data Solicitação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Número Série</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredGarantias.map((garantia) => (
              <tr key={garantia.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{garantia.solicitante}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{garantia.data_solicitacao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{garantia.codigo_produto}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{garantia.numero_serie}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{garantia.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {garantia.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(garantia)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(garantia.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPasswordModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerified={handleAdminPasswordVerified}
      />
    </div>
  );
}

export default ConsultaGarantias;