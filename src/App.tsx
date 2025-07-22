import React from "react"



function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to Rehbar AI
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your intelligent companion for navigating the digital world with confidence and ease.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">AI-Powered Guidance</h2>
            <p className="text-gray-300">
              Get intelligent recommendations and insights tailored to your needs.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Smart Analytics</h2>
            <p className="text-gray-300">
              Comprehensive analytics and reporting to track your progress.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">24/7 Support</h2>
            <p className="text-gray-300">
              Round-the-clock assistance whenever you need help.
            </p>
          </div>
        </main>

        <footer className="text-center mt-12">
          <p className="text-gray-400">
            © 2024 Rehbar AI. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
