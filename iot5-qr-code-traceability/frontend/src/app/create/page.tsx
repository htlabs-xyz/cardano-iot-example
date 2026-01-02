// app/create/page.tsx
'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

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
    setLoading(true);

    const id = nanoid(10);
    setProductId(id);

    // Lưu vào database
    const res = await fetch('/api/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...formData }),
    });

    if (!res.ok) {
      alert('Lỗi khi lưu dữ liệu');
      setLoading(false);
      return;
    }

    // Tạo QR code chứa link đến trang chi tiết
    const url = `${window.location.origin}/product/${id}`;
    const qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    setQrCodeUrl(qr);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Tạo Mã QR Cho Sản Phẩm
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Form nhập thông tin */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ví dụ: Gạo ST25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn gốc</label>
                <input
                  name="origin"
                  type="text"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Ví dụ: Sóc Trăng, Việt Nam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất</label>
                <input
                  name="manufacture_date"
                  type="date"
                  value={formData.manufacture_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà sản xuất</label>
                <input
                  name="manufacturer"
                  type="text"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Ví dụ: Công ty CP Lương thực..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Thông tin chứng nhận, quy trình sản xuất..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo QR Code'}
              </button>
            </form>
          </div>

          {/* Hiển thị QR Code */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center">
            {qrCodeUrl ? (
              <>
                <p className="text-lg font-semibold mb-4 text-center">
                  Mã sản phẩm: <span className="text-blue-600">{productId}</span>
                </p>
                <img src={qrCodeUrl} alt="QR Code" className="w-80 h-80" />
                <div className="mt-6 space-x-4">
                  <a
                    href={qrCodeUrl}
                    download={`QR_${productId}.png`}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Tải QR Code
                  </a>
                  <a
                    href={`/product/${productId}`}
                    target="_blank"
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Xem trang chi tiết
                  </a>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center">
                Điền thông tin và nhấn "Tạo QR Code" để xem kết quả
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}