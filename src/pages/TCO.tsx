import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Plus, Minus } from 'lucide-react';

type TCOFormData = {
  modelo: string;
  fabricante: string;
  tipo: string;
  preco_impressora: number;
  pis: number;
  ipi: number;
  icms: number;
  cofins: number;
  acessorios: number;
  observacao: string;
};

type CustoAdicional = {
  titulo: string;
  valor: number;
};

function TCO() {
  const [custosOperacionais, setCustosOperacionais] = useState<CustoAdicional[]>([{ titulo: '', valor: 0 }]);
  const [custosIndiretos, setCustosIndiretos] = useState<CustoAdicional[]>([{ titulo: '', valor: 0 }]);
  const [totalAquisicao, setTotalAquisicao] = useState(0);
  const [totalOperacional, setTotalOperacional] = useState(0);
  const [totalIndireto, setTotalIndireto] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<TCOFormData>({
    defaultValues: {
      pis: 0,
      ipi: 0,
      icms: 0,
      cofins: 0,
      acessorios: 0,
      preco_impressora: 0
    }
  });

  // Watch values for real-time total calculation
  const watchedValues = watch([
    'preco_impressora',
    'pis',
    'ipi',
    'icms',
    'cofins',
    'acessorios'
  ]);

  useEffect(() => {
    const total = Object.values(watchedValues).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    setTotalAquisicao(total);
  }, [watchedValues]);

  const handleOperacionalChange = (index: number, field: 'titulo' | 'valor', value: string | number) => {
    const newCustos = [...custosOperacionais];
    if (field === 'valor') {
      newCustos[index] = { ...newCustos[index], [field]: Number(value) || 0 };
    } else {
      newCustos[index] = { ...newCustos[index], [field]: value };
    }
    setCustosOperacionais(newCustos);
    setTotalOperacional(newCustos.reduce((acc, curr) => acc + (curr.valor || 0), 0));
  };

  const handleIndiretoChange = (index: number, field: 'titulo' | 'valor', value: string | number) => {
    const newCustos = [...custosIndiretos];
    if (field === 'valor') {
      newCustos[index] = { ...newCustos[index], [field]: Number(value) || 0 };
    } else {
      newCustos[index] = { ...newCustos[index], [field]: value };
    }
    setCustosIndiretos(newCustos);
    setTotalIndireto(newCustos.reduce((acc, curr) => acc + (curr.valor || 0), 0));
  };

  const addOperacionalRow = () => {
    setCustosOperacionais([...custosOperacionais, { titulo: '', valor: 0 }]);
  };

  const removeOperacionalRow = (index: number) => {
    if (custosOperacionais.length > 1) {
      const newCustos = custosOperacionais.filter((_, i) => i !== index);
      setCustosOperacionais(newCustos);
      setTotalOperacional(newCustos.reduce((acc, curr) => acc + (curr.valor || 0), 0));
    }
  };

  const addIndiretoRow = () => {
    setCustosIndiretos([...custosIndiretos, { titulo: '', valor: 0 }]);
  };

  const removeIndiretoRow = (index: number) => {
    if (custosIndiretos.length > 1) {
      const newCustos = custosIndiretos.filter((_, i) => i !== index);
      setCustosIndiretos(newCustos);
      setTotalIndireto(newCustos.reduce((acc, curr) => acc + (curr.valor || 0), 0));
    }
  };

  const onSubmit = async (data: TCOFormData) => {
    try {
      // Ensure all numeric fields have valid numbers
      const numericData = {
        ...data,
        preco_impressora: Number(data.preco_impressora) || 0,
        pis: Number(data.pis) || 0,
        ipi: Number(data.ipi) || 0,
        icms: Number(data.icms) || 0,
        cofins: Number(data.cofins) || 0,
        acessorios: Number(data.acessorios) || 0
      };

      // Insert TCO
      const { data: tcoData, error: tcoError } = await supabase
        .from('tcos')
        .insert([{
          ...numericData,
          total_aquisicao: totalAquisicao
        }])
        .select()
        .single();

      if (tcoError) throw tcoError;

      // Insert operational costs
      const { error: opError } = await supabase
        .from('tco_custos_operacionais')
        .insert(
          custosOperacionais
            .filter(custo => custo.titulo && custo.valor)
            .map(custo => ({
              tco_id: tcoData.id,
              titulo: custo.titulo,
              valor: Number(custo.valor) || 0
            }))
        );

      if (opError) throw opError;

      // Insert indirect costs
      const { error: indError } = await supabase
        .from('tco_custos_indiretos')
        .insert(
          custosIndiretos
            .filter(custo => custo.titulo && custo.valor)
            .map(custo => ({
              tco_id: tcoData.id,
              titulo: custo.titulo,
              valor: Number(custo.valor) || 0
            }))
        );

      if (indError) throw indError;

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        reset();
        setCustosOperacionais([{ titulo: '', valor: 0 }]);
        setCustosIndiretos([{ titulo: '', valor: 0 }]);
      }, 3000);
    } catch (error: any) {
      alert('Erro ao registrar TCO: ' + error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">TCO - Total Cost of Ownership</h2>

      {showSuccessMessage && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          TCO registrado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Gerais */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo do Produto
              </label>
              <input
                type="text"
                {...register('modelo', { required: 'Campo obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.modelo && (
                <p className="mt-1 text-sm text-red-600">{errors.modelo.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fabricante
              </label>
              <input
                type="text"
                {...register('fabricante', { required: 'Campo obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.fabricante && (
                <p className="mt-1 text-sm text-red-600">{errors.fabricante.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <input
                type="text"
                {...register('tipo', { required: 'Campo obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Valor do Bem Principal + Impostos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Valor do Bem Principal + Impostos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço da Impressora (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('preco_impressora', { 
                  required: 'Campo obrigatório',
                  min: { value: 0, message: 'O valor deve ser maior ou igual a 0' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIS (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('pis', { 
                  min: { value: 0, message: 'O valor deve ser maior ou igual a 0' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IPI (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('ipi', { 
                  min: { value: 0, message: 'O valor deve ser maior ou igual a 0' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ICMS (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('icms', { 
                  min: { value: 0, message: 'O valor deve ser maior ou igual a 0' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                COFINS (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('cofins', { 
                  min: { value: 0, message: 'O valor deve ser maior ou igual a 0' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acessórios (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('acessorios', { 
                  min: { value: 0, message: 'O valor deve ser maior ou igual a 0' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-800 font-medium">
              Total de Aquisição: {formatCurrency(totalAquisicao)}
            </p>
          </div>
        </div>

        {/* Custo Operacional */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Custo Operacional</h3>
            <button
              type="button"
              onClick={addOperacionalRow}
              className="text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {custosOperacionais.map((custo, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Título"
                  value={custo.titulo}
                  onChange={(e) => handleOperacionalChange(index, 'titulo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-48">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor"
                  value={custo.valor}
                  onChange={(e) => handleOperacionalChange(index, 'valor', Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {custosOperacionais.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOperacionalRow(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Minus className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-800 font-medium">
              Total Operacional Mensal: {formatCurrency(totalOperacional)}
            </p>
          </div>
        </div>

        {/* Custo Indireto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Custo Indireto</h3>
            <button
              type="button"
              onClick={addIndiretoRow}
              className="text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {custosIndiretos.map((custo, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Título"
                  value={custo.titulo}
                  onChange={(e) => handleIndiretoChange(index, 'titulo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-48">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor"
                  value={custo.valor}
                  onChange={(e) => handleIndiretoChange(index, 'valor', Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {custosIndiretos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIndiretoRow(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Minus className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-800 font-medium">
              Total Indireto Mensal: {formatCurrency(totalIndireto)}
            </p>
          </div>
        </div>

        {/* Observação */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Observação</h3>
          <textarea
            {...register('observacao')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#3f4c6b] hover:bg-[#2c3e50] text-white font-medium py-2 px-4 rounded-md"
          >
            Registrar TCO
          </button>
        </div>
      </form>
    </div>
  );
}

export default TCO;