import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { validateUsername, validatePassword } from '@/lib/validation';

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validasi username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      setErrors(usernameValidation.errors);
      return;
    }

    // Validasi password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors(passwordValidation.errors);
      return;
    }

    try {
      setLoading(true);
      
      // Ambil data users dari localStorage untuk dicocokkan
      const savedUsersStr = localStorage.getItem('admin_users');
      let isUserValid = false;
      
      if (savedUsersStr) {
        try {
          const savedUsers = JSON.parse(savedUsersStr);
          // Cari user yang aktif dan cocok dengan username dan password
          const matchedUser = savedUsers.find(
            (u: any) => u.username === username && u.isActive
          );
          if (matchedUser) {
            // Cocokkan password (bawaan default jika tidak diset saat migrasi awal)
            const expectedPassword = matchedUser.password || matchedUser.username;
            if (password === expectedPassword) {
              isUserValid = true;
            } else {
              setErrors(['Password salah']);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Fallback ke default users jika localStorage kosong / tidak ditemukan
      if (!isUserValid && errors.length === 0) {
        const defaultUsers: Record<string, string> = {
          'admin': 'admin',
          'manager': 'manager',
          'technician': 'technician'
        };
        if (defaultUsers[username] && defaultUsers[username] === password) {
          isUserValid = true;
        } else if (defaultUsers[username]) {
          setErrors(['Password salah']);
          setLoading(false);
          return;
        }
      }

      if (!isUserValid) {
        setErrors(['Username tidak ditemukan atau user dinonaktifkan']);
        return;
      }

      console.log('Login attempt:', { username, password });
      
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Login berhasil
      onLogin(username);
    } catch (error) {
      setErrors(['Login gagal. Periksa kembali username dan password.']);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Order System</h1>
            <p className="text-gray-600">Engineering Management Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Minimal 3 karakter (huruf saja)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: admin, mgr, op
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter (huruf + angka)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: Interbat2026, Engineering2026 (hindari password pasaran seperti pass123)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Demo Mode: Username (min 3 karakter huruf), Password (min 6 karakter huruf + angka)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
