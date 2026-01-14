import React, { useState } from 'react'; // 1. Importar useState

const Sidebar = ({ activeTab, setActiveTab, onLogout, darkMode, setDarkMode }) => {
  const [showConfirm, setShowConfirm] = useState(false); // 2. Estado para la confirmación

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard'},
    { id: 'pedidos', label: 'Pedidos'},
    { id: 'cookies', label: 'Catálogo'},
    { id: 'preventa', label: 'Pre-Venta'},
    { id: 'historial', label: 'Historial Campañas'},
    { id: 'clientes', label: 'Clientes' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-flavis-dark h-screen fixed left-0 top-0 border-r border-[#326371]/5 dark:border-white/5 flex flex-col p-8 z-50 font-sans transition-colors duration-300">
      {/* --- LOGO / HEADER --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-flavis-gold italic tracking-tighter transition-colors">
          Flavis Admin
        </h2>
        <p className="text-[9px] uppercase tracking-[0.3em] text-flavis-blue/40 dark:text-white/30 font-bold">
          Gestión Interna
        </p>
      </div>

      {/* --- NAVEGACIÓN --- */}
      <nav className="flex-grow space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setShowConfirm(false); // Cerrar confirmación si cambia de pestaña
            }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
              activeTab === item.id 
              ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-lg scale-105' 
              : 'text-flavis-blue/50 dark:text-white/40 hover:bg-flavis-blue/5 dark:hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* --- SECCIÓN INFERIOR: TOGGLE & LOGOUT --- */}
      <div className="mt-auto flex flex-col gap-8">
        {/* BOTÓN MODO OSCURO (Sin cambios) */}
        <div className="flex flex-col gap-3 px-2">
          <p className="text-[8px] uppercase font-black text-flavis-blue/30 dark:text-white/20 tracking-widest ml-1">
            Apariencia
          </p>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="group flex items-center justify-between w-full p-1.5 rounded-2xl bg-gray-100 dark:bg-flavis-card-dark border border-transparent dark:border-white/5 transition-all duration-300"
          >
            <span className="text-[9px] font-black uppercase tracking-widest ml-3 text-flavis-blue/60 dark:text-white/60">
              {darkMode ? 'Oscuro' : 'Claro'}
            </span>
            <div className={`relative w-12 h-7 rounded-xl transition-all duration-500 flex items-center px-1 ${darkMode ? 'bg-flavis-gold' : 'bg-flavis-blue'}`}>
              <div className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 flex items-center justify-center text-[10px] ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}>
                {darkMode ? '🌙' : '☀️'}
              </div>
            </div>
          </button>
        </div>

        {/* --- BOTÓN CERRAR SESIÓN CON CONFIRMACIÓN --- */}
        <div className="pt-6 border-t border-flavis-blue/10 dark:border-white/10 flex flex-col gap-2">
          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              className="text-flavis-blue/40 dark:text-white/20 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-400 dark:hover:text-red-400 transition-colors duration-300 text-center"
            >
              Cerrar Sesión
            </button>
          ) : (
            <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
              <p className="text-[9px] font-black text-red-400 uppercase text-center tracking-tighter">¿Estás seguro?</p>
              <div className="flex gap-2">
                <button 
                  onClick={onLogout}
                  className="flex-1 bg-red-400/10 text-red-400 text-[9px] font-black py-2 rounded-lg hover:bg-red-400 hover:text-white transition-all"
                >
                  SÍ
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-100 dark:bg-white/5 text-flavis-blue/40 dark:text-white/40 text-[9px] font-black py-2 rounded-lg"
                >
                  NO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;