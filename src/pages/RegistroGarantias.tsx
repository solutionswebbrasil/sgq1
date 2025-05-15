import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type GarantiaFormData = {
  solicitante: string;
  data_solicitacao: string;
  codigo_produto: string;
  numero_serie: string;
  tipo: 'Peça' | 'Toner' | 'Equipamento';
  nf_compra: string;
  nf_remessa: string;
  nf_devolucao: string;
  nf_compra_chave: string;
  nf_remessa_chave: string;
  nf_devolucao_chave: string;
  data_garantia: string;
  numero_ticket: string;
  status: 'Aberta' | 'Em andamento' | 'Concluída' | 'Rejeitada';
  fornecedor: string;
  quantidade: number;
  observacao_defeito: string;
  valor_total: number;
};

function RegistroGarantias() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<GarantiaFormData>({
    defaultValues: {
      quantidade: 1,
      status: 'Aberta',
      valor_total: 0
    }
  });

  const onSubmit = async (data: GarantiaFormData) => {
    try {
      const { error } = await supabase
        .from('garantias')
        .insert([data]);

      if (error) throw error;

      alert('Garantia registrada com sucesso!');
      reset();
    } catch (error: any) {
      alert('Erro ao registrar garantia: ' + error.message);
    }
  };

  const handleVerNF = (chave: string) => {
    if (chave) {
      navigator.clipboard.writeText(chave);
      window.open('https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g=&AspxAutoDetectCookieSupport=1', '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Registro de Garantia</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante
            </label>
            <input
              type="text"
              {...register('solicitante', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.solicitante && (
              <p className="mt-1 text-sm text-red-600">{errors.solicitante.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Solicitação
            </label>
            <input
              type="date"
              {...register('data_solicitacao', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.data_solicitacao && (
              <p className="mt-1 text-sm text-red-600">{errors.data_solicitacao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fornecedor
            </label>
            <input
              type="text"
              {...register('fornecedor', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.fornecedor && (
              <p className="mt-1 text-sm text-red-600">{errors.fornecedor.message}</p>
            )}
          </div>
        </div>

        {/* Informações do Produto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código do Produto
            </label>
            <input
              type="text"
              {...register('codigo_produto', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.codigo_produto && (
              <p className="mt-1 text-sm text-red-600">{errors.codigo_produto.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Série
            </label>
            <input
              type="text"
              {...register('numero_serie', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.numero_serie && (
              <p className="mt-1 text-sm text-red-600">{errors.numero_serie.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              {...register('tipo', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione o tipo</option>
              <option value="Peça">Peça</option>
              <option value="Toner">Toner</option>
              <option value="Equipamento">Equipamento</option>
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>
        </div>

        {/* Notas Fiscais */}
        <div className="bg-yellow-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notas Fiscais</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NF Compra
                </label>
                <input
                  type="text"
                  maxLength={10}
                  {...register('nf_compra')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave NF Compra
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register('nf_compra_chave')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerNF(watch('nf_compra_chave'))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Ver NF
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NF Remessa
                </label>
                <input
                  type="text"
                  maxLength={10}
                  {...register('nf_remessa')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave NF Remessa
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register('nf_remessa_chave')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerNF(watch('nf_remessa_chave'))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Ver NF
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NF Devolução
                </label>
                <input
                  type="text"
                  maxLength={10}
                  {...register('nf_devolucao')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave NF Devolução
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register('nf_devolucao_chave')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerNF(watch('nf_devolucao_chave'))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Ver NF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data da Garantia
          </label>
          <input
            type="date"
            {...register('data_garantia')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do Ticket
            </label>
            <input
              type="text"
              {...register('numero_ticket')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              {...register('quantidade', { 
                min: { value: 1, message: 'Quantidade deve ser maior que 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.quantidade && (
              <p className="mt-1 text-sm text-red-600">{errors.quantidade.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('valor_total', { 
                min: { value: 0, message: 'Valor deve ser maior ou igual a 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.valor_total && (
              <p className="mt-1 text-sm text-red-600">{errors.valor_total.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Aberta">Aberta</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluída">Concluída</option>
              <option value="Rejeitada">Rejeitada</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observação do Defeito
          </label>
          <textarea
            {...register('observacao_defeito')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Descreva o defeito do produto..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#3f4c6b] hover:bg-[#2c3e50] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Garantia'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistroGarantias;