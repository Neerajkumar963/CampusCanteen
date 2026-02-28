import { useState } from 'react';
import { Upload, Download, QrCode } from 'lucide-react';
import { Switch } from '../../components/ui/switch';

export default function Payments() {
  const [qrImage, setQrImage] = useState(
    'https://images.unsplash.com/photo-1636690619787-5155d1d41e13?w=400&h=400&fit=crop'
  );
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(true);

  const handleDownloadQR = () => {
    // In a real app, this would download the QR image
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'campus-bite-qr.png';
    link.click();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* QR Code Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1E1E1E] mb-6">
          UPI QR Code
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="bg-[#FFFAF5] rounded-2xl p-6 flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <img
                  src={qrImage}
                  alt="UPI QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Upload New QR Code
              </label>
              <div className="border-2 border-dashed border-[#E5E5E5] rounded-xl p-8 text-center hover:border-[#FF6B00] transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
                <p className="text-sm text-[#6B6B6B]">
                  Click to upload QR code image
                </p>
                <p className="text-xs text-[#6B6B6B] mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadQR}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8A00] transition-colors"
            >
              <Download className="w-5 h-5" />
              Download QR Print Version
            </button>

            <div className="bg-[#FFF5EE] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-[#FF6B00] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#1E1E1E] mb-1">
                    Display QR at Counter
                  </p>
                  <p className="text-xs text-[#6B6B6B]">
                    Print and display this QR code at your counter for customers
                    to scan and pay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1E1E1E] mb-6">
          Payment Methods
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#FFFAF5] rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1E1E1E]">UPI Payments</h3>
                <p className="text-sm text-[#6B6B6B]">
                  Accept payments via UPI QR code
                </p>
              </div>
            </div>
            <Switch checked={upiEnabled} onCheckedChange={setUpiEnabled} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FFFAF5] rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#22C55E] rounded-lg flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#1E1E1E]">Cash Payments</h3>
                <p className="text-sm text-[#6B6B6B]">
                  Accept cash at the counter
                </p>
              </div>
            </div>
            <Switch checked={cashEnabled} onCheckedChange={setCashEnabled} />
          </div>
        </div>
      </div>

      {/* UPI Details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1E1E1E] mb-6">
          UPI Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              UPI ID
            </label>
            <input
              type="text"
              placeholder="yourname@upi"
              className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Merchant Name
            </label>
            <input
              type="text"
              placeholder="GGI Canteen"
              className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          <button className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8A00] transition-colors">
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
}
