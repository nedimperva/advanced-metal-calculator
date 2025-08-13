export const metadata = {
  title: 'Offline | SteelForge Pro',
}

export default function OfflinePage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">You are offline</h1>
        <p className="text-muted-foreground">
          Some features may be unavailable. We will automatically retry when your
          connection is restored.
        </p>
      </div>
    </main>
  )
}


