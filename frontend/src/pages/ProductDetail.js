import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';

const Stars = ({ rating, interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ cursor: interactive ? 'pointer' : 'default' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          style={{ fontSize: interactive ? 24 : 16, color: star <= (hover || rating) ? '#FFA41C' : '#ccc' }}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate && onRate(star)}
        >★</span>
      ))}
    </span>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const addToast = useContext(ToastContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productAPI.getById(id);
        setProduct(data);
      } catch { navigate('/products'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { addToast('Please sign in to add items to cart', 'error'); navigate('/login'); return; }
    setAddingToCart(true);
    const ok = await addToCart(product, qty);
    if (ok) addToast(`Added ${qty} item(s) to cart`);
    else addToast('Failed to add to cart', 'error');
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    await addToCart(product, qty);
    navigate('/cart');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Please sign in to leave a review', 'error'); return; }
    if (!reviewRating) { addToast('Please select a rating', 'error'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await productAPI.addReview(id, { rating: reviewRating, comment: reviewComment });
      setProduct(data);
      setReviewRating(0);
      setReviewComment('');
      addToast('Review submitted!');
    } catch { addToast('Failed to submit review', 'error'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return null;

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <div className="container" style={{ padding: '16px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: '#007185', marginBottom: 12 }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span> ›{' '}
        <span onClick={() => navigate(`/products?category=${product.category}`)} style={{ cursor: 'pointer' }}>{product.category}</span> ›{' '}
        <span style={{ color: '#565959' }}>{product.title?.slice(0, 50)}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 24, background: '#fff', padding: 24, borderRadius: 4, border: '1px solid var(--border)' }}>
        {/* Images */}
        <div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 16, background: '#f7f7f7', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <img src={product.images?.[activeImg]} alt={product.title}
              style={{ maxHeight: 300, maxWidth: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {product.images?.map((img, i) => (
              <div key={i}
                onClick={() => setActiveImg(i)}
                style={{ border: `2px solid ${i === activeImg ? '#FF9900' : 'var(--border)'}`, borderRadius: 4, padding: 4, cursor: 'pointer', background: '#f7f7f7' }}>
                <img src={img} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 400, lineHeight: 1.4, marginBottom: 8 }}>{product.title}</h1>
          <div style={{ fontSize: 13, color: '#565959', marginBottom: 4 }}>
            Brand: <span style={{ color: '#0066c0' }}>{product.brand}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Stars rating={product.rating || 0} />
            <span style={{ color: '#0066c0', fontSize: 13 }}>{product.numReviews?.toLocaleString()} ratings</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
            {discount && (
              <div style={{ fontSize: 13, color: '#565959', marginBottom: 2 }}>
                List Price: <span className="original-price">${product.originalPrice}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ color: '#B12704', fontSize: 13 }}>Price:</span>
              <span style={{ color: '#B12704' }}>
                <span className="price-symbol">$</span>
                <span style={{ fontSize: 28, fontWeight: 400 }}>{Math.floor(product.price)}</span>
                <span className="price-fraction">{product.price.toFixed(2).split('.')[1]}</span>
              </span>
              {discount && <span style={{ color: '#cc0c39', fontWeight: 600, fontSize: 13 }}>You Save: ${(product.originalPrice - product.price).toFixed(2)} ({discount}%)</span>}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#007600', fontWeight: 700, marginBottom: 4 }}>
              {product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} left in stock!` : 'In Stock') : 'Out of Stock'}
            </div>
            <div style={{ fontSize: 13, color: '#565959' }}>
              {product.price > 35 ? '✓ FREE delivery' : `Delivery: $4.99`}
            </div>
          </div>

          {product.features?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>About this item</h3>
              <ul style={{ paddingLeft: 18 }}>
                {product.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, marginBottom: 3, color: '#0F1111' }}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ fontSize: 13, color: '#565959', lineHeight: 1.6 }}>{product.description}</div>
        </div>

        {/* Buy Box */}
        <div style={{ width: 220, border: '1px solid var(--border)', borderRadius: 4, padding: 16, height: 'fit-content' }}>
          <div style={{ color: '#B12704', marginBottom: 8 }}>
            <span style={{ fontSize: 12 }}>$</span>
            <span style={{ fontSize: 24, fontWeight: 400 }}>{Math.floor(product.price)}</span>
            <span style={{ fontSize: 12 }}>{product.price.toFixed(2).split('.')[1]}</span>
          </div>
          <div style={{ fontSize: 13, color: '#007600', fontWeight: 700, marginBottom: 8 }}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Qty: </label>
            <select value={qty} onChange={e => setQty(Number(e.target.value))}
              style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }}>
              {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}
            className="btn-primary" style={{ width: '100%', marginBottom: 8, padding: '9px 0' }}>
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button onClick={handleBuyNow} disabled={product.stock === 0}
            className="btn-orange" style={{ width: '100%', padding: '9px 0' }}>
            Buy Now
          </button>
          <div style={{ marginTop: 12, fontSize: 12, color: '#565959' }}>
            <div>✓ Ships from Amazon Clone</div>
            <div>✓ Sold by Amazon Clone</div>
            <div style={{ marginTop: 4, color: '#0066c0', cursor: 'pointer' }}>Add to Wish List</div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 24, marginTop: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Customer Reviews</h2>

        {/* Rating summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 300, color: '#0F1111' }}>{(product.rating || 0).toFixed(1)}</div>
            <Stars rating={product.rating || 0} />
            <div style={{ fontSize: 13, color: '#565959', marginTop: 4 }}>out of 5</div>
          </div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = product.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
              const pct = product.reviews?.length ? (count / product.reviews.length) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#0066c0', width: 40 }}>{star} star</span>
                  <div style={{ flex: 1, height: 14, background: '#f0f0f0', borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#FFA41C', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#0066c0', width: 30 }}>{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write review */}
        {user && (
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Write a customer review</h3>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Overall rating</div>
              <Stars rating={reviewRating} interactive onRate={setReviewRating} />
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={3}
              style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, resize: 'vertical' }}
            />
            <button onClick={handleReview} disabled={submittingReview} className="btn-primary" style={{ marginTop: 8 }}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Reviews list */}
        {product.reviews?.length === 0 ? (
          <p style={{ color: '#565959', fontSize: 14 }}>No reviews yet. Be the first to review this product!</p>
        ) : (
          product.reviews?.slice().reverse().map((r, i) => (
            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < product.reviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#232f3e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                  {r.userName?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.userName}</span>
              </div>
              <Stars rating={r.rating} />
              <p style={{ fontSize: 13, color: '#0F1111', marginTop: 6, lineHeight: 1.5 }}>{r.comment}</p>
              <div style={{ fontSize: 12, color: '#767676', marginTop: 4 }}>
                Reviewed on {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
