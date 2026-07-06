import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserPlus, Shield, UserCheck, Key, RefreshCw } from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  onRegisterUser: (userData: any) => Promise<void>;
}

export default function UserManagement({ currentUser, onRegisterUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'petugas'>('petugas');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch users list
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username || !password || !fullName) {
      setError('Mohon lengkapi seluruh kolom formulir.');
      return;
    }

    if (password.length < 5) {
      setError('Password harus memiliki panjang minimal 5 karakter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          password,
          fullName,
          role,
          requesterUsername: currentUser.username
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendaftarkan user baru.');
      }

      setMessage(data.message || 'User baru berhasil didaftarkan!');
      setUsername('');
      setPassword('');
      setFullName('');
      setRole('petugas');
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Form Tambah User - Left Column (Admin only sees this or can submit) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-mu-green" />
            Mendaftarkan Pengguna (User) Baru
          </h3>
          <p className="text-xs text-slate-500">
            Hanya Administrator yang diperbolehkan mendaftarkan petugas pencatatan baru
          </p>
        </div>

        {currentUser.role !== 'admin' ? (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs leading-normal">
            ⚠️ <strong>Akses Terbatas:</strong> Anda saat ini login sebagai <strong>Petugas</strong>. Pendaftaran user baru hanya dapat dilakukan oleh akun dengan peran <strong>Administrator</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg font-bold">
                ✓ {message}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Lengkap Petugas *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: H. M. Syakir"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: syakir_kajen"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi (Password) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 5 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Peran Hak Akses (Role) *
              </label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${role === 'petugas' ? 'border-emerald-600 bg-emerald-50/20 text-emerald-900 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="petugas"
                    checked={role === 'petugas'}
                    onChange={() => setRole('petugas')}
                    className="accent-emerald-700"
                  />
                  <span>Petugas Lapangan</span>
                </label>
                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${role === 'admin' ? 'border-emerald-600 bg-emerald-50/20 text-emerald-900 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="accent-emerald-700"
                  />
                  <span>Administrator</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-mu-green hover:bg-mu-green-hover text-white rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Mendaftarkan...' : 'Daftarkan Pengguna Baru'}
            </button>
          </form>
        )}
      </div>

      {/* List Active Users - Right Column */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-mu-green" />
              Daftar Petugas & Pengelola Aktif ({users.length})
            </h3>
            <p className="text-xs text-slate-500">
              Pengguna terdaftar yang memiliki otoritas input data aset tanah
            </p>
          </div>
          <button 
            onClick={fetchUsers}
            title="Segarkan data"
            className="p-1.5 hover:bg-slate-100 rounded-lg transition border border-slate-200 text-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Username</th>
                <th className="p-3">Peran (Role)</th>
                <th className="p-3 text-right">Dibuat Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-800">{user.fullName}</td>
                  <td className="p-3 font-mono text-emerald-800">{user.username}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${user.role === 'admin' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-blue-50 text-blue-800 border border-blue-100'}`}>
                      <Shield className="w-2.5 h-2.5" />
                      {user.role === 'admin' ? 'Administrator' : 'Petugas'}
                    </span>
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono text-[10px]">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
