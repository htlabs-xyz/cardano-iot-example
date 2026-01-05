// app/create/page.tsx
'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import { QrCode, Download, ExternalLink, Sparkles } from 'lucide-react';

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    manufacture_date: '',
    manufacturer: '',
    description: '',
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);

    const id = nanoid(10);
    setProductId(id);

    // Save to database
    const res = await fetch('/api/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...formData }),
    });

    if (!res.ok) {
      alert('Error saving product data. Please try again.');
      setLoading(false);
      return;
    }

    // Generate QR code pointing to product detail page
    const url = `${window.location.origin}/product/${id}`;
    const qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 4,
      color: { dark: '#1e293b', light: '#ffffff' },
    });

    setQrCodeUrl(qr);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-12 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50">
            <QrCode className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-slate-700">Create Product QR Code</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Register a New Product
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Fill in product details to generate a secure, traceable QR code for consumers
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/50">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="e.g., Premium ST25 Rice"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Origin</label>
                <input
                  name="origin"
                  type="text"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="e.g., Soc Trang, Vietnam"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacture Date</label>
                <input
                  name="manufacture_date"
                  type="date"
                  value={formData.manufacture_date}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacturer</label>
                <input
                  name="manufacturer"
                  type="text"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="e.g., ABC Food Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                  placeholder="Certifications, production process, sustainability info..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>Generating QR Code...</>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate QR Code
                  </>
                )}
              </button>
            </form>
          </div>

          {/* QR Code Preview Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/50 flex flex-col items-center justify-center">
            {qrCodeUrl ? (
              <div className="text-center space-y-8">
                <div>
                  <p className="text-lg font-medium text-slate-600 mb-2">Product ID</p>
                  <p className="text-2xl font-bold text-blue-600 font-mono tracking-wider">
                    {productId}
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-inner">
                  <img
                    src={qrCodeUrl}
                    alt="Product QR Code"
                    className="w-80 h-80 mx-auto"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={qrCodeUrl}
                    download={`QR_${productId}.png`}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    Download QR Code
                  </a>

                  <a
                    href={`/product/${productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Product Page
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-100 to-emerald-100 rounded-3xl flex items-center justify-center mb-8">
                  <QrCode className="w-32 h-32 text-blue-400" />
                </div>
                <p className="text-xl font-medium text-slate-600">
                  Fill in the product details and click
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-2">
                  "Generate QR Code"
                </p>
                <p className="text-slate-500 mt-4">
                  Your unique traceable QR code will appear here instantly
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}