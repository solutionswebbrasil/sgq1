import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Search, Download, Eye, FileText } from 'lucide-react';

type IT = {
  id: string;
  nome: string;
  departamento: string;
  created_at: string;
  versoes: Array<{
    id: string;
    versao: number;
    arquivo_url: string;
    created_at: string;
    visualizacoes: Array<{
      nome: string;
      data: string;
    }>;
  }>;
};

type SearchFormData = {
  searchTerm: string;
};

function ConsultaITs() {
  const [its, setITs] = useState<IT[]>([]);
  const [filteredITs, setFilteredITs] = useState<IT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState('');
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{url: string, itId: string, versaoId: string} | null>(null);
  
  const { register, handleSubmit } = useForm<SearchFormData>();

  useEffect(() => {
    fetchITs();
  }, []);

  const fetchITs = async () => {
    try {
      const { data: its, error: itsError } = await supabase
        .from('its')
        .select('*')
        .order('nome');

      if (itsError) throw itsError;

      const itsWithVersions = await Promise.all(
        its.map(async (it) => {
          const { data: versoes, error: versoesError } = await supabase
            .from('it_versoes')
            .select('*')
            .eq('it_id', it.id)
            .order('versao', { ascending: false });

          if (versoesError) throw versoesError;

          return {
            ...it,
            versoes: versoes || []
          };
        })
      );

      setITs(itsWithVersions);
      setFilteredITs(itsWithVersions);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const onSearch = (data: SearchFormData) => {
    const { searchTerm } = data;
    
    if (!searchTerm.trim()) {
      setFilteredITs(its);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = its.filter(it => 
      it.nome.toLowerCase().includes(searchTermLower) ||
      it.departamento.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredITs(filtered);
  };

  const handleView = async (fileUrl: string, itId: string, versaoId: string) => {
    if (!viewerName.trim()) {
      setSelectedFile({url: fileUrl, itId, versaoId});
      setShowViewerModal(true);
      return;
    }

    try {
      // Update visualizacoes
      const { data: versao } = await supabase
        .from('it_versoes')
        .select('visualizacoes')
        .eq('id', versaoId)
        .single();

      const visualizacoes = versao?.visualizacoes || [];
      visualizacoes.push({
        nome: viewerName,
        data: new Date().toISOString()
      });

      await supabase
        .from('it_versoes')
        .update({ visualizacoes })
        .eq('id', versaoId);

      // Open file in new tab
      window.open(fileUrl, '_blank');
      
      // Reset
      setSelectedFile(null);
      setViewerName('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Consulta de ITs</h2>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSearch)} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              {...register('searchTerm')}
              placeholder="Buscar por título ou departamento..."
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button 
            type="submit"
            className="px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
          >
            Buscar
          </button>
        </div>
      </form>

      {filteredITs.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma IT encontrada</h3>
          <p className="text-gray-500">Tente buscar com outros termos ou cadastre uma nova IT.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredITs.map((it) => (
            <div key={it.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{it.nome}</h3>
                  <p className="text-sm text-gray-500">
                    Departamento: {it.departamento}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cadastrado em: {new Date(it.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {it.versoes.length === 0 ? (
                  <p className="text-gray-500 italic">Nenhuma versão cadastrada</p>
                ) : (
                  it.versoes.map((versao) => (
                    <div key={versao.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Versão v{versao.versao}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(versao.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(versao.arquivo_url, it.id, versao.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <a
                          href={versao.arquivo_url}
                          download
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Viewer Name Modal */}
      {showViewerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Identificação do Visualizador
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={viewerName}
                onChange={(e) => setViewerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Digite seu nome"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowViewerModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedFile && viewerName.trim()) {
                    setShowViewerModal(false);
                    handleView(selectedFile.url, selectedFile.itId, selectedFile.versaoId);
                  }
                }}
                disabled={!viewerName.trim()}
                className="px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md disabled:opacity-50"
              >
                Visualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsultaITs;