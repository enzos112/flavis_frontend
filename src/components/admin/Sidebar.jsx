import React, { useState } from 'react'; 

// --- ÍCONOS VECTORIALES (CERO EMOJIS) ---
const Icons = {
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-flavis-blue"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-flavis-gold"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
};

const Sidebar = ({ activeTab, setActiveTab, onLogout, darkMode, setDarkMode }) => {
  const [showConfirm, setShowConfirm] = useState(false); 

  // --- ORDEN ESTRATÉGICO DEFINIDO ---
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard'},
    { id: 'pedidos', label: 'Pedidos'},
    { id: 'egresos', label: 'Egresos'},
    { id: 'cookies', label: 'Catálogo'},
    { id: 'preventa', label: 'Campaña'},
    { id: 'historial', label: 'Historial Campañas'},
    { id: 'clientes', label: 'Clientes' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-flavis-dark h-screen fixed left-0 top-0 border-r border-[#326371]/5 dark:border-white/5 flex flex-col p-8 z-50 font-sans transition-colors duration-300 shadow-[4px_0_24px_rgba(50,99,113,0.05)] dark:shadow-none">
      {/* --- LOGO / HEADER --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-flavis-gold italic tracking-tighter transition-colors">
          Flavis
        </h2>
        <p className="text-[9px] uppercase tracking-[0.3em] text-flavis-blue/40 dark:text-white/30 font-bold">
          Gestión
        </p>
      </div>

      {/* --- NAVEGACIÓN --- */}
      <nav className="flex-grow space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setShowConfirm(false); 
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
        
        {/* BOTÓN MODO OSCURO (REDISEÑADO CON SVG) */}
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
            <div className={`relative w-12 h-7 rounded-xl transition-all duration-500 flex items-center px-1 ${darkMode ? 'bg-flavis-gold' : 'bg-flavis-blue/10'}`}>
              <div className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 flex items-center justify-center ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}>
                {darkMode ? <Icons.Moon /> : <Icons.Sun />}
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