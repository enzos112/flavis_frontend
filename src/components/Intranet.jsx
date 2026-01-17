import React, { useState, useEffect } from 'react';
import Sidebar from './admin/Sidebar';
import PedidosModule from './admin/PedidosModule';
import CookiesModule from './admin/CookiesModule';
import PreVentaModule from './admin/PreVentaModule';
import ClientesModule from './admin/ClientesModule';
import DashboardModule from './admin/DashboardModule';
import HistorialModule from './admin/HistorialModule'; 

const Intranet = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const htmlElement = window.document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardModule isDarkMode={darkMode} />; 
      case 'pedidos': return <PedidosModule />;
      case 'cookies': return <CookiesModule />;
      case 'preventa': return <PreVentaModule />;
      case 'clientes': return <ClientesModule />;
      case 'historial': return <HistorialModule />;
      default: return <DashboardModule isDarkMode={darkMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-flavis-blue dark:text-white/90 flex transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
      
      <main className="flex-1 ml-64 p-12">
        <div className="max-w-6xl mx-auto animate-in">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default Intranet;