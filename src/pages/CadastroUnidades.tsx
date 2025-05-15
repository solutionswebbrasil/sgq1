import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type UnidadeFormData = {
  unidade: string;
};

function CadastroUnidades() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnidadeFormData>();

  const onSubmit = async (data: UnidadeFormData) => {
    try {
      const { error } = await supabase.from('unidades').insert([
        {
          unidade: data.unidade,
        },
      ]);

      if (error) throw error;

      alert('Unidade cadastrada com sucesso!');
      reset();
    } catch (error: any) {
      alert('Erro ao cadastrar unidade: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cadastro de Unidades</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Unidade
          </label>
          <input
            type="text"
            {...register('unidade', { 
              required: 'Campo obrigatório',
              minLength: { 
                value: 2, 
                message: 'Nome da unidade deve ter pelo menos 2 caracteres' 
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Digite o nome da unidade"
          />
          {errors.unidade && (
            <p className="mt-1 text-sm text-red-600">{errors.unidade.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#3f4c6b] hover:bg-[#2c3e50] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CadastroUnidades;