import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Activity, ShieldCheck, Users, ClipboardList, ArrowRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Puskesmas<span className="text-blue-600">Digital</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Fitur</Link>
          <Link href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Tentang</Link>
          <Link href="/login" className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95">
            Masuk ke Sistem
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistem Informasi Terintegrasi
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl leading-[1.1]">
              Transformasi Digital untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Pelayanan Kesehatan</span> Puskesmas
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
              Kelola rekam medis, pendaftaran pasien, dan pelaporan kesehatan dalam satu platform aman, cepat, dan mudah digunakan.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/login" 
                className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features" 
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-95"
              >
                Lihat Fitur
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="px-6 py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Utama Sistem</h2>
              <p className="text-slate-600 max-w-xl mx-auto">Dirancang khusus untuk memenuhi kebutuhan operasional Puskesmas modern di Indonesia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="w-6 h-6 text-blue-600" />,
                  title: "Multi-Puskesmas",
                  desc: "Isolasi data yang aman untuk setiap unit Puskesmas dalam satu infrastruktur."
                },
                {
                  icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
                  title: "Rekam Medis Global",
                  desc: "Akses riwayat kesehatan pasien secara komprehensif dari berbagai kunjungan."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
                  title: "Keamanan Tingkat Tinggi",
                  desc: "Proteksi data menggunakan enkripsi dan kontrol akses berbasis peran (RBAC)."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 transition-all group">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Puskesmas Digital. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
