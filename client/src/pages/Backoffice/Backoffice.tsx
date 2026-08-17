import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './Backoffice.css';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export const Backoffice: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, you would check if the logged in user is an Admin/Attendant here
  // For now we assume anyone accessing this route is the attendant.

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('Novo pedido recebido!', { icon: '🔔', duration: 6000 });
          // Faz um novo fetch para garantir que traz a tabela filha "order_items" que foi inserida logo em seguida
          fetchOrders();
          playAlertSound();
        } else if (payload.eventType === 'UPDATE') {
          fetchOrders(); // Atualiza a lista toda para garantir os itens também
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error('Erro ao buscar pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Status atualizado para: ${newStatus}`);
      
      // Atualiza o estado local para a tela piscar na mesma hora
      setOrders(current => 
        current.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  };

  const playAlertSound = () => {
    // Simple beep sound for new orders
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800; // Hz
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recebido': return '#F59E0B'; // Amarelo
      case 'Preparando': return '#3B82F6'; // Azul
      case 'A Caminho': return '#8B5CF6'; // Roxo
      case 'Entregue': return '#10B981'; // Verde
      default: return '#6B7280'; // Cinza
    }
  };

  if (loading) return <div className="container mt-4">Carregando painel de pedidos...</div>;

  return (
    <div className="backoffice-page container">
      <h2>Painel do Atendente - Pedidos em Tempo Real</h2>
      
      <div className="orders-grid">
        {orders.length === 0 ? (
          <p>Nenhum pedido recebido ainda.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card" style={{ borderTop: `4px solid ${getStatusColor(order.status)}` }}>
              <div className="order-header">
                <h3>Pedido #{order.id.slice(0, 5).toUpperCase()} - {order.customer_name}</h3>
                <span className="order-time">{new Date(order.created_at).toLocaleTimeString()}</span>
              </div>
              
              <div className="order-details">
                <p><strong>Telefone:</strong> {order.customer_phone}</p>
                <p><strong>Endereço:</strong> {order.delivery_address}</p>
                <p><strong>Pagamento:</strong> {order.payment_method}</p>
                
                <div className="order-items-summary" style={{ marginTop: '0.75rem', marginBottom: '0.75rem', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>🍽️ O que preparar:</p>
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#ef4444' }}>{item.quantity}x</strong> {item.product_name}
                      {item.observation && <span style={{ color: '#6b7280', fontStyle: 'italic', display: 'block', paddingLeft: '1.25rem' }}>Obs: {item.observation}</span>}
                    </div>
                  ))}
                </div>

                <p className="order-total"><strong>Total a Cobrar:</strong> R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="order-status-control">
                <p><strong>Status Atual:</strong> <span style={{color: getStatusColor(order.status), fontWeight: 'bold'}}>{order.status}</span></p>
                <div className="status-buttons">
                  <button onClick={() => updateOrderStatus(order.id, 'Recebido')} className={order.status === 'Recebido' ? 'active' : ''}>Recebido</button>
                  <button onClick={() => updateOrderStatus(order.id, 'Preparando')} className={order.status === 'Preparando' ? 'active' : ''}>Preparando</button>
                  <button onClick={() => updateOrderStatus(order.id, 'A Caminho')} className={order.status === 'A Caminho' ? 'active' : ''}>A Caminho</button>
                  <button onClick={() => updateOrderStatus(order.id, 'Entregue')} className={order.status === 'Entregue' ? 'active' : ''}>Entregue</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
