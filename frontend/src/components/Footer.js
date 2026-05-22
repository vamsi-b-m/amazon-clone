import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ background: '#37475A', color: '#fff', textAlign: 'center', padding: '14px', fontSize: 13, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#3d5068'}
        onMouseLeave={e => e.currentTarget.style.background = '#37475A'}
      >Back to top</div>
      <div style={{ background: '#232f3e', color: '#fff', padding: '40px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
          {[
            { title: 'Get to Know Us', links: ['About Us', 'Careers', 'Press Releases', 'Amazon Science'] },
            { title: 'Make Money with Us', links: ['Sell products on Amazon', 'Sell on Amazon Business', 'Advertise Your Products', 'Become an Affiliate'] },
            { title: 'Amazon Payment Products', links: ['Amazon Business Card', 'Shop with Points', 'Reload Your Balance', 'Currency Converter'] },
            { title: 'Let Us Help You', links: ['Your Account', 'Your Orders', 'Shipping Rates & Policies', 'Returns & Replacements', 'Help'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{col.title}</h4>
              {col.links.map(l => (
                <div key={l} style={{ marginBottom: 6 }}>
                  <a href="#" style={{ color: '#ddd', fontSize: 13 }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >{l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#131921', color: '#ddd', textAlign: 'center', padding: '20px', fontSize: 12 }}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#FF9900', fontSize: 18, fontWeight: 700 }}>amazon</span>
          <span style={{ fontSize: 10, color: '#FF9900' }}>clone</span>
        </div>
        <div>© 2024 Amazon Clone — Built with Microservices Architecture</div>
        <div style={{ marginTop: 4, color: '#999' }}>Node.js • React • MongoDB • Redis • RabbitMQ • Docker</div>
      </div>
    </footer>
  );
}
