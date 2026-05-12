export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Kolom Kiri: Banner/Branding (Disembunyikan di layar kecil) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-600/90 to-emerald-900/90 mix-blend-multiply"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Konten Banner */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl w-fit mb-8 border border-white/20 shadow-xl">
            <span className="text-5xl">🌱</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Posyandu Melati
          </h1>
          <p className="text-lg text-emerald-100/90 max-w-md leading-relaxed font-medium">
            Sistem Informasi Manajemen Posyandu terintegrasi. Membantu kader dan petugas kesehatan mencatat serta memantau tumbuh kembang balita, kesehatan ibu hamil, ibu menyusui, dan lansia dengan lebih mudah.
          </p>
          
          {/* Testimonial / Info tambahan */}
          <div className="mt-16 pt-8 border-t border-emerald-500/30">
            <div className="flex -space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-200 border-2 border-emerald-800 flex items-center justify-center text-emerald-800 font-bold text-xs">A</div>
              <div className="w-10 h-10 rounded-full bg-teal-200 border-2 border-emerald-800 flex items-center justify-center text-teal-800 font-bold text-xs">P</div>
              <div className="w-10 h-10 rounded-full bg-sky-200 border-2 border-emerald-800 flex items-center justify-center text-sky-800 font-bold text-xs">B</div>
            </div>
            <p className="text-sm text-emerald-200 font-medium">Dipercaya oleh seluruh kader kesehatan Posyandu Melati.</p>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-slate-50 relative">
        {/* Mobile Logo (Hanya muncul di HP) */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-emerald-200">
            <span className="text-xl">🌱</span>
          </div>
          <span className="font-bold text-emerald-900 tracking-tight">Posyandu Melati</span>
        </div>

        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h2>
            <p className="mt-3 text-base text-slate-500 font-medium">
              Silakan masuk ke akun Anda untuk melanjutkan.
            </p>
          </div>
          
          <div className="mt-8 bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
            {children}
          </div>
          
          <div className="text-center lg:text-left mt-8">
            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} Posyandu Melati. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
