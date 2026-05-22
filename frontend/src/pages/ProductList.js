import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    productAPI.getCategories().then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let data;
        if (search) {
          const res = await productAPI.search(search);
          setProducts(res.data.products || []);
          setTotal(res.data.products?.length || 0);
          setPages(1);
        } else {
          const params = { page, limit: 12, sort };
          if (category !== 'All') params.category = category;
          const res = await productAPI.getAll(params);
          setProducts(res.data.products || []);
          setTotal(res.data.total || 0);
          setPages(res.data.pages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, sort, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Avg. Customer Review' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  return (
    <div className="container" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        {search && (
          <div style={{ fontSize: 18, marginBottom: 4 }}>
            {total} results for "<strong>{search}</strong>"
          </div>
        )}
        {!search && <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {category !== 'All' ? category : 'All Products'}
        </h1>}
        <div style={{ fontSize: 13, color: '#565959' }}>{total} products</div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Sidebar filters */}
        <aside style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 4, padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
              Department
            </h3>
            {categories.map(cat => (
              <div key={cat}
                onClick={() => setParam('category', cat)}
                style={{
                  padding: '5px 0', fontSize: 13, cursor: 'pointer',
                  color: cat === category ? '#c45500' : '#0066c0',
                  fontWeight: cat === category ? 700 : 400,
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                {cat === category ? '▸ ' : ''}{cat}
              </div>
            ))}

            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '16px 0 12px', paddingBottom: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              Sort By
            </h3>
            {sortOptions.map(opt => (
              <div key={opt.value}
                onClick={() => setParam('sort', opt.value)}
                style={{
                  padding: '5px 0', fontSize: 13, cursor: 'pointer',
                  color: opt.value === sort ? '#c45500' : '#0066c0',
                  fontWeight: opt.value === sort ? 700 : 400,
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                {opt.value === sort ? '▸ ' : ''}{opt.label}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 4, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>No results found</h2>
              <p style={{ color: '#565959' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                  {[...Array(pages)].map((_, i) => (
                    <button key={i}
                      onClick={() => setParam('page', String(i + 1))}
                      style={{
                        padding: '7px 13px', borderRadius: 4, border: '1px solid var(--border)',
                        background: (i + 1) === page ? '#FF9900' : '#fff',
                        fontWeight: (i + 1) === page ? 700 : 400,
                        cursor: 'pointer', fontSize: 13,
                      }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
