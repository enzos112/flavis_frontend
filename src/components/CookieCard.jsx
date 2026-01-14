import React from 'react';

const CookieCard = ({ cookie, quantity, onUpdate, onOpenModal }) => {
  return (
    <div 
      className="bg-[#2d5a6a] rounded-2xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col cursor-pointer transform hover:-translate-y-1 transition-all duration-300 active:scale-95 no-select"
      onClick={() => onOpenModal(cookie)}
    >
      <div className="h-40 overflow-hidden img-protect">
        <img 
          src={cookie.imagenUrl || ""} 
          alt={cookie.nombre} 
          className="w-full h-full object-cover bg-[#264b58]"
          onError={(e) => { 
            e.target.src = ""; 
            e.target.className = "w-full h-full object-cover bg-[#264b58]";
          }} 
        />
      </div>
      <div className="p-4">
        <h3 className="text-flavis-gold font-main text-lg mb-2 leading-tight">
          {cookie.nombre}
        </h3>
        
        <div className="flex justify-between items-center font-secondary">
          <span className="text-white font-bold text-base italic text-with-symbols">
            S/ {cookie.precio.toFixed(2)}
          </span>
          
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onUpdate(-1)}
              className="w-7 h-7 rounded-full border border-flavis-gold/30 text-flavis-gold flex items-center justify-center hover:bg-flavis-gold hover:text-[#326371] transition-all font-sans"
            > − </button>
            <span className="text-white font-bold text-sm w-4 text-center text-with-symbols">{quantity}</span>
            <button 
              onClick={() => onUpdate(1)}
              className="w-7 h-7 rounded-full border border-flavis-gold/30 text-flavis-gold flex items-center justify-center hover:bg-flavis-gold hover:text-[#326371] transition-all font-sans"
            > + </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieCard;