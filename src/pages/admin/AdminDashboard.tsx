import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Database, Settings } from 'lucide-react';

function AdminDashboard() {
  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage users, create accounts, and control access',
      icon: Users,
      link: '/admin/users'
    },
    {
      title: 'Role Management',
      description: 'Configure roles and permissions for system access',
      icon: Shield,
      link: '/admin/roles'
    },
    {
      title: 'Database Configuration',
      description: 'Configure and manage database connections',
      icon: Database,
      link: '/admin/database'
    },
    {
      title: 'System Settings',
      description: 'Configure general system settings and preferences',
      icon: Settings,
      link: '/admin/settings'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.title}
              to={module.link}
              className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center text-center">
                <Icon className="w-12 h-12 text-[#3f4c6b] mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {module.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;