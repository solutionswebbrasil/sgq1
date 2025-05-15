import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClipboardCheck, Save } from 'lucide-react';

type FormularioAuditoria = {
  id: string;
  titulo: string;
  auditor: string;
  data_auditoria: string;
  unidade_id: string;
  link_evidencias: string;
  observacoes_gap: string;
  observacoes_melhorias: string;
  assinatura_responsavel: string;
  subtitulos: {
    id: string;
    titulo: string;
    ordem: number;
    itens: {
      id: string;
      descricao: string;
      ordem: number;
      conformidade: string;
      porcentagem: number | null;
      observacao: string;
    }[];
  }[];
};

type Unidade = {
  id: string;
  unidade: string;
};

function RegistroAuditoria() {
  const navigate = useNavigate();
  const [formularios, setFormularios] = useState<{ id: string; titulo: string; }[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [selectedFormulario, setSelectedFormulario] = useState<FormularioAuditoria | null>(null);
  const [formData, setFormData] = useState({
    auditor: '',
    data_auditoria: '',
    unidade_id: '',
    link_evidencias: '',
    observacoes_gap: '',
    observacoes_melhorias: '',
    assinatura_responsavel: ''
  });
  const [respostas, setRespostas] = useState<Record<string, { conforme: boolean; porcentagem?: number; observacao: string; }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchFormularios();
    fetchUnidades();
  }, []);

  const fetchUnidades = async () => {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .order('unidade');

    if (error) {
      console.error('Erro ao buscar unidades:', error);
      return;
    }

    setUnidades(data || []);
  };

  const fetchFormularios = async () => {
    try {
      const { data, error } = await supabase
        .from('formularios_auditoria')
        .select('id, titulo')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFormularios(data || []);
      setLoading(false);
    } catch (error: any) {
      setError('Erro ao carregar formulários: ' + error.message);
      setLoading(false);
    }
  };

  const fetchFormularioCompleto = async (id: string) => {
    try {
      // Fetch form details
      const { data: formulario, error: formularioError } = await supabase
        .from('formularios_auditoria')
        .select('*')
        .eq('id', id)
        .single();

      if (formularioError) throw formularioError;

      // Fetch subtitles
      const { data: subtitulos, error: subtitulosError } = await supabase
        .from('subtitulos_auditoria')
        .select('id, titulo, ordem')
        .eq('formulario_id', id)
        .order('ordem');

      if (subtitulosError) throw subtitulosError;

      // Fetch items for each subtitle
      const subtitulosComItens = await Promise.all(
        subtitulos.map(async (subtitulo) => {
          const { data: itens, error: itensError } = await supabase
            .from('itens_auditoria')
            .select('*')
            .eq('subtitulo_id', subtitulo.id)
            .order('ordem');

          if (itensError) throw itensError;

          return {
            ...subtitulo,
            itens: itens || []
          };
        })
      );

      setSelectedFormulario({
        ...formulario,
        subtitulos: subtitulosComItens
      });

      // Initialize respostas state
      const respostasIniciais: Record<string, { conforme: boolean; porcentagem?: number; observacao: string; }> = {};
      subtitulosComItens.forEach(subtitulo => {
        subtitulo.itens.forEach(item => {
          respostasIniciais[item.id] = {
            conforme: true,
            porcentagem: item.conformidade === 'porcentagem' ? 0 : undefined,
            observacao: ''
          };
        });
      });
      setRespostas(respostasIniciais);

    } catch (error: any) {
      setError('Erro ao carregar formulário: ' + error.message);
    }
  };

  const handleFormularioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      fetchFormularioCompleto(id);
    } else {
      setSelectedFormulario(null);
    }
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRespostaChange = (
    itemId: string,
    field: 'conforme' | 'porcentagem' | 'observacao',
    value: boolean | number | string
  ) => {
    setRespostas(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormulario) return;

    try {
      // Create registro
      const { data: registro, error: registroError } = await supabase
        .from('registros_auditoria')
        .insert([{
          formulario_id: selectedFormulario.id,
          responsavel: formData.auditor,
          local: formData.unidade_id,
          link_evidencias: formData.link_evidencias,
          sugestao_melhorias: formData.observacoes_melhorias
        }])
        .select()
        .single();

      if (registroError) throw registroError;

      // Create respostas
      const respostasArray = Object.entries(respostas).map(([itemId, resposta]) => ({
        registro_id: registro.id,
        item_id: itemId,
        conforme: resposta.conforme,
        observacao: resposta.observacao
      }));

      const { error: respostasError } = await supabase
        .from('respostas_auditoria')
        .insert(respostasArray);

      if (respostasError) throw respostasError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/consulta-auditorias');
      }, 2000);

    } catch (error: any) {
      setError('Erro ao salvar auditoria: ' + error.message);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardCheck className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-semibold text-gray-800">Registro de Auditoria</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          Auditoria registrada com sucesso! Redirecionando...
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selecione o Formulário
        </label>
        <select
          onChange={handleFormularioChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Selecione um formulário</option>
          {formularios.map((formulario) => (
            <option key={formulario.id} value={formulario.id}>
              {formulario.titulo}
            </option>
          ))}
        </select>
      </div>

      {selectedFormulario && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cabeçalho */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Auditoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Auditor
                </label>
                <input
                  type="text"
                  name="auditor"
                  value={formData.auditor}
                  onChange={handleFormDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Auditoria
                </label>
                <input
                  type="date"
                  name="data_auditoria"
                  value={formData.data_auditoria}
                  onChange={handleFormDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade a ser Auditada
                </label>
                <select
                  name="unidade_id"
                  value={formData.unidade_id}
                  onChange={handleFormDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Selecione uma unidade</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.unidade}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Subtítulos e Itens */}
          {selectedFormulario.subtitulos.map((subtitulo) => (
            <div key={subtitulo.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {subtitulo.titulo}
              </h3>

              <div className="space-y-4">
                {subtitulo.itens.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-64">
                      <p className="text-sm font-medium text-gray-700">{item.descricao}</p>
                    </div>

                    {item.conformidade === 'porcentagem' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={respostas[item.id]?.porcentagem || 0}
                          onChange={(e) => handleRespostaChange(item.id, 'porcentagem', Number(e.target.value))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={respostas[item.id]?.conforme}
                            onChange={() => handleRespostaChange(item.id, 'conforme', true)}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">Conforme</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={!respostas[item.id]?.conforme}
                            onChange={() => handleRespostaChange(item.id, 'conforme', false)}
                            className="form-radio h-4 w-4 text-red-600"
                          />
                          <span className="ml-2">Não Conforme</span>
                        </label>
                      </div>
                    )}

                    <input
                      type="text"
                      value={respostas[item.id]?.observacao || ''}
                      onChange={(e) => handleRespostaChange(item.id, 'observacao', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Observação"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Rodapé */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link de Evidências
              </label>
              <input
                type="text"
                name="link_evidencias"
                value={formData.link_evidencias}
                onChange={handleFormDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Cole aqui o link das evidências"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações de Gap
              </label>
              <textarea
                name="observacoes_gap"
                value={formData.observacoes_gap}
                onChange={handleFormDataChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Descreva os gaps identificados"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações de Melhorias
              </label>
              <textarea
                name="observacoes_melhorias"
                value={formData.observacoes_melhorias}
                onChange={handleFormDataChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Descreva as sugestões de melhorias"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assinatura do Responsável
              </label>
              <input
                type="text"
                name="assinatura_responsavel"
                value={formData.assinatura_responsavel}
                onChange={handleFormDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nome completo do responsável"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
            >
              <Save className="w-5 h-5" />
              Registrar Auditoria
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegistroAuditoria;