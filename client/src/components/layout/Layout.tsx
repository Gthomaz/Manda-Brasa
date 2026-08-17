import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { SliderMenu } from './SliderMenu';
import { Footer } from './Footer';
import './Layout.css';

export const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="layout-wrapper">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <SliderMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
