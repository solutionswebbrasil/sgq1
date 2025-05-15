import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { FileText, Upload, AlertTriangle } from 'lucide-react';

type IT = {
  id: string;
  nome: string;
  departamento: string;
  created_at: string;
};

type FormData = {
  it_id: string;
  arquivo: FileList;
};

function RegistroITs() {
  const [its, setITs] = useState<IT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  const selectedITId = watch('it_id');

  useEffect(() => {
    fetchITs();
  }, []);

  useEffect(() => {
    if (selectedITId) {
      fetchLatestVersion(selectedITId);
    } else {
      setCurrentVersion(null);
    }
  }, [selectedITId]);

  const fetchITs = async () => {
    try {
      const { data, error } = await supabase
        .from('its')
        .select('*')
        .order('nome');

      if (error) throw error;

      setITs(data || []);
      setLoading(false);
    } catch (error: any) {
      setError('Erro ao carregar ITs: ' + error.message);
      setLoading(false);
    }
  };

  const fetchLatestVersion = async (itId: string) => {
    try {
      const { data, error } = await supabase
        .from('it_versoes')
        .select('versao')
        .eq('it_id', itId)
        .order('versao', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setCurrentVersion(data[0].versao);
      } else {
        setCurrentVersion(null);
      }
    } catch (error: any) {
      console.error('Erro ao buscar versão:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setSuccess(false);
      setUploadProgress(0);
      
      // Upload file to Storage
      const file = data.arquivo[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `its/${selectedITId}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('its')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('its')
        .getPublicUrl(filePath);

      // Calculate new version
      const newVersion = currentVersion ? currentVersion + 1 : 1;

      // Create version record
      const { error: versionError } = await supabase
        .from('it_versoes')
        .insert([{
          it_id: data.it_id,
          versao: newVersion,
          arquivo_url: publicUrl
        }]);

      if (versionError) throw versionError;

      setSuccess(true);
      reset();
      setUploadProgress(null);
      setCurrentVersion(newVersion);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      setError('Erro ao registrar IT: ' + error.message);
      setUploadProgress(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-semibold text-gray-800">Registro de ITs</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          IT registrada com sucesso!
        </div>
      )}

      {its.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700 font-medium">Nenhuma IT cadastrada.</p>
          <p className="text-yellow-600">Por favor, cadastre uma IT primeiro na seção "Cadastro de ITs".</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione a IT
            </label>
            <select
              {...register('it_id', { required: 'Campo obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione uma IT</option>
              {its.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.nome} - {it.departamento}
                </option>
              ))}
            </select>
            {errors.it_id && (
              <p className="mt-1 text-sm text-red-600">{errors.it_id.message}</p>
            )}
          </div>

          {selectedITId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                {currentVersion 
                  ? `Versão atual: v${currentVersion} - Será criada a versão v${currentVersion + 1}` 
                  : 'Primeira versão a ser criada: v1'}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anexar Arquivo (PPT ou PDF)
              </label>
              <div className="mt-1">
                <label className="flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg border-2 border-blue-200 border-dashed cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8" />
                  <span className="mt-2 text-base leading-normal">Selecione um arquivo</span>
                  <input
                    type="file"
                    className="hidden"
                    {...register('arquivo', { 
                      required: 'Campo obrigatório',
                      validate: {
                        fileType: (files) => {
                          if (files.length === 0) return true;
                          const file = files[0];
                          const ext = file.name.split('.').pop()?.toLowerCase();
                          return ['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(ext || '') || 
                            'Formato inválido. Apenas PDF, PPT, PPTX, DOC e DOCX são permitidos';
                        }
                      }
                    })}
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                  />
                </label>
                {errors.arquivo && (
                  <p className="mt-1 text-sm text-red-600">{errors.arquivo.message}</p>
                )}
              </div>
            </div>
          )}

          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="h-2 w-full bg-gray-200 rounded">
                <div 
                  className="h-full bg-blue-500 rounded" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Enviando: {uploadProgress}%</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedITId || uploadProgress !== null}
              className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              Enviar Arquivo
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegistroITs;