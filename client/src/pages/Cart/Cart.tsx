import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ArrowRight } from 'lucide-react';
import './Cart.css';

export const Cart: React.FC = () => {
  const { items, removeFromCart, subtotal, deliveryFee, total, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-empty container">
        <h2>Seu carrinho está vazio</h2>
        <p>Volte ao cardápio e adicione os melhores itens da cidade!</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Ver Cardápio</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h2>Seu Carrinho</h2>
      
      <div className="cart-content">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.product.id} className="cart-item">
              <div className="item-details">
                <h3>{item.quantity}x {item.product.name}</h3>
                {item.observation && <p className="item-obs">Obs: {item.observation}</p>}
                <p className="item-price">
                  R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button 
                onClick={() => removeFromCart(item.product.id)}
                className="remove-btn"
                aria-label="Remover item"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Resumo do Pedido</h3>
          <div className="summary-row">
            <span>Subtotal ({totalItems} itens)</span>
            <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>Taxa de Entrega</span>
            <span>R$ {deliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <Link to="/checkout" className="btn-primary checkout-btn">
            Finalizar Pedido <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};
