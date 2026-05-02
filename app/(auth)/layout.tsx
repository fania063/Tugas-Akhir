export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistem Pencatatan Puskesmas
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk untuk mengakses dashboard
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
