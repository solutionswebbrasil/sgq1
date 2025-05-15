import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type MovimentacaoFormData = {
  numero_serie: string;
  tipo: string;
};

function RegistroMovimentacoes() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [numeroOSMovimentacao, setNumeroOSMovimentacao] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovimentacaoFormData>();

  const tiposMovimentacao = [
    'De Estoque para Quarentena',
    'De Quarentena para Área Técnica Print',
    'De Quarentena para Área Técnica Mobile',
    'De Embalagem para Logística'
  ];

  const onSubmitForm = (data: MovimentacaoFormData) => {
    setSelectedTipo(data.tipo);
    setNumeroSerie(data.numero_serie);
    setShowModal(true);
  };

  const onSubmitFinal = async () => {
    try {
      const { error } = await supabase.from('movimentacoes').insert([{
        numero_serie: numeroSerie,
        tipo: selectedTipo,
        numero_movimentacao: numeroOSMovimentacao,
        numero_os: numeroOSMovimentacao
      }]);

      if (error) throw error;

      alert('Movimentação registrada com sucesso!');
      setShowModal(false);
      setSelectedTipo('');
      setNumeroOSMovimentacao('');
      setNumeroSerie('');
      reset();
    } catch (error: any) {
      alert('Erro ao registrar movimentação: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Registro de Movimentações</h2>
      
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Série
          </label>
          <input
            type="text"
            {...register('numero_serie', { 
              required: 'Campo obrigatório',
              minLength: { value: 3, message: 'Mínimo de 3 caracteres' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Digite o número de série"
          />
          {errors.numero_serie && (
            <p className="mt-1 text-sm text-red-600">{errors.numero_serie.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Movimentação
          </label>
          <select
            {...register('tipo', { required: 'Campo obrigatório' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione o tipo de movimentação</option>
            {tiposMovimentacao.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {errors.tipo && (
            <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#3f4c6b] hover:bg-[#2c3e50] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Adicionais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número da OS/Movimentação
              </label>
              <input
                type="text"
                value={numeroOSMovimentacao}
                onChange={(e) => setNumeroOSMovimentacao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Digite o número da OS/Movimentação"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmitFinal}
                disabled={!numeroOSMovimentacao}
                className="bg-[#3f4c6b] hover:bg-[#2c3e50] text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroMovimentacoes;