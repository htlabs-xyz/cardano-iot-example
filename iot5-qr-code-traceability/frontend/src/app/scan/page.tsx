// app/scan/page.tsx
'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

export default function ScanQR() {
  const [result, setResult] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleScan = (results: any[]) => {
    if (results.length > 0 && !isPaused) {
      const text = results[0].rawValue;
      setResult(text);
      setIsPaused(true);

      // Nếu là URL của ứng dụng → tự động chuyển hướng
      if (text.includes(window.location.origin) && text.includes('/product/')) {
        window.location.href = text;
      } else {
        alert('Mã QR: ' + text);
      }
    }
  };

  const handleRestart = () => {
    setResult(null);
    setIsPaused(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Scan Mã QR</h1>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <Scanner
          onScan={handleScan}
          paused={isPaused}
          styles={{ container: { width: '100%' }, video: { width: '100%' } }}
          components={{
            torch: true,
            zoom: true,
            finder: true,
          }}
          allowMultiple={false}
        />

        <div className="p-6 text-center">
          {!isPaused && !result && (
            <p className="text-gray-600">Hướng camera vào mã QR để quét</p>
          )}

          {result && (
            <div>
              <p className="text-lg font-medium mb-4">Đã quét thành công!</p>
              <p className="text-sm text-blue-600 break-all mb-6">{result}</p>
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Quét mã khác
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}