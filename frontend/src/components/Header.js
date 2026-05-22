import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';

const AmazonLogo = () => (
  <svg width="90" height="28" viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="22" fill="white" fontSize="22" fontWeight="700" fontFamily="Inter,Arial">amazon</text>
    <path d="M8 26 Q45 32 82 26" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <text x="68" y="26" fill="#FF9900" fontSize="14" fontFamily="Arial">✦</text>
  </svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSearchInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await productAPI.search(val);
        setSuggestions(data.products?.slice(0, 6) || []);
        setShowDropdown(true);
      } catch {}
    }, 250);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!searchRef.current?.contains(e.target)) setShowDropdown(false);
      setShowUserMenu(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <header>
      {/* Main nav */}
      <div style={{ background: '#131921', padding: '8px 16px' }}>
        <div style={{ maxWidth: 1500, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo */}
          <Link to="/" style={{ border: '1px solid transparent', borderRadius: 2, padding: '2px 6px', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <AmazonLogo />
          </Link>

          {/* Deliver to */}
          <div style={{ color: '#ccc', fontSize: 12, flexShrink: 0, display: 'none' }}>
            <div>Deliver to</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>🌍 Worldwide</div>
          </div>

          {/* Search */}
          <div ref={searchRef} style={{ flex: 1, position: 'relative', maxWidth: 900 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
              <input
                value={query}
                onChange={e => handleSearchInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder="Search Amazon Clone"
                style={{
                  flex: 1, padding: '10px 14px', fontSize: 14, border: 'none', outline: 'none',
                  background: '#fff', color: '#0F1111',
                }}
              />
              <button type="submit" style={{
                background: '#FF9900', border: 'none', padding: '0 16px', cursor: 'pointer', flexShrink: 0,
              }}>
                <span style={{ fontSize: 18 }}>🔍</span>
              </button>
            </form>
            {showDropdown && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
                border: '1px solid #cdcdcd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 1000, overflow: 'hidden',
              }}>
                {suggestions.map(p => (
                  <div key={p._id}
                    onClick={() => { navigate(`/products/${p._id}`); setShowDropdown(false); setQuery(''); }}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      borderBottom: '1px solid #f0f0f0', fontSize: 13,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <img src={p.images?.[0]} alt={p.title} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 2 }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{p.title}</div>
                      <div style={{ color: '#B12704', fontSize: 12 }}>${p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account */}
          <div style={{ position: 'relative', flexShrink: 0 }}
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <Link to={user ? '/orders' : '/login'} style={{
              color: '#fff', display: 'flex', flexDirection: 'column', padding: '4px 8px',
              border: '1px solid transparent', borderRadius: 2, fontSize: 12,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <span style={{ color: '#ccc' }}>Hello, {user ? user.name.split(' ')[0] : 'sign in'}</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Account & Orders ▾</span>
            </Link>
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, background: '#fff', width: 220,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)', borderRadius: 4, zIndex: 999, padding: 16,
              }}>
                {!user ? (
                  <>
                    <Link to="/login">
                      <button className="btn-orange" style={{ width: '100%', marginBottom: 12 }}>Sign in</button>
                    </Link>
                    <div style={{ fontSize: 12, textAlign: 'center', color: '#555' }}>
                      New customer? <Link to="/register" style={{ color: '#0066c0' }}>Start here</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/orders" style={{ display: 'block', padding: '8px 0', fontSize: 13, color: '#0066c0', borderBottom: '1px solid #eee' }}>Your Orders</Link>
                    <div onClick={logout} style={{ padding: '8px 0', fontSize: 13, color: '#0066c0', cursor: 'pointer' }}>Sign Out</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          <Link to="/orders" style={{
            color: '#fff', display: 'flex', flexDirection: 'column', padding: '4px 8px', flexShrink: 0,
            border: '1px solid transparent', borderRadius: 2, fontSize: 12,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <span style={{ color: '#ccc' }}>Returns</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>& Orders</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" style={{
            color: '#fff', display: 'flex', alignItems: 'flex-end', gap: 4, padding: '4px 8px', flexShrink: 0,
            border: '1px solid transparent', borderRadius: 2,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 32 }}>🛒</span>
              <span style={{
                position: 'absolute', top: -2, right: -4, background: '#FF9900', color: '#111',
                borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 700,
              }}>{cartCount}</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Cart</span>
          </Link>
        </div>
      </div>

      {/* Sub nav */}
      <div style={{ background: '#232f3e', padding: '6px 16px' }}>
        <div style={{ maxWidth: 1500, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
          {['All', 'Electronics', 'Books', 'Home & Kitchen', 'Clothing', 'Sports', 'Toys'].map(cat => (
            <Link key={cat} to={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
              style={{ color: '#fff', fontSize: 13, padding: '4px 10px', whiteSpace: 'nowrap', border: '1px solid transparent', borderRadius: 2 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >{cat === 'All' ? '☰ All' : cat}</Link>
          ))}
          <Link to="/products?badge=Best+Seller"
            style={{ color: '#FF9900', fontSize: 13, padding: '4px 10px', whiteSpace: 'nowrap', fontWeight: 600 }}>
            🔥 Best Sellers
          </Link>
          <Link to="/products?sort=price_asc"
            style={{ color: '#fff', fontSize: 13, padding: '4px 10px', whiteSpace: 'nowrap' }}>
            Today's Deals
          </Link>
        </div>
      </div>
    </header>
  );
}
