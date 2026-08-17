import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Star, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import './Fidelidade.css';

export const Fidelidade: React.FC = () => {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const GOAL = 10;

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Faça login para ver seu Cartão Fidelidade');
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('fidelity_points')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setPoints(data?.fidelity_points || 0);
      } catch (error: any) {
        toast.error('Erro ao buscar pontos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [navigate]);

  if (loading) return <div className="container mt-4">Carregando fidelidade...</div>;

  const pointsArray = Array.from({ length: GOAL }, (_, i) => i + 1);

  return (
    <div className="fidelidade-page container">
      <div className="fidelidade-card">
        <div className="fidelidade-header">
          <Star size={40} className="header-icon" />
          <h2>Programa de Fidelidade</h2>
          <p className="fidelidade-subtitle">Manda Brasa Delivery & Epicentro Supermercados</p>
        </div>

        <div className="fidelidade-rules">
          <p>Compre 10 frangos e ganhe 1 <strong>completamente grátis</strong> como cortesia!</p>
          <p className="note">*(1 frango = 1 ponto)</p>
        </div>

        <div className="stamps-container">
          {pointsArray.map((point) => (
            <div key={point} className={`stamp ${points >= point ? 'active' : ''}`}>
              {points >= point ? (
                <Star size={32} fill="currentColor" />
              ) : (
                <span className="stamp-number">{point}</span>
              )}
            </div>
          ))}
        </div>

        <div className="fidelidade-status">
          {points >= GOAL ? (
            <div className="reward-ready">
              <Gift size={48} className="reward-icon" />
              <h3>Parabéns!</h3>
              <p>Você completou o cartão e ganhou um Frango Assado grátis!</p>
              <button className="btn-primary" onClick={() => navigate('/')}>Usar meu prêmio agora</button>
            </div>
          ) : (
            <div className="progress-info">
              <h3>Você tem {points} {points === 1 ? 'ponto' : 'pontos'}</h3>
              <p>Faltam {GOAL - points} {GOAL - points === 1 ? 'ponto' : 'pontos'} para o seu frango grátis!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
