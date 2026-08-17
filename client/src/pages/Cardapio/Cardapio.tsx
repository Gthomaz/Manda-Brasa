import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useCart, type Product } from '../../context/CartContext';
import { LayoutGrid, Grid2X2, List } from 'lucide-react';
import toast from 'react-hot-toast';
import '../Home/Home.css'; // Reusing the same CSS for now

export const Cardapio: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'normal' | 'columns' | 'list'>('normal');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('position', { ascending: true }).order('name');
    if (data) setProducts(data);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1, '');
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="home-container">
      <section className="menu-section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ marginBottom: 0 }}>Cardápio do Dia</h2>
            <div className="view-mode-controls">
              <button className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Lista">
                <List size={20} />
              </button>
              <button className={`btn-view-mode ${viewMode === 'columns' ? 'active' : ''}`} onClick={() => setViewMode('columns')} title="Duas Colunas">
                <Grid2X2 size={20} />
              </button>
              <button className={`btn-view-mode ${viewMode === 'normal' ? 'active' : ''}`} onClick={() => setViewMode('normal')} title="Normal">
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
          
          <div className={`menu-grid view-${viewMode}`}>
            {products.length === 0 ? <p>Carregando cardápio...</p> : products.map((item) => (
              <div key={item.id} className="menu-card">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="menu-card-image" />
                )}
                <div className="menu-info">
                  <h3>{item.name}</h3>
                  {item.description && <p className="item-description">{item.description}</p>}
                  <span className="price">
                    R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="menu-actions">
                  <button onClick={() => handleAddToCart(item)} className="btn-primary" style={{ width: '100%' }}>
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
