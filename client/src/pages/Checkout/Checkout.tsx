import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const { items, total, subtotal, deliveryFee, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const [paymentMethod, setPaymentMethod] = useState('Cartão na Entrega');
  const [ccName, setCcName] = useState('');
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');
  const [cpf, setCpf] = useState('');
  const [pixData, setPixData] = useState<{ qr_code_url: string, qr_code: string, order_id: string } | null>(null);

  useEffect(() => {
    if (items.length === 0 && !pixData) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado para finalizar o pedido!');
        navigate('/auth');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [items, navigate, pixData]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");

      const addressStr = `${profile.address_street}, ${profile.address_neighborhood}, CEP: ${profile.address_cep} ${profile.address_complement ? '- ' + profile.address_complement : ''}`;

      // 1. Criar o pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          customer_name: profile.full_name,
          customer_phone: profile.phone,
          delivery_address: addressStr,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total,
          payment_method: paymentMethod,
          status: 'Recebido'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Inserir os itens do pedido
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        observation: item.observation || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Se for cartão online (Pagar.me), processar o pagamento
      if (paymentMethod === 'Cartão Online (Pagar.me)') {
        toast.loading('Processando pagamento...', { id: 'payment' });
        
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await fetch(`${apiUrl}/api/pagarme/transaction`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: total,
              card_number: ccNumber.replace(/\D/g, ''),
              card_cvv: ccCvv,
              card_expiration_date: ccExpiry.replace(/\D/g, ''),
              card_holder_name: ccName,
              customer: {
                id: session.user.id,
                name: profile.full_name,
                email: session.user.email,
                phone: profile.phone,
                cep: profile.address_cep,
                street: profile.address_street,
                neighborhood: profile.address_neighborhood,
                cpf: cpf
              }
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Falha no pagamento');
          }

          // Optional: handle credit card integration
          toast.success('Pagamento de cartão não implementado no backend ainda.', { id: 'payment' });
        } catch (paymentError: any) {
          toast.error(paymentError.message, { id: 'payment' });
          throw paymentError;
        }
      } else if (paymentMethod === 'Gerar QR Pix') {
        toast.loading('Gerando código PIX...', { id: 'payment' });
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const response = await fetch(`${apiUrl}/api/pagarme`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: total,
              customer: {
                name: profile.full_name,
                email: session.user.email,
                phone: profile.phone,
                cpf: cpf
              }
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Falha ao gerar PIX');
          }

          toast.success('PIX gerado com sucesso! Efetue o pagamento.', { id: 'payment' });
          setPixData(data);
          clearCart();
          // We intentionally do not navigate away so the user can scan the QR code
        } catch (paymentError: any) {
          toast.error(paymentError.message, { id: 'payment' });
          throw paymentError;
        }
      } else {
        toast.success('Pedido enviado com sucesso! Acompanhe no chat.');
        clearCart();
        navigate('/meus-pedidos');
      }

    } catch (error: any) {
      toast.error('Erro ao finalizar pedido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="container mt-4">Carregando dados...</div>;

  return (
    <div className="checkout-page container">
      <h2>Finalizar Pedido</h2>

      <div className="checkout-grid">
        <form onSubmit={handleCheckout} className="checkout-form">
          
          <div className="checkout-section">
            <h3>1. Endereço de Entrega</h3>
            <div className="profile-info">
              <p><strong>Nome:</strong> {profile.full_name}</p>
              <p><strong>Celular:</strong> {profile.phone}</p>
              <p><strong>Endereço:</strong> {profile.address_street}, {profile.address_neighborhood}</p>
              <p><strong>CEP:</strong> {profile.address_cep} {profile.address_complement && `- ${profile.address_complement}`}</p>
              <button type="button" className="btn-edit" onClick={() => navigate('/auth')}>Editar Dados</button>
            </div>
          </div>

          <div className="checkout-section">
            <h3>2. Forma de Pagamento</h3>
            <div className="payment-options">
              <label className={`payment-label ${paymentMethod === 'Cartão na Entrega' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="Cartão na Entrega" checked={paymentMethod === 'Cartão na Entrega'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Cartão na Entrega (Maquininha)
              </label>
              <label className={`payment-label ${paymentMethod === 'Gerar QR Pix' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="Gerar QR Pix" checked={paymentMethod === 'Gerar QR Pix'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Gerar QR Pix
              </label>
              <label className={`payment-label ${paymentMethod === 'Dinheiro' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="Dinheiro" checked={paymentMethod === 'Dinheiro'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Dinheiro
              </label>
              <label className={`payment-label ${paymentMethod === 'Cartão Online (Pagar.me)' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="Cartão Online (Pagar.me)" checked={paymentMethod === 'Cartão Online (Pagar.me)'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Pagar com Cartão Agora
              </label>

              {paymentMethod === 'Cartão Online (Pagar.me)' && (
                <div className="cc-form" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" placeholder="Nome no Cartão" value={ccName} onChange={e => setCcName(e.target.value)} className="obs-input" required />
                  <input type="text" placeholder="Número do Cartão" value={ccNumber} onChange={e => setCcNumber(e.target.value)} className="obs-input" required />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" placeholder="Validade (MM/AA)" value={ccExpiry} onChange={e => setCcExpiry(e.target.value)} className="obs-input" required />
                    <input type="text" placeholder="CVV" value={ccCvv} onChange={e => setCcCvv(e.target.value)} className="obs-input" required />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="checkout-section">
            <h3>3. Dados Fiscais (Obrigatório para PIX)</h3>
            <input 
              type="text" 
              placeholder="Digite seu CPF (Apenas números)" 
              value={cpf} 
              onChange={e => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))} 
              className="obs-input" 
              required={paymentMethod === 'Gerar QR Pix' || paymentMethod === 'Cartão Online (Pagar.me)'}
              style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" className="btn-primary btn-submit-order" disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar e Enviar Pedido'}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Resumo da Compra</h3>
          <div className="summary-items">
            {items.map(item => (
              <div key={item.product.id} className="summary-item">
                <span>{item.quantity}x {item.product.name}</span>
                <span>R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>Taxa de Entrega</span>
            <span>R$ {deliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row total">
            <span>Total a Pagar</span>
            <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      
      {/* OVERLAY DO PIX */}
      {pixData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: 'var(--color-red-dark)', marginBottom: '1rem', fontSize: '1.5rem' }}>Pague seu PIX</h3>
            <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem' }}>
              Escaneie o QR Code abaixo com o app do seu banco ou copie o código.
            </p>
            
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <img src={pixData.qr_code_url} alt="QR Code PIX" style={{ maxWidth: '200px', width: '100%' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Ou copie o código (Pix Copia e Cola):</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={pixData.qr_code} 
                  readOnly 
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }} 
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.qr_code);
                    toast.success('Código PIX copiado!');
                  }}
                  style={{ backgroundColor: 'var(--color-orange)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Copiar
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                setPixData(null);
                navigate('/meus-pedidos');
              }}
              style={{ backgroundColor: 'var(--color-red)', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.5rem', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '1rem' }}
            >
              Já paguei / Fechar
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
              O pedido já foi enviado ao restaurante e o status mudará assim que confirmarmos o pagamento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
