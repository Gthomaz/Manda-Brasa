import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Package, Bell, Plus, Trash2, Edit, GripVertical, Ban, CheckCircle, LogOut } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import './Admin.css';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'produtos' | 'usuarios' | 'push'>('produtos');
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // States para CRUD de Usuários
  const [newUser, setNewUser] = useState({ full_name: '', email: '', phone: '', address_street: '', address_neighborhood: '', password: '', address_cep: '', address_city: 'Quissamã' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // States para CRUD de Produtos
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image_url: '' });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // States para Notificação Push
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushImage, setPushImage] = useState('');
  const [uploadingPushImage, setUploadingPushImage] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('position', { ascending: true }).order('name');
    if (data) setProducts(data);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Erro ao carregar usuários da API', e);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedPrice = parseFloat(newProduct.price.toString().replace(',', '.'));
      
      if (editingProductId) {
        const { error, data } = await supabase.from('products').update({
          name: newProduct.name,
          price: parsedPrice,
          description: newProduct.description,
          image_url: newProduct.image_url
        }).eq('id', editingProductId).select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Falha ao atualizar. O banco de dados bloqueou a ação (Verifique as políticas RLS de Update).');
        }
        
        toast.success('Produto atualizado!');
        setEditingProductId(null);
      } else {
        const { error, data } = await supabase.from('products').insert({
          name: newProduct.name,
          price: parsedPrice,
          description: newProduct.description,
          image_url: newProduct.image_url
        }).select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Falha ao adicionar. O banco de dados bloqueou a ação (Verifique as políticas RLS de Insert).');
        }
        
        toast.success('Produto adicionado!');
      }
      setNewProduct({ name: '', price: '', description: '', image_url: '' });
      fetchProducts();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProducts(items);

    try {
      const updates = items.map((item, index) => 
        supabase.from('products').update({ position: index }).eq('id', item.id)
      );
      await Promise.all(updates);
      toast.success('Ordem atualizada!');
    } catch (error: any) {
      toast.error('Erro ao reordenar: ' + error.message);
      fetchProducts();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `menu/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setNewProduct(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePushImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingPushImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `push-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `push/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setPushImage(data.publicUrl);
      toast.success('Imagem da notificação enviada!');
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message);
    } finally {
      setUploadingPushImage(false);
    }
  };

  const handleEditProduct = (p: any) => {
    setEditingProductId(p.id);
    setNewProduct({ name: p.name, price: p.price.toString(), description: p.description || '', image_url: p.image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setNewProduct({ name: '', price: '', description: '', image_url: '' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Produto excluído!');
      fetchProducts();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const handleUpdateFidelity = async (userId: string, currentPoints: number, increment: number) => {
    try {
      const newPoints = Math.max(0, currentPoints + increment);
      const { error } = await supabase.from('profiles').update({ fidelity_points: newPoints }).eq('id', userId);
      if (error) throw error;
      toast.success('Pontos atualizados!');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao atualizar pontos');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const res = await fetch(`/api/users?id=${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Erro desconhecido');
        toast.success('Usuário atualizado!');
        setEditingUserId(null);
      } else {
        if (!newUser.password) throw new Error('A senha é obrigatória para novos usuários');
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Erro desconhecido');
        toast.success('Usuário criado com sucesso!');
      }
      setNewUser({ full_name: '', email: '', phone: '', address_street: '', address_neighborhood: '', password: '', address_cep: '', address_city: 'Quissamã' });
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  const handleEditUser = (u: any) => {
    setEditingUserId(u.id);
    setNewUser({
      full_name: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      address_street: u.address_street || '',
      address_neighborhood: u.address_neighborhood || '',
      address_cep: u.address_cep || '',
      address_city: u.address_city || 'Quissamã'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setNewUser({ full_name: '', email: '', phone: '', address_street: '', address_neighborhood: '', password: '', address_cep: '', address_city: 'Quissamã' });
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja DELETAR este usuário completamente do sistema?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Erro desconhecido');
      toast.success('Usuário excluído definitivamente!');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const handleBanUser = async (id: string, isBan: boolean) => {
    if (!window.confirm(`Tem certeza que deseja ${isBan ? 'BANIR' : 'DESBANIR'} este usuário?`)) return;
    try {
      const res = await fetch(`/api/users?id=${id}&action=ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban: isBan })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erro desconhecido');
      toast.success(isBan ? 'Usuário banido!' : 'Usuário desbanido!');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushMessage) return;
    
    // Simulação do envio de Push Notification
    toast.success(`Notificação enviada para ${users.length} usuários!`);
    setPushTitle('');
    setPushMessage('');
    setPushImage('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h2>Painel Administrativo</h2>
        <p>Controle total do Manda Brasa Delivery</p>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button className={activeTab === 'produtos' ? 'active' : ''} onClick={() => setActiveTab('produtos')}>
            <Package size={20} /> Cardápio (Produtos)
          </button>
          <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>
            <Users size={20} /> Usuários & Fidelidade
          </button>
          <button className={activeTab === 'push' ? 'active' : ''} onClick={() => setActiveTab('push')}>
            <Bell size={20} /> Notificações (Push)
          </button>
          <hr style={{ margin: '1rem 0', borderTop: '1px solid #eee' }} />
          <button onClick={handleLogout} style={{ color: '#EF4444' }}>
            <LogOut size={20} /> Sair do Painel
          </button>
        </aside>

        <main className="admin-content">
          {activeTab === 'produtos' && (
            <div className="admin-section">
              <h3>Gerenciar Cardápio</h3>
              
              <form onSubmit={handleSaveProduct} className="add-product-form">
                <h4>{editingProductId ? 'Editar Produto' : 'Adicionar Novo Produto'}</h4>
                <div className="form-group-row">
                  <input type="text" placeholder="Nome do Produto" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                  <input type="number" step="0.01" placeholder="Preço (R$)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                </div>
                <div className="form-group-row">
                  <input type="text" placeholder="Descrição (Opcional)" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <input type="text" placeholder="URL da Imagem (Ex: /menu/foto.jpg)" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ cursor: 'pointer', background: '#eee', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', color: '#333' }}>
                        {uploadingImage ? 'Enviando...' : '📤 Fazer Upload do Dispositivo'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                      {newProduct.image_url && <span style={{ fontSize: '0.8rem', color: 'var(--color-green)' }}>Imagem pronta!</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-primary">
                    {editingProductId ? <><Edit size={18} /> Salvar Alterações</> : <><Plus size={18} /> Adicionar</>}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={cancelEdit} className="btn-secondary" style={{ backgroundColor: '#666', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              <div className="product-list">
                {products.length === 0 ? <p>Nenhum produto cadastrado.</p> : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}></th>
                          <th>Foto</th>
                          <th>Nome</th>
                          <th>Preço</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <Droppable droppableId="products">
                        {(provided) => (
                          <tbody {...provided.droppableProps} ref={provided.innerRef}>
                            {products.map((p, index) => (
                              <Draggable key={p.id} draggableId={p.id} index={index}>
                                {(provided, snapshot) => (
                                  <tr 
                                    ref={provided.innerRef} 
                                    {...provided.draggableProps} 
                                    style={{
                                      ...provided.draggableProps.style, 
                                      background: snapshot.isDragging ? '#f8f9fa' : 'var(--color-white)',
                                      boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
                                      display: snapshot.isDragging ? 'table' : ''
                                    }}
                                  >
                                    <td {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#999', textAlign: 'center' }}>
                                      <GripVertical size={20} />
                                    </td>
                                    <td>
                                      {p.image_url ? (
                                        <img src={p.image_url} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                      ) : (
                                        <div style={{ width: '50px', height: '50px', backgroundColor: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>Sem foto</div>
                                      )}
                                    </td>
                                    <td>
                                      <strong>{p.name}</strong>
                                      <br/><small>{p.description}</small>
                                    </td>
                                    <td>R$ {p.price.toFixed(2)}</td>
                                    <td className="actions-cell">
                                      <button onClick={() => handleEditProduct(p)} className="btn-icon" style={{ color: 'var(--color-blue)', marginRight: '0.5rem' }} title="Editar"><Edit size={18} /></button>
                                      <button onClick={() => handleDeleteProduct(p.id)} className="btn-icon text-red" title="Excluir"><Trash2 size={18} /></button>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        )}
                      </Droppable>
                    </table>
                  </DragDropContext>
                )}
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="admin-section">
              <h3>Gerenciar Usuários e Fidelidade</h3>
              
              <form onSubmit={handleSaveUser} className="add-product-form" style={{ marginBottom: '2rem' }}>
                <h4>{editingUserId ? 'Editar Usuário' : 'Criar Novo Usuário Oficial'}</h4>
                <div className="form-group-row">
                  <input type="text" placeholder="Nome Completo" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} required />
                  <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                </div>
                <div className="form-group-row">
                  <input type="text" placeholder="Celular/WhatsApp" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                  {!editingUserId && (
                    <input type="password" placeholder="Senha Oficial" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                  )}
                </div>
                <div className="form-group-row">
                  <input type="text" placeholder="CEP" value={newUser.address_cep} onChange={e => setNewUser({...newUser, address_cep: e.target.value})} />
                  <input type="text" placeholder="Cidade" value={newUser.address_city} onChange={e => setNewUser({...newUser, address_city: e.target.value})} />
                </div>
                <div className="form-group-row">
                  <input type="text" placeholder="Rua e Número" value={newUser.address_street} onChange={e => setNewUser({...newUser, address_street: e.target.value})} />
                  <input type="text" placeholder="Bairro" value={newUser.address_neighborhood} onChange={e => setNewUser({...newUser, address_neighborhood: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary">
                    {editingUserId ? <><Edit size={18} /> Salvar Alterações</> : <><Plus size={18} /> Criar Usuário</>}
                  </button>
                  {editingUserId && (
                    <button type="button" onClick={cancelEditUser} className="btn-secondary" style={{ backgroundColor: '#666', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              <div className="users-list">
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Nome / Email</th>
                      <th>Endereço</th>
                      <th>Fidelidade</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ opacity: u.banned ? 0.6 : 1 }}>
                        <td>
                          {u.banned ? <span style={{ color: 'red', fontWeight: 'bold' }}>BANIDO</span> : <span style={{ color: 'green', fontWeight: 'bold' }}>ATIVO</span>}
                        </td>
                        <td>
                          <strong>{u.full_name || 'Sem nome'}</strong><br/>
                          <small>{u.email || u.phone}</small>
                        </td>
                        <td>{u.address_street}, {u.address_neighborhood}<br/><small>{u.address_city} - {u.address_cep}</small></td>
                        <td>
                          <div className="fidelity-control">
                            <button onClick={() => handleUpdateFidelity(u.id, u.fidelity_points, -1)}>-</button>
                            <span>{u.fidelity_points || 0}</span>
                            <button onClick={() => handleUpdateFidelity(u.id, u.fidelity_points, 1)}>+</button>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <button onClick={() => handleEditUser(u)} className="btn-icon" style={{ color: 'var(--color-blue)', marginRight: '0.5rem' }} title="Editar"><Edit size={18} /></button>
                          {u.banned ? (
                            <button onClick={() => handleBanUser(u.id, false)} className="btn-icon" style={{ color: 'green', marginRight: '0.5rem' }} title="Desbanir"><CheckCircle size={18} /></button>
                          ) : (
                            <button onClick={() => handleBanUser(u.id, true)} className="btn-icon text-red" style={{ marginRight: '0.5rem' }} title="Banir"><Ban size={18} /></button>
                          )}
                          <button onClick={() => handleDeleteUser(u.id)} className="btn-icon text-red" title="Deletar permanentemente"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'push' && (
            <div className="admin-section">
              <h3>Disparar Notificações Push</h3>
              <p className="section-desc">Envie promoções, cupons ou novidades diretamente para o celular de todos os seus clientes.</p>
              
              <form onSubmit={handleSendPush} className="push-form">
                <div className="form-group">
                  <label>Título da Notificação</label>
                  <input type="text" placeholder="Ex: Frango Assado com 20% de Desconto!" value={pushTitle} onChange={e => setPushTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Mensagem</label>
                  <textarea placeholder="Ex: Aproveite o final de semana para pedir o melhor frango da cidade. Peça agora pelo app!" rows={4} value={pushMessage} onChange={e => setPushMessage(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Imagem da Notificação (Opcional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <label style={{ cursor: 'pointer', background: '#eee', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', color: '#333' }}>
                      {uploadingPushImage ? 'Enviando...' : '📤 Upload de Imagem'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePushImageUpload} disabled={uploadingPushImage} />
                    </label>
                    {pushImage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={pushImage} alt="Push Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        <button type="button" onClick={() => setPushImage('')} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '0.9rem' }}>Remover</button>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="btn-primary">Disparar para {users.length} usuários</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
