import React from 'react';

export const Galeria: React.FC = () => {
  const images = [
    "/galeria/galeria-1.jpg",
    "/galeria/galeria-2.jpg",
    "/galeria/galeria-3.png",
    "/galeria/galeria-4.png",
    "/galeria/galeria-5.png"
  ];

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h2 style={{ color: 'var(--color-red-dark)', marginBottom: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>Nossa Galeria</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {images.map((src, index) => (
          <div key={index} style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <img src={src} alt="Frango Assado" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: '4/3' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
