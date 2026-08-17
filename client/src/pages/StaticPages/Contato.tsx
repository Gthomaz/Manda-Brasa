import React, { useState } from 'react';
import { MapPin, Phone, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const Contato: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      toast.success('Mensagem enviada com sucesso! Em breve entraremos em contato.');
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-red-dark)', marginBottom: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>Contato e Localização</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Info & Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <MapPin size={32} color="var(--color-orange)" />
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Onde Estamos</h3>
                <p style={{ color: 'var(--color-text-light)' }}>Centro de Quissamã, RJ (Anexo ao Epicentro Supermercados)</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Phone size={32} color="var(--color-orange)" />
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Telefone / WhatsApp</h3>
                <p style={{ color: 'var(--color-text-light)' }}>(22) 99999-9999</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Clock size={32} color="var(--color-orange)" />
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Funcionamento</h3>
                <p style={{ color: 'var(--color-text-light)' }}>Terça a Domingo: 10:00 às 15:00</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117565.48512399583!2d-41.56588265814515!3d-22.10901592652618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97bfeb72a9e223%3A0xc3f8e5fbd296f8a!2sQuissam%C3%A3%2C%20RJ!5e0!3m2!1spt-BR!2sbr!4v1715099354020!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="250" 
              style={{ border: 0, borderRadius: '0.5rem' }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-red-dark)' }}>Envie uma Mensagem</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome Completo *</label>
              <input type="text" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>E-mail *</label>
              <input type="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Celular *</label>
              <input type="tel" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mensagem *</label>
              <textarea rows={4} required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', resize: 'vertical' }}></textarea>
            </div>
            <button type="submit" disabled={loading} style={{ 
              backgroundColor: 'var(--color-red-dark)', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              <Send size={20} />
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
