import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const addToast = useContext(ToastContext);
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Please sign in to add items to cart', 'error'); return; }
    const ok = await addToCart(product);
    if (ok) addToast(`"${product.title.slice(0, 30)}..." added to cart`);
    else addToast('Failed to add to cart', 'error');
  };

  return (
    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className="card-hover" style={{
        background: '#fff', borderRadius: 4, overflow: 'hidden',
        border: '1px solid var(--border)', height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', background: '#f7f7f7', padding: 16, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.badge && (
            <span className={`badge ${product.badge === "Amazon's Choice" ? 'choice' : product.badge === 'New' ? 'new' : ''}`}
              style={{ position: 'absolute', top: 8, left: 8 }}>
              {product.badge}
            </span>
          )}
          {discount && (
            <span style={{ position: 'absolute', top: 8, right: 8, background: '#cc0c39', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 2 }}>
              -{discount}%
            </span>
          )}
          <img src={product.images?.[0]} alt={product.title}
            style={{ width: '100%', maxHeight: 180, objectFit: 'contain', transition: 'transform 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {/* Info */}
        <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#0F1111', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Stars rating={product.rating || 0} />
            <span className="rating-count">({product.numReviews?.toLocaleString()})</span>
          </div>

          <div style={{ marginTop: 2 }}>
            <span style={{ color: '#B12704', fontWeight: 400 }}>
              <span className="price-symbol">$</span>
              <span className="price-whole">{Math.floor(product.price)}</span>
              <span className="price-fraction">{String(product.price.toFixed(2)).split('.')[1]}</span>
            </span>
            {discount && (
              <span className="original-price" style={{ marginLeft: 6 }}>${product.originalPrice}</span>
            )}
          </div>

          {product.stock < 10 && (
            <div style={{ color: '#c45500', fontSize: 12 }}>Only {product.stock} left in stock</div>
          )}

          <div style={{ fontSize: 12, color: '#007185' }}>
            {product.price > 35 ? '✓ FREE Delivery' : `+ $4.99 shipping`}
          </div>
        </div>

        <div style={{ padding: '0 14px 14px' }}>
          <button onClick={handleAdd} className="btn-primary" style={{ width: '100%', padding: '7px 0' }}>
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
