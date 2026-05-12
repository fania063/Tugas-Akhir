import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HeartPulse, Baby, UserRound, Users, ShieldCheck, ClipboardList, ArrowRight, HeartHandshake, Leaf } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <HeartPulse className="text-white w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="text-base font-black tracking-tight text-slate-900 block">Posyandu Melati</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Sistem Informasi Kesehatan</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#layanan" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Layanan</Link>
          <Link href="#tentang" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Tentang</Link>
          <Link href="/login" className="px-5 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95">
            Masuk ke Sistem
          </Link>
        </div>
        <Link href="/login" className="md:hidden px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold">
          Masuk
        </Link>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-50 rounded-full blur-3xl opacity-60" />
          </div>

          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Sistem Informasi Posyandu Melati
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-[1.1]">
              Pelayanan Kesehatan yang{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Lebih Mudah & Cerdas
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
              Platform digital khusus untuk Posyandu Melati — pencatatan pasien, imunisasi balita, dan laporan kesehatan ibu & anak serta Lansia dalam satu sistem terintegrasi.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/login" 
                className="group flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
              >
                Masuk ke Sistem
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#layanan" 
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-95"
              >
                Lihat Layanan
              </Link>
            </div>
          </div>
        </section>

        {/* Layanan Grid */}
        <section id="layanan" className="px-6 py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Layanan Posyandu Melati</h2>
              <p className="text-slate-600 max-w-xl mx-auto">Sistem kami dirancang untuk mendukung seluruh layanan kesehatan ibu dan anak di Posyandu Melati.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Baby className="w-7 h-7 text-sky-600" />,
                  bg: "bg-sky-50",
                  title: "Pemeriksaan Balita",
                  desc: "Pantau tumbuh kembang, imunisasi, dan vitamin A balita secara lengkap dan terstruktur."
                },
                {
                  icon: <HeartHandshake className="w-7 h-7 text-pink-600" />,
                  bg: "bg-pink-50",
                  title: "Ibu Hamil (Bumil)",
                  desc: "Pemantauan kehamilan dengan kalkulasi usia kandungan dan status imunisasi TT otomatis."
                },
                {
                  icon: <UserRound className="w-7 h-7 text-violet-600" />,
                  bg: "bg-violet-50",
                  title: "Ibu Menyusui (Busui)",
                  desc: "Pencatatan kondisi laktasi dan kesehatan ibu menyusui secara berkala dan mudah."
                },
                {
                  icon: <Leaf className="w-7 h-7 text-amber-600" />,
                  bg: "bg-amber-50",
                  title: "Pemeriksaan Lansia",
                  desc: "Pantau tekanan darah, gula darah, kolesterol, dan asam urat dengan indikator nilai normal."
                },
              ].map((item, i) => (
                <div key={i} className="p-7 bg-white rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all group">
                  <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fitur Sistem */}
        <section id="tentang" className="px-6 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Keunggulan Sistem</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="w-6 h-6 text-emerald-600" />,
                  title: "Manajemen Pasien Lengkap",
                  desc: "Daftarkan dan kelola seluruh data pasien Posyandu Melati dengan relasi ibu dan anak yang terintegrasi."
                },
                {
                  icon: <ClipboardList className="w-6 h-6 text-emerald-600" />,
                  title: "Riwayat Pemeriksaan & Imunisasi",
                  desc: "Lacak seluruh riwayat pemeriksaan dan kelengkapan imunisasi balita dengan jadwal nasional."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                  title: "Keamanan Data",
                  desc: "Data pasien terlindungi dengan Row Level Security dan kontrol akses berbasis peran (Admin & Petugas)."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 hover:shadow-lg hover:shadow-emerald-50 transition-all group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-10 border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center">
              <HeartPulse className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-700">Posyandu Melati</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Posyandu Melati — Sistem Informasi Kesehatan Ibu & Anak
          </p>
        </div>
      </footer>
    </div>
  );
}
