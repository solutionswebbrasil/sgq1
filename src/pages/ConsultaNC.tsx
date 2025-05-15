import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Search, Download, Pencil, Trash2, Check, X, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

type NC = {
  id: string;
  numero: string;
  data_abertura: string;
  responsavel_abertura: string;
  descricao: string;
  tipo: 'Produto' | 'Processo' | 'Sistema' | 'Cliente';
  gravidade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  departamento: string;
  analise_causa: string;
  acao_imediata: string;
  responsavel_acao: string;
  prazo_conclusao: string;
  evidencia_solucao: string;
  status: 'Aberta' | 'Em andamento' | 'Concluída' | 'Rejeitada';
  data_encerramento: string;
  created_at: string;
};

type EditFormData = {
  responsavel_abertura: string;
  descricao: string;
  tipo: NC['tipo'];
  gravidade: NC['gravidade'];
  departamento: string;
  analise_causa: string;
  acao_imediata: string;
  responsavel_acao: string;
  prazo_conclusao: string;
  evidencia_solucao: string;
};

function ConsultaNC() {
  const [ncs, setNCs] = useState<NC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    gravidade: '',
    tipo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showConclusionModal, setShowConclusionModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState<NC | null>(null);
  const [conclusionDetails, setConclusionDetails] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchNCs();
  }, []);

  const fetchNCs = async () => {
    try {
      const { data, error } = await supabase
        .from('nao_conformidades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNCs(data || []);
      setLoading(false);
    } catch (error: any) {
      setError('Erro ao carregar NCs: ' + error.message);
      setLoading(false);
    }
  };

  const handleStatusChange = async (nc: NC, newStatus: NC['status']) => {
    if (newStatus === 'Concluída') {
      setSelectedNC(nc);
      setShowConclusionModal(true);
      return;
    }

    try {
      const updates = {
        status: newStatus,
        data_encerramento: newStatus === 'Concluída' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('nao_conformidades')
        .update(updates)
        .eq('id', nc.id);

      if (error) throw error;

      await fetchNCs();
    } catch (error: any) {
      setError('Erro ao atualizar status: ' + error.message);
    }
  };

  const handleConclusionSubmit = async () => {
    if (!selectedNC) return;

    try {
      const { error } = await supabase
        .from('nao_conformidades')
        .update({
          status: 'Concluída',
          data_encerramento: new Date().toISOString(),
          evidencia_solucao: conclusionDetails
        })
        .eq('id', selectedNC.id);

      if (error) throw error;

      await fetchNCs();
      setShowConclusionModal(false);
      setSelectedNC(null);
      setConclusionDetails('');
    } catch (error: any) {
      setError('Erro ao concluir NC: ' + error.message);
    }
  };

  const startEditing = (nc: NC) => {
    setSelectedNC(nc);
    setEditForm({
      responsavel_abertura: nc.responsavel_abertura,
      descricao: nc.descricao,
      tipo: nc.tipo,
      gravidade: nc.gravidade,
      departamento: nc.departamento,
      analise_causa: nc.analise_causa || '',
      acao_imediata: nc.acao_imediata || '',
      responsavel_acao: nc.responsavel_acao || '',
      prazo_conclusao: nc.prazo_conclusao || '',
      evidencia_solucao: nc.evidencia_solucao || ''
    });
    setIsEditing(true);
  };

  const handleEditChange = (field: keyof EditFormData, value: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const saveEdit = async () => {
    if (!selectedNC || !editForm) return;

    try {
      const { error } = await supabase
        .from('nao_conformidades')
        .update(editForm)
        .eq('id', selectedNC.id);

      if (error) throw error;

      await fetchNCs();
      setIsEditing(false);
      setSelectedNC(null);
      setEditForm(null);
    } catch (error: any) {
      setError('Erro ao atualizar NC: ' + error.message);
    }
  };

  const deleteNC = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta NC?')) return;

    try {
      const { error } = await supabase
        .from('nao_conformidades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNCs();
    } catch (error: any) {
      setError('Erro ao excluir NC: ' + error.message);
    }
  };

  const exportToExcel = () => {
    // Define headers
    const headers = [
      'Número',
      'Data de Abertura',
      'Responsável',
      'Departamento',
      'Tipo',
      'Gravidade',
      'Status',
      'Descrição',
      'Causa Raiz',
      'Ação Imediata',
      'Responsável Ação',
      'Prazo',
      'Data Encerramento',
      'Evidência da Solução'
    ];

    const exportData = filteredNCs.map(nc => ({
      'Número': nc.numero,
      'Data de Abertura': new Date(nc.data_abertura).toLocaleDateString('pt-BR'),
      'Responsável': nc.responsavel_abertura,
      'Departamento': nc.departamento,
      'Tipo': nc.tipo,
      'Gravidade': nc.gravidade,
      'Status': nc.status,
      'Descrição': nc.descricao,
      'Causa Raiz': nc.analise_causa,
      'Ação Imediata': nc.acao_imediata,
      'Responsável Ação': nc.responsavel_acao,
      'Prazo': nc.prazo_conclusao ? new Date(nc.prazo_conclusao).toLocaleDateString('pt-BR') : '',
      'Data Encerramento': nc.data_encerramento ? new Date(nc.data_encerramento).toLocaleDateString('pt-BR') : '',
      'Evidência da Solução': nc.evidencia_solucao
    }));

    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Não Conformidades');
    XLSX.writeFile(wb, 'nao-conformidades.xlsx');
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

          // Função para gerar número de NC
          const generateNCNumber = async () => {
            const { data, error } = await supabase.rpc('generate_nc_number');
            if (error) throw error;
            return data;
          };

          // Process each row and insert into database
          let successCount = 0;
          for (const row of jsonData) {
            // Check for required fields
            if (!row['Responsável'] || !row['Descrição'] || !row['Tipo'] || 
                !row['Gravidade'] || !row['Departamento']) {
              console.warn('Registro ignorado por falta de campos obrigatórios', row);
              continue;
            }

            // Generate NC number
            const ncNumber = await generateNCNumber();

            // Prepare NC data
            const ncData = {
              numero: ncNumber,
              responsavel_abertura: row['Responsável'],
              descricao: row['Descrição'],
              tipo: row['Tipo'],
              gravidade: row['Gravidade'],
              departamento: row['Departamento'],
              analise_causa: row['Causa Raiz'] || null,
              acao_imediata: row['Ação Imediata'] || null,
              responsavel_acao: row['Responsável Ação'] || null,
              prazo_conclusao: row['Prazo'] || null,
              status: row['Status'] || 'Aberta',
              evidencia_solucao: row['Evidência da Solução'] || null,
            };

            // Insert the record
            const { error: insertError } = await supabase
              .from('nao_conformidades')
              .insert(ncData);

            if (insertError) {
              console.error('Erro ao inserir NC:', insertError);
            } else {
              successCount++;
            }
          }
          
          // Refresh data
          await fetchNCs();
          alert(`Importação concluída! ${successCount} não conformidades importadas com sucesso.`);
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

  const filteredNCs = ncs.filter(nc => {
    const matchesSearch = 
      nc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.responsavel_abertura.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.status || nc.status === filters.status) &&
      (!filters.gravidade || nc.gravidade === filters.gravidade) &&
      (!filters.tipo || nc.tipo === filters.tipo);

    return matchesSearch && matchesFilters;
  });

  const getStatusColor = (status: NC['status']) => {
    switch (status) {
      case 'Aberta': return 'bg-yellow-100 text-yellow-800';
      case 'Em andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluída': return 'bg-green-100 text-green-800';
      case 'Rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGravidadeColor = (gravidade: NC['gravidade']) => {
    switch (gravidade) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Crítica': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h2 className="text-2xl font-semibold text-gray-800">Consulta de Não Conformidades</h2>
        </div>
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

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número, descrição ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos os Status</option>
            <option value="Aberta">Aberta</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Rejeitada">Rejeitada</option>
          </select>
          <select
            value={filters.gravidade}
            onChange={(e) => setFilters(prev => ({ ...prev, gravidade: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todas as Gravidades</option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
          <select
            value={filters.tipo}
            onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos os Tipos</option>
            <option value="Produto">Produto</option>
            <option value="Processo">Processo</option>
            <option value="Sistema">Sistema</option>
            <option value="Cliente">Cliente</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Gravidade</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredNCs.map((nc) => (
              <tr key={nc.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{nc.numero}</td>
                <td className="px-4 py-3">
                  {new Date(nc.data_abertura).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">{nc.responsavel_abertura}</td>
                <td className="px-4 py-3">{nc.tipo}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGravidadeColor(nc.gravidade)}`}>
                    {nc.gravidade}
                  </span>
                </td>
                <td className="px-4 py-3">{nc.departamento}</td>
                <td className="px-4 py-3">
                  <select
                    value={nc.status}
                    onChange={(e) => handleStatusChange(nc, e.target.value as NC['status'])}
                    className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(nc.status)}`}
                  >
                    <option value="Aberta">Aberta</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Rejeitada">Rejeitada</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  {nc.prazo_conclusao ? new Date(nc.prazo_conclusao).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(nc)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteNC(nc.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Conclusão */}
      {showConclusionModal && selectedNC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Concluir NC - {selectedNC.numero}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evidência da Solução
              </label>
              <textarea
                value={conclusionDetails}
                onChange={(e) => setConclusionDetails(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Descreva as evidências da solução implementada..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConclusionModal(false);
                  setSelectedNC(null);
                  setConclusionDetails('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConclusionSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Concluir NC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditing && selectedNC && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar NC - {selectedNC.numero}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável pela Abertura
                  </label>
                  <input
                    type="text"
                    value={editForm.responsavel_abertura}
                    onChange={(e) => handleEditChange('responsavel_abertura', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={editForm.departamento}
                    onChange={(e) => handleEditChange('departamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={editForm.tipo}
                    onChange={(e) => handleEditChange('tipo', e.target.value as NC['tipo'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Produto">Produto</option>
                    <option value="Processo">Processo</option>
                    <option value="Sistema">Sistema</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gravidade
                  </label>
                  <select
                    value={editForm.gravidade}
                    onChange={(e) => handleEditChange('gravidade', e.target.value as NC['gravidade'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editForm.descricao}
                  onChange={(e) => handleEditChange('descricao', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Análise da Causa
                </label>
                <textarea
                  value={editForm.analise_causa}
                  onChange={(e) => handleEditChange('analise_causa', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ação Imediata
                </label>
                <textarea
                  value={editForm.acao_imediata}
                  onChange={(e) => handleEditChange('acao_imediata', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável pela Ação
                  </label>
                  <input
                    type="text"
                    value={editForm.responsavel_acao}
                    onChange={(e) => handleEditChange('responsavel_acao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prazo para Conclusão
                  </label>
                  <input
                    type="date"
                    value={editForm.prazo_conclusao}
                    onChange={(e) => handleEditChange('prazo_conclusao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidência da Solução
                </label>
                <textarea
                  value={editForm.evidencia_solucao}
                  onChange={(e) => handleEditChange('evidencia_solucao', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedNC(null);
                  setEditForm(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsultaNC;