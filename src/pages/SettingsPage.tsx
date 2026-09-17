import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';
import type { Role } from '@/types';
import type { PageKey } from '@/App';
import { ROLES } from '@/lib/constants';

interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

interface SettingsPageProps {
  navigate?: (page: PageKey) => void;
}

export function SettingsPage({ navigate }: SettingsPageProps) {
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: '1',
      username: 'admin123',
      email: 'admin@interbat.com',
      role: 'Admin',
      isActive: true,
      createdAt: '2026-01-01',
    },
    {
      id: '2',
      username: 'manager456',
      email: 'manager@interbat.com',
      role: 'Manager',
      isActive: true,
      createdAt: '2026-01-15',
    },
    {
      id: '3',
      username: 'tech789',
      email: 'tech@interbat.com',
      role: 'Technician',
      isActive: true,
      createdAt: '2026-02-01',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Technician' as Role,
  });

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role,
      });
    } else {
      setEditingId(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'Technician',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'Technician',
    });
  };

  const handleSaveUser = () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      alert('Username dan Password harus diisi!');
      return;
    }

    if (formData.username.length < 6) {
      alert('Username minimal 6 karakter');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    if (editingId) {
      // Edit user
      setUsers(
        users.map((u) =>
          u.id === editingId
            ? {
                ...u,
                username: formData.username,
                email: formData.email,
                role: formData.role,
              }
            : u
        )
      );
    } else {
      // Add new user
      const newUser: AdminUser = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        role: formData.role,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }

    handleCloseModal();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, isActive: !u.isActive }
          : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengaturan Admin</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola user dan role sistem</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Tambah User
        </button>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dibuat</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{user.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{user.email || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'Admin'
                        ? 'bg-red-100 text-red-700'
                        : user.role === 'Manager'
                        ? 'bg-blue-100 text-blue-700'
                        : user.role === 'Supervisor'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition ${
                        user.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <Check className="w-3 h-3" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          Nonaktif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{user.createdAt}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Tidak ada user. Klik "Tambah User" untuk membuat user baru.</p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Edit User' : 'Tambah User Baru'}
            </h3>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Min 6 karakter, huruf + angka"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@interbat.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Min 6 karakter, huruf + angka"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as Role })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
