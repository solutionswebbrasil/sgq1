import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';

type NCFormData = {
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
};

function RegistroNC() {
  const [numero, setNumero] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<NCFormData>();

  useEffect(() => {
    generateNCNumber();
  }, []);

  const generateNCNumber = async () => {
    try {
      const { data, error } = await supabase
        .rpc('generate_nc_number');

      if (error) throw error;

      setNumero(data);
      setLoading(false);
    } catch (error: any) {
      setError('Erro ao gerar número da NC: ' + error.message);
      setLoading(false);
    }
  };

  const onSubmit = async (data: NCFormData) => {
    try {
      const { error } = await supabase
        .from('nao_conformidades')
        .insert([{
          numero,
          ...data,
          status: 'Aberta'
        }]);

      if (error) throw error;

      alert('Não Conformidade registrada com sucesso!');
      reset();
      generateNCNumber(); // Generate new number for next NC
    } catch (error: any) {
      setError('Erro ao registrar NC: ' + error.message);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <h2 className="text-2xl font-semibold text-gray-800">Registro de Não Conformidade</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Número da NC:</span>
          <span className="text-lg font-bold text-gray-700">{numero}</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Data de Abertura: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável pela Abertura
            </label>
            <input
              type="text"
              {...register('responsavel_abertura', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.responsavel_abertura && (
              <p className="mt-1 text-sm text-red-600">{errors.responsavel_abertura.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento Afetado
            </label>
            <input
              type="text"
              {...register('departamento', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.departamento && (
              <p className="mt-1 text-sm text-red-600">{errors.departamento.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo da NC
            </label>
            <select
              {...register('tipo', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione o tipo</option>
              <option value="Produto">Produto</option>
              <option value="Processo">Processo</option>
              <option value="Sistema">Sistema</option>
              <option value="Cliente">Cliente</option>
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gravidade
            </label>
            <select
              {...register('gravidade', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione a gravidade</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
            {errors.gravidade && (
              <p className="mt-1 text-sm text-red-600">{errors.gravidade.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição da Não Conformidade
          </label>
          <textarea
            {...register('descricao', { required: 'Campo obrigatório' })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.descricao && (
            <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Análise da Causa Raiz
          </label>
          <textarea
            {...register('analise_causa')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ação Imediata
          </label>
          <textarea
            {...register('acao_imediata')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável pela Ação
            </label>
            <input
              type="text"
              {...register('responsavel_acao')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prazo para Conclusão
            </label>
            <input
              type="date"
              {...register('prazo_conclusao')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evidência da Solução
          </label>
          <textarea
            {...register('evidencia_solucao')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Descreva as evidências ou anexe arquivos..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar NC'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistroNC;