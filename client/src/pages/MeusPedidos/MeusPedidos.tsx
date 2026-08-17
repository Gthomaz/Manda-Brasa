import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, Clock, Truck, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './MeusPedidos.css';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  observation: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  delivery_fee: number;
  payment_method: string;
  order_items: OrderItem[];
}

export const MeusPedidos: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();

    const fetchSessionAndSubscribe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const channel = supabase
        .channel('public:orders:user')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            const updatedOrder = payload.new as Order;
            setOrders(currentOrders => 
              currentOrders.map(order => 
                order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
              )
            );
            
            // Play notification sound
            playNotificationSound();
            toast(`O status do seu pedido mudou para: ${updatedOrder.status}`, {
              icon: '🔔',
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = fetchSessionAndSubscribe();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);

  const playNotificationSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 600; // Tom agradável
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 1);
  };

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar logado para ver seus pedidos');
        navigate('/auth');
        return;
      }

      // Buscar pedidos com seus respectivos itens
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar seus pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Recebido':
        return <Package size={24} color="#F59E0B" />;
      case 'Preparando':
        return <Clock size={24} color="#3B82F6" />;
      case 'A Caminho':
        return <Truck size={24} color="#8B5CF6" />;
      case 'Entregue':
        return <CheckCircle size={24} color="#10B981" />;
      default:
        return <Package size={24} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recebido': return '#F59E0B';
      case 'Preparando': return '#3B82F6';
      case 'A Caminho': return '#8B5CF6';
      case 'Entregue': return '#10B981';
      default: return '#6B7280';
    }
  };

  const toggleOrderExpand = (id: string) => {
    if (expandedOrder === id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(id);
    }
  };

  if (loading) {
    return <div className="container mt-4">Carregando seus pedidos...</div>;
  }

  return (
    <div className="meus-pedidos-page container">
      <h2>Meus Pedidos</h2>
      <p className="page-subtitle">Acompanhe o status do seu frango assado em tempo real.</p>

      {orders.length === 0 ? (
        <div className="no-orders">
          <Package size={64} color="#ccc" />
          <h3>Você ainda não fez nenhum pedido</h3>
          <p>Que tal experimentar o melhor frango da cidade agora mesmo?</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ver Cardápio</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card" style={{ borderLeft: `4px solid ${getStatusColor(order.status)}` }}>
              <div className="order-header-info" onClick={() => toggleOrderExpand(order.id)}>
                <div className="order-main-info">
                  <div className="order-status-badge" style={{ backgroundColor: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                  <div className="order-date">
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                
                <div className="order-summary-price">
                  <strong>R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  <button className="expand-btn">
                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="order-details-expanded">
                  <div className="order-items-list">
                    <h4>Itens do Pedido</h4>
                    {order.order_items?.map(item => (
                      <div key={item.id} className="order-item-row">
                        <div className="item-qty-name">
                          <span className="qty">{item.quantity}x</span>
                          <div className="name-obs">
                            <span className="name">{item.product_name}</span>
                            {item.observation && <span className="obs">Obs: {item.observation}</span>}
                          </div>
                        </div>
                        <span className="item-total">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer-details">
                    <div className="detail-row">
                      <span>Pagamento:</span>
                      <strong>{order.payment_method}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Taxa de Entrega:</span>
                      <span>R$ {order.delivery_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {order.status === 'Recebido' && (
                      <p className="status-hint">O restaurante já recebeu seu pedido e logo começará a prepará-lo!</p>
                    )}
                    {order.status === 'A Caminho' && (
                      <p className="status-hint">O entregador já saiu. Fique atento no seu endereço!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
