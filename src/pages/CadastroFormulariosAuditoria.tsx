import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Plus, Minus, Save } from 'lucide-react';

type ItemType = {
  id: string;
  descricao: string;
  conformidade: 'conforme' | 'nao_conforme' | 'porcentagem';
  porcentagem?: number;
  observacao: string;
};

type SubtituloType = {
  id: string;
  titulo: string;
  itens: ItemType[];
};

type FormData = {
  titulo: string;
  auditor: string;
  data_auditoria: string;
  unidade_id: string;
  link_evidencias: string;
  observacoes_gap: string;
  observacoes_melhorias: string;
  assinatura_responsavel: string;
};

type Unidade = {
  id: string;
  unidade: string;
};

function CadastroFormulariosAuditoria() {
  const [subtitulos, setSubtitulos] = useState<SubtituloType[]>([
    { 
      id: '1', 
      titulo: '', 
      itens: [{ 
        id: '1', 
        descricao: '', 
        conformidade: 'conforme',
        observacao: ''
      }] 
    }
  ]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>();

  useEffect(() => {
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

  const addSubtitulo = () => {
    setSubtitulos([
      ...subtitulos,
      {
        id: Date.now().toString(),
        titulo: '',
        itens: [{ 
          id: Date.now().toString(), 
          descricao: '',
          conformidade: 'conforme',
          observacao: ''
        }]
      }
    ]);
  };

  const removeSubtitulo = (subtituloId: string) => {
    setSubtitulos(subtitulos.filter(s => s.id !== subtituloId));
  };

  const addItem = (subtituloId: string) => {
    setSubtitulos(subtitulos.map(s => {
      if (s.id === subtituloId) {
        return {
          ...s,
          itens: [...s.itens, { 
            id: Date.now().toString(), 
            descricao: '',
            conformidade: 'conforme',
            observacao: ''
          }]
        };
      }
      return s;
    }));
  };

  const removeItem = (subtituloId: string, itemId: string) => {
    setSubtitulos(subtitulos.map(s => {
      if (s.id === subtituloId) {
        return {
          ...s,
          itens: s.itens.filter(i => i.id !== itemId)
        };
      }
      return s;
    }));
  };

  const updateSubtituloTitulo = (subtituloId: string, titulo: string) => {
    setSubtitulos(subtitulos.map(s => {
      if (s.id === subtituloId) {
        return { ...s, titulo };
      }
      return s;
    }));
  };

  const updateItem = (
    subtituloId: string, 
    itemId: string, 
    field: keyof ItemType, 
    value: any
  ) => {
    setSubtitulos(subtitulos.map(s => {
      if (s.id === subtituloId) {
        return {
          ...s,
          itens: s.itens.map(i => {
            if (i.id === itemId) {
              if (field === 'conformidade') {
                if (value === 'porcentagem') {
                  return { ...i, conformidade: value, porcentagem: 0 };
                }
                return { ...i, conformidade: value, porcentagem: undefined };
              }
              return { ...i, [field]: value };
            }
            return i;
          })
        };
      }
      return s;
    }));
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Insert formulário
      const { data: formulario, error: formularioError } = await supabase
        .from('formularios_auditoria')
        .insert([{
          titulo: data.titulo,
          auditor: data.auditor,
          data_auditoria: data.data_auditoria,
          unidade_id: data.unidade_id,
          link_evidencias: data.link_evidencias,
          observacoes_gap: data.observacoes_gap,
          observacoes_melhorias: data.observacoes_melhorias,
          assinatura_responsavel: data.assinatura_responsavel
        }])
        .select()
        .single();

      if (formularioError) throw formularioError;

      // Insert subtítulos e itens
      for (let i = 0; i < subtitulos.length; i++) {
        const subtitulo = subtitulos[i];
        
        const { data: subtituloData, error: subtituloError } = await supabase
          .from('subtitulos_auditoria')
          .insert([{
            formulario_id: formulario.id,
            titulo: subtitulo.titulo,
            ordem: i + 1
          }])
          .select()
          .single();

        if (subtituloError) throw subtituloError;

        const { error: itensError } = await supabase
          .from('itens_auditoria')
          .insert(
            subtitulo.itens.map((item, index) => ({
              subtitulo_id: subtituloData.id,
              descricao: item.descricao,
              conformidade: item.conformidade,
              porcentagem: item.porcentagem,
              observacao: item.observacao,
              ordem: index + 1
            }))
          );

        if (itensError) throw itensError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      reset();
      setSubtitulos([{ 
        id: '1', 
        titulo: '', 
        itens: [{ 
          id: '1', 
          descricao: '',
          conformidade: 'conforme',
          observacao: ''
        }] 
      }]);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cadastro de Formulários de Auditoria</h2>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          Formulário cadastrado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {...register('auditor', { required: 'Campo obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.auditor && (
                <p className="mt-1 text-sm text-red-600">{errors.auditor.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Auditoria
              </label>
              <input
                type="date"
                {...register('data_auditoria', { required: 'Campo obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.data_auditoria && (
                <p className="mt-1 text-sm text-red-600">{errors.data_auditoria.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade a ser Auditada
              </label>
              <select
                {...register('unidade_id', { required: 'Campo obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.unidade}
                  </option>
                ))}
              </select>
              {errors.unidade_id && (
                <p className="mt-1 text-sm text-red-600">{errors.unidade_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Título do Formulário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título do Formulário
          </label>
          <input
            type="text"
            {...register('titulo', { required: 'Campo obrigatório' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Digite o título do formulário"
          />
          {errors.titulo && (
            <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
          )}
        </div>

        {/* Subtítulos e Itens */}
        <div className="space-y-6">
          {subtitulos.map((subtitulo, subtituloIndex) => (
            <div
              key={subtitulo.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="text"
                  value={subtitulo.titulo}
                  onChange={(e) => updateSubtituloTitulo(subtitulo.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Digite o nome do processo ou área (ex: Logística)"
                />
                {subtituloIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSubtitulo(subtitulo.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {subtitulo.itens.map((item, itemIndex) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => updateItem(subtitulo.id, item.id, 'descricao', e.target.value)}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Digite o nome do item"
                    />

                    <div className="flex items-center gap-4">
                      <select
                        value={item.conformidade === 'porcentagem' ? 'porcentagem' : 'conforme_nao_conforme'}
                        onChange={(e) => {
                          if (e.target.value === 'porcentagem') {
                            updateItem(subtitulo.id, item.id, 'conformidade', 'porcentagem');
                          } else {
                            updateItem(subtitulo.id, item.id, 'conformidade', 'conforme');
                          }
                        }}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="conforme_nao_conforme">Conforme/Não Conforme</option>
                        <option value="porcentagem">Porcentagem</option>
                      </select>

                      {item.conformidade === 'porcentagem' ? (
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.porcentagem || 0}
                            onChange={(e) => updateItem(subtitulo.id, item.id, 'porcentagem', Number(e.target.value))}
                            className="w-16 px-3 py-2 border border-gray-300 rounded-l-md"
                          />
                          <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                            %
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={item.conformidade === 'conforme'}
                              onChange={() => updateItem(subtitulo.id, item.id, 'conformidade', 'conforme')}
                              className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Conforme</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={item.conformidade === 'nao_conforme'}
                              onChange={() => updateItem(subtitulo.id, item.id, 'conformidade', 'nao_conforme')}
                              className="form-radio h-4 w-4 text-red-600"
                            />
                            <span className="ml-2">Não Conforme</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={item.observacao}
                      onChange={(e) => updateItem(subtitulo.id, item.id, 'observacao', e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Observação"
                    />

                    <button
                      type="button"
                      onClick={() => addItem(subtitulo.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {itemIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => removeItem(subtitulo.id, item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link de Evidências
            </label>
            <input
              type="text"
              {...register('link_evidencias')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Cole aqui o link das evidências"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações de Gap
            </label>
            <textarea
              {...register('observacoes_gap')}
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
              {...register('observacoes_melhorias')}
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
              {...register('assinatura_responsavel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome completo do responsável"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={addSubtitulo}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Adicionar Processo/Área
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
          >
            <Save className="w-5 h-5" />
            Salvar Formulário
          </button>
        </div>
      </form>
    </div>
  );
}

export default CadastroFormulariosAuditoria;