import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('Quissamã');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://client-eight-henna-1w09ykoxye.vercel.app/',
            data: {
              full_name: nome,
              phone: celular,
              address_cep: cep,
              address_city: cidade,
              address_street: rua,
              address_neighborhood: bairro,
              address_complement: complemento
            }
          }
        });
        if (error) throw error;
        toast.success('Conta criada! Verifique seu e-mail para confirmar.', { duration: 5000 });
        // The user will be automatically logged in after confirming their email and redirected back
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Faça seu Login' : 'Crie sua Conta'}</h2>
        
        <form onSubmit={handleAuth} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Celular *</label>
                <input type="tel" value={celular} onChange={(e) => setCelular(e.target.value)} required />
              </div>
              
              <div className="form-divider">Endereço Completo</div>
              
              <div className="form-group">
                <label>CEP *</label>
                <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} required />
                <span className="cep-help">
                  Se não souber seu CEP <a href="https://quissamavirtualshopping.com.br/busca-cep" target="_blank" rel="noopener noreferrer">clique aqui</a>
                </span>
              </div>
              <div className="form-group">
                <label>Cidade *</label>
                <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Rua *</label>
                <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Bairro *</label>
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
              </div>
            </>
          )}

          <div className="form-divider">Dados de Acesso</div>

          <div className="form-group">
            <label>E-mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Senha *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}
            <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
              {isLogin ? 'Crie aqui' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
