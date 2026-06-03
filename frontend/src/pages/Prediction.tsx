import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, HelpCircle, Loader2, BedDouble, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Prediction() {
  // Model state form untuk merekam ketikan pengguna secara lokal
  const [formData, setFormData] = useState({
    leadTime: '', depositType: 'No Deposit', marketSegment: 'Online TA',
    customerType: 'Transient', previousCancellations: '0', bookingChanges: '0',
    totalSpecialRequests: '0', adr: '', weekendNights: '0', weekNights: '0',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Reaktivitas visual interaktif mendeteksi nilai lead time tinggi (> 30 hari) sebelum submit
  const isHighLeadTime = Number(formData.leadTime) > 30;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    // Memaketkan data dari state React ke objek payload JSON murni
    const payload = {
      leadTime: formData.leadTime,
      depositType: formData.depositType,
      marketSegment: formData.marketSegment,
      previousCancellations: formData.previousCancellations,
      bookingChanges: formData.bookingChanges,
      totalSpecialRequests: formData.totalSpecialRequests,
      weekendNights: formData.weekendNights,
      weekNights: formData.weekNights,
      adr: formData.adr // Nominal rupiah asli, dibiarkan utuh
    };

    try {
      // Menembak server API backend Python Flask port 5000
      //const response = await fetch('http://localhost:5000/predict', {
      const response = await fetch('https://cancelsenses-production.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Injeksi respon pintar model XGBoost ke state result
        setResult({
          prediction: data.risk_level === 'Risiko Tinggi' ? 'Cancelled' : 'Check-In',
          probability: data.probability,       // Mengambil pecahan desimal (misal 0.75)
          risk_level: data.risk_level,         // Menyimpan label risiko bahasa indonesia
          recommendation: data.recommendation, // Menyimpan string rekomendasi intervensi
          meta: data.meta                      // Data pendukung nilai objek kurs_used dan adr_in_usd
        });
      } else {
        alert("Gagal melakukan komputasi: " + data.message);
      }
    } catch (error) {
      console.error("Error connecting to Python backend:", error);
      alert("Gagal terhubung ke Server Machine Learning! Pastikan backend app.py sudah dijalankan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative selection:bg-brand-orange/20">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-text flex items-center gap-3">
            <Sliders className="w-8 h-8 text-brand-blue" />
            Prediksi Risiko Pembatalan
          </h1>
          <p className="text-brand-muted mt-1 text-sm">
            Isi parameter reservasi untuk memicu pemindaian matriks perilaku konsumen berbasis XGBoost.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* ================= PANEL FORM INPUT (KIRI) ================= */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 neo-card p-6 md:p-8 space-y-6 border border-white/80 relative overflow-hidden group">
          
          {/* Laser Scanner Overlay Animasi saat Loading */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ top: '-100%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-brand-orange/15 to-transparent pointer-events-none z-20 border-b-2 border-brand-orange/40"
              />
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-b border-slate-300/40 pb-3">
            <h2 className="text-lg font-black text-brand-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-blue" />
              Parameter Atribut Reservasi
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-extrabold px-2.5 py-1 rounded-md shadow-neo-in">
              9 Variabel Utama
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lead Time */}
            <div className="flex flex-col gap-1 group">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted group-focus-within:text-brand-blue transition-colors duration-300">
                Lead Time (Hari)
              </label>
              <input 
                type="number" name="leadTime" required min="0" placeholder="Contoh: 34"
                value={formData.leadTime} onChange={handleInputChange}
                className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold focus:shadow-neo-out focus:scale-[1.01] transition-all duration-300"
              />
              <span className="text-[10px] text-brand-muted px-1">Jarak waktu pesan hingga tanggal check-in.</span>
            </div>

            {/* ADR */}
            <div className="flex flex-col gap-1 group">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted group-focus-within:text-brand-orange transition-colors duration-300">
                Average Daily Rate (Harga Kamar - Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-brand-muted">Rp</span>
                <input 
                  type="number" name="adr" required min="0" placeholder="Contoh: 1250000" step="any"
                  value={formData.adr} onChange={handleInputChange}
                  className="neo-input w-full pl-11 pr-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold focus:shadow-neo-out focus:scale-[1.01] transition-all duration-300"
                />
              </div>
              <span className="text-[10px] text-brand-muted px-1">Input harga riil dalam Rupiah (misal: 750000).</span>
            </div>

            {/* Deposit Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted">Jenis Jaminan Deposit</label>
              <select name="depositType" value={formData.depositType} onChange={handleInputChange} className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold cursor-pointer">
                <option value="No Deposit">Tanpa Jaminan (No Deposit)</option>
                <option value="Non Refund">Tidak Bisa Kembali (Non Refund)</option>
                <option value="Refundable">Dapat Dikembalikan (Refundable)</option>
              </select>
            </div>

            {/* Market Segment */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted">Kanal Segmen Pasar</label>
              <select name="marketSegment" value={formData.marketSegment} onChange={handleInputChange} className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold cursor-pointer">
                <option value="Online TA">Online Travel Agent (OTA)</option>
                <option value="Offline TA/TO">Offline Agent / Tour Operator</option>
                <option value="Groups">Rombongan (Groups)</option>
                <option value="Direct">Langsung Ke Hotel (Direct)</option>
              </select>
            </div>

            {/* Previous Cancellations */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted">Rekam Jejak Batalkan Pesanan</label>
              <input 
                type="number" name="previousCancellations" min="0" value={formData.previousCancellations} onChange={handleInputChange}
                className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold focus:shadow-neo-out"
              />
            </div>

            {/* Booking Changes */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted">Total Perubahan Data (Edit)</label>
              <input 
                type="number" name="bookingChanges" min="0" value={formData.bookingChanges} onChange={handleInputChange}
                className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold focus:shadow-neo-out"
              />
            </div>

            {/* Total Special Requests */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted">Jumlah Permintaan Khusus</label>
              <input 
                type="number" name="totalSpecialRequests" min="0" value={formData.totalSpecialRequests} onChange={handleInputChange}
                className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold focus:shadow-neo-out"
              />
            </div>

            {/* Durasi Menginap Akhir Pekan */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted">Durasi Malam Akhir Pekan</label>
              <input 
                type="number" name="weekendNights" min="0" value={formData.weekendNights} onChange={handleInputChange}
                className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold focus:shadow-neo-out"
              />
            </div>

            {/* Durasi Menginap Hari Kerja */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-wider text-brand-muted">Durasi Malam Hari Kerja</label>
              <input 
                type="number" name="weekNights" min="0" value={formData.weekNights} onChange={handleInputChange}
                className="neo-input px-4 py-3.5 text-brand-text rounded-xl text-sm font-semibold focus:shadow-neo-out"
              />
            </div>

          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-brand-blue shadow-neo-btn hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin text-brand-orange" /> MENGEKSTRAKSI TENSOR DATA...</>
            ) : (
              <><Eye className="w-4 h-4" /> Hitung Probabilitas Risiko</>
            )}
          </button>
        </form>

        {/* ================= PANEL TAMPILAN OUTPUT (KANAN) ================= */}
        <div className="lg:col-span-5 h-full sticky top-8">
          <AnimatePresence mode="wait">
            
            {/* STATE 1: KONDISI AWAL SEBELUM SUBMIT */}
            {!isLoading && !result && (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="neo-card p-8 text-center flex flex-col items-center justify-between min-h-[530px] border border-white/60 relative">
                <div className="w-full flex justify-between items-center border-b border-slate-300/30 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-text flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
                    </span>
                    Live Spatial Preview
                  </span>
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                </div>

                <motion.div 
                  animate={{ 
                    scale: isHighLeadTime ? [1, 1.03, 1] : 1,
                    boxShadow: isHighLeadTime ? "0px 10px 30px rgba(249,115,22,0.15)" : "0px 5px 15px rgba(0,0,0,0.02)"
                  }}
                  transition={{ repeat: isHighLeadTime ? Infinity : 0, duration: 3 }}
                  className={`w-48 h-36 rounded-2xl border flex flex-col items-center justify-center relative transition-all duration-500 backdrop-blur-sm ${
                    isHighLeadTime ? 'bg-brand-orange/5 border-brand-orange/40 text-brand-orange' : 'bg-white/40 border-white text-brand-blue'
                  }`}
                >
                  <BedDouble className={`w-14 h-14 transition-transform duration-500 ${isHighLeadTime ? 'rotate-3 scale-110' : ''}`} />
                  <span className="text-[10px] font-black uppercase mt-3 tracking-widest">Kamar Deluxe #01</span>
                  <span className={`absolute -bottom-3 text-[9px] font-black px-3 py-1 rounded-full border shadow-sm transition-all duration-300 ${
                    isHighLeadTime ? 'bg-brand-orange text-white border-brand-orange' : 'bg-brand-blue text-white border-brand-blue'
                  }`}>
                    {isHighLeadTime ? 'Risiko Cancel Meningkat' : 'Reservasi Stabil Aman'}
                  </span>
                </motion.div>

                <div className="space-y-2">
                  <h3 className="font-black text-brand-text text-base">Simulator Kamar Cerdas</h3>
                  <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
                    Ubah nilai input <span className="font-bold text-brand-blue">Lead Time</span> di kiri melebihi 30 hari untuk melihat simulasi reaksi perubahan <span className="font-bold text-brand-orange">Status Kerawanan Reservasi</span> pada aset kamar hotel Anda.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STATE 2: KONDISI SEDANG PROSES (LOADING) */}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="neo-card p-8 text-center flex flex-col items-center justify-center min-h-[530px] border border-white/60">
                <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-slate-300/30 border-t-brand-blue border-r-brand-orange" />
                  <Sliders className="w-6 h-6 text-brand-text animate-pulse" />
                </div>
                <h3 className="font-black text-brand-text text-lg tracking-tight uppercase">Komputasi Matriks Kedatangan</h3>
                <p className="text-xs text-brand-muted max-w-xs mt-2 leading-relaxed">
                  Mesin XGBoost sedang mengalkulasi korelasi bobot parameter jaminan deposit terhadap pola musiman hari kerja...
                </p>
              </motion.div>
            )}

            {/* STATE 3: BERHASIL MENDAPATKAN RESPONS DARI FLASK API */}
            {!isLoading && result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: [0, -6, 0] }}
                transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" }, default: { type: 'spring', stiffness: 120 } }}
                className={`neo-card p-6 md:p-8 space-y-5 border-l-4 border-y border-r border-white/80 relative overflow-hidden bg-gradient-to-br from-brand-surface to-white/60 min-h-[550px] flex flex-col justify-between shadow-2xl ${
                  result.risk_level === 'Risiko Tinggi' ? 'border-l-brand-orange' : 'border-l-brand-blue'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-300/30 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Matriks Probabilitas</span>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border animate-pulse ${
                    result.risk_level === 'Risiko Tinggi' 
                      ? 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' 
                      : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
                  }`}>
                    {result.risk_level}
                  </div>
                </div>

                {/* Skor Persentase Neomorphic Besar */}
                <div className="text-center py-4 bg-brand-bg shadow-neo-in rounded-2xl border border-white/50 relative overflow-hidden">
                  <div className="text-5xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-brand-text to-slate-700">
                    {(result.probability * 100).toFixed(0)}%
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-brand-muted mt-1">Skor Pembatalan Tamu</div>
                  
                  {/* Progress Bar Grafik Batang */}
                  <div className="mx-6 mt-3 h-2.5 bg-slate-300/20 rounded-full p-[2px] overflow-hidden border border-slate-300/30">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${result.probability * 100}%` }} 
                      transition={{ duration: 1.2, ease: "easeOut" }} 
                      className={`h-full rounded-full ${
                        result.risk_level === 'Risiko Tinggi'
                          ? 'bg-gradient-to-r from-brand-orange via-red-400 to-red-600'
                          : 'bg-gradient-to-r from-emerald-400 via-brand-blue to-indigo-600'
                      }`}
                    />
                  </div>
                </div>

                {/* LAYER BARU: FITUR UTAMA YANG MEMPENGARUHI (EXPLAINABLE AI) */}
                <div className="p-3.5 rounded-xl bg-slate-200/50 border border-slate-300/30 shadow-inner">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Fitur Paling Berpengaruh:</h4>
                  <p className="text-xs font-black text-brand-text mt-0.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    {result.influenced_by || "Seluruh Kombinasi Fitur"}
                  </p>
                </div>

                {/* LAYER BARU: DAFTAR ALASAN LOGIS DARI MODEL */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Indikator Alasan Utama:</h4>
                  <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1 text-left custom-scrollbar">
                    {result.reasons && result.reasons.map((reason: string, idx: number) => (
                      <div key={idx} className="text-[11px] leading-relaxed text-brand-muted bg-white/50 border border-white p-2.5 rounded-lg flex gap-2 items-start shadow-sm">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${result.risk_level === 'Risiko Tinggi' ? 'bg-brand-orange' : 'bg-emerald-500'}`} />
                        <p>{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rekomendasi Dinamis AI */}
                <div className="space-y-1.5">
                  <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                    result.risk_level === 'Risiko Tinggi' ? 'text-brand-orange' : 'text-brand-blue'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Intervensi Yang Disarankan
                  </h4>
                  <p className="text-[11px] font-semibold leading-relaxed text-brand-text bg-brand-bg shadow-neo-out p-3.5 rounded-xl border border-white/80">
                    {result.recommendation}
                  </p>
                </div>

                {/* MONITOR LOG DATA KURS REAL-TIME */}
                {result.meta && (
                  <div className="pt-2.5 border-t border-slate-300/30 flex justify-between text-[9px] text-brand-muted font-mono tracking-tight">
                    <span>Kurs: 1 USD = Rp {result.meta.kurs_used.toLocaleString('id-ID')}</span>
                    <span>Skala Model: ${result.meta.adr_in_usd}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
