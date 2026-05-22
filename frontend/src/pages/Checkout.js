import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { ToastContext } from '../App';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const addToast = useContext(ToastContext);
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ name: user?.name || '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US' });
  const [payment, setPayment] = useState({ method: 'card', cardNumber: '•••• •••• •••• 4242', cardExpiry: '12/25', cardName: user?.name || '' });

  if (!user) { navigate('/login'); return null; }
  if (!cart.items?.length) { navigate('/cart'); return null; }

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 35 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { data: order } = await orderAPI.createOrder({
        items: cart.items.map(i => ({ productId: i.productId, title: i.title, price: i.price, image: i.image, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod: payment.method,
      });
      await clearCart();
      addToast('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #888', borderRadius: 4, fontSize: 14, marginTop: 4, outline: 'none' };

  return (
    <div style={{ background: '#EAEDED', minHeight: '100vh' }}>
      {/* Checkout header */}
      <div style={{ background: '#131921', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: '#FF9900', fontSize: 22, fontWeight: 700 }}>amazon</span>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 300 }}>Checkout</span>
      </div>

      <div className="container" style={{ padding: '20px 16px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        <div>
          {/* Step indicators */}
          <div style={{ display: 'flex', marginBottom: 16, gap: 4 }}>
            {['Shipping', 'Payment', 'Review'].map((s, i) => (
              <React.Fragment key={s}>
                <div style={{
                  padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: step === i + 1 ? 700 : 400,
                  background: step === i + 1 ? '#232f3e' : '#fff',
                  color: step === i + 1 ? '#fff' : step > i + 1 ? '#067D62' : '#565959',
                  border: '1px solid var(--border)', cursor: step > i + 1 ? 'pointer' : 'default',
                }} onClick={() => step > i + 1 && setStep(i + 1)}>
                  {step > i + 1 ? '✓ ' : `${i + 1}. `}{s}
                </div>
                {i < 2 && <div style={{ color: '#565959', display: 'flex', alignItems: 'center' }}>›</div>}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Address */}
          {step === 1 && (
            <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                Enter a shipping address
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Full Name</label>
                  <input style={inputStyle} value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Address Line 1</label>
                  <input style={inputStyle} placeholder="Street address, P.O. box" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Address Line 2 (optional)</label>
                  <input style={inputStyle} placeholder="Apartment, suite, unit" value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>City</label>
                  <input style={inputStyle} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>State</label>
                  <input style={inputStyle} value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>ZIP Code</label>
                  <input style={inputStyle} value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Country</label>
                  <select style={inputStyle} value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })}>
                    <option value="US">United States</option>
                    <option value="IN">India</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-orange" style={{ marginTop: 20, padding: '10px 24px' }}
                disabled={!address.name || !address.line1 || !address.city}>
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                Payment method
              </h2>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {['card', 'paypal', 'amazon_pay'].map(m => (
                  <div key={m} onClick={() => setPayment({ ...payment, method: m })}
                    style={{ flex: 1, border: `2px solid ${payment.method === m ? '#FF9900' : 'var(--border)'}`, borderRadius: 4, padding: '12px 16px', cursor: 'pointer', textAlign: 'center', fontSize: 13 }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>
                      {m === 'card' ? '💳' : m === 'paypal' ? '🅿️' : '🟡'}
                    </div>
                    {m === 'card' ? 'Credit Card' : m === 'paypal' ? 'PayPal' : 'Amazon Pay'}
                  </div>
                ))}
              </div>
              {payment.method === 'card' && (
                <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Card Number</label>
                    <input style={inputStyle} value={payment.cardNumber} onChange={e => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="•••• •••• •••• ••••" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>Expiry</label>
                      <input style={inputStyle} value={payment.cardExpiry} onChange={e => setPayment({ ...payment, cardExpiry: e.target.value })} placeholder="MM/YY" />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>CVV</label>
                      <input style={inputStyle} placeholder="•••" type="password" />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Name on Card</label>
                    <input style={inputStyle} value={payment.cardName} onChange={e => setPayment({ ...payment, cardName: e.target.value })} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: '10px 24px' }}>Back</button>
                <button onClick={() => setStep(3)} className="btn-orange" style={{ padding: '10px 24px' }}>Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                Review your order
              </h2>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Shipping to:</h3>
                <div style={{ fontSize: 13, color: '#565959', background: '#f7f7f7', padding: '10px 14px', borderRadius: 4 }}>
                  {address.name} — {address.line1}, {address.city}, {address.state} {address.zip}, {address.country}
                </div>
              </div>
              {cart.items?.map(item => (
                <div key={item.productId} style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <img src={item.image} alt={item.title} style={{ width: 60, height: 60, objectFit: 'contain' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: '#565959' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button onClick={() => setStep(2)} className="btn-secondary" style={{ padding: '10px 24px' }}>Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-orange" style={{ padding: '10px 24px', fontWeight: 700 }}>
                  {placing ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            Order Summary
          </h3>
          {[
            { label: 'Items', value: `$${subtotal.toFixed(2)}` },
            { label: 'Shipping', value: shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}` },
            { label: 'Tax', value: `$${tax.toFixed(2)}` },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#565959' }}>{r.label}:</span>
              <span style={{ color: r.value === 'FREE' ? '#067D62' : 'inherit' }}>{r.value}</span>
            </div>
          ))}
          <div style={{ borderTop: '2px solid var(--border)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#B12704' }}>
            <span>Order Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
