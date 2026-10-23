import React, { useState } from 'react';
import { CartItem, Order, UserProfile } from '../types';
import { dataStore } from '../lib/supabase';
import {
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface CheckoutModalProps {
  cartItems: CartItem[];
  currentUser: UserProfile;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cartItems,
  currentUser,
  onClose,
  onOrderCompleted,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name || 'Vikram Malhotra');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98112 34567');
  const [addressLine, setAddressLine] = useState('Flat 402, Heritage Residency, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560038');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const total = subtotal + shipping;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = dataStore.createOrder({
        customer_id: currentUser.id,
        customer_name: fullName,
        customer_email: currentUser.email || 'customer@kalasetu.in',
        customer_phone: phone,
        buyer_id: currentUser.id,
        buyer_name: fullName,
        shipping_address: {
          full_name: fullName,
          phone,
          street: addressLine,
          address_line1: addressLine,
          city,
          state,
          postal_code: postalCode,
          country: 'India',
        },
        items: cartItems.map((ci) => ({
          id: `item_${Date.now()}_${ci.product.id}`,
          product_id: ci.product.id,
          product_title: ci.product.title,
          product_image: ci.product.images[0]?.image_url || '',
          quantity: ci.quantity,
          unit_price: ci.product.price,
          total_price: ci.product.price * ci.quantity,
          artisan_id: ci.product.artisan_id,
          artisan_name: ci.product.artisan_name,
        })),
        subtotal,
        shipping,
        shipping_cost: shipping,
        discount: 0,
        total,
        total_amount: total,
        payment_status: 'Paid',
        payment_method: paymentMethod.toUpperCase(),
        status: 'Confirmed',
        order_status: 'Confirmed',
      });

      setIsProcessing(false);
      setCompletedOrder(newOrder);
      onOrderCompleted(newOrder);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto bg-white rounded-3xl shadow-2xl border border-[#E7E0D3] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E0D3] bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#6B6258]" />
            <h3 className="font-serif font-bold text-base text-[#1C1917]">
              {completedOrder ? 'Order Confirmed' : 'Secure Artisan Checkout'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9A9089] hover:text-[#1C1917] hover:bg-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Receipt View */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#6B6258]/10 text-[#6B6258] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-serif font-bold text-2xl text-[#1C1917]">
              Dhanyawaad! Your Order is Placed
            </h2>
            <p className="text-xs text-[#6B6258] max-w-md mx-auto">
              Your order <strong className="text-[#B89B5E]">#{completedOrder.order_number}</strong> has been transmitted directly to our master artisan workshop for preparation and insured packaging.
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E7E0D3] max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between font-semibold text-[#1C1917]">
                <span>Total Paid</span>
                <span>₹{completedOrder.total_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#9A9089]">
                <span>Payment Method</span>
                <span>{completedOrder.payment_method}</span>
              </div>
              <div className="flex justify-between text-[#9A9089]">
                <span>Delivering To</span>
                <span className="truncate max-w-[200px]">
                  {completedOrder.shipping_address.city}, {completedOrder.shipping_address.state}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#B89B5E] text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Continue Exploring Crafts
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
            {/* Delivery Address */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C1917] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B89B5E]" />
                <span>Pan-India Shipping Address</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E7E0D3]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E7E0D3]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">Street Address *</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-[#E7E0D3]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E7E0D3]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E7E0D3]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E7E0D3]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-3 border-t border-[#E7E0D3]">
              <h4 className="font-serif font-bold text-sm text-[#1C1917] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#6B6258]" />
                <span>Payment Method</span>
              </h4>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'upi', label: 'UPI / QR', sub: 'GPay, PhonePe, Paytm' },
                  { id: 'card', label: 'Cards', sub: 'Debit & Credit' },
                  { id: 'netbanking', label: 'NetBanking', sub: 'All Indian Banks' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'bg-[#B89B5E]/10 border-[#B89B5E] text-[#B89B5E]'
                        : 'bg-[#FAF7F0] border-[#E7E0D3] hover:bg-white'
                    }`}
                  >
                    <p className="font-bold text-xs">{pm.label}</p>
                    <p className="text-[10px] text-[#9A9089]">{pm.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Items Review */}
            <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E7E0D3] space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-[#1C1917]">
                <span>Items ({cartItems.reduce((a, b) => a + b.quantity, 0)})</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#6B6258]">
                <span>Insured Craft Delivery</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-sm text-[#B89B5E] pt-1 border-t border-[#E7E0D3]">
                <span>Total Payable</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E7E0D3] text-[#6B6258]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-[#6B6258] hover:bg-[#4A4038] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>{isProcessing ? 'Authorizing Payment...' : `Pay ₹${total.toLocaleString('en-IN')}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
