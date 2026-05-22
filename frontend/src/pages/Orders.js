import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: { bg: '#FFF8DC', text: '#8B6914', label: '⏳ Pending' },
  confirmed: { bg: '#E8F5E9', text: '#2E7D32', label: '✅ Confirmed' },
  processing: { bg: '#E3F2FD', text: '#1565C0', label: '⚙️ Processing' },
  shipped: { bg: '#F3E5F5', text: '#6A1B9A', label: '📦 Shipped' },
  delivered: { bg: '#E8F5E9', text: '#1B5E20', label: '🎉 Delivered' },
  cancelled: { bg: '#FFEBEE', text: '#B71C1C', label: '❌ Cancelled' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    orderAPI.getOrders()
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      const { data } = await orderAPI.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 400, marginBottom: 20 }}>Your Orders</h1>
      {orders.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h2 style={{ marginBottom: 8 }}>No orders yet</h2>
          <p style={{ color: '#565959', marginBottom: 20 }}>You haven't placed any orders yet.</p>
          <Link to="/products"><button className="btn-orange" style={{ padding: '10px 24px' }}>Start Shopping</button></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            return (
              <div key={order._id} style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Order header */}
                <div style={{ background: '#F0F2F2', padding: '12px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, fontSize: 12 }}>
                  <div>
                    <div style={{ color: '#565959', textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Placed</div>
                    <div style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ color: '#565959', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>${order.total?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#565959', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ship To</div>
                    <div style={{ fontWeight: 600 }}>{order.shippingAddress?.name || user.name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#565959', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</div>
                    <span style={{ background: status.bg, color: status.text, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                      {status.label}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#565959', textTransform: 'uppercase', letterSpacing: 0.5 }}>Order ID</div>
                    <div style={{ fontWeight: 600, fontSize: 11, fontFamily: 'monospace' }}>#{order._id?.slice(-8).toUpperCase()}</div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '16px 20px' }}>
                  {order.status === 'shipped' && (
                    <div style={{ background: '#F0FFF4', border: '1px solid #c6f6d5', borderRadius: 4, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#067D62' }}>
                      📦 Tracking: <strong>{order.trackingNumber}</strong> — Est. delivery: <strong>{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, flex: '1 1 300px', minWidth: 0 }}>
                        <img src={item.image} alt={item.title}
                          style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 4, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/products/${item.productId}`}>
                            <div style={{ fontSize: 14, color: '#0066c0', fontWeight: 500, marginBottom: 4,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </div>
                          </Link>
                          <div style={{ fontSize: 13, color: '#565959' }}>Qty: {item.quantity}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1111' }}>${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    {['pending', 'confirmed', 'processing'].includes(order.status) && (
                      <button onClick={() => handleCancel(order._id)} disabled={cancellingId === order._id}
                        className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px', color: '#c45500', borderColor: '#c45500' }}>
                        {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                    <button className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
                      Track Package
                    </button>
                    <button className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
                      Return Items
                    </button>
                    <button className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
                      Write Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
