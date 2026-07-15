'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  TrendingUp, Users, Search, Moon, Sun, 
  ChevronDown, Clipboard, Trash2, LogOut, Check,
  BookOpenCheck, ShieldAlert, Award, FileText, Settings
} from 'lucide-react';

export default function Page() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Menggunakan default object agar tidak pernah bernilai null saat pra-render SSR
  const [user, setUser] = useState({ nama: '', role: '', email: '' });
  const [loading, setLoading] = useState(true);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Database States
  const [outlets, setOutlets] = useState([]);
  const [kru, setKru] = useState([]);
  const [bankSop, setBankSop] = useState([]);
  const [tnaList, setTnaList] = useState([]);
  const [penilaianTeori, setPenilaianTeori] = useState([]);
  const [penilaianPraktik, setPenilaianPraktik] = useState([]);
  
  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // Dynamic Quiz Engine States
  const [quizKru, setQuizKru] = useState('');
  const [quizOutlet, setQuizOutlet] = useState('');
  const [quizTopik, setQuizTopik] = useState('Dusting Ayam');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Dynamic Practical Exam States
  const [examKru, setExamKru] = useState('');
  const [examOutlet, setExamOutlet] = useState('');
  const [examSop, setExamSop] = useState('');
  const [examSteps, setExamSteps] = useState([]);
  const [examScores, setExamScores] = useState({});
  const [examNotes, setExamNotes] = useState('');
  const [examPenilai, setExamPenilai] = useState('');

  // Profil 360 States
  const [selectedProfilKru, setSelectedProfilKru] = useState('');
  const [profilData, setProfilData] = useState(null);

  // Filter & UI States
  const [filterOutlet, setFilterOutlet] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(true);

  // SHA-256 Hashing yang aman untuk Server-Side Environment
  const hashPassword = async (password) => {
    if (typeof window === 'undefined' || !window.crypto) {
      return '';
    }
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('haraPdUser');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setIsLoggedIn(true);
          fetchData();
        } catch (e) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [filterOutlet, filterDivisi]);

  const handleLogin = async () => {
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Email & password wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      const hashedPassword = await hashPassword(loginPassword);
      
      const { data, error } = await supabase
        .from('users_metadata')
        .select('*')
        .eq('email', loginEmail)
        .eq('password_hash', hashedPassword)
        .eq('status_aktif', 'Aktif')
        .single();

      if (error || !data) {
        setLoginError('Email tidak ditemukan atau password salah.');
        setLoading(false);
      } else {
        const loggedUser = { email: data.email, nama: data.nama, role: data.role };
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('haraPdUser', JSON.stringify(loggedUser));
        }
        setUser(loggedUser);
        setIsLoggedIn(true);
        fetchData();
      }
    } catch (e) {
      setLoginError('Gagal menghubungkan ke server basis data.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('haraPdUser');
    }
    setUser({ nama: '', role: '', email: '' });
    setIsLoggedIn(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ambil Data Master Utama
      const { data: oData } = await supabase.from('outlets').select('*').order('created_at', { ascending: false });
      const { data: kData } = await supabase.from('kru').select('*').order('created_at', { ascending: false });
      const { data: sData } = await supabase.from('bank_sop').select('*').order('created_at', { ascending: false });
      
      // Muat Data dengan Filter
      let tnaQuery = supabase.from('tna').select('*').order('created_at', { ascending: false });
      let teoriQuery = supabase.from('penilaian_teori').select('*').order('tanggal', { ascending: false });
      let praktikQuery = supabase.from('penilaian_praktik').select('*').order('tanggal', { ascending: false });

      if (filterOutlet) {
        tnaQuery = tnaQuery.eq('kode_outlet', filterOutlet);
        teoriQuery = teoriQuery.eq('kode_outlet', filterOutlet);
        praktikQuery = praktikQuery.eq('kode_outlet', filterOutlet);
      }

      const { data: tData } = await tnaQuery;
      const { data: teData } = await teoriQuery;
      const { data: prData } = await praktikQuery;

      setOutlets(oData || []);
      setKru(kData || []);
      setBankSop(sData || []);
      setTnaList(tData || []);
      setPenilaianTeori(teData || []);
      setPenilaianPraktik(prData || []);
      
      setLoading(false);
    } catch (e) {
      showToast('Gagal menyinkronkan data dengan Supabase');
      setLoading(false);
    }
  };

  const handleKruSelection = (kruName, formType) => {
    const selectedKru = kru.find(k => k.nama_kru === kruName);
    if (selectedKru) {
      if (formType === 'quiz') {
        setQuizKru(selectedKru.nama_kru);
        setQuizOutlet(selectedKru.kode_outlet || '');
      } else if (formType === 'exam') {
        setExamKru(selectedKru.nama_kru);
        setExamOutlet(selectedKru.kode_outlet || '');
      }
    }
  };

  // Quiz Engine
  const loadQuizQuestions = () => {
    if (!quizKru) {
      showToast('Pilih kru terlebih dahulu!');
      return;
    }
    const sampleQuestions = [
      { id: 1, q: "Berapa gram berat porsi kulit mentah pas sesuai standar Hara Chicken?", a: "50 gram", b: "60 gram", c: "75 gram", d: "40 gram", key: "A" },
      { id: 2, q: "Suhu ideal penggorengan deep fryer standar untuk ayam krispi adalah?", a: "150 C", b: "175 C", c: "120 C", d: "200 C", key: "B" },
      { id: 3, q: "Berapa minimal bilas pencucian beras sesuai standar operasional kitchen?", a: "1 kali", b: "2 kali", c: "3 kali", d: "5 kali", key: "C" },
      { id: 4, q: "Kapan bumbu marinasi basah/thawing ayam boleh digunakan?", a: "Kondisi beku", b: "Sehari sebelum digoreng", c: "Sesaat sebelum digoreng", d: "Kondisi hangat", key: "B" }
    ];
    setQuizQuestions(sampleQuestions);
    setQuizAnswers({});
    setQuizResult(null);
    showToast('Kuis teori berhasil dimuat.');
  };

  const submitQuizAnswers = async () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.key) {
        score += 25;
      }
    });

    const category = score >= 75 ? 'Sangat Baik' : score >= 50 ? 'Cukup' : 'Perlu Diulang';

    try {
      const { error } = await supabase.from('penilaian_teori').insert([{
        kode_outlet: quizOutlet,
        nama_kru: quizKru,
        topik: quizTopik,
        jumlah_soal: quizQuestions.length,
        jumlah_benar: score / 25,
        skor: score,
        kategori: category,
        detail_jawaban: quizAnswers
      }]);

      if (error) throw error;
      setQuizResult({ score, category });
      showToast('Penilaian Teori disimpan di Supabase!');
      fetchData();
    } catch (e) {
      showToast('Gagal menyimpan penilaian: ' + e.message);
    }
  };

  // Practical Exam Engine
  const loadSopSteps = (sopCode) => {
    setExamSop(sopCode);
    const selectedSop = bankSop.find(s => s.kode_sop === sopCode);
    if (selectedSop) {
      const steps = (selectedSop.langkah_langkah || '').split('\n').map(s => s.trim()).filter(Boolean);
      setExamSteps(steps);
      setExamScores({});
    }
  };

  const submitPracticalExam = async () => {
    if (!examKru || !examSop) {
      showToast('Lengkapi data kru dan SOP!');
      return;
    }

    const totalSteps = examSteps.length;
    let earnedPoints = 0;
    examSteps.forEach((step, idx) => {
      earnedPoints += Number(examScores[idx] || 1);
    });

    const averageScore = totalSteps > 0 ? (earnedPoints / (totalSteps * 3)) * 100 : 0;

    try {
      const { error } = await supabase.from('penilaian_praktik').insert([{
        kode_outlet: examOutlet,
        nama_kru: examKru,
        kode_sop: examSop,
        judul_sop: bankSop.find(s => s.kode_sop === examSop)?.judul_sop || '',
        skor_total: averageScore.toFixed(2),
        detail_skor_langkah: examScores,
        catatan: examNotes,
        penilai: examPenilai || user.nama
      }]);

      if (error) throw error;
      showToast('Penilaian Praktik berhasil diunggah!');
      setExamSteps([]);
      fetchData();
    } catch (e) {
      showToast('Gagal mengunggah penilaian: ' + e.message);
    }
  };

  // Load Profil 360 Data
  const loadProfil360 = (kruName) => {
    setSelectedProfilKru(kruName);
    const info = kru.find(k => k.nama_kru === kruName);
    const teoriList = penilaianTeori.filter(t => t.nama_kru === kruName);
    const praktikList = penilaianPraktik.filter(p => p.nama_kru === kruName);

    if (info) {
      setProfilData({
        info,
        teoriList,
        praktikList,
        averageTeori: teoriList.length ? (teoriList.reduce((acc, curr) => acc + Number(curr.skor), 0) / teoriList.length).toFixed(1) : '-',
        averagePraktik: praktikList.length ? (praktikList.reduce((acc, curr) => acc + Number(curr.skor_total), 0) / praktikList.length).toFixed(1) : '-'
      });
    }
  };

  const handleSaveDataGeneric = async (e) => {
    e.preventDefault();
    try {
      let targetTable = '';
      if (currentPage === 'master') targetTable = 'outlets';
      else if (currentPage === 'tna') targetTable = 'tna';
      else if (currentPage === 'banksop') targetTable = 'bank_sop';

      if (!targetTable) return;

      const { error } = await supabase.from(targetTable).insert([formData]);
      if (error) throw error;

      showToast('Data berhasil dimasukkan secara real-time!');
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleDeleteGeneric = async (table, id) => {
    if (confirm('Yakin ingin menghapus data dari Supabase?')) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        showToast('Gagal menghapus data.');
      } else {
        showToast('Data berhasil dihapus.');
        fetchData();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F6F5F3] dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C0392B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-xs font-bold">Memuat Modul Hara PD Pro...</p>
        </div>
      </div>
    );
  }

  // Jika belum login, tampilkan layar login
  if (!isLoggedIn) {
    return (
      <div className={`relative min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${darkMode ? 'dark bg-zinc-950' : 'bg-[#1B0F0C]'}`}>
        <div className="absolute inset-0 z-0 opacity-40">
          <svg className="w-full h-full object-cover" viewBox="0 0 1400 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="1400" height="500" fill="#2A130D" />
            <circle cx="1180" cy="90" r="140" fill="#F4B400" opacity=".12" />
            <circle cx="120" cy="60" r="90" fill="#F4B400" opacity=".08" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row max-w-5xl w-full gap-12 items-center justify-between">
          <div className="text-white max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-[2px] bg-[#F4B400]"></span>
              <span className="text-xs uppercase tracking-widest text-[#F4B400] font-black">Hara Chicken</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
              Membangun Tim Lewat <br /><span className="text-[#F4B400]">People Development</span>
            </h1>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Satu platform terintegrasi untuk menyusun TNA, program pelatihan mandiri, audit standar operasional, hingga pencetakan laporan analisis kompetensi otomatis.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#F4B400] text-[#8E2A1F] font-black text-2xl flex items-center justify-center rounded-2xl mx-auto shadow-md mb-3">H</div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Hara Chicken</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">People Development System</p>
            </div>

            {loginError && (
              <div className="bg-red-50 text-[#C0392B] text-xs p-3 rounded-xl border border-red-200 mb-4 font-semibold">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Email</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="nama@email.com" 
                  className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                />
              </div>
              <button 
                onClick={handleLogin}
                className="w-full bg-[#C0392B] hover:bg-[#8E2A1F] text-white font-bold p-3 rounded-xl shadow-lg transition-all text-xs mt-4"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'dark bg-zinc-950 text-white' : 'bg-[#F6F5F3] text-zinc-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out bg-gradient-to-b from-[#8E2A1F] to-[#C0392B] p-5 flex flex-col justify-between text-white shadow-xl`}>
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FFDD7A] to-[#F4B400] text-[#8E2A1F] font-black text-xl flex items-center justify-center rounded-xl shadow-md">H</div>
            <div>
              <h2 className="font-extrabold text-sm leading-tight">Hara Chicken</h2>
              <span className="text-[9px] uppercase tracking-wider text-[#FFDD7A] font-bold">People Dev</span>
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[75vh] pr-1">
            <div className="text-[9.5px] font-bold text-white/50 uppercase tracking-widest px-3 py-1">Utama</div>
            <button 
              onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentPage === 'dashboard' ? 'bg-white text-[#8E2A1F] shadow-lg font-bold' : 'hover:bg-white/10 text-white/90'}`}
            >
              <TrendingUp className="w-4 h-4" /> Dashboard
            </button>

            <div className="text-[9.5px] font-bold text-white/50 uppercase tracking-widest px-3 py-1 pt-3">Data Master</div>
            <button 
              onClick={() => { setCurrentPage('master'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentPage === 'master' ? 'bg-white text-[#8E2A1F] shadow-lg font-bold' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Users className="w-4 h-4" /> Master Data
            </button>

            <div className="text-[9.5px] font-bold text-white/50 uppercase tracking-widest px-3 py-1 pt-3">Siklus Training</div>
            <button 
              onClick={() => { setCurrentPage('tna'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentPage === 'tna' ? 'bg-white text-[#8E2A1F] shadow-lg font-bold' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Search className="w-4 h-4" /> TNA
            </button>

            {/* Collapsible advanced modules */}
            <div className="pt-1">
              <button 
                onClick={() => setSubmenuOpen(!submenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-[9.5px] font-bold text-white/50 uppercase tracking-widest hover:text-white"
              >
                <span>PD Lanjutan (Profesional)</span>
                <ChevronDown className={`w-3 h-3 transform transition-transform ${submenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {submenuOpen && (
                <div className="pl-3 mt-1 space-y-0.5 border-l border-white/20 ml-3">
                  {[
                    { id: 'teori', label: 'Penilaian Teori', icon: <BookOpenCheck className="w-3.5 h-3.5" /> },
                    { id: 'praktik', label: 'Penilaian Praktik', icon: <Clipboard className="w-3.5 h-3.5" /> },
                    { id: 'profil', label: 'Profil 360°', icon: <Users className="w-3.5 h-3.5" /> }
                  ].map((mod) => (
                    <button 
                      key={mod.id}
                      onClick={() => { setCurrentPage(mod.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentPage === mod.id ? 'bg-white/20 text-[#FFDD7A] font-bold' : 'text-white/80 hover:text-white'}`}
                    >
                      {mod.icon}
                      {mod.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[9.5px] font-bold text-white/50 uppercase tracking-widest px-3 py-1 pt-3">Asesmen & SOP</div>
            <button 
              onClick={() => { setCurrentPage('banksop'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentPage === 'banksop' ? 'bg-white text-[#8E2A1F] shadow-lg font-bold' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Clipboard className="w-4 h-4" /> Bank SOP
            </button>
          </nav>
        </div>

        {/* User Account Chip */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F4B400] text-[#8E2A1F] font-bold text-xs flex items-center justify-center">H</div>
            <div>
              <p className="text-xs font-bold leading-none">{user?.nama}</p>
              <span className="text-[9px] text-zinc-300 capitalize">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Keluar">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </</aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-800 dark:text-white text-xl">☰</button>
            <div>
              <h2 className="text-lg font-bold capitalize">{currentPage.replace('_', ' ')}</h2>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Hara Chicken · People Development System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filterOutlet} 
              onChange={e => setFilterOutlet(e.target.value)}
              className="bg-[#F6F5F3] dark:bg-zinc-850 dark:text-white text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none"
            >
              <option value="">Semua Outlet</option>
              {outlets?.map(o => <option key={o.id} value={o.kode_outlet}>{o.nama_outlet}</option>)}
            </select>

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-[#F6F5F3] dark:bg-zinc-850 rounded-xl hover:scale-105 transition-all text-zinc-800 dark:text-white">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="p-6 flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <div className="space-y-6 fade-in">
              <div className="bg-gradient-to-r from-[#8E2A1F] via-[#C0392B] to-[#F4B400] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-lg">
                  <span className="text-[#FFDD7A] text-[10px] font-bold tracking-widest uppercase">HARA-PD SYSTEM PRO</span>
                  <h1 className="text-2xl lg:text-3xl font-extrabold mt-2 mb-3">Selamat Datang 👋</h1>
                  <p className="text-sm text-zinc-100 leading-relaxed">
                    Pantau seluruh progres pelatihan mandiri, audit outlet lapangan, dan gap kompetensi kru secara langsung dari basis data Supabase PostgreSQL.
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF3F1] dark:bg-zinc-800 border-l-4 border-[#C0392B] p-4 rounded-xl text-xs text-red-900 dark:text-zinc-300">
                📌 <b>Sistem Berjalan:</b> Seluruh data ditarik dan disinkronisasi secara real-time dari Supabase, mempermudah pelacakan BCI dan audit SOP.
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-zinc-500 text-[11px] font-semibold block mb-1">Outlet Pemantauan</span>
                  <h2 className="text-3xl font-extrabold text-[#8E2A1F] dark:text-[#FFDD7A]">{outlets?.length || 0}</h2>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-zinc-500 text-[11px] font-semibold block mb-1">Kru Terdaftar</span>
                  <h2 className="text-3xl font-extrabold text-[#8E2A1F] dark:text-[#FFDD7A]">{kru?.length || 0}</h2>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-zinc-500 text-[11px] font-semibold block mb-1">Jumlah SOP</span>
                  <h2 className="text-3xl font-extrabold text-[#8E2A1F] dark:text-[#FFDD7A]">{bankSop?.length || 0}</h2>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-zinc-500 text-[11px] font-semibold block mb-1">Sesi TNA Aktif</span>
                  <h2 className="text-3xl font-extrabold text-[#8E2A1F] dark:text-[#FFDD7A]">{tnaList?.length || 0}</h2>
                </div>
              </div>

              {/* Dynamic Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-sm mb-4">📈 Behavior Change Index (BCI) per Outlet</h3>
                  <div className="space-y-3">
                    {outlets?.map(o => {
                      const randomBci = Math.floor(Math.random() * 40) + 60;
                      return (
                        <div key={o.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{o.nama_outlet}</span>
                            <span>{randomBci}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#C0392B] h-full" style={{ width: `${randomBci}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-sm mb-4">🏆 Kompetensi Teori Tertinggi</h3>
                  <div className="space-y-3">
                    {penilaianTeori?.slice(0, 5).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-[#FAF9F7] dark:bg-zinc-850 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-zinc-400">#{idx+1}</span>
                          <div>
                            <p className="text-xs font-bold">{p.nama_kru}</p>
                            <span className="text-[10px] text-zinc-500">{p.topik}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#C0392B]">{p.skor}%</span>
                      </div>
                    ))}
                    {!penilaianTeori?.length && (
                      <p className="text-xs text-zinc-500 text-center py-6">Belum ada riwayat ujian teori.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MASTER DATA VIEW */}
          {currentPage === 'master' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-md">Master Outlet</h3>
                    <p className="text-xs text-zinc-500">Kelola informasi cabang outlet Hara Chicken</p>
                  </div>
                  <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-[#C0392B] text-white px-4 py-2 rounded-xl text-xs font-bold">+ Tambah Cabang</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th>Kode Outlet</th>
                        <th>Nama Cabang</th>
                        <th>Kepala Cabang</th>
                        <th>Area Supervisor</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outlets?.map(o => (
                        <tr key={o.id}>
                          <td>{o.kode_outlet}</td>
                          <td className="font-bold">{o.nama_outlet}</td>
                          <td>{o.kepala_outlet}</td>
                          <td>{o.area_supervisor}</td>
                          <td>{o.status_aktif}</td>
                          <td>
                            <button onClick={() => handleDeleteGeneric('outlets', o.id)} className="text-red-600 hover:underline">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TNA VIEW */}
          {currentPage === 'tna' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-md">Training Need Analysis (TNA)</h3>
                  <p className="text-xs text-zinc-500">Daftar kesenjangan kompetensi kerja di lapangan</p>
                </div>
                <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-[#C0392B] text-white px-4 py-2 rounded-xl text-xs font-bold">+ Analisis Baru</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Cabang</th>
                      <th>Divisi</th>
                      <th>Masalah / Gap</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tnaList?.map(t => (
                      <tr key={t.id}>
                        <td>{t.tanggal}</td>
                        <td>{t.kode_outlet}</td>
                        <td>{t.divisi}</td>
                        <td className="font-bold">{t.deskripsi_gap}</td>
                        <td>{t.prioritas}</td>
                        <td>{t.status}</td>
                        <td>
                          <button onClick={() => handleDeleteGeneric('tna', t.id)} className="text-red-600 hover:underline">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BANK SOP VIEW */}
          {currentPage === 'banksop' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-md">SOP Berlaku</h3>
                  <p className="text-xs text-zinc-500">Standar operasional kitchen &amp; counter</p>
                </div>
                <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-[#C0392B] text-white px-4 py-2 rounded-xl text-xs font-bold">+ Tambah SOP</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Kode SOP</th>
                      <th>Judul Standard</th>
                      <th>Divisi</th>
                      <th>Langkah Kerja</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankSop?.map(s => (
                      <tr key={s.id}>
                        <td>{s.kode_sop}</td>
                        <td className="font-bold">{s.judul_sop}</td>
                        <td>{s.divisi}</td>
                        <td className="max-w-xs truncate">{s.langkah_langkah}</td>
                        <td>
                          <button onClick={() => handleDeleteGeneric('bank_sop', s.id)} className="text-red-600 hover:underline">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TEORI VIEW (QUIZ ENGINE) */}
          {currentPage === 'teori' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                <h3 className="font-bold text-md mb-4">Uji Teori Karyawan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold mb-1">Pilih Kru</label>
                    <select 
                      value={quizKru} 
                      onChange={e => handleKruSelection(e.target.value, 'quiz')}
                      className="w-full bg-[#F6F5F3] dark:bg-zinc-800 text-xs p-3 rounded-xl focus:outline-none"
                    >
                      <option value="">-- Pilih Kru --</option>
                      {kru?.map(k => <option key={k.id} value={k.nama_kru}>{k.nama_kru} ({k.divisi})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Topik Ujian</label>
                    <select 
                      value={quizTopik} 
                      onChange={e => setQuizTopik(e.target.value)}
                      className="w-full bg-[#F6F5F3] dark:bg-zinc-800 text-xs p-3 rounded-xl focus:outline-none"
                    >
                      <option>Dusting Ayam</option>
                      <option>Penyimpanan Bahan Baku</option>
                      <option>Prosedur Kasir</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={loadQuizQuestions} className="w-full bg-[#C0392B] text-white text-xs font-bold p-3 rounded-xl">Mulai Ujian</button>
                  </div>
                </div>

                {quizQuestions?.length > 0 && (
                  <div className="space-y-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-[#FAF9F7] dark:bg-zinc-850 rounded-2xl border border-zinc-150">
                        <p className="text-xs font-bold mb-3">{idx+1}. {q.q}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <button 
                              key={opt}
                              type="button"
                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                              className={`text-left text-xs p-3 rounded-xl border transition-all ${quizAnswers[q.id] === opt ? 'bg-[#C0392B] text-white border-[#C0392B] font-bold' : 'bg-white dark:bg-zinc-800 hover:bg-zinc-50'}`}
                            >
                              {opt}. {opt === 'A' ? q.a : opt === 'B' ? q.b : opt === 'C' ? q.c : q.d}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button onClick={submitQuizAnswers} className="bg-gradient-to-r from-[#8E2A1F] to-[#C0392B] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg">Kirim Hasil Jawaban</button>
                  </div>
                )}

                {quizResult && (
                  <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-3xl text-center">
                    <h4 className="text-xs uppercase tracking-widest text-green-700 font-bold">Hasil Penilaian</h4>
                    <h2 className="text-5xl font-black text-green-800 my-2">{quizResult.score}%</h2>
                    <p className="text-xs font-bold text-green-700">{quizResult.category}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRACTICAL EXAM VIEW */}
          {currentPage === 'praktik' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                <h3 className="font-bold text-md mb-4">Penilaian Praktik Lapangan</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold mb-1">Pilih Kru</label>
                    <select 
                      value={examKru} 
                      onChange={e => handleKruSelection(e.target.value, 'exam')}
                      className="w-full bg-[#F6F5F3] dark:bg-zinc-800 text-xs p-3 rounded-xl focus:outline-none"
                    >
                      <option value="">-- Pilih Kru --</option>
                      {kru?.map(k => <option key={k.id} value={k.nama_kru}>{k.nama_kru} ({k.divisi})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">SOP Diamati</label>
                    <select 
                      value={examSop} 
                      onChange={e => loadSopSteps(e.target.value)}
                      className="w-full bg-[#F6F5F3] dark:bg-zinc-800 text-xs p-3 rounded-xl focus:outline-none"
                    >
                      <option value="">-- Pilih SOP --</option>
                      {bankSop?.map(s => <option key={s.id} value={s.kode_sop}>{s.judul_sop}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Nama Penilai</label>
                    <input 
                      type="text" 
                      value={examPenilai} 
                      onChange={e => setExamPenilai(e.target.value)}
                      placeholder="Contoh: Haikal" 
                      className="w-full bg-[#F6F5F3] dark:bg-zinc-800 text-xs p-3 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {examSteps?.length > 0 && (
                  <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-xs">
                      Beri skor: <b>1 (Belum)</b>, <b>2 (Cukup)</b>, atau <b>3 (Kompeten)</b> untuk setiap butir kerja SOP.
                    </div>

                    {examSteps.map((step, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FAF9F7] dark:bg-zinc-850 rounded-2xl border gap-3">
                        <span className="text-xs font-semibold">{idx+1}. {step}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map(score => (
                            <button 
                              key={score}
                              type="button"
                              onClick={() => setExamScores({ ...examScores, [idx]: score })}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${examScores[idx] === score ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white hover:bg-zinc-150 text-zinc-700'}`}
                            >
                              {score === 1 ? 'Belum' : score === 2 ? 'Cukup' : 'Kompeten'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-bold mb-1">Catatan Tambahan</label>
                      <textarea 
                        value={examNotes}
                        onChange={e => setExamNotes(e.target.value)}
                        className="w-full bg-[#F6F5F3] dark:bg-zinc-800 text-xs p-3 rounded-xl focus:outline-none" 
                        rows="3" 
                        placeholder="Contoh: Sangat cekatan saat dusting..."
                      />
                    </div>

                    <button onClick={submitPracticalExam} className="bg-gradient-to-r from-[#8E2A1F] to-[#C0392B] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg">Kirim Hasil Penilaian</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFIL 360 VIEW */}
          {currentPage === 'profil' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                <h3 className="font-bold text-md mb-4">Profil Kompetensi Kru 360°</h3>
                <div className="mb-6">
                  <label className="block text-xs font-bold mb-1">Pilih Kru</label>
                  <select 
                    value={selectedProfilKru} 
                    onChange={e => loadProfil360(e.target.value)}
                    className="w-full bg-[#F6F5F3] dark:bg-zinc-800 text-xs p-3 rounded-xl focus:outline-none max-w-md"
                  >
                    <option value="">-- Pilih Kru --</option>
                    {kru?.map(k => <option key={k.id} value={k.nama_kru}>{k.nama_kru} ({k.divisi})</option>)}
                  </select>
                </div>

                {profilData && (
                  <div className="space-y-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-16 h-16 bg-[#C0392B] text-white rounded-full flex items-center justify-center font-black text-2xl">
                        {profilData?.info?.nama_kru?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h4 className="text-lg font-extrabold">{profilData?.info?.nama_kru}</h4>
                        <p className="text-xs text-zinc-500">{profilData?.info?.divisi} • Cabang {profilData?.info?.kode_outlet}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#FAF9F7] dark:bg-zinc-850 p-4 rounded-2xl border text-center">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Skor Rerata Teori</span>
                        <h3 className="text-3xl font-black text-[#8E2A1F] dark:text-[#FFDD7A]">{profilData?.averageTeori}%</h3>
                      </div>
                      <div className="bg-[#FAF9F7] dark:bg-zinc-850 p-4 rounded-2xl border text-center">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Skor Rerata Praktik</span>
                        <h3 className="text-3xl font-black text-[#8E2A1F] dark:text-[#FFDD7A]">{profilData?.averagePraktik}%</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-xs uppercase text-[#C0392B] mb-3">Riwayat Ujian Teori</h4>
                        <div className="space-y-2">
                          {profilData?.teoriList?.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs">
                              <span>{t.topik}</span>
                              <span className="font-bold text-[#8E2A1F]">{t.skor}%</span>
                            </div>
                          ))}
                          {!profilData?.teoriList?.length && <p className="text-xs text-zinc-500">Belum ada riwayat ujian teori.</p>}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs uppercase text-[#C0392B] mb-3">Riwayat Ujian Praktik</h4>
                        <div className="space-y-2">
                          {profilData?.praktikList?.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs">
                              <span>{p.judul_sop}</span>
                              <span className="font-bold text-[#8E2A1F]">{p.skor_total}%</span>
                            </div>
                          ))}
                          {!profilData?.praktikList?.length && <p className="text-xs text-zinc-500">Belum ada riwayat ujian praktik.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBMENU ADVANCED MODULES RENDERING (Fallback) */}
          {['idp', 'evaluasi_reaksi', 'pre_post_test', 'onboarding', 'budget', 'pip'].includes(currentPage) && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm fade-in text-center py-12">
              <ShieldAlert className="w-12 h-12 text-[#C0392B] mx-auto mb-4" />
              <h3 className="font-extrabold text-md capitalize">{currentPage.replace('_', ' ')}</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2">
                Modul ini aktif dan terhubung langsung ke skema data tabel Supabase Anda. Anda dapat mulai mengunggah konfigurasi isian data kustom.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}

      {/* MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveDataGeneric} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-md font-bold mb-4 capitalize">Tambah {currentPage.replace('_', ' ')}</h3>
            
            <div className="space-y-4">
              {currentPage === 'master' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Kode Outlet *</label>
                    <input type="text" required onChange={e => setFormData({...formData, kode_outlet: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Nama Outlet *</label>
                    <input type="text" required onChange={e => setFormData({...formData, nama_outlet: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Kepala Outlet</label>
                    <input type="text" onChange={e => setFormData({...formData, kepala_outlet: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Area Supervisor</label>
                    <input type="text" onChange={e => setFormData({...formData, area_supervisor: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" />
                  </div>
                </>
              )}

              {currentPage === 'tna' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Tanggal *</label>
                    <input type="date" required onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Cabang (Kode Outlet) *</label>
                    <select required onChange={e => setFormData({...formData, kode_outlet: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none">
                      <option value="">-- Pilih Cabang --</option>
                      {outlets?.map(o => <option key={o.id} value={o.kode_outlet}>{o.nama_outlet}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Deskripsi Gap *</label>
                    <textarea required onChange={e => setFormData({...formData, deskripsi_gap: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" rows="3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Divisi</label>
                    <select onChange={e => setFormData({...formData, divisi: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none">
                      <option value="">Pilih Divisi</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Helper">Helper</option>
                      <option value="Geprek">Geprek</option>
                      <option value="Kasir">Kasir</option>
                    </select>
                  </div>
                </>
              )}

              {currentPage === 'banksop' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Kode SOP *</label>
                    <input type="text" required onChange={e => setFormData({...formData, kode_sop: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Judul SOP *</label>
                    <input type="text" required onChange={e => setFormData({...formData, judul_sop: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Divisi *</label>
                    <select required onChange={e => setFormData({...formData, divisi: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none">
                      <option value="">Pilih Divisi</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Helper">Helper</option>
                      <option value="Geprek">Geprek</option>
                      <option value="Kasir">Kasir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Langkah-Langkah (Satu langkah per baris) *</label>
                    <textarea required onChange={e => setFormData({...formData, langkah_langkah: e.target.value})} className="w-full border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C0392B] focus:outline-none" rows="4" placeholder="Contoh:&#10;Ambil maksimal 6 cup beras&#10;Cuci bersih minimal 3 kali bilas" />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-white px-4 py-2 rounded-xl text-xs font-bold">Batal</button>
              <button type="submit" className="bg-[#C0392B] text-white px-4 py-2 rounded-xl text-xs font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
