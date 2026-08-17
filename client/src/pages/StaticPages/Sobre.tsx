import React from 'react';

export const Sobre: React.FC = () => {
  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-red-dark)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Sobre Nós</h2>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <img 
          src="/sobre-img.jpg" 
          alt="Manda Brasa Delivery" 
          style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', marginBottom: '1.5rem', objectFit: 'cover' }} 
        />
        <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--color-text)', marginBottom: '1.5rem' }}>
          O <strong>Manda Brasa Delivery</strong> nasceu da paixão por servir o melhor frango assado da região. Nossa receita exclusiva, temperada com dedicação e assada lentamente na brasa, garante um sabor inigualável e uma carne suculenta que derrete na boca.
        </p>
        <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--color-text)' }}>
          Em parceria com o <strong>Epicentro Supermercados</strong>, garantimos a procedência e a qualidade dos nossos ingredientes todos os dias. Nossa missão é levar para a sua mesa, no conforto da sua casa em Quissamã, uma refeição quente, saborosa e que une a família.
        </p>
      </div>
    </div>
  );
};
