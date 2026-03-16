import { useState } from 'react';
import { Upload, Download, QrCode } from 'lucide-react';
import { Switch } from '../../components/ui/switch';

export default function Payments() {
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(true);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1E1E1E] mb-2">
          Payment Methods
        </h2>
        <p className="text-sm text-[#6B6B6B] mb-6">
          Toggle which payment methods are active for your canteen.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#FFFAF5] rounded-xl border border-[#FFF5EE]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1E1E1E]">Online Payments</h3>
                <p className="text-sm text-[#6B6B6B]">
                  Accept UPI, Cards, and Netbanking via <span className="text-[#FF6B00] font-medium">Razorpay</span>
                </p>
              </div>
            </div>
            <Switch checked={upiEnabled} onCheckedChange={setUpiEnabled} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F0FDF4] rounded-xl border border-[#DCFCE7]">
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

      {/* Info Card */}
      <div className="bg-[#EFF6FF] rounded-2xl p-6 border border-[#DBEAFE]">
        <h3 className="text-[#1E40AF] font-semibold mb-2 flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Note on Online Payments
        </h3>
        <p className="text-[#1E40AF] text-sm opacity-90">
          Online payments are automatically settled to your registered bank account via Razorpay. You don't need to upload any manual QR codes; the system generates a dynamic one for every customer.
        </p>
      </div>
    </div>
  );
}
