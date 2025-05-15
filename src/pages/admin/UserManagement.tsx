import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  email: string;
  created_at: string;
};

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

function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      const hasAdminRole = userRoles?.some(ur => ur.roles?.name === 'admin');
      
      if (!hasAdminRole) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchUsers();
      fetchRoles();
      fetchPermissions();
    } catch (error: any) {
      setError('Error checking admin access: ' + error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      setUsers(users);
    } catch (error: any) {
      setError('Error fetching users: ' + error.message);
    }
  };

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

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId);
      if (error) throw error;
      setSelectedRoles(data.map(ur => ur.role_id));
    } catch (error: any) {
      setError('Error fetching user roles: ' + error.message);
    }
  };

  const handleUserSelect = async (userId: string) => {
    setSelectedUser(userId);
    await fetchUserRoles(userId);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true
      });

      if (error) throw error;

      setSuccess('User created successfully');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchUsers();
    } catch (error: any) {
      setError('Error creating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      setError('Error deleting user: ' + error.message);
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      // Delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser);

      // Insert new roles
      if (selectedRoles.length > 0) {
        const { error } = await supabase
          .from('user_roles')
          .insert(
            selectedRoles.map(roleId => ({
              user_id: selectedUser,
              role_id: roleId
            }))
          );

        if (error) throw error;
      }

      setSuccess('User roles updated successfully');
    } catch (error: any) {
      setError('Error updating user roles: ' + error.message);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Management</h2>

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

      {/* Create User Form */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
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
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
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
              Create User
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUserSelect(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Manage Roles
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Assign Roles
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role.id]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(id => id !== role.id));
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                className="flex items-center gap-2 px-4 py-2 bg-[#3f4c6b] hover:bg-[#2c3e50] text-white rounded-md"
              >
                <Save className="w-4 h-4" />
                Save Roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;