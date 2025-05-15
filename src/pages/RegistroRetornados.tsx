import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

type Toner = {
  id: string;
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

type Unidade = {
  id: string;
  unidade: string;
};

type RetornadoFormData = {
  id_cliente: number;
  toner_id: string;
  peso_retornado: number;
  unidade_id: string;
};

type DestinoType = 'Descarte' | 'Garantia' | 'Estoque' | 'Uso Interno';

function RegistroRetornados() {
  const [toners, setToners] = useState<Toner[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [selectedToner, setSelectedToner] = useState<Toner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<RetornadoFormData | null>(null);
  const [selectedDestino, setSelectedDestino] = useState<DestinoType | null>(null);
  const [weightPercentage, setWeightPercentage] = useState<number>(0);
  const [remainingWeight, setRemainingWeight] = useState<number>(0);
  const [remainingPages, setRemainingPages] = useState<number>(0);
  const [recoveredValue, setRecoveredValue] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RetornadoFormData>();

  const watchTonerId = watch('toner_id');
  const watchPesoRetornado = watch('peso_retornado');

  useEffect(() => {
    fetchToners();
    fetchUnidades();
  }, []);

  useEffect(() => {
    if (watchTonerId && toners.length > 0) {
      const toner = toners.find(t => t.id === watchTonerId);
      setSelectedToner(toner || null);
    }
  }, [watchTonerId, toners]);

  useEffect(() => {
    if (selectedToner && watchPesoRetornado) {
      // Calculate remaining toner weight (peso_retornado - peso_vazio)
      const remainingTonerWeight = watchPesoRetornado - selectedToner.peso_vazio;
      setRemainingWeight(remainingTonerWeight);

      // Calculate total usable weight (peso_cheio - peso_vazio)
      const totalUsableWeight = selectedToner.peso_cheio - selectedToner.peso_vazio;

      // Calculate percentage based on remaining weight vs total usable weight
      const percentage = (remainingTonerWeight / totalUsableWeight) * 100;
      setWeightPercentage(Number(Math.max(0, Math.min(100, percentage)).toFixed(1)));

      // Calculate remaining pages
      // First, calculate weight per page (total usable weight / total pages)
      const weightPerPage = totalUsableWeight / selectedToner.capacidade_folhas;
      // Then, calculate remaining pages (remaining weight / weight per page)
      const pages = Math.floor(remainingTonerWeight / weightPerPage);
      setRemainingPages(Math.max(0, pages));

      // Calculate recovered value (preco_folha * 10000) if destination is Estoque
      if (selectedDestino === 'Estoque') {
        const value = selectedToner.preco_folha * 10000;
        setRecoveredValue(value);
      } else {
        setRecoveredValue(0);
      }
    } else {
      setWeightPercentage(0);
      setRemainingWeight(0);
      setRemainingPages(0);
      setRecoveredValue(0);
    }
  }, [selectedToner, watchPesoRetornado, selectedDestino]);

  const fetchToners = async () => {
    const { data, error } = await supabase.from('toners').select('*');
    if (error) {
      console.error('Erro ao buscar toners:', error);
      return;
    }
    setToners(data);
  };

  const fetchUnidades = async () => {
    const { data, error } = await supabase.from('unidades').select('*');
    if (error) {
      console.error('Erro ao buscar unidades:', error);
      return;
    }
    setUnidades(data);
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 40) return 'bg-blue-500';
    if (percentage >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDestinationSuggestion = (percentage: number) => {
    if (percentage >= 80) {
      return {
        text: 'Teste o produto. Se estiver em boa qualidade, envie para o estoque como novo. Se estiver ruim, envie para garantia.',
        icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      };
    } else if (percentage >= 40) {
      return {
        text: `Teste o produto. Se estiver em boa qualidade, envie para o estoque como seminovo (${percentage}%). Se estiver ruim, envie para garantia.`,
        icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
      };
    } else if (percentage >= 20) {
      return {
        text: 'Teste o produto. Se estiver em boa qualidade, envie para uso interno. Se estiver ruim, descarte.',
        icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      };
    } else {
      return {
        text: 'Recomendamos descartar este item.',
        icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const onSubmitForm = (data: RetornadoFormData) => {
    setFormData(data);
    setShowModal(true);
  };

  const onSubmitFinal = async () => {
    if (!formData || !selectedDestino) return;

    try {
      const { error } = await supabase.from('retornados').insert([{
        id_cliente: Number(formData.id_cliente),
        toner_id: formData.toner_id,
        peso_retornado: Number(formData.peso_retornado),
        unidade_id: formData.unidade_id,
        destino_final: selectedDestino,
      }]);

      if (error) throw error;

      alert('Retornado registrado com sucesso!');
      setShowModal(false);
      setSelectedDestino(null);
      setFormData(null);
      reset();
    } catch (error: any) {
      alert('Erro ao registrar retornado: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Registro de Retornados</h2>
      
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Cliente
            </label>
            <input
              type="number"
              {...register('id_cliente', { 
                required: 'Campo obrigatório',
                min: { value: 1, message: 'ID deve ser maior que 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.id_cliente && (
              <p className="mt-1 text-sm text-red-600">{errors.id_cliente.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade
            </label>
            <select
              {...register('unidade_id', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo do Toner
            </label>
            <select
              {...register('toner_id', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione um modelo</option>
              {toners.map((toner) => (
                <option key={toner.id} value={toner.id}>
                  {toner.modelo}
                </option>
              ))}
            </select>
            {errors.toner_id && (
              <p className="mt-1 text-sm text-red-600">{errors.toner_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso do Retornado
            </label>
            <input
              type="number"
              step="0.01"
              {...register('peso_retornado', { 
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Peso deve ser maior que 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.peso_retornado && (
              <p className="mt-1 text-sm text-red-600">{errors.peso_retornado.message}</p>
            )}
          </div>
        </div>

        {selectedToner && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Toner</h3>
            
            {/* Progress bar and weight information */}
            <div className="mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Gramatura Restante: {remainingWeight.toFixed(1)}g ({weightPercentage}%)
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Páginas Restantes: {remainingPages.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getProgressBarColor(weightPercentage)}`}
                    style={{ width: `${Math.min(weightPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Peso Cheio</label>
                <input
                  type="text"
                  value={`${selectedToner.peso_cheio}g`}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Peso Vazio</label>
                <input
                  type="text"
                  value={`${selectedToner.peso_vazio}g`}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gramatura Total</label>
                <input
                  type="text"
                  value={`${selectedToner.gramatura}g`}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço</label>
                <input
                  type="text"
                  value={formatCurrency(selectedToner.preco)}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço por Folha</label>
                <input
                  type="text"
                  value={formatCurrency(selectedToner.preco_folha)}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cor</label>
                <input
                  type="text"
                  value={selectedToner.cor}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <input
                  type="text"
                  value={selectedToner.tipo}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Área Impressa ISO</label>
                <input
                  type="text"
                  value={`${selectedToner.area_impressa_iso * 100}%`}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacidade de Folhas</label>
                <input
                  type="text"
                  value={selectedToner.capacidade_folhas}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Impressoras Compatíveis</label>
              <input
                type="text"
                value={selectedToner.impressoras_compativeis}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600"
              />
            </div>
          </div>
        )}

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
      {showModal && formData && selectedToner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Selecione o Destino Final</h3>
            
            {/* Weight and pages information */}
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  {getDestinationSuggestion(weightPercentage).icon}
                  <div>
                    <div className="font-medium mb-1">
                      <p>Gramatura Restante: {remainingWeight.toFixed(1)}g ({weightPercentage}%)</p>
                      <p>Páginas Restantes: {remainingPages.toLocaleString('pt-BR')}</p>
                    </div>
                    <p className="text-gray-600">{getDestinationSuggestion(weightPercentage).text}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Destination options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['Descarte', 'Garantia', 'Estoque', 'Uso Interno'] as DestinoType[]).map((destino) => (
                <button
                  key={destino}
                  onClick={() => setSelectedDestino(destino)}
                  className={`p-3 rounded-lg border ${
                    selectedDestino === destino
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {destino}
                </button>
              ))}
            </div>

            {/* Show recovered value when Estoque is selected */}
            {selectedDestino === 'Estoque' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Valor Recuperado (10.000 páginas):
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(recoveredValue)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDestino(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmitFinal}
                disabled={!selectedDestino}
                className="bg-[#3f4c6b] hover:bg-[#2c3e50] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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

export default RegistroRetornados;