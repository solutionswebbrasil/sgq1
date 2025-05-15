import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, Save, AlertTriangle } from 'lucide-react';

type DatabaseConfig = {
  id: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  is_active: boolean;
};

function DatabaseConfig() {
  const [config, setConfig] = useState<DatabaseConfig | null>(null);
  const [formData, setFormData] = useState({
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('database_configs')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // No rows returned
          throw error;
        }
      }

      if (data) {
        setConfig(data);
        setFormData({
          host: data.host,
          port: data.port,
          database_name: data.database_name,
          username: data.username,
          password: data.password
        });
      }
    } catch (error: any) {
      setError('Error fetching database configuration: ' + error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      
      ...prev,
      [name]: name === 'port' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      // First test the connection
      const response = await fetch('/api/test-database-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // If connection successful, save the configuration
      const { error: saveError } = await supabase
        .from('database_configs')
        .upsert([{
          ...formData,
          is_active: true
        }]);

      if (saveError) throw saveError;

      setSuccess('Database configuration saved and activated successfully');
      fetchConfig();
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-semibold text-gray-800">Database Configuration</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host
            </label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Port
            </label>
            <input
              type="number"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Database Name
          </label>
          <input
            type="text"
            name="database_name"
            value={formData.database_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {testing ? 'Testing Connection...' : 'Test and Activate Database'}
          </button>
        </div>
      </form>

      {config && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Host</p>
              <p className="font-medium">{config.host}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Port</p>
              <p className="font-medium">{config.port}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Database</p>
              <p className="font-medium">{config.database_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">{config.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseConfig;