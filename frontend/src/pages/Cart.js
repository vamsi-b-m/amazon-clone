import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2>Sign in to see your cart</h2>
        <p style={{ color: '#565959', margin: '12px 0 20px' }}>Please sign in to view your shopping cart.</p>
        <Link to="/login"><button className="btn-orange" style={{ padding: '10px 24px' }}>Sign In</button></Link>
      </div>
    );
  }

  if (cart.items?.length === 0) {
    return (
      <div className="container" style={{ padding: 32 }}>
        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Your Amazon Cart is empty</h2>
          <p style={{ color: '#565959', marginBottom: 20 }}>Your shopping cart lives here. Start shopping and fill it up!</p>
          <Link to="/products"><button className="btn-orange" style={{ padding: '10px 24px' }}>Start Shopping</button></Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = subtotal > 35 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="container" style={{ padding: '16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 400, marginBottom: 16 }}>Shopping Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
        {/* Items */}
        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 20 }}>
          {subtotal > 35 && (
            <div style={{ background: '#F0FFF4', border: '1px solid #c6f6d5', borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#067D62', fontWeight: 500 }}>
              ✓ Your order qualifies for FREE Shipping!
            </div>
          )}
          {cart.items?.map((item, i) => (
            <div key={item.productId} style={{
              display: 'flex', gap: 16, paddingBottom: 20, marginBottom: 20,
              borderBottom: i < cart.items.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <Link to={`/products/${item.productId}`}>
                <img src={item.image} alt={item.title}
                  style={{ width: 120, height: 120, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 4, padding: 4 }} />
              </Link>
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.productId}`}>
                  <div style={{ fontSize: 16, color: '#0066c0', marginBottom: 4, fontWeight: 500 }}>{item.title}</div>
                </Link>
                <div style={{ fontSize: 13, color: '#007600', marginBottom: 8 }}>In Stock</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <select value={item.quantity}
                    onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                    style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, background: '#f7f7f7' }}>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <span style={{ color: '#ccc' }}>|</span>
                  <button onClick={() => removeFromCart(item.productId)}
                    style={{ background: 'none', border: 'none', color: '#0066c0', fontSize: 13, cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >Delete</button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#0F1111', whiteSpace: 'nowrap' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'right', fontSize: 18, color: '#0F1111' }}>
            Subtotal ({cart.items?.reduce((s, i) => s + i.quantity, 0)} items):{' '}
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
        </div>

        {/* Order summary */}
        <div style={{ width: 280, background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 20 }}>
          {subtotal > 35 && (
            <div style={{ fontSize: 13, color: '#067D62', marginBottom: 12, fontWeight: 500 }}>
              ✓ Your order qualifies for FREE Shipping!
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            {[
              { label: `Subtotal (${cart.items?.reduce((s, i) => s + i.quantity, 0)} items)`, value: `$${subtotal.toFixed(2)}` },
              { label: 'Shipping', value: shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}` },
              { label: 'Tax (8%)', value: `$${tax.toFixed(2)}` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                <span style={{ color: '#565959' }}>{row.label}:</span>
                <span style={{ color: row.value === 'FREE' ? '#067D62' : '#0F1111', fontWeight: row.value === 'FREE' ? 600 : 400 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
              <span>Order Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-orange" style={{ width: '100%', padding: '10px 0', fontSize: 14 }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
