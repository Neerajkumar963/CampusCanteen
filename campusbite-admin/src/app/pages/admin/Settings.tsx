import { useState } from 'react';
import { Save, CreditCard, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore, API_URL } from '../../store/useStore';

export default function Settings() {
  const currentVendor = useStore((state) => state.currentVendor);
  const [deliveryCharge, setDeliveryCharge] = useState('20');
  const [tableServiceCharge, setTableServiceCharge] = useState('10');
  const [taxPercent, setTaxPercent] = useState('5');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* General Settings - Hidden for College Admins */}
      {currentVendor?.role !== 'collegeadmin' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">General Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Delivery Charge (₹)</label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              <p className="text-xs text-[#6B6B6B] mt-1">Flat delivery charge for all orders</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Table Service Charge (₹)</label>
              <input
                type="number"
                value={tableServiceCharge}
                onChange={(e) => setTableServiceCharge(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              <p className="text-xs text-[#6B6B6B] mt-1">Service charge for table orders</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Tax Percentage (%)</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              <p className="text-xs text-[#6B6B6B] mt-1">GST or sales tax percentage</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${saved ? 'bg-[#22C55E] text-white' : 'bg-[#FF6B00] text-white hover:bg-[#FF8A00]'
                }`}
            >
              <Save className="w-5 h-5" />
              {saved ? 'Settings Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Canteen / Campus Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold text-[#1E1E1E]">
          {currentVendor?.role === 'collegeadmin' ? 'Campus Information' : 'Canteen Information'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              {currentVendor?.role === 'collegeadmin' ? 'Campus Name' : 'Canteen Name'}
            </label>
            <input
              type="text"
              defaultValue={currentVendor?.role === 'collegeadmin' ? 'My Campus' : 'GGI Canteen'}
              className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Contact Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          {currentVendor?.role !== 'collegeadmin' && (
            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Operating Hours</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-1">Opening Time</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-1">Closing Time</label>
                  <input
                    type="time"
                    defaultValue="20:00"
                    className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8A00] transition-colors"
          >
            Save Information
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">Subscription Plan</h2>
              <p className="text-sm text-[#6B6B6B]">CampusBite SaaS License</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${currentVendor?.subscription?.status === 'Active' ? 'bg-[#F0FDF4] text-[#22C55E]' : 'bg-[#FEF2F2] text-[#EF4444]'
            }`}>
            {currentVendor?.subscription?.status === 'Active' ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
            {currentVendor?.subscription?.status || 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FFFAF5] p-4 rounded-xl">
          <div>
            <p className="text-xs text-[#6B6B6B] uppercase font-bold tracking-wider">Current Plan</p>
            <p className="text-[#1E1E1E] font-semibold">Standard Campus License</p>
          </div>
          <div>
            <p className="text-xs text-[#6B6B6B] uppercase font-bold tracking-wider">Valid Until</p>
            <p className="text-[#1E1E1E] font-semibold">
              {currentVendor?.subscription?.validUntil ? new Date(currentVendor.subscription.validUntil).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {(() => {
          if (!currentVendor?.subscription?.validUntil) return null;

          const validUntil = new Date(currentVendor.subscription.validUntil);
          const today = new Date();
          const msPerDay = 1000 * 60 * 60 * 24;
          const daysRemaining = Math.ceil((validUntil.getTime() - today.getTime()) / msPerDay);

          if (daysRemaining > 7) {
            return (
              <div className="bg-[#F0FDF4] border border-[#22C55E]/30 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="text-[#22C55E] shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-[#1E1E1E]">Subscription is Active</h4>
                  <p className="text-sm text-[#6B6B6B] mt-1">Your SaaS license is active for another {daysRemaining} days. You don't need to renew right now.</p>
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="bg-[#FFFBEB] border border-[#F59E0B]/30 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-[#F59E0B] shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-[#1E1E1E]">{daysRemaining <= 0 ? 'Subscription Expired' : 'Renewal Due Soon'}</h4>
                  <p className="text-sm text-[#6B6B6B] mt-1">
                    {daysRemaining <= 0
                      ? 'Your subscription has expired. Please renew to avoid service interruption.'
                      : `You have ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left on your current plan. Renew now to maintain uninterrupted access.`}
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_URL}/api/ordering/subscriptions/create-order`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ vendorId: currentVendor?.vendorId })
                    });
                    const order = await response.json();

                    const options = {
                      key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SL82HYZ95efW68',
                      amount: order.amount,
                      currency: order.currency,
                      name: "CampusBite",
                      description: "SaaS Subscription Renewal",
                      order_id: order.id,
                      handler: async function (response: any) {
                        const verifyRes = await fetch(`${API_URL}/api/ordering/subscriptions/verify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...response,
                            vendorId: currentVendor?.vendorId
                          })
                        });
                        const result = await verifyRes.json();
                        if (verifyRes.ok) {
                          alert("Subscription Renewed! Expiry extended to: " + new Date(result.validUntil).toLocaleDateString());
                          window.location.reload();
                        } else {
                          alert("Failure: " + result.message);
                        }
                      },
                      prefill: {
                        name: currentVendor?.name,
                        email: "admin@college.edu",
                        contact: "9999999999"
                      },
                      theme: { color: "#FF6B00" }
                    };

                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                  } catch (err) {
                    console.error(err);
                    alert("Could not initialize payment. Check console.");
                  }
                }}
                className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4F46E5]/20"
              >
                <CreditCard size={18} />
                Renew Subscription (₹999 / Year)
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
