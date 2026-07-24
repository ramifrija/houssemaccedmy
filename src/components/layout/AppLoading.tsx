export function AppLoading({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-gray-light to-white">
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-school-yellow/20" />
          <div className="absolute inset-0 rounded-full border-4 border-school-yellow border-t-transparent animate-spin" />
        </div>
        <p className="text-school-black/70 font-medium">{message}</p>
      </div>
    </div>
  )
}
