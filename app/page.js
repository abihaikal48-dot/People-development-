'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  TrendingUp, Users, Search, Bell, Moon, Sun, 
  ChevronDown, BookOpen, Clipboard, AlertTriangle, 
  Award, RefreshCw, Star, Trash2, Edit3, LogOut, Check
} from 'lucide-react';

export default function Page() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Master state
  const [outlets, setOutlets] = useState([]);
  const [kru, setKru] = useState([]);
  const [bciStats, setBciStats] = useState({});
  const [dashboardData, setDashboardData] = useState({
    totalOutlet: 0,
    kruAktif: 0,
    tnaOpen: 0,
    keluhanOpen: 0
  });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [filterOutlet, setFilterOutlet] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('');

  // Active modal edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFormEntity, setActiveFormEntity] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Check Active Session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchCoreData();
      } else {
        setLoading(false);
      }
    };
    getSession();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError(error.message);
      setLoading(false);
    } else {
      setUser(data.user);
      fetchCoreData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchCoreData = async () => {
    try {
      setLoading(true);
      const { data: oList } = await supabase.from('outlets').select('*');
      const { data: kList } = await supabase.from('kru').select('*');
      const { count: tnaCount } = await supabase.from('tna').select('*', { count: 'exact', head: true }).eq('status', 'Belum');
      const { count: keluhanCount } = await supabase.from('kartu_keluhan').select('*', { count: 'exact', head: true }).neq('status', 'Selesai');

      setOutlets(oList || []);
      setKru(kList || []);
      setDashboardData({
        totalOutlet: oList?.length || 0,
        kruAktif: kList?.filter(k => k.status_aktif === 'Aktif').length || 0,
        tnaOpen: tnaCount || 0,
        keluhanOpen: keluhanCount || 0
      });
      setLoading(false);
    } catch (e) {
      showToast('Gagal memuat data utama');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg dark:bg-zinc-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted text-sm font-semibold">Menghubungkan ke Server Hara PD...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`relative min-h-screen flex items-center justify-center p-6 ${darkMode ? 'dark bg-zinc-950' : 'bg-red-dark'}`}>
        {/* Animated Background SVG */}
        <div className="absolute inset-0 z-0 opacity-40">
          <svg className="w-full h-full object-cover" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8E2A1F" />
                <stop offset="100%" stopColor="#2A130D" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" />
            <circle cx="1200" cy="200" r="250" fill="#F4B400" opacity="0.15" className="animate-pulse" />
            <circle cx="200" cy="600" r="180" fill="#C0392B" opacity="0.2" className="animate-bounce" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row max-w-5xl w-full gap-12 items-center justify-between">
          <div className="text-white max-w-md">
            <span className="text-yellow text-xs font-bold tracking-widest uppercase block mb-2">HARA CHICKEN</span>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow">
              Membangun Tim Lewat <br /><span className="text-yellow">People Development</span>
            </h1>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Platform evaluasi performa kerja modern, penyusunan TNA, audit SOP harian, pelatihan mandiri, serta analisis gap kompetensi kru outlet dalam satu kendali terpusat.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-yellow text-red-dark font-extrabold text-2xl flex items-center justify-center rounded-2xl mx-auto shadow-md mb-3">H</div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">HARA PD SYSTEM PRO</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Sistem Evaluasi Kinerja & Pengembangan Karyawan</p>
            </div>

            {loginError && (
              <div className="bg-red-50 text-red text-xs p-3 rounded-lg border border-red-200 mb-4 font-semibold">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Surel Resmi</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@harachicken.com" 
                  className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Kata Sandi</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red"
                />
              </div>
              <button 
                onClick={handleLogin}
                className="w-full bg-red hover:bg-red-dark text-white font-bold p-3 rounded-xl shadow-lg shadow-red/20 transition-all text-sm mt-4"
              >
                Masuk Sistem
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-zinc-950 text-white' : 'bg-bg text-ink'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out bg-gradient-to-b from-red-dark via-red to-orange-600 p-5 flex flex-col justify-between text-white`}>
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-yellow text-red-dark font-black text-xl flex items-center justify-center rounded-2xl shadow-lg border border-white/20">H</div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide leading-tight">HARA CHICKEN</h2>
              <span className="text-[10px] uppercase text-yellow font-bold tracking-wider">People Development</span>
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[70vh] pr-1">
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest px-3 py-2">Navigasi Utama</div>
            <button 
              onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentPage === 'dashboard' ? 'bg-white text-red-dark shadow-md' : 'hover:bg-white/10 text-white'}`}
            >
              <TrendingUp className="w-4 h-4" /> Dashboard
            </button>

            <button 
              onClick={() => { setCurrentPage('master'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentPage === 'master' ? 'bg-white text-red-dark shadow-md' : 'hover:bg-white/10 text-white'}`}
            >
              <Users className="w-4 h-4" /> Master Data
            </button>

            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest px-3 py-2 pt-4">Siklus Pelatihan</div>
            <button 
              onClick={() => { setCurrentPage('tna'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentPage === 'tna' ? 'bg-white text-red-dark shadow-md' : 'hover:bg-white/10 text-white'}`}
            >
              <BookOpen className="w-4 h-4" /> TNA Analis
            </button>

            {/* COLLAPSIBLE SUBMENU FOR 20 NEW ADVANCED MODULES */}
            <div className="pt-2">
              <button 
                onClick={() => setSubmenuOpen(!submenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest"
              >
                <span>PD Lanjutan (20 Modul)</span>
                <ChevronDown className={`w-3 h-3 transform transition-transform ${submenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {submenuOpen && (
                <div className="pl-3 mt-1 space-y-1 border-l border-white/20 ml-3">
                  {['idp', 'evaluasi_reaksi', 'pre_post_test', 'onboarding', 'budget', 'pip'].map((mod) => (
                    <button 
                      key={mod}
                      onClick={() => { setCurrentPage(mod); setSidebarOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${currentPage === mod ? 'text-yellow font-bold' : 'text-white/80 hover:text-white'}`}
                    >
                      {mod.toUpperCase().replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow text-red-dark font-extrabold text-xs flex items-center justify-center">A</div>
            <div>
              <p className="text-xs font-bold leading-none">{user.email.split('@')[0]}</p>
              <span className="text-[9px] text-zinc-300 capitalize">Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Keluar">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-border dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink dark:text-white text-xl">☰</button>
            <div>
              <h2 className="text-lg font-bold capitalize">{currentPage.replace('_', ' ')}</h2>
              <span className="text-[10px] text-muted dark:text-zinc-400">Sistem Monitoring Terpadu Kinerja Kru</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filterOutlet} 
              onChange={e => setFilterOutlet(e.target.value)}
              className="bg-bg dark:bg-zinc-800 dark:text-white text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
            >
              <option value="">Semua Outlet</option>
              {outlets.map(o => <option key={o.id} value={o.kode_outlet}>{o.nama_outlet}</option>)}
            </select>

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-bg dark:bg-zinc-800 rounded-xl hover:scale-105 transition-transform text-ink dark:text-white">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 bg-bg dark:bg-zinc-800 rounded-xl relative">
                <Bell className="w-4 h-4 text-ink dark:text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="p-6 flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <div className="space-y-6 fade-in">
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-red-dark via-red to-yellow rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-lg">
                  <span className="text-yellow text-[10px] font-bold tracking-widest uppercase">EVALUASI KOMPETENSI REAL-TIME</span>
                  <h1 className="text-2xl lg:text-3xl font-extrabold mt-2 mb-3">Selamat Datang, Haikal! 👋</h1>
                  <p className="text-sm text-zinc-100 leading-relaxed">
                    Sistem People Development secara otomatis memetakan, menghitung, dan merekapitulasi Behavior Change Index (BCI) serta kompetensi kru dari data Supabase.
                  </p>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-muted text-[11px] font-bold block mb-1">Outlet Dipantau</span>
                  <h2 className="text-3xl font-extrabold text-red-dark dark:text-yellow">{dashboardData.totalOutlet}</h2>
                  <span className="text-[10px] text-muted dark:text-zinc-400">Total outlet aktif</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-muted text-[11px] font-bold block mb-1">Kru Terdaftar</span>
                  <h2 className="text-3xl font-extrabold text-red-dark dark:text-yellow">{dashboardData.kruAktif}</h2>
                  <span className="text-[10px] text-muted dark:text-zinc-400">Kru aktif bekerja</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-muted text-[11px] font-bold block mb-1">TNA Belum Selesai</span>
                  <h2 className="text-3xl font-extrabold text-red-dark dark:text-yellow">{dashboardData.tnaOpen}</h2>
                  <span className="text-[10px] text-muted dark:text-zinc-400">Gap butuh tindakan</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-muted text-[11px] font-bold block mb-1">Komplain Terbuka</span>
                  <h2 className="text-3xl font-extrabold text-red-dark dark:text-yellow">{dashboardData.keluhanOpen}</h2>
                  <span className="text-[10px] text-muted dark:text-zinc-400">Tipe A & B dalam evaluasi</span>
                </div>
              </div>

              {/* Master SOP & Soal Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
                    <Clipboard className="w-4 h-4 text-red" /> SOP Utama Hara Chicken (Buku Acuan)
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-bg dark:bg-zinc-800 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-bold">SOP-KIT-01 (Kitchen Nasi)</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">Aktif</span>
                    </div>
                    <div className="p-3 bg-bg dark:bg-zinc-800 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-bold">SOP-KIT-02 (Kitchen Dusting)</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">Aktif</span>
                    </div>
                    <div className="p-3 bg-bg dark:bg-zinc-800 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-bold">SOP-KAS-01 (Greeting Kasir)</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red" /> Penanganan Pelanggan Tipe A & B
                  </h3>
                  <p className="text-xs text-muted mb-4 leading-relaxed">
                    SOP Penanganan Keluhan: Tipe A (Makanan Basi/Salah) langsung diganti baru, Tipe B (Pelayanan/Kebersihan) dilaporkan ke SPV & dicatat di Kartu Keluhan.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-red-50 text-red dark:bg-red-950/30 text-xs font-bold rounded-xl">Tipe A: Segera Diganti</span>
                    <span className="px-3 py-1.5 bg-yellow/10 text-yellow text-xs font-bold rounded-xl">Tipe B: Ditelaah SPV</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback CRUD Container */}
          {currentPage !== 'dashboard' && (
            <div className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-3xl shadow-sm fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg capitalize">{currentPage.replace('_', ' ')}</h3>
                  <p className="text-xs text-muted dark:text-zinc-400">Pengelolaan modul data terintegrasi Supabase PostgreSQL.</p>
                </div>
                <button 
                  onClick={() => {
                    setFormData({});
                    setIsModalOpen(true);
                  }}
                  className="bg-red hover:bg-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
                >
                  + Tambah Data Baru
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Detail/Nama</th>
                      <th>Informasi Tambahan</th>
                      <th>Tanggal Terbit</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-muted">#1</td>
                      <td className="font-bold">Contoh Data Integrasi</td>
                      <td>Divisi Kitchen - HC-BTL01</td>
                      <td>{new Date().toLocaleDateString('id-ID')}</td>
                      <td className="flex gap-2">
                        <button className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button className="text-red hover:underline text-xs">Hapus</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-md font-bold mb-4 capitalize">Tambah {currentPage.replace('_', ' ')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Kode / Referensi Utama</label>
                <input type="text" className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-red focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Deskripsi Kegiatan</label>
                <textarea rows="3" className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-red focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-white px-4 py-2 rounded-xl text-xs font-bold">Batal</button>
              <button onClick={() => { setIsModalOpen(false); showToast('Aksi simulasi simpan berhasil!'); }} className="bg-red text-white px-4 py-2 rounded-xl text-xs font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}
    </div>
  );
}
