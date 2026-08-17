
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home/Home';
import { Cardapio } from './pages/Cardapio/Cardapio';
import { Auth } from './pages/Auth/Auth';
import { Cart } from './pages/Cart/Cart';
import { Checkout } from './pages/Checkout/Checkout';
import { Backoffice } from './pages/Backoffice/Backoffice';
import { Fidelidade } from './pages/Fidelidade/Fidelidade';
import { Chat } from './pages/Chat/Chat';
import { Sobre } from './pages/StaticPages/Sobre';
import { Galeria } from './pages/StaticPages/Galeria';
import { Contato } from './pages/StaticPages/Contato';
import { Admin } from './pages/Admin/Admin';
import { MeusPedidos } from './pages/MeusPedidos/MeusPedidos';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cardapio" element={<Cardapio />} />
            <Route path="auth" element={<Auth />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="backoffice" element={<Backoffice />} />
            <Route path="fidelidade" element={<Fidelidade />} />
            <Route path="chat" element={<Chat />} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="galeria" element={<Galeria />} />
            <Route path="contato" element={<Contato />} />
            <Route path="admin" element={<Admin />} />
            <Route path="meus-pedidos" element={<MeusPedidos />} />
            {/* Outras rotas serão adicionadas aqui */}
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
