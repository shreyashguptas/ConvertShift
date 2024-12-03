export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to File Converter</h1>
        <p className="text-gray-600 text-lg mb-4">
          Your one-stop solution for all file conversion needs. Select a tool from the sidebar to get started.
        </p>
        <div className="text-sm text-gray-500">
          All conversions are performed locally in your browser for maximum privacy and speed.
        </div>
      </div>
    </div>
  )
}
