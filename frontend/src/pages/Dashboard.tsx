import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowRight, Activity, CalendarCheck2, Percent, UserMinus, UserCheck, RefreshCw } from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({ setCurrentTab }: DashboardProps) {
  // Tanggal dinamis dengan format lokal
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // State live feed simulasi indikasi pembatalan (Bahasa taktis operasional hotel)
  const [liveGuests, setLiveGuests] = useState([
    { id: 1, name: "Budi Santoso", room: "Deluxe 302", status: "Anomali Perilaku (Membatalkan...)", time: "Baru saja", risk: "High", icon: UserMinus, color: "text-brand-orange bg-brand-orange/10" },
    { id: 2, name: "Siti Rahma", room: "Suite 101", status: "Metode Pembayaran Aman", time: "2 mnt lalu", risk: "Low", icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
    { id: 3, name: "John Doe", room: "Standard 405", status: "Lead Time >100 Hari (Rentan Churn)", time: "5 mnt lalu", risk: "High", icon: UserMinus, color: "text-brand-orange bg-brand-orange/10" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGuests(prev => {
        const shuffled = [...prev];
        const first = shuffled.shift();
        if (first) shuffled.push(first);
        return shuffled;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Perubahan Copywriting pada Card Informasi Utama
  const summaryCards = [
    { title: 'Total Reservasi Dipantau', value: '1.420', change: '+12% minggu ini', icon: CalendarCheck2, color: 'text-brand-blue' },
    { title: 'Rata-rata Risiko Pembatalan', value: '34.3%', change: 'Tren Stabil', icon: Percent, color: 'text-brand-orange' },
    { title: 'Kesehatan Sistem', value: 'Optimal', change: 'Engine v1.2 Aktif', icon: Activity, color: 'text-emerald-600', hasPing: true },
  ];

  return (
    <div className="space-y-10 selection:bg-brand-blue/20">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-300/40 pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-text flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-brand-blue" />
            Pusat Kontrol CancelSense
          </h1>
          {/* SEBELUMNYA: "Platform kecerdasan buatan pelacak risiko..." -> Terlalu AI-template */}
          <p className="text-brand-muted mt-1 text-sm font-medium">
            Analisis risiko reservasi real-time dan proteksi pendapatan okupansi hotel Anda.
          </p>
        </div>
        <div className="px-5 py-2.5 rounded-2xl bg-brand-surface shadow-neo-in border border-white/60 text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted block">Hari Ini</span>
          <span className="text-xs font-black text-brand-text tracking-wide">{today}</span>
        </div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="neo-card p-8 md:p-10 border border-white/80 bg-gradient-to-br from-brand-surface via-slate-100/30 to-slate-200/50 relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Glow Latar Belakang */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sisi Kiri: Teks & Aksi */}
        <div className="lg:col-span-7 space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 text-brand-blue border border-white/40 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
            </span>
            Sinkronisasi Data Aktif
          </div>
          
          {/* SEBELUMNYA: "Prediksi Pembatalan Kamar Sebelum Benar-Benar Terjadi" */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-brand-text leading-tight font-sans">
            Cegah Pembatalan Kamar <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-orange">
              Sebelum Merusak Revenue Anda.
            </span>
          </h2>
          
          {/* SEBELUMNYA: Menggunakan kata klise "memanfaatkan penilaian perilaku berlapis..." */}
          <p className="text-xs md:text-sm text-brand-muted leading-relaxed max-w-xl font-medium">
            Deteksi pola perilaku tamu untuk memetakan metrik risiko pesanan secara instan. Amankan tingkat okupansi kamar dan antisipasi penurunan omzet secara otomatis.
          </p>
          
          <div className="pt-2 flex flex-wrap gap-4">
            <button 
              onClick={() => setCurrentTab('prediction')}
              className="px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-brand-blue shadow-neo-btn hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:translate-x-1 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer group"
            >
              Profil Risiko Reservasi
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Sisi Kanan: Live Animasi Aktivitas Tamu (Makin Glassmorphism) */}
        <div className="lg:col-span-5 relative w-full h-full min-h-[220px] flex items-center justify-center">
          <div className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-lg space-y-3 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-300/30 pb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-text flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-brand-blue animate-spin" style={{ animationDuration: '6s' }} />
                Aktivitas Pemesanan Real-Time
              </span>
              <span className="text-[9px] bg-brand-orange/10 text-brand-orange font-bold px-2 py-0.5 rounded-md animate-pulse">
                Live Stream
              </span>
            </div>

            {/* List Simulasi Real-Time */}
            <div className="space-y-2.5 overflow-hidden max-h-[160px]">
              {liveGuests.map((guest) => {
                const Icon = guest.icon;
                return (
                  <motion.div
                    key={guest.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-white/50 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${guest.color} shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-text leading-tight">{guest.name}</h4>
                        <p className="text-[10px] text-brand-muted mt-0.5">{guest.room} • <span className="font-medium text-slate-600">{guest.status}</span></p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded ${guest.risk === 'High' ? 'bg-red-50 text-red-600 border border-red-200/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/40'}`}>
                        {guest.risk} Risk
                      </span>
                      <span className="text-[8px] text-brand-muted mt-1 font-medium">{guest.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ================= OPERATIONAL OVERVIEW CARDS ================= */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-muted">
          Metrik Okupansi & Risiko
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -6, 
                  scale: 1.01,
                  boxShadow: "12px 12px 24px #c8d0da, -12px -12px 24px #ffffff" 
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 20,
                  delay: index * 0.1 
                }}
                className="neo-card p-6 flex flex-col justify-between h-44 cursor-pointer select-none border border-white/50 group relative overflow-hidden"
              >
                {/* Efek border glow atas saat hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-muted group-hover:text-brand-blue transition-colors duration-300">
                    {card.title}
                  </span>
                  
                  <div className="p-2.5 bg-brand-surface shadow-neo-in rounded-xl border border-slate-200/40 group-hover:shadow-neo-out transition-all duration-300">
                    {card.hasPing ? (
                      <span className="relative flex h-5 w-5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <Icon className={`w-4 h-4 ${card.color} relative z-10`} />
                      </span>
                    ) : (
                      <Icon className={`w-4 h-4 ${card.color} transition-transform duration-300 group-hover:scale-110`} />
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-4xl font-black text-brand-text block tracking-tighter font-mono bg-gradient-to-b from-brand-text to-slate-700 bg-clip-text text-transparent">
                    {card.value}
                  </span>
                  <span className="text-[11px] font-bold text-brand-muted block mt-1.5 flex items-center gap-1">
                    {card.hasPing && <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                    {card.change}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}