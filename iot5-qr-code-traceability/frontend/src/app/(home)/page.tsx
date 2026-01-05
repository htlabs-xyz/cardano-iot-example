// app/page.tsx
import Link from 'next/link';
import { QrCode, Camera, Sparkles, Shield, Globe } from 'lucide-react';

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center px-6 py-16 overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
        </div>

        <div className="w-full max-w-6xl mx-auto text-center relative z-10">
          {/* Header Section */}
          <div className="mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-full shadow-lg">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-700 font-medium tracking-wide">
                Transparent Product Traceability
              </span>
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-tight">
              Trace Every<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600">
                Product Journey
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Empower consumers with complete transparency using secure, modern QR code technology. 
              From origin to shelf — build trust effortlessly.
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>Global Accessibility</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto mt-20">
            {/* Create QR Code Card */}
            <Link
              href="/create"
              className="group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 border border-white/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative p-12 lg:p-16 text-center">
                <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-xl transition-all duration-700">
                  <QrCode className="w-14 h-14 text-blue-600 group-hover:text-white transition-colors duration-500" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 group-hover:text-white transition-colors duration-500 mb-5">
                  Create QR Codes
                </h2>

               

                <div className="mt-10 inline-flex items-center gap-3 text-blue-600 font-semibold text-lg group-hover:text-white transition-colors duration-500">
                  Start Creating
                  <svg className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Scan QR Code Card */}
            <Link
              href="/scan"
              className="group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 border border-white/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative p-12 lg:p-16 text-center">
                <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-emerald-100 to-green-200 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-xl transition-all duration-700">
                  <Camera className="w-14 h-14 text-emerald-600 group-hover:text-white transition-colors duration-500" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 group-hover:text-white transition-colors duration-500 mb-5">
                  Scan & Verify
                </h2>

               
                <div className="mt-10 inline-flex items-center gap-3 text-emerald-600 font-semibold text-lg group-hover:text-white transition-colors duration-500">
                  Start Scanning
                  <svg className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-24 text-slate-500">
            <p className="text-sm font-medium tracking-wide">
              © 2026 Product Traceability System • Secure • Transparent • Trusted Worldwide
            </p>
          </div>
        </div>
      </main>
    </>
  );
}