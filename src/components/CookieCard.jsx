import React from 'react';

// --- ICONOS MINIMALISTAS ---
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
};

const CookieCard = ({ cookie, quantity, onUpdate, onOpenModal, isPack = false }) => {
  
  // Obtenemos la cantidad real de galletas si es un pack
  const cookiesInPack = cookie.galletas?.length || 0;

  return (
    <div 
      className="bg-[#2d5a6a] rounded-2xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col cursor-pointer transform hover:-translate-y-1 transition-all duration-300 active:scale-95 no-select group relative"
      onClick={() => onOpenModal(cookie)}
    >
      {/* INDICADOR DE PACK DINÁMICO */}
      {isPack && (
        <div className="absolute top-3 left-3 z-10 bg-[#1e3b44]/90 backdrop-blur-md text-flavis-gold border border-flavis-gold/30 text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          Pack x{cookiesInPack}
        </div>
      )}

      <div className="h-40 overflow-hidden img-protect">
        <img 
          src={cookie.imagenUrl || ""} 
          alt={cookie.nombre} 
          className="w-full h-full object-cover bg-[#264b58] group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { 
            e.target.src = "https://placehold.co/400x300/264b58/white?text=Flavis+Cookies"; 
            e.target.className = "w-full h-full object-cover bg-[#264b58]";
          }} 
        />
      </div>

      <div className="p-4">
        <h3 className="text-flavis-gold font-main text-lg mb-2 leading-tight uppercase tracking-tight truncate">
          {cookie.nombre}
        </h3>
        
        <div className="flex justify-between items-center font-secondary">
          <span className="text-white font-bold text-base italic">
            S/ {cookie.precio.toFixed(2)}
          </span>
          
          {/* CONTROLES DE CANTIDAD */}
          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onUpdate(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-flavis-gold hover:bg-flavis-gold hover:text-[#326371] transition-all disabled:opacity-20"
              disabled={quantity === 0}
            > 
              <Icons.Minus /> 
            </button>
            
            <span className="text-white font-bold text-xs min-w-[12px] text-center">
              {quantity}
            </span>
            
            <button 
              onClick={() => onUpdate(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-flavis-gold hover:bg-flavis-gold hover:text-[#326371] transition-all"
            > 
              <Icons.Plus /> 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieCard;