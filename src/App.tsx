import { useState, useEffect, FormEvent } from 'react';
import { User, Asset } from './types';
import MapKajen from './components/MapKajen';
import StatsDashboard from './components/StatsDashboard';
import AssetForm from './components/AssetForm';
import AssetList from './components/AssetList';
import UserManagement from './components/UserManagement';
import ActivityLogs from './components/ActivityLogs';
import SQLViewer from './components/SQLViewer';
import { 
  Building2, 
  Map, 
  LayoutDashboard, 
  Database, 
  Users, 
  LogOut, 
  LogIn, 
  Plus, 
  Lock, 
  Compass, 
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'assets' | 'users' | 'sql'>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  
  // Asset Form States
  const [showAssetForm, setShowAssetForm] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Map Filter integration
  const [selectedRantingFilter, setSelectedRantingFilter] = useState<string | null>(null);

  // Fetch all assets from server on load
  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  };

  useEffect(() => {
    fetchAssets();
    
    // Check if session exists in localStorage
    const savedUser = localStorage.getItem('siatmu_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Handle Login submission
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername || !loginPassword) {
      setLoginError('Mohon isi username dan password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal.');
      }

      // Save session
      localStorage.setItem('siatmu_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Koneksi ke server terputus.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('siatmu_user');
    setCurrentUser(null);
    setIsLoggedIn(false);
    // If we're on users/management tab, reset to dashboard
    if (activeTab === 'users') {
      setActiveTab('dashboard');
    }
  };

  // Save asset (Insert or Update)
  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    const isEditing = !!editingAsset;
    const url = isEditing ? `/api/assets/${editingAsset.id}` : '/api/assets';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Gagal menyimpan aset.');
    }

    // Refresh and close
    fetchAssets();
    setShowAssetForm(false);
    setEditingAsset(null);
  };

  // Delete asset
  const handleDeleteAsset = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const res = await fetch(`/api/assets/${id}?username=${currentUser.username}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menghapus aset.');
      }

      fetchAssets();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menghapus data.');
    }
  };

  // Edit asset trigger
  const handleEditAssetTrigger = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  // Select Ranting from Map
  const handleSelectRantingFromMap = (rantingName: string | null) => {
    setSelectedRantingFilter(rantingName);
    // Auto shift to assets tab to let them see the filtered tabular list!
    if (rantingName) {
      setActiveTab('assets');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row selection:bg-emerald-200 overflow-x-hidden">
      
      {/* ----------------- SIDEBAR FOR DESKTOP (no-print) ----------------- */}
      <aside className="hidden md:flex w-64 bg-emerald-950 text-white flex-col flex-shrink-0 border-r border-emerald-900/30 sticky top-0 h-screen overflow-y-auto z-30 no-print">
        {/* Sidebar Header */}
        <div className="p-6 flex flex-col items-center border-b border-emerald-900/60 bg-emerald-950/40">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-md border border-emerald-800/10 shrink-0">
            <Compass className="w-10 h-10 text-emerald-700 animate-spin-slow" />
          </div>
          <h1 className="text-sm font-display font-extrabold text-center leading-tight tracking-tight text-white uppercase">
            SIMAS MUHA
          </h1>
          <p className="text-[10px] text-emerald-300 font-bold mt-1 uppercase tracking-widest text-center">
            KAJEN - PEKALONGAN
          </p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 space-y-1">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedRantingFilter(null); }}
            className={`w-full flex items-center px-6 py-3 text-xs font-semibold border-l-4 transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-emerald-900 border-emerald-400 text-white font-bold' : 'border-transparent text-emerald-100/75 hover:bg-emerald-900/60 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3 opacity-80" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center px-6 py-3 text-xs font-semibold border-l-4 transition-all cursor-pointer ${activeTab === 'map' ? 'bg-emerald-900 border-emerald-400 text-white font-bold' : 'border-transparent text-emerald-100/75 hover:bg-emerald-900/60 hover:text-white'}`}
          >
            <Map className="w-4 h-4 mr-3 opacity-80" />
            Peta Sebaran
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`w-full flex items-center px-6 py-3 text-xs font-semibold border-l-4 transition-all cursor-pointer ${activeTab === 'assets' ? 'bg-emerald-900 border-emerald-400 text-white font-bold' : 'border-transparent text-emerald-100/75 hover:bg-emerald-900/60 hover:text-white'}`}
          >
            <ClipboardList className="w-4 h-4 mr-3 opacity-80" />
            Pendataan Aset
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`w-full flex items-center px-6 py-3 text-xs font-semibold border-l-4 transition-all cursor-pointer ${activeTab === 'sql' ? 'bg-emerald-900 border-emerald-400 text-white font-bold' : 'border-transparent text-emerald-100/75 hover:bg-emerald-900/60 hover:text-white'}`}
          >
            <Database className="w-4 h-4 mr-3 opacity-80" />
            Struktur SQL
          </button>

          {isLoggedIn && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-6 py-3 text-xs font-semibold border-l-4 transition-all cursor-pointer ${activeTab === 'users' ? 'bg-emerald-900 border-emerald-400 text-white font-bold' : 'border-transparent text-emerald-100/75 hover:bg-emerald-900/60 hover:text-white'}`}
            >
              <Users className="w-4 h-4 mr-3 opacity-80" />
              Manajemen User
            </button>
          )}
        </nav>

        {/* Sidebar Footer Account Status */}
        <div className="p-5 border-t border-emerald-900/60 bg-emerald-950/20 text-xs">
          {isLoggedIn && currentUser ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-800 rounded-full border border-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-emerald-100" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white truncate leading-tight">{currentUser.fullName}</p>
                <p className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-300">
              <div className="w-8 h-8 rounded-full bg-emerald-900/60 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-white">Mode Tamu</p>
                <p className="text-[9px] text-emerald-400/80 leading-none mt-0.5">Hanya lihat data</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ----------------- MOBILE TOP BAR (no-print) ----------------- */}
      <nav className="md:hidden bg-emerald-950 text-white border-b border-emerald-900/60 py-3.5 px-4 flex justify-between items-center z-40 sticky top-0 no-print w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
            <Compass className="w-4.5 h-4.5 text-emerald-700 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-white text-xs tracking-tight uppercase leading-none">
              SIAT-MU KAJEN
            </h1>
            <span className="text-[9px] font-bold text-emerald-300 leading-none">
              Kajen - Pekalongan
            </span>
          </div>
        </div>

        <div>
          {isLoggedIn && currentUser ? (
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800/50 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1.5 bg-white text-emerald-950 hover:bg-slate-100 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </button>
          )}
        </div>
      </nav>

      {/* ----------------- MOBILE BOTTOM NAV (no-print) ----------------- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-150 py-2.5 px-4 flex justify-around items-center z-40 shadow-lg no-print">
        <button
          onClick={() => { setActiveTab('dashboard'); setSelectedRantingFilter(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${activeTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${activeTab === 'map' ? 'text-emerald-700' : 'text-slate-400'}`}
        >
          <Map className="w-5 h-5" />
          Peta
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${activeTab === 'assets' ? 'text-emerald-700' : 'text-slate-400'}`}
        >
          <ClipboardList className="w-5 h-5" />
          Aset
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${activeTab === 'sql' ? 'text-emerald-700' : 'text-slate-400'}`}
        >
          <Database className="w-5 h-5" />
          SQL
        </button>
        {isLoggedIn && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${activeTab === 'users' ? 'text-emerald-700' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            Pengelola
          </button>
        )}
      </div>

      {/* ----------------- MAIN APP CONTENT (RIGHT SIDE) ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        
        {/* Dynamic Desktop Header (no-print) */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/80 items-center justify-between px-8 shrink-0 no-print">
          <div>
            <h2 className="text-sm font-bold font-display text-slate-800 uppercase tracking-tight flex items-center gap-2">
              {activeTab === 'dashboard' && 'Ringkasan & Analisis Aset'}
              {activeTab === 'map' && 'Peta Geospasial Sebaran Aset'}
              {activeTab === 'assets' && 'Manajemen Database Inventaris'}
              {activeTab === 'sql' && 'Struktur Blueprint Database SQL'}
              {activeTab === 'users' && 'Sistem Pengelola & Log Aktivitas'}
            </h2>
            <p className="text-[10px] text-slate-500 leading-none mt-1">
              {activeTab === 'dashboard' && 'Statistik dan visualisasi data aset tanah Muhammadiyah Kajen'}
              {activeTab === 'map' && 'Peta interaktif sebaran lokasi aset tanah di wilayah Kajen'}
              {activeTab === 'assets' && 'Pencarian, pemfilteran, cetak laporan resmi, dan ekspor data'}
              {activeTab === 'sql' && 'Skema SQL, seeding data awal, dan panduan integrasi CodeIgniter'}
              {activeTab === 'users' && 'Daftar administrator/petugas dan rekam jejak aktivitas sistem'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={() => { setEditingAsset(null); setShowAssetForm(true); }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Aset Baru
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Masuk Sistem
              </button>
            )}

            <div className="h-6 w-px bg-slate-200"></div>

            {isLoggedIn && currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.fullName}</p>
                  <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">{currentUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Mode Tamu</span>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-10 max-w-7xl w-full mx-auto">
          
          {/* Welcome Header Info Bar (no-print) */}
          <div className="no-print bg-gradient-to-r from-emerald-950 to-emerald-850 text-white p-6 rounded-2xl shadow-sm border border-emerald-900/20 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-5 pointer-events-none">
              <Compass className="w-64 h-64" />
            </div>
            <div className="max-w-xl space-y-1.5 relative">
              <span className="text-[9px] bg-emerald-900/60 text-emerald-200 font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-800/40">
                Sistem Informasi Kehartabendaan (SIMAS MUHA)
              </span>
              <h2 className="font-display font-extrabold text-xl tracking-tight leading-snug">
                Sistem Informasi Aset Tanah Muhammadiyah
              </h2>
              <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
                Sistem pengelolaan data, visualisasi geospasial (geotagging), dan sertifikasi legal hukum seluruh aset tanah Pimpinan Cabang Muhammadiyah Kajen, Kabupaten Pekalongan.
              </p>
              
              {!isLoggedIn && (
                <div className="pt-2 text-[10px] text-emerald-300/80 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                  <span>💡 Kredensial Demo: gunakan akun <b className="text-white bg-emerald-900/60 px-1 py-0.5 rounded">admin</b> / pw: <b className="text-white bg-emerald-900/60 px-1 py-0.5 rounded">admin123</b></span>
                </div>
              )}
            </div>
          </div>

          {/* ----------------- ACTIVE TAB RENDERING ----------------- */}
          <div className="no-print">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tab 1: Dashboard */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <StatsDashboard assets={assets} />
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h4 className="font-display font-bold text-slate-800 text-sm">Ingin melihat visual peta interaktif?</h4>
                        <p className="text-xs text-slate-500">Jelajahi sebaran lokasi aset tanah Muhammadiyah di setiap Ranting Kajen secara spasial.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('map')} 
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Buka Peta Spasial
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Peta Sebaran */}
                {activeTab === 'map' && (
                  <div className="space-y-6">
                    <MapKajen 
                      assets={assets} 
                      onSelectRanting={handleSelectRantingFromMap}
                      selectedRanting={selectedRantingFilter}
                    />
                  </div>
                )}

                {/* Tab 3: Data Aset */}
                {activeTab === 'assets' && (
                  <div className="space-y-4">
                    {/* Plus Button for Logged-In Users */}
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <h3 className="font-display font-bold text-slate-800 text-base">Manajemen Database Inventaris</h3>
                        <p className="text-xs text-slate-500">Pencarian, pemfilteran, cetak laporan PDF resmi, dan ekspor CSV/Excel</p>
                      </div>
                      {isLoggedIn ? (
                        <button
                          onClick={() => { setEditingAsset(null); setShowAssetForm(true); }}
                          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Tambah Pendataan Aset Baru
                        </button>
                      ) : (
                        <div className="px-3.5 py-2 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-xs font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-600" />
                          Masuk sistem untuk menambah / mengedit data aset.
                        </div>
                      )}
                    </div>

                    <AssetList 
                      assets={assets}
                      onEdit={handleEditAssetTrigger}
                      onDelete={handleDeleteAsset}
                      isLoggedIn={isLoggedIn}
                      selectedRantingFilter={selectedRantingFilter}
                      onSelectRantingFilter={setSelectedRantingFilter}
                    />
                  </div>
                )}

                {/* Tab 4: SQL Blueprint */}
                {activeTab === 'sql' && (
                  <SQLViewer />
                )}

                {/* Tab 5: User & Logs */}
                {activeTab === 'users' && isLoggedIn && currentUser && (
                  <div className="space-y-6">
                    <UserManagement 
                      currentUser={currentUser} 
                      onRegisterUser={async () => {}} 
                    />
                    <ActivityLogs />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* -------------------- PRINT-ONLY BACKUP -------------------- */}
          <div className="print-only">
            <AssetList 
              assets={assets}
              onEdit={() => {}}
              onDelete={() => {}}
              isLoggedIn={false}
              selectedRantingFilter={selectedRantingFilter}
              onSelectRantingFilter={() => {}}
            />
          </div>

        </main>

        {/* ----------------- FOOTER (no-print) ----------------- */}
        <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400 no-print shrink-0">
          <p className="font-bold text-slate-600">© 2026 SIAT-MU Kajen</p>
          <p className="mt-1">Sistem Informasi Aset Tanah Persyarikatan Muhammadiyah Kajen, Pekalongan, Jawa Tengah</p>
          <p className="text-[10px] mt-2 font-mono">Dibuat menggunakan React, Express & SQL Blueprint</p>
        </footer>
      </div>

      {/* ----------------- ASSET DIALOG / SLIDE-OVER FORM ----------------- */}
      {showAssetForm && (
        <AssetForm 
          asset={editingAsset}
          onSave={handleSaveAsset}
          onClose={() => { setShowAssetForm(false); setEditingAsset(null); }}
          username={currentUser?.username || ''}
        />
      )}

      {/* ----------------- LOGIN MODAL ----------------- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-display font-black text-slate-800 text-base">Masuk Portal Kehartabendaan</h3>
              <p className="text-xs text-slate-500">Masukkan username & password petugas untuk mengakses database</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: admin"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg font-bold transition text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition shadow-md text-xs cursor-pointer"
                >
                  Masuk (Login)
                </button>
              </div>
            </form>

            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 text-center leading-relaxed">
              <strong>Info Login Demo:</strong><br />
              Admin: <b>admin</b> / pw: <b>admin123</b><br />
              Petugas: <b>petugas</b> / pw: <b>kajen123</b>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
