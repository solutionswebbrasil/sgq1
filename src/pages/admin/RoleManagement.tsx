import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, X } from 'lucide-react';

type Role = {
  id: string;
  name: string;
  description: string;
};

type Permission = {
  id: string;
  name: string;
  description: string;
  module: string;
};

function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      if (error) throw error;
      setRoles(data);
    } catch (error: any) {
      setError('Error fetching roles: ' + error.message);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module, name');
      if (error) throw error;
      setPermissions(data);
    } catch (error: any) {
      setError('Error fetching permissions: ' + error.message);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);
      if (error) throw error;
      setSelectedPermissions(data.map(rp => rp.permission_id));
    } catch (error: any) {
      setError('Error fetching role permissions: ' + error.message);
    }
  };

  const handleRoleSelect = async (roleId: string) => {
    setSelectedRole(roleId);
    await fetchRolePermissions(roleId);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert([{
          name: newRoleName,
          description: newRoleDescription
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccess('Role created successfully');
      setNewRoleName('');
      setNewRoleDescription('');
      fetchRoles();
    } catch (error: any) {
      setError('Error creating role: ' + error.message);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setSuccess('Role deleted successfully');
      fetchRoles();
    } catch (error: any) {
      setError('Error deleting role: ' + error.message);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      // Delete existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', selectedRole);

      // Insert new permissions
      if (selectedPermissions.length > 0) {
        const { error } = await supabase
          .from('role_permissions')
          .insert(
            selectedPermissions.map(permissionId => ({
              role_id: selectedRole,
              permission_id: permissionId
            }))
          );

        if (error) throw error;
      }

      setSuccess('Role permissions updated successfully');
    } catch (error: any) {
      setError('Error updating role permissions: ' + error.message);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Role Management</h2>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          {success}
        </div>
      )}

      {/* Create Role Form */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Role</h3>
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </div>
        </form>
      </div>

      {/* Roles List */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Roles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{role.name}</td>
                  <td className="px-4 py-3">{role.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRoleSelect(role.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Manage Permissions
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Assignment Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Assign Permissions
              </h3>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <div key={module} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">
                    {module}
                  </h4>
                  <div className="space-y-3">
                    {modulePermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, permission.id]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRole(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
              >
                <Save className="w-4 h-4" />
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;