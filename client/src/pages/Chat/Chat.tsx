import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ThumbsUp, ThumbsDown, Share2, Image as ImageIcon, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import './Chat.css';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  image_url: string | null;
  likes: number;
  dislikes: number;
  created_at: string;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setCurrentUser(data));
      }
    });

    fetchMessages();

    // Realtime subscription for chat
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Você precisa estar logado para enviar mensagens.');
      return;
    }
    if (!newMessage.trim() && !selectedImage) return;

    setUploadingImage(true);
    let imageUrl = null;

    try {
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat_images')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('chat_images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          content: newMessage,
          image_url: imageUrl,
        });

      if (error) throw error;
      
      setNewMessage('');
      setSelectedImage(null);
      toast.success('Mensagem enviada!');
    } catch (error: any) {
      toast.error('Erro ao enviar: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInteraction = async (messageId: string, type: 'like' | 'dislike') => {
    // In a real app we'd have a separate table to track who liked what to prevent multiple votes
    // For simplicity, we just increment here
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const column = type === 'like' ? 'likes' : 'dislikes';
    const newValue = message[column] + 1;

    const { error } = await supabase
      .from('chat_messages')
      .update({ [column]: newValue })
      .eq('id', messageId);

    if (error) {
      toast.error('Erro ao interagir');
    }
  };

  const handleShare = (message: ChatMessage) => {
    const text = `Olha esse comentário de ${message.user_name} no Manda Brasa Delivery: "${message.content}"`;
    const url = window.location.href;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="chat-page container">
      <div className="chat-header">
        <h2>Chat e Sugestões</h2>
        <p>Compartilhe sua experiência, fotos e sugestões com a comunidade!</p>
      </div>

      <div className="chat-compose-area">
        <form onSubmit={handleSendMessage} className="chat-form">
          <textarea
            placeholder="Escreva seu comentário..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
          />
          
          {selectedImage && (
            <div className="selected-image-preview">
              <span>Imagem selecionada: {selectedImage.name}</span>
              <button type="button" onClick={() => setSelectedImage(null)}>Remover</button>
            </div>
          )}

          <div className="chat-form-actions">
            <label className="btn-upload">
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              <ImageIcon size={20} /> Adicionar Foto
            </label>
            <button type="submit" className="btn-primary" disabled={uploadingImage || (!newMessage.trim() && !selectedImage)}>
              {uploadingImage ? 'Enviando...' : <><Send size={20} /> Enviar</>}
            </button>
          </div>
        </form>
      </div>

      <div className="chat-feed">
        {messages.length === 0 ? (
          <p className="no-messages">Nenhuma mensagem ainda. Seja o primeiro a comentar!</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="chat-message">
              <div className="message-header">
                <strong>{msg.user_name}</strong>
                <span className="message-time">{new Date(msg.created_at).toLocaleString('pt-BR')}</span>
              </div>
              
              {msg.content && <p className="message-content">{msg.content}</p>}
              
              {msg.image_url && (
                <div className="message-image">
                  <img src={msg.image_url} alt="Upload do usuário" loading="lazy" />
                </div>
              )}

              <div className="message-actions">
                <button onClick={() => handleInteraction(msg.id, 'like')} className="action-btn like-btn">
                  <ThumbsUp size={18} /> <span>{msg.likes}</span>
                </button>
                <button onClick={() => handleInteraction(msg.id, 'dislike')} className="action-btn dislike-btn">
                  <ThumbsDown size={18} /> <span>{msg.dislikes}</span>
                </button>
                <button onClick={() => handleShare(msg)} className="action-btn share-btn">
                  <Share2 size={18} /> <span>Compartilhar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
