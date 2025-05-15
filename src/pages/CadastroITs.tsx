import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Save, FileText } from 'lucide-react';

type ITFormData = {
  nome: string;
  departamento: string;
};

function CadastroITs() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ITFormData>();

  const onSubmit = async (data: ITFormData) => {
    try {
      // First, check if the IT already exists
      const { data: existingITs } = await supabase
        .from('its')
        .select('*')
        .eq('nome', data.nome);
      
      if (existingITs && existingITs.length > 0) {
        setError('Uma IT com este nome já existe');
        return;
      }

      // Insert new IT record
      const { error: insertError } = await supabase
        .from('its')
        .insert([{
          nome: data.nome,
          departamento: data.departamento
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setError(null);
      reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      setError('Erro ao cadastrar IT: ' + error.message);
      setSuccess(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-semibold text-gray-800">Cadastro de ITs</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          IT cadastrada com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da IT
            </label>
            <input
              type="text"
              {...register('nome', { 
                required: 'Campo obrigatório',
                minLength: { value: 3, message: 'Título deve ter pelo menos 3 caracteres' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Procedimento para Calibração de Equipamentos"
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <input
              type="text"
              {...register('departamento', { 
                required: 'Campo obrigatório' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Qualidade, Produção, RH, etc."
            />
            {errors.departamento && (
              <p className="mt-1 text-sm text-red-600">{errors.departamento.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
          >
            <Save className="w-5 h-5" />
            Cadastrar IT
          </button>
        </div>
      </form>
    </div>
  );
}

export default CadastroITs;