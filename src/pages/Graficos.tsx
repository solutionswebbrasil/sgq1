import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useDarkMode } from '../hooks/useDarkMode';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

type GarantiaData = {
  mes: string;
  quantidade: number;
  valor_total: number;
};

type FornecedorData = {
  fornecedor: string;
  quantidade: number;
  valor_total: number;
};

type StatusData = {
  status: string;
  quantidade: number;
  valor_total: number;
};

function Graficos() {
  const [garantiasPorMes, setGarantiasPorMes] = useState<GarantiaData[]>([]);
  const [garantiasPorFornecedor, setGarantiasPorFornecedor] = useState<FornecedorData[]>([]);
  const [garantiasPorStatus, setGarantiasPorStatus] = useState<StatusData[]>([]);
  const { isDarkMode } = useDarkMode();

  // Always use dark text color for better visibility on chart backgrounds
  const textColor = '#1f2937';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch garantias data
      const { data: garantiasData } = await supabase.rpc('get_garantias_por_mes');
      setGarantiasPorMes(garantiasData || []);

      const { data: fornecedoresData } = await supabase.rpc('get_garantias_por_fornecedor');
      setGarantiasPorFornecedor(fornecedoresData || []);

      const { data: statusData } = await supabase.rpc('get_garantias_por_status');
      setGarantiasPorStatus(statusData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      }
    }
  };

  const garantiasQuantidadeChart = {
    labels: garantiasPorMes.map(item => item.mes),
    datasets: [
      {
        label: 'Quantidade de Garantias',
        data: garantiasPorMes.map(item => item.quantidade),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const garantiasValorChart = {
    labels: garantiasPorMes.map(item => item.mes),
    datasets: [
      {
        label: 'Valor Total (R$)',
        data: garantiasPorMes.map(item => item.valor_total),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const fornecedoresChart = {
    labels: garantiasPorFornecedor.map(item => item.fornecedor),
    datasets: [
      {
        label: 'Quantidade por Fornecedor',
        data: garantiasPorFornecedor.map(item => item.quantidade),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  const statusChart = {
    labels: garantiasPorStatus.map(item => item.status),
    datasets: [
      {
        label: 'Quantidade por Status',
        data: garantiasPorStatus.map(item => item.quantidade),
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  const valorPorFornecedorChart = {
    labels: garantiasPorFornecedor.map(item => item.fornecedor),
    datasets: [
      {
        label: 'Valor Total por Fornecedor (R$)',
        data: garantiasPorFornecedor.map(item => item.valor_total),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-6`}>
      <h2 className="text-2xl font-semibold mb-6">Análise de Garantias</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quantidade de Garantias por Mês */}
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
          <h3 className="text-lg font-medium mb-4">Quantidade de Garantias por Mês</h3>
          <Bar options={chartOptions} data={garantiasQuantidadeChart} />
        </div>

        {/* Valor Total de Garantias por Mês */}
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
          <h3 className="text-lg font-medium mb-4">Valor Total de Garantias por Mês</h3>
          <Bar options={chartOptions} data={garantiasValorChart} />
        </div>

        {/* Distribuição por Fornecedor */}
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
          <h3 className="text-lg font-medium mb-4">Distribuição por Fornecedor</h3>
          <Pie data={fornecedoresChart} options={chartOptions} />
        </div>

        {/* Distribuição por Status */}
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
          <h3 className="text-lg font-medium mb-4">Distribuição por Status</h3>
          <Pie data={statusChart} options={chartOptions} />
        </div>

        {/* Valor Total por Fornecedor */}
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg md:col-span-2`}>
          <h3 className="text-lg font-medium mb-4">Valor Total por Fornecedor</h3>
          <Bar options={chartOptions} data={valorPorFornecedorChart} />
        </div>
      </div>
    </div>
  );
}

export default Graficos;