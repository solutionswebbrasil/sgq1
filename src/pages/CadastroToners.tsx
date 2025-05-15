import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type TonerFormData = {
  modelo: string;
  peso_cheio: number;
  peso_vazio: number;
  impressoras_compativeis: string;
  cor: 'Black' | 'Cyan' | 'Magenta' | 'Yellow';
  area_impressa_iso: number;
  capacidade_folhas: number;
  tipo: 'Compatível' | 'Original';
  preco: number;
  preco_folha: number;
  gramatura: number;
};

function CadastroToners() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TonerFormData>();

  // Watch the fields needed for calculations
  const preco = useWatch({ control, name: 'preco' });
  const capacidadeFolhas = useWatch({ control, name: 'capacidade_folhas' });
  const pesoCheio = useWatch({ control, name: 'peso_cheio' });
  const pesoVazio = useWatch({ control, name: 'peso_vazio' });

  // Calculate price per page when price or capacity changes
  React.useEffect(() => {
    if (preco && capacidadeFolhas) {
      const precoFolha = Number(preco) / Number(capacidadeFolhas);
      setValue('preco_folha', Number(precoFolha.toFixed(3)));
    }
  }, [preco, capacidadeFolhas, setValue]);

  // Calculate weight when full or empty weight changes
  React.useEffect(() => {
    if (pesoCheio && pesoVazio) {
      const gramatura = Number(pesoCheio) - Number(pesoVazio);
      setValue('gramatura', Number(gramatura.toFixed(1)));
    }
  }, [pesoCheio, pesoVazio, setValue]);

  const onSubmit = async (data: TonerFormData) => {
    try {
      const { error } = await supabase.from('toners').insert([
        {
          modelo: data.modelo,
          peso_cheio: data.peso_cheio,
          peso_vazio: data.peso_vazio,
          impressoras_compativeis: data.impressoras_compativeis,
          cor: data.cor,
          area_impressa_iso: data.area_impressa_iso,
          capacidade_folhas: data.capacidade_folhas,
          tipo: data.tipo,
          preco: data.preco,
          preco_folha: data.preco_folha,
          gramatura: data.gramatura,
        },
      ]);

      if (error) throw error;

      alert('Toner cadastrado com sucesso!');
      reset();
    } catch (error: any) {
      alert('Erro ao cadastrar toner: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cadastro de Toners</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo
          </label>
          <input
            type="text"
            {...register('modelo', { required: 'Campo obrigatório' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.modelo && (
            <p className="mt-1 text-sm text-red-600">{errors.modelo.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso Cheio
            </label>
            <input
              type="number"
              step="0.01"
              {...register('peso_cheio', { 
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Peso deve ser maior que 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.peso_cheio && (
              <p className="mt-1 text-sm text-red-600">{errors.peso_cheio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso Vazio
            </label>
            <input
              type="number"
              step="0.01"
              {...register('peso_vazio', { 
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Peso deve ser maior que 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.peso_vazio && (
              <p className="mt-1 text-sm text-red-600">{errors.peso_vazio.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impressoras Compatíveis
          </label>
          <input
            type="text"
            {...register('impressoras_compativeis', { required: 'Campo obrigatório' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.impressoras_compativeis && (
            <p className="mt-1 text-sm text-red-600">{errors.impressoras_compativeis.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor
            </label>
            <select
              {...register('cor', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione uma cor</option>
              <option value="Black">Black</option>
              <option value="Cyan">Cyan</option>
              <option value="Magenta">Magenta</option>
              <option value="Yellow">Yellow</option>
            </select>
            {errors.cor && (
              <p className="mt-1 text-sm text-red-600">{errors.cor.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Impressa ISO
            </label>
            <select
              {...register('area_impressa_iso', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione a área</option>
              <option value="0.05">5%</option>
              <option value="0.06">6%</option>
            </select>
            {errors.area_impressa_iso && (
              <p className="mt-1 text-sm text-red-600">{errors.area_impressa_iso.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade de Folhas
            </label>
            <input
              type="number"
              {...register('capacidade_folhas', { 
                required: 'Campo obrigatório',
                min: { value: 1, message: 'Capacidade deve ser maior que 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.capacidade_folhas && (
              <p className="mt-1 text-sm text-red-600">{errors.capacidade_folhas.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              {...register('tipo', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="Compatível">Compatível</option>
              <option value="Original">Original</option>
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>
        </div>

        {/* Price and weight fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço do Toner (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('preco', { 
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Preço deve ser maior que 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.preco && (
              <p className="mt-1 text-sm text-red-600">{errors.preco.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço por Folha (R$)
            </label>
            <input
              type="number"
              step="0.001"
              disabled
              {...register('preco_folha')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gramatura (g/m²)
            </label>
            <input
              type="number"
              step="0.1"
              disabled
              {...register('gramatura')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
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

export default CadastroToners;