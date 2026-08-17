import React from 'react';
import { X, Info, Image, Star, MessageCircle, Phone, LogIn, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SliderMenu.css';

interface SliderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SliderMenu: React.FC<SliderMenuProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`slider-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`slider-menu ${isOpen ? 'open' : ''}`}>
        <div className="slider-header">
          <h2>Menu</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={28} />
          </button>
        </div>
        
        <nav className="slider-nav">
          <ul>
            <li>
              <Link to="/" onClick={onClose}>
                <Home size={20} /> Início
              </Link>
            </li>
            <li>
              <Link to="/cardapio" onClick={onClose}>
                <Star size={20} /> Cardápio
              </Link>
            </li>
            <li>
              <Link to="/sobre" onClick={onClose}>
                <Info size={20} /> Sobre nós
              </Link>
            </li>
            <li>
              <Link to="/galeria" onClick={onClose}>
                <Image size={20} /> Galeria de fotos
              </Link>
            </li>
            <li>
              <Link to="/fidelidade" onClick={onClose}>
                <Star size={20} /> Cartão Fidelidade
              </Link>
            </li>
            <li>
              <Link to="/chat" onClick={onClose}>
                <MessageCircle size={20} /> Chat & Sugestões
              </Link>
            </li>
            <li>
              <Link to="/contato" onClick={onClose}>
                <Phone size={20} /> Contato
              </Link>
            </li>
            <li className="nav-divider"></li>
            <li>
              <Link to="/auth" onClick={onClose}>
                <LogIn size={20} /> Entrar / Criar Conta
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};
