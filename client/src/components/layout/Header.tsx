import React, { useEffect, useState } from 'react';
import { Menu, User, ShoppingCart, LogOut, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './Header.css';

import logoImg from '../../assets/logo.jpg';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { totalItems } = useCart();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
        setUserName(name ? name.split(' ')[0] : null);
      } else {
        setUserName(null);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
        setUserName(name ? name.split(' ')[0] : null);
      } else {
        setUserName(null);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Você saiu da sua conta.');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <button className="menu-btn" onClick={onMenuClick}>
          <Menu size={28} />
        </button>
        
        <div className="logo">
          <Link to="/">
            <img src={logoImg} alt="Manda Brasa Delivery" className="header-logo" />
          </Link>
        </div>

        <div className="header-actions">
          {userName && (
            <Link to="/meus-pedidos" className="auth-btn" title="Meus Pedidos">
              <Package size={24} />
              <span className="hidden-mobile">Pedidos</span>
            </Link>
          )}
          <Link to={userName ? "/cardapio" : "/auth"} className="auth-btn">
            <User size={24} />
            <span className="hidden-mobile">{userName ? `Olá, ${userName}` : 'Entrar'}</span>
          </Link>
          {userName && (
            <button onClick={handleLogout} className="auth-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Sair">
              <LogOut size={24} />
              <span className="hidden-mobile">Sair</span>
            </button>
          )}
          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={24} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};
