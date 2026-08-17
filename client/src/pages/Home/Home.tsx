import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Home.css';


export const Home: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="slogan">Melhor Frango Assado de Quissamã</h1>
          <p className="hero-note" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Por que somos o Melhor Frango Assado de Quissamã? Porque unimos tradição, tempero de família e praticidade! Esqueça o frango seco: aqui garantimos suculência extrema, pele crocante e um sabor inesquecível. Com nosso novo app, o frango mais famoso da cidade chega na sua mesa em minutos. Experimente e comprove!
          </p>
          <p className="hero-note">Crie sua conta ou faça seu login para fazer o seu pedido.</p>
          <div className="hero-actions">
            {!isAuthenticated ? (
              <Link to="/auth" className="btn-primary">Criar Conta / Login</Link>
            ) : (
              <Link to="/cardapio" className="btn-primary">Ver Cardápio</Link>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <img 
            src="/hero-bg.jpg" 
            alt="Frango Assado" 
            className="hero-image"
          />
        </div>
      </section>
    </div>
  );
};
