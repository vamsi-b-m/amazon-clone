import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const HeroBanner = () => (
  <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 8 }}>
    <div style={{
      background: 'linear-gradient(135deg, #131921 0%, #232f3e 50%, #1a252f 100%)',
      minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: (i + 1) * 120, height: (i + 1) * 120,
          borderRadius: '50%',
          border: '1px solid rgba(255,153,0,0.1)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />
      ))}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', padding: '40px 20px' }}>
        <div style={{ fontSize: 13, color: '#FF9900', fontWeight: 600, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
          Microservices Architecture Demo
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
          Everything You Need,<br />
          <span style={{ color: '#FF9900' }}>Delivered Fast</span>
        </h1>
        <p style={{ fontSize: 16, color: '#ccc', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
          Shop millions of products across every category. Built with a modern microservices stack.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products">
            <button className="btn-orange" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600 }}>
              Shop Now
            </button>
          </Link>
          <Link to="/register">
            <button className="btn-secondary" style={{ padding: '12px 28px', fontSize: 15, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}>
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
    {/* Wave */}
    <svg viewBox="0 0 1440 40" style={{ display: 'block', background: '#EAEDED', marginTop: -1 }}>
      <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#232f3e" />
    </svg>
  </div>
);

const CategoryCard = ({ name, icon, color }) => (
  <Link to={`/products?category=${encodeURIComponent(name)}`}>
    <div style={{
      background: '#fff', borderRadius: 4, padding: '20px 16px', textAlign: 'center',
      border: '1px solid var(--border)', transition: 'all 0.2s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1111' }}>{name}</div>
      <div style={{ fontSize: 12, color: '#0066c0', marginTop: 4 }}>Shop now →</div>
    </div>
  </Link>
);

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, dealRes] = await Promise.all([
          productAPI.getAll({ limit: 8, sort: 'popular' }),
          productAPI.getAll({ limit: 4, sort: 'rating' }),
        ]);
        setFeatured(featRes.data.products || []);
        setDeals(dealRes.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Electronics', icon: '💻', color: '#0066c0' },
    { name: 'Books', icon: '📚', color: '#c45500' },
    { name: 'Home & Kitchen', icon: '🏠', color: '#067D62' },
    { name: 'Clothing', icon: '👕', color: '#9b59b6' },
    { name: 'Sports', icon: '⚽', color: '#e74c3c' },
    { name: 'Toys', icon: '🎮', color: '#f39c12' },
  ];

  return (
    <div>
      <HeroBanner />

      <div className="container">
        {/* Stats bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 1, background: 'var(--border)', marginBottom: 20, borderRadius: 4, overflow: 'hidden',
        }}>
          {[
            { label: 'Products', value: '16+', icon: '📦' },
            { label: 'Categories', value: '6', icon: '🏷️' },
            { label: 'Microservices', value: '6', icon: '⚙️' },
            { label: 'Fast Delivery', value: '2-5 days', icon: '🚀' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', padding: '14px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0F1111' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#565959' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Shop by Category</h2>
            <Link to="/products" style={{ color: '#0066c0', fontSize: 13 }}>See all categories →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {categories.map(c => <CategoryCard key={c.name} {...c} />)}
          </div>
        </section>

        {/* Top Deals */}
        {deals.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F1111' }}>🔥 Top Rated Products</h2>
                  <p style={{ fontSize: 13, color: '#565959', marginTop: 2 }}>Highest rated by our customers</p>
                </div>
                <Link to="/products?sort=rating" style={{ color: '#0066c0', fontSize: 13 }}>See all deals</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, paddingBottom: 20 }}>
                {deals.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Best Sellers</h2>
            <Link to="/products" style={{ color: '#0066c0', fontSize: 13 }}>See all products →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

        {/* Architecture Banner */}
        <section style={{ marginBottom: 28 }}>
          <div style={{
            background: 'linear-gradient(135deg, #131921, #232f3e)',
            borderRadius: 8, padding: '32px 28px', color: '#fff',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>⚙️ Microservices Architecture</h2>
            <p style={{ color: '#ccc', marginBottom: 20, maxWidth: 600 }}>
              This app is built with a production-grade microservices stack — perfect for learning DevOps, Kubernetes, and CI/CD practices.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { name: 'API Gateway', desc: 'Routing & Auth', icon: '🔀' },
                { name: 'User Service', desc: 'Auth & Profiles', icon: '👤' },
                { name: 'Product Service', desc: 'Catalog & Search', icon: '📦' },
                { name: 'Cart Service', desc: 'Shopping Cart', icon: '🛒' },
                { name: 'Order Service', desc: 'Order Processing', icon: '📋' },
                { name: 'Notification Svc', desc: 'Event-driven', icon: '🔔' },
              ].map(svc => (
                <div key={svc.name} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{svc.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{svc.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{svc.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
