import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.jpg';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="footer-info">
            <img src={logoImg} alt="Manda Brasa Delivery" className="footer-logo" />
            <div className="contact-item">
              <MapPin size={18} />
              <p>Rua Principal, 123 - Centro, Quissamã - RJ</p>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <p>(22) 99999-9999</p>
            </div>
          </div>
          <div className="footer-whatsapp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '250px' }}>
            <p style={{ marginBottom: '0.5rem', color: '#D1D5DB', fontSize: '0.9rem' }}>Dúvidas ou pedidos por mensagem?</p>
            <a 
              href="https://wa.me/5522981413187" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                backgroundColor: '#25D366', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '2rem', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📱 (22) 98141-3187
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Manda Brasa Assados e Grelhados. Todos os direitos reservados.</p>
          <div className="admin-links" style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/backoffice" className="backoffice-link">Atendimento</Link>
            <Link to="/admin" className="backoffice-link">Administração</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
