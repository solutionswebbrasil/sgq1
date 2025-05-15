import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Upload, Download, Trash2, Eye, FileText } from 'lucide-react';

type IT = {
  id: string;
  nome: string;
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

function ArquivamentoITs() {
  const [its, setITs] = useState<IT[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState('');
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    checkAdminRole();
    fetchITs();
  }, []);

  const checkAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id);

      if (roles && roles.length > 0) {
        const { data: adminRole } = await supabase
          .from('roles')
          .select('name')
          .eq('id', roles[0].role_id)
          .single();

        setIsAdmin(adminRole?.name === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

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
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Upload file to Storage
      const file = data.arquivo[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `its/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('its')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('its')
        .getPublicUrl(filePath);

      // Create IT record
      const { data: it, error: itError } = await supabase
        .from('its')
        .insert([{ nome: data.nome }])
        .select()
        .single();

      if (itError) throw itError;

      // Create version record
      const { error: versionError } = await supabase
        .from('it_versoes')
        .insert([{
          it_id: it.id,
          versao: 1.0,
          arquivo_url: publicUrl
        }]);

      if (versionError) throw versionError;

      reset();
      fetchITs();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleNewVersion = async (it: IT, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `its/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('its')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('its')
        .getPublicUrl(filePath);

      const lastVersion = it.versoes[0]?.versao || 1.0;
      const newVersion = Math.floor(lastVersion) + 0.1;

      const { error: versionError } = await supabase
        .from('it_versoes')
        .insert([{
          it_id: it.id,
          versao: newVersion,
          arquivo_url: publicUrl
        }]);

      if (versionError) throw versionError;

      fetchITs();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (itId: string) => {
    if (!isAdmin) return;
    if (!confirm('Tem certeza que deseja excluir esta IT?')) return;

    try {
      const { error } = await supabase
        .from('its')
        .delete()
        .eq('id', itId);

      if (error) throw error;

      fetchITs();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleView = async (fileUrl: string, itId: string, versaoId: string) => {
    if (!viewerName.trim()) {
      setSelectedFile(fileUrl);
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
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Arquivamento de ITs</h2>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da IT
            </label>
            <input
              type="text"
              {...register('nome', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arquivo
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              {...register('arquivo', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.arquivo && (
              <p className="mt-1 text-sm text-red-600">{errors.arquivo.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
          >
            <Upload className="w-4 h-4" />
            Cadastrar IT
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {its.map((it) => (
          <div key={it.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{it.nome}</h3>
                <p className="text-sm text-gray-500">
                  Criado em: {new Date(it.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(it.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {it.versoes.map((versao) => (
                <div key={versao.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Versão {versao.versao.toFixed(1)}</p>
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
              ))}
            </div>

            {/* Upload new version button */}
            <div className="mt-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Nova Versão</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleNewVersion(it, file);
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Viewer Name Modal */}
      {showViewerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                    window.open(selectedFile, '_blank');
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

export default ArquivamentoITs;