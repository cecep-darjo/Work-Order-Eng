import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import type { Role } from '@/types';
import type { PageKey } from '@/App';
import { ROLES } from '@/lib/constants';
import { validateUsername, validatePassword } from '@/lib/validation';

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
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const savedUsers = localStorage.getItem('admin_users');
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch (e) {
        console.error('Failed to parse admin_users from localStorage', e);
      }
    }
    return [
      {
        id: '1',
        username: 'admin',
        email: 'admin@interbat.com',
        role: 'Admin',
        isActive: true,
        createdAt: '2026-01-01',
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@interbat.com',
        role: 'Manager',
        isActive: true,
        createdAt: '2026-01-15',
      },
      {
        id: '3',
        username: 'technician',
        email: 'tech@interbat.com',
        role: 'Technician',
        isActive: true,
        createdAt: '2026-02-01',
      },
    ];
  });

  const saveUsersToStorage = (updatedUsers: AdminUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
  };

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
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
    setErrors([]);
    setSuccessMessage('');
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
    setErrors([]);
    setSuccessMessage('');
  };

  const handleSaveUser = () => {
    const newErrors: string[] = [];

    // Validasi username
    if (!formData.username.trim()) {
      newErrors.push('Username harus diisi');
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.push(...usernameValidation.errors);
      }
    }

    // Check if username already exists (except when editing)
    if (!editingId && users.some((u) => u.username === formData.username)) {
      newErrors.push('Username sudah digunakan');
    }

    // Validasi password
    if (!formData.password.trim()) {
      newErrors.push('Password harus diisi');
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.push(...passwordValidation.errors);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingId) {
      // Edit user
      const updatedUsers = users.map((u) =>
        u.id === editingId
          ? {
              ...u,
              username: formData.username,
              email: formData.email,
              role: formData.role,
            }
          : u
      );
      saveUsersToStorage(updatedUsers);
      setSuccessMessage('User berhasil diperbarui!');
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
      saveUsersToStorage([...users, newUser]);
      setSuccessMessage('User berhasil ditambahkan!');
    }

    setTimeout(() => {
      handleCloseModal();
    }, 1500);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      const updatedUsers = users.filter((u) => u.id !== id);
      saveUsersToStorage(updatedUsers);
    }
  };

  const toggleUserStatus = (id: string) => {
    const updatedUsers = users.map((u) =>
      u.id === id
        ? { ...u, isActive: !u.isActive }
        : u
    );
    saveUsersToStorage(updatedUsers);
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

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-700">Validasi Gagal:</p>
                </div>
                <ul className="ml-7 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-700">✓ {successMessage}</p>
              </div>
            )}

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
                  placeholder="Minimal 3 karakter (huruf saja)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Contoh: admin, mgr, op</p>
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
                <p className="text-xs text-slate-500 mt-1">Gunakan password yang kuat agar tidak diblokir browser, misal: Interbat2026</p>
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
