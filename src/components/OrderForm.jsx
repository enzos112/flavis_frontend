import React, { useState, useEffect, useRef } from 'react';

// --- MODAL 1: INFORMACIÓN DE ENTREGA (ACTUALIZADO LOGÍSTICA 2026) ---
const InfoModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-flavis-blue/95 backdrop-blur-md animate-in">
      <div className="bg-[#eef1e6] w-full max-w-md max-h-[calc(100vh-40px)] overflow-hidden rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl relative border border-white/20 flex flex-col">
        
        {/* Título */}
        <div className="p-5 sm:p-10 pb-2 sm:pb-4 flex-shrink-0">
          <h3 className="text-lg sm:text-3xl font-main text-flavis-blue italic border-b border-flavis-blue/10 pb-3 tracking-tighter text-with-symbols">
            Términos de Entrega 👇
          </h3>
        </div>
        
        {/* Contenido con Scroll */}
        <div className="px-5 sm:px-10 overflow-y-auto space-y-4 sm:space-y-6 font-secondary text-flavis-blue leading-relaxed text-xs sm:text-base custom-scrollbar">
          
          {/* SECCIÓN DELIVERY */}
          <div>
            <p className="font-bold mb-2 text-sm sm:text-lg italic flex items-center gap-2">🛵 Delivery (Lima):</p>
            <div className="space-y-2 opacity-95">
              <p>• Servicio gestionado por <span className="font-bold">Flavis</span> con un costo fijo de <span className="font-bold text-flavis-gold">S/ 15.00</span>.</p>
              <p>• Las entregas se realizan exclusivamente de <span className="font-bold">11:00 am a 1:00 pm</span> en la fecha indicada.</p>
              <p>• Es indispensable estar atento al celular; el repartidor se comunicará al llegar a la dirección.</p>
            </div>
          </div>

          {/* SECCIÓN RECOJO */}
          <div className="pt-2 border-t border-flavis-blue/5">
            <p className="font-bold mb-2 text-sm sm:text-lg italic text-with-symbols">🏠 Recojo en Local:</p>
            <div className="space-y-2 opacity-95">
              <p>• Ubicación: <span className="font-bold">Santiago de Surco</span> (Ref: Parque Casuarinas).</p>
              <p>• Al llegar, debe acercarse a recepción y brindar el <span className="font-bold uppercase">Nombre Registrado</span> en este formulario.</p>
            </div>

            <div className="mt-4 bg-flavis-gold/15 p-3 sm:p-4 rounded-xl border border-flavis-gold/30">
              <p className="text-[11px] sm:text-[13px] leading-snug font-bold">
                (La dirección exacta se compartirá por WhatsApp únicamente tras validar el comprobante de pago)
              </p>
            </div>
          </div>

          {/* NOTAS FINALES */}
          <div className="pt-2 border-t border-flavis-blue/5 opacity-70">
            <p className="text-[10px] sm:text-xs italic">• Los pedidos se procesan solo con el pago confirmado.</p>
            <p className="text-[10px] sm:text-xs italic">• No se aceptan cancelaciones con menos de 48 horas de anticipación.</p>
          </div>
        </div>

        {/* Botones */}
        <div className="p-5 sm:p-10 pt-4 sm:pt-6 flex flex-col gap-2 flex-shrink-0">
            <button onClick={onAccept} className="w-full bg-flavis-blue text-white py-3 sm:py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg hover:bg-flavis-gold transition-all font-sans">He leído y acepto</button>
            <button onClick={onClose} className="w-full py-1 text-flavis-blue/40 text-[9px] font-bold uppercase tracking-widest font-sans">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL 2: DINÁMICA DE PEDIDOS ---
const ClosedInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-flavis-blue/90 backdrop-blur-sm animate-in">
      <div className="bg-[#eef1e6] w-[95%] sm:w-full max-w-md max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl relative border border-white/20 flex flex-col">
        
        <h3 className="text-xl sm:text-3xl font-main text-flavis-blue italic mb-4 sm:mb-6 border-b border-flavis-blue/10 pb-4 tracking-tighter text-with-symbols flex-shrink-0">
          Nuestra Dinámica 🍪
        </h3>
        
        <div className="space-y-4 sm:space-y-6 font-secondary text-flavis-blue text-sm sm:text-base leading-relaxed overflow-y-auto pr-2 custom-scrollbar flex-grow">
          <div>
            <p className="font-bold mb-2 text-base italic text-with-symbols">✨ Pre-Ventas Semanales</p>
            <p className="opacity-90">Horneamos lotes exclusivos por temporada. Cada semana abrimos el formulario por tiempo limitado o hasta agotar el stock disponible.</p>
          </div>

          <div>
            <p className="font-bold mb-2 text-base italic text-with-symbols">📍 Entrega y Recojo</p>
            <div className="space-y-2 opacity-90 text-with-symbols">
              <p>• <span className="font-bold">Delivery:</span> Servicio gestionado por Flavis (<span className="font-bold text-flavis-gold">S/ 15.00</span>) en el rango de <span className="font-bold">11:00 am a 1:00 pm</span>.</p>
              <p>• <span className="font-bold">Recojo:</span> En Santiago de Surco (Ref. Parque Casuarinas). Solo debes brindar tu nombre en recepción.</p>
            </div>
          </div>

          <div className="bg-flavis-gold/15 p-4 sm:p-5 rounded-2xl border border-flavis-gold/30">
            <p className="font-bold text-[10px] sm:text-[11px] uppercase tracking-widest mb-2 font-sans text-flavis-blue/70">Aviso de Seguridad:</p>
            <p className="text-xs sm:text-[13px] leading-normal font-secondary text-flavis-blue font-medium">
              Por seguridad, la dirección exacta de recojo y los datos de contacto se comparten por WhatsApp únicamente tras la validación de tu pedido y pago.
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex-shrink-0">
            <button onClick={onClose} className="w-full bg-flavis-blue text-white py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all font-sans">Entendido</button>
        </div>
      </div>
    </div>
  );
};

const WholesaleModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleWholesaleClick = () => {
    const phone = "51933304850";
    const msg = encodeURIComponent("¡Hola! Quisiera realizar un pedido mayorista de galletas ") + "%F0%9F%8D%AA";
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-flavis-blue/95 backdrop-blur-md animate-in">
      <div className="bg-[#eef1e6] w-[95%] sm:w-full max-w-sm rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-center shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="text-4xl sm:text-5xl mb-4 text-with-symbols flex-shrink-0">🍪✨</div>
        <h3 className="text-xl sm:text-2xl font-main text-flavis-blue italic mb-4 tracking-tighter text-with-symbols flex-shrink-0">¡Pedido Especial!</h3>
        <p className="font-secondary text-flavis-blue text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 text-with-symbols flex-grow">
          Para pedidos mayores a <span className="font-bold text-with-symbols">20 unidades</span>, nos gusta coordinar directamente para asegurar que tus galletas lleguen frescas y perfectas.
        </p>
        <div className="flex flex-col gap-3 flex-shrink-0">
          <button 
            onClick={handleWholesaleClick}
            className="w-full bg-[#25D366] text-white py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 font-sans"
          >
            Contactar por WhatsApp
          </button>
          <button onClick={onClose} className="w-full py-2 text-flavis-blue/40 text-[9px] font-bold uppercase tracking-widest font-sans">Regresar al formulario</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL 4: DETALLE (Actualizado para mostrar sabores de packs) ---
const CookieDetailModal = ({ cookie, isOpen, onClose }) => {
  if (!isOpen || !cookie) return null;
  // Detectamos si es un pack si tiene el array de galletas
  const esPack = cookie.galletas && cookie.galletas.length > 0;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-flavis-blue/95 backdrop-blur-md animate-in" onClick={onClose}>
      <div className="bg-[#eef1e6] w-[95%] sm:w-full max-w-sm rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/20 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 bg-white/80 text-flavis-blue w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg font-bold hover:scale-110 transition-all">✕</button>
        
        <div className="h-48 sm:h-64 w-full img-protect flex-shrink-0 relative">
          <img src={cookie.imagenUrl} alt={cookie.nombre} className="w-full h-full object-cover" />
          {esPack && (
            <div className="absolute bottom-4 left-4 bg-flavis-gold text-flavis-blue text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Contenido Especial
            </div>
          )}
        </div>
        
        <div className="p-6 sm:p-10 flex-grow overflow-y-auto custom-scrollbar">
          <h3 className="text-2xl sm:text-3xl font-main text-flavis-blue italic mb-2 tracking-tighter">{cookie.nombre}</h3>
          <p className="text-flavis-gold font-bold text-lg sm:text-xl mb-4 sm:mb-6 italic font-secondary">S/ {cookie.precio.toFixed(2)}</p>
          
          {/* SECCIÓN DE SABORES (SOLO SI ES PACK) */}
          {esPack && (
            <div className="mb-6 p-4 bg-flavis-gold/10 rounded-2xl border border-flavis-gold/20">
              <p className="text-[9px] uppercase font-black text-flavis-gold tracking-widest mb-3 text-center">Incluye los sabores:</p>
              <div className="grid grid-cols-2 gap-2">
                {cookie.galletas.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/50 p-2 rounded-xl text-[10px] font-bold text-flavis-blue border border-white">
                    🍪 {g.nombre}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[9px] sm:text-[10px] uppercase font-black text-flavis-blue/30 tracking-[0.2em] font-sans">Descripción</p>
            <p className="font-secondary text-flavis-blue/80 text-sm sm:text-base leading-relaxed">
              {cookie.descripcion || "Una creación artesanal horneada para alegrar tu semana. ✨"}
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-10 pt-0 flex-shrink-0">
            <button onClick={onClose} className="w-full bg-flavis-blue text-white py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-flavis-gold transition-all font-sans">Cerrar Detalle</button>
        </div>
      </div>
    </div>
  );
};  

const SuccessModal = ({ isOpen, onClose, customerName, tipoEntrega }) => {
  if (!isOpen) return null;
  const firstName = customerName ? customerName.trim().split(' ')[0] : 'Cookie Lover';

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-flavis-blue/95 backdrop-blur-md animate-in">
      <div className="bg-[#eef1e6] w-[95%] sm:w-full max-w-sm rounded-[2rem] p-8 sm:p-12 text-center shadow-2xl relative border border-white/10 flex flex-col">
        <div className="text-4xl mb-6 flex-shrink-0">🍪</div>
        <h2 className="text-2xl sm:text-3xl font-main text-flavis-blue italic mb-4 tracking-tighter">
          ¡Gracias, {firstName}!
        </h2>
        <div className="space-y-4 text-sm sm:text-base font-secondary text-flavis-blue/70 leading-relaxed mb-8 flex-grow">
          <p>Tu pedido ha sido registrado con éxito.</p>
          
          <div className="bg-flavis-gold/10 p-4 rounded-2xl border border-flavis-gold/20 text-flavis-blue font-medium italic">
            {tipoEntrega === 'DELIVERY' 
              ? "🛵 ¡Todo listo! Muy pronto estaremos llevando tus galletas a tu dirección en el horario indicado (11:00 am - 1:00 pm). ¡Mantente atenta al celular!"
              : "🏠 ¡Genial! Te esperamos en nuestro local de Surco (Santiago de Surco - Gardenias) en el horario de 11:00 am a 1:00 pm. Solo brinda tu nombre en recepción."
            }
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-flavis-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all font-sans">
          ¡GENIAL!
        </button>
      </div>
    </div>
  );
};

const WarningModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-flavis-blue/90 backdrop-blur-sm animate-in">
      <div className="bg-[#eef1e6] w-full max-w-xs sm:max-w-sm rounded-[2rem] p-6 sm:p-10 text-center shadow-2xl border-t-8 border-red-500 max-h-[80vh] overflow-y-auto flex flex-col">
        <div className="text-3xl sm:text-4xl mb-3 flex-shrink-0">⚠️</div>
        <h3 className="text-lg sm:text-2xl font-main text-flavis-blue italic mb-3 tracking-tighter">
          ¡Casi listo!
        </h3>
        <p className="font-secondary text-flavis-blue text-xs sm:text-base leading-relaxed mb-6 flex-grow">
          Para procesar tu pedido, necesitamos que todos los campos marcados con <span className="text-red-500 font-bold">*</span> estén completos.
          <br /><br />
          <span className="text-[10px] opacity-70 italic">
            (Revisa los campos resaltados en rojo arriba)
          </span>
        </p>
        <button 
          onClick={onClose} 
          className="w-full bg-flavis-blue text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg hover:bg-flavis-gold transition-all font-sans"
        >
          Revisar Formulario
        </button>
      </div>
    </div>
  );
};

const CLOSED_MESSAGE = (
  <>
    ¡Nuestros hornos están tomando un breve descanso! 🍪<br />
    <span className="text-sm font-normal block mt-2 opacity-80 font-secondary text-with-symbols">
      Estamos preparando la próxima producción para sorprenderte. Vuelve pronto para no quedarte sin tus favoritas. ✨
    </span>
  </>
);

const OrderForm = ({ 
  formData, setFormData, onFileUpload, onPhoneBlur, isExistingCustomer, 
  qrUrl, previewUrl, onRemoveFile, loading, isSearching, preVenta, 
  cart, total, cookies, packs, handleOrder, formErrors, 
  isShaking, setIsShaking,
  successOrder, setSuccessOrder, successName, successDeliveryType,
  selectedCookie, setSelectedCookie, setFormErrors, isDetailModalOpen, setIsDetailModalOpen,
  isClosed, setShowWarningModal, showWarningModal
}) => {
  // --- 1. ESTADOS LOCALES (Solo lo que no pertenece a App.jsx) ---
  const [copiedId, setCopiedId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [showWholesaleModal, setShowWholesaleModal] = useState(false);
  const [direccionesGuardadas, setDireccionesGuardadas] = useState([]);
  const [mostrarNuevaDireccion, setMostrarNuevaDireccion] = useState(true);
  
  // Estados específicos del buscador
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // --- 2. LÓGICA DE DISTRITOS ---
  const distritosLima = [
    "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", 
    "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", 
    "La Molina", "La Victoria", "Lima", "Lince", "Los Olivos", "Lurigancho", 
    "Lurín", "Magdalena del Mar", "Miraflores", "Pachacamac", "Pucusana", 
    "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rimac", 
    "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", 
    "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", 
    "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", 
    "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
  ].sort(); 

  const filteredDistritos = searchTerm === "" 
    ? distritosLima.slice(0, 3) 
    : distritosLima.filter(d => 
        d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
         .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      ).slice(0, 3);

  // --- 3. EFECTOS (Separados y al nivel superior) ---

  // Efecto 1: Cargar direcciones guardadas
  useEffect(() => {
    if (formData.celular && formData.celular.length === 9) {
      const stored = localStorage.getItem(`direcciones_${formData.celular}`);
      if (stored) {
        setDireccionesGuardadas(JSON.parse(stored));
        setMostrarNuevaDireccion(false);
      }
    }
  }, [formData.celular]);

  // Efecto 2: Cerrar buscador al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Efecto 3: Limpiar buscador cuando el pedido es exitoso (App.jsx resetea el distrito)
  useEffect(() => {
    if (!formData.direccion?.distrito) {
      setSearchTerm(""); 
    }
  }, [formData.direccion?.distrito]);

  // --- 4. FUNCIONES DE MANEJO ---

  const selectDireccionGuardada = (dir) => {
    setFormData({ ...formData, direccion: dir });
    setMostrarNuevaDireccion(false);
  };

  const validateAndOrder = () => {
  const errors = {}; 
  
  if (!formData.nombres?.trim()) errors.nombres = true;
  if (!formData.apellidos?.trim()) errors.apellidos = true;
  if (!formData.celular || formData.celular.length < 9) errors.celular = true;
  if (!formData.comprobanteUrl) errors.comprobanteUrl = true;
  if (!formData.aceptoCondiciones) errors.aceptoCondiciones = true;

  if (formData.tipoEntrega === 'DELIVERY') {
    const distritoValido = distritosLima.includes(formData.direccion.distrito);
    if (!formData.direccion.distrito || !distritoValido || !formData.direccion.detalle?.trim()) {
      errors.direccion = true; 
    }
  }
  
  const totalQuantity = Object.values(cart).reduce((a, b) => a + b, 0);
  if (totalQuantity === 0) errors.total = true;

  setFormErrors(errors); 

  if (Object.keys(errors).length > 0) {
    if (setIsShaking) { 
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    setShowWarningModal(true); 
    return;
  }

  if (totalQuantity > 20) {
    setShowWholesaleModal(true);
    return;
  }

  // El bloque de direcciones queda comentado para que no rompa nada
  /* if (formData.guardarDatos && formData.tipoEntrega === 'DELIVERY') {
    // Implementación futura
  }
  */

  handleOrder({
    tipoEntrega: formData.tipoEntrega,
    costoEnvio: formData.tipoEntrega === 'DELIVERY' ? 15.0 : 0.0,
    direccion: formData.tipoEntrega === 'DELIVERY' ? formData.direccion : null
  });
};

  const handleCheckboxClick = () => {
    if (!formData.aceptoCondiciones) {
      setShowInfoModal(true);
    } else {
      setFormData({ ...formData, aceptoCondiciones: false });
    }
  };

  const handleAcceptFromModal = () => {
    setFormData({ ...formData, aceptoCondiciones: true });
    setShowInfoModal(false);
  };

  const handleInputChange = (field, value) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (regex.test(value) && value.length <= 60) {
      const formattedValue = value.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
      setFormData({ ...formData, [field]: formattedValue });
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 9) {
      setFormData({ ...formData, celular: value });
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text.replace(/\s|-/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsAppClick = (tipo) => {
    const phone = "51933304850";
    const emojiCode = "%F0%9F%8D%AA"; 
    const baseMsg = tipo === 'cerrado' 
      ? "¡Hola! Tengo una duda sobre la próxima preventa de Flavis"
      : "¡Hola! Tengo una duda sobre los pedidos de Flavis";

    const fullTextEncoded = encodeURIComponent(baseMsg) + " " + emojiCode;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${fullTextEncoded}`;
    window.open(url, '_blank');
  };

  const CopyButton = ({ text, id }) => (
    <button onClick={() => copyToClipboard(text, id)} className="p-1.5 bg-[#326371]/5 hover:bg-[#326371]/15 rounded-md transition-all flex items-center gap-1 active:scale-90 font-sans">
      {copiedId === id ? (
        <span className="text-[10px] font-bold text-green-600 animate-pulse font-sans">¡Copiado!</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#326371] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="mt-20 max-w-full overflow-hidden no-select">
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} onAccept={handleAcceptFromModal} />
      <ClosedInfoModal isOpen={showClosedModal} onClose={() => setShowClosedModal(false)} />
      <WholesaleModal isOpen={showWholesaleModal} onClose={() => setShowWholesaleModal(false)} />
      <WarningModal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} />
      <CookieDetailModal cookie={selectedCookie} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />  
      <SuccessModal isOpen={successOrder} onClose={() => setSuccessOrder(false)} customerName={successName} tipoEntrega={successDeliveryType}/>

      {isClosed ? (
        <div className="p-6 sm:p-10 md:p-16 bg-[#eef1e6]/10 border-2 border-dashed border-flavis-gold/30 rounded-[2.5rem] sm:rounded-[3rem] text-center animate-in font-secondary mx-auto w-full max-w-4xl">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 opacity-40 font-sans text-with-symbols">🍪</div>
          
          <h2 className="text-2xl xs:text-3xl sm:text-4xl text-flavis-gold font-main font-bold italic mb-4 tracking-tight text-with-symbols break-words leading-tight">
            Próximamente nueva Pre-Venta
          </h2>
          
          <div className="text-white/90 max-w-lg mx-auto leading-relaxed mb-8 text-sm sm:text-base">
            {CLOSED_MESSAGE}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 px-4 w-full max-w-md mx-auto">
            <button 
              onClick={() => setShowClosedModal(true)} 
              className="w-full sm:w-auto bg-flavis-gold text-flavis-blue px-4 sm:px-8 py-4 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl font-sans leading-tight"
            >
              ¿Cómo funcionan nuestros pedidos?
            </button>
            
            {/* BOTÓN WHATSAPP DE DUDAS (ESTADO CERRADO) */}
            <button 
              onClick={() => handleWhatsAppClick('cerrado')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:scale-105 active:scale-95 text-white px-8 py-4 sm:py-3 rounded-full transition-all shadow-xl font-sans font-black uppercase text-[9px] sm:text-[10px] tracking-widest leading-tight"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="whitespace-normal">Escríbenos por dudas</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start font-secondary">
          
          {/* --- CONTENEDOR 1: IZQUIERDA --- */}
          <div className="contents lg:flex lg:flex-col lg:gap-10">
            
            {/* Slot 1: Datos Personales */}
            <div className="space-y-8 order-1">
              <h2 className="text-4xl text-flavis-gold font-main font-bold tracking-tight italic">Completa tu pedido</h2>
              <div className="space-y-6">
                
                <div className="relative">
                  <label className="block text-white mb-2 font-bold tracking-tight">Número de Celular *</label>
                  <div className="relative font-sans text-with-symbols">
                    <input 
                      type="tel" 
                      className={`w-full bg-[#366a7d] border p-4 rounded-xl text-white focus:border-flavis-gold outline-none transition-all font-bold pr-12 font-sans ${formErrors.celular ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      value={formData?.celular || ''} 
                      onChange={handlePhoneChange} 
                      onBlur={onPhoneBlur} 
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-flavis-gold border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-bold tracking-tight">Nombres *</label>
                    <input 
                      type="text" 
                      className={`w-full bg-[#366a7d] border p-4 rounded-xl text-white outline-none transition-all ${isExistingCustomer ? 'opacity-60 cursor-not-allowed' : 'focus:border-flavis-gold'} ${formErrors.nombres ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      value={formData?.nombres || ''} 
                      onChange={(e) => handleInputChange('nombres', e.target.value)} 
                      disabled={isExistingCustomer}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-bold tracking-tight">Apellidos *</label>
                    <input 
                      type="text" 
                      className={`w-full bg-[#366a7d] border p-4 rounded-xl text-white outline-none transition-all ${isExistingCustomer ? 'opacity-60 cursor-not-allowed' : 'focus:border-flavis-gold'} ${formErrors.apellidos ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      value={formData?.apellidos || ''} 
                      onChange={(e) => handleInputChange('apellidos', e.target.value)} 
                      disabled={isExistingCustomer}
                    />
                  </div>
                </div>

                {/* --- MODALIDAD DE ENTREGA --- */}
                <div className="pt-4 border-t border-white/10">
                  <label className="block text-flavis-gold mb-4 font-black uppercase text-[10px] tracking-widest font-sans">
                    ¿Cómo prefieres recibirlo? *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, tipoEntrega: 'RECOJO' })}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 
                        ${formData.tipoEntrega === 'RECOJO' ? 'border-flavis-gold bg-flavis-gold/10 text-white' : 'border-white/10 text-white/40'}`}
                    >
                      <span className="text-2xl">🏠</span>
                      <span className="font-bold text-xs uppercase tracking-tighter">Recojo</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, tipoEntrega: 'DELIVERY' })}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 
                        ${formData.tipoEntrega === 'DELIVERY' 
                          ? (formErrors.direccion ? 'border-red-500 bg-red-500/10 text-white' : 'border-flavis-gold bg-flavis-gold/10 text-white') 
                          : 'border-white/10 text-white/40'}`}
                    >
                      <span className="text-2xl">🛵</span>
                      <span className="font-bold text-xs uppercase tracking-tighter">Delivery (S/15)</span>
                    </button>
                  </div>
                </div>

                {/* --- BUSCADOR DE DISTRITOS CON AUTO-CIERRE --- */}
                {formData.tipoEntrega === 'DELIVERY' && (
                  <div className="space-y-4 p-5 sm:p-6 bg-white/5 rounded-[2rem] border border-white/10 animate-in">
                    <div className="relative" ref={dropdownRef}>
                      <label className="block text-white mb-2 text-sm font-bold tracking-tight">Distrito de Lima *</label>
                      
                      <div className="relative group">
                        <input 
                          type="text"
                          placeholder="Escribe tu distrito..."
                          className={`w-full bg-[#366a7d] border p-4 rounded-xl text-white outline-none focus:border-flavis-gold transition-all pr-12 shadow-inner font-secondary text-sm 
                            ${formErrors.direccion && !formData.direccion.distrito ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}
                          value={searchTerm || formData.direccion.distrito}
                          onFocus={() => setShowDropdown(true)}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""); 
                            setSearchTerm(val);
                            setFormData({ ...formData, direccion: { ...formData.direccion, distrito: "" } }); 
                            setShowDropdown(true);
                          }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-flavis-gold transition-colors text-sm">🔍</span>
                      </div>

                      {showDropdown && (
                        <div className="absolute z-[110] left-0 right-0 mt-2 bg-[#1e3b44]/98 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in">
                          <ul className="font-secondary">
                            {filteredDistritos.map((d, idx) => (
                              <li 
                                key={idx}
                                className="px-5 py-4 text-xs sm:text-sm text-white/90 hover:bg-flavis-gold hover:text-flavis-blue cursor-pointer transition-colors font-medium flex justify-between items-center border-b border-white/5 last:border-0"
                                onClick={() => {
                                  setFormData({ ...formData, direccion: { ...formData.direccion, distrito: d } });
                                  setSearchTerm(d);
                                  setShowDropdown(false);
                                }}
                              >
                                <span className="tracking-tight">{d}</span>
                                {formData.direccion.distrito === d && <span className="text-flavis-gold text-[10px]">●</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {formErrors.direccion && !formData.direccion.distrito && (
                        <p className="text-red-400 text-[10px] mt-2 ml-2 font-bold uppercase italic animate-pulse">Debes seleccionar un distrito</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 font-secondary">
                      <div>
                        <label className="block text-white mb-2 text-sm font-bold tracking-tight">Dirección Exacta *</label>
                        <input 
                          type="text"
                          placeholder="Ej: Av. Benavides 123, Dpto 401"
                          className={`w-full bg-[#366a7d] border p-4 rounded-xl text-white outline-none focus:border-flavis-gold text-sm transition-all 
                            ${formErrors.direccion && !formData.direccion.detalle ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}
                          value={formData.direccion.detalle}
                          onChange={(e) => setFormData({ ...formData, direccion: { ...formData.direccion, detalle: e.target.value } })}
                        />
                        {formErrors.direccion && !formData.direccion.detalle && (
                          <p className="text-red-400 text-[10px] mt-2 ml-2 font-bold uppercase italic animate-pulse">La dirección es obligatoria</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-white mb-2 text-sm font-bold tracking-tight">Referencia</label>
                        <input 
                          type="text"
                          placeholder="Ej: Frente al centro comercial..."
                          className="w-full bg-[#366a7d] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-flavis-gold text-sm"
                          value={formData.direccion.referencia}
                          onChange={(e) => setFormData({ ...formData, direccion: { ...formData.direccion, referencia: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {formData.tipoEntrega === 'RECOJO' && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <p className="text-xs text-white/60 italic leading-relaxed">
                      📍 Recogerás tu pedido en <span className="text-white font-bold">Santiago de Surco (Ref. Parque Casuarinas)</span>. 
                      Te enviaremos la ubicación exacta por WhatsApp una vez validado tu pago.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="saveData" 
                    className="w-4 h-4 accent-flavis-gold cursor-pointer" 
                    checked={formData?.guardarDatos || false} 
                    disabled={isExistingCustomer} 
                    onChange={(e) => setFormData({ ...formData, guardarDatos: e.target.checked })} 
                  />
                  <label htmlFor="saveData" className="text-white/80 text-xs sm:text-sm cursor-pointer italic">
                    Guardar mis datos para la siguiente compra.
                  </label>
                </div>
              </div>
            </div>

            {/* Slot 4: Resumen Selección */}
            <div className={`bg-white/5 border p-8 rounded-[2.5rem] animate-in flex flex-col gap-6 order-4 lg:order-2 transition-all ${formErrors.total ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}>
              <p className="text-[10px] uppercase font-black text-flavis-gold tracking-[0.3em] font-sans">Tu Selección</p>
              
              <div className="space-y-3 font-secondary text-white">
                {/* 1. Render de Packs Especiales (Prioridad visual) */}
                {(packs || []).filter(p => cart[`p_${p.id}`] > 0).map(pack => (
                  <div key={`res_p_${pack.id}`} className="flex justify-between items-center border-b border-white/10 pb-3 bg-flavis-gold/5 p-2 rounded-2xl animate-in">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-flavis-gold uppercase tracking-tighter">Pack Especial x4</span>
                      <span className="text-sm font-bold"> <span className="text-white">{cart[`p_${pack.id}`]}x</span> {pack.nombre}</span>
                    </div>
                    <span className="text-xs font-sans font-bold">S/ {(pack.precio * cart[`p_${pack.id}`]).toFixed(2)}</span>
                  </div>
                ))}

                {/* 2. Render de Galletas Individuales */}
                {(cookies || []).filter(c => cart[`c_${c.id}`] > 0).map(cookie => (
                  <div key={`res_c_${cookie.id}`} className="flex justify-between items-center border-b border-white/5 pb-2 px-1">
                    <span className="text-sm font-bold"><span className="text-flavis-gold font-sans">{cart[`c_${cookie.id}`]}x</span> {cookie.nombre}</span>
                    <span className="text-xs opacity-60 font-sans">S/ {(cookie.precio * cart[`c_${cookie.id}`]).toFixed(2)}</span>
                  </div>
                ))}

                {/* 3. Costo de Envío */}
                {formData.tipoEntrega === 'DELIVERY' && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 text-flavis-gold px-1 italic font-bold">
                    <span className="text-sm">🛵 Servicio de Delivery</span>
                    <span className="text-xs font-sans">S/ 15.00</span>
                  </div>
                )}

                {/* 4. Estado vacío */}
                {(!cart || Object.values(cart).every(v => v === 0)) && (
                  <p className="text-xs italic text-white/30 py-4 text-center uppercase tracking-widest">Aún no has elegido galletas...</p>
                )}
              </div>

              <div className="pt-2">
                <div className="text-3xl sm:text-4xl font-bold text-flavis-gold mb-6 italic text-right tracking-tighter text-with-symbols font-secondary">
                  Total: S/ {(total + (formData.tipoEntrega === 'DELIVERY' ? 15 : 0)).toFixed(2)}
                </div>
                
                <button 
                  onClick={validateAndOrder} 
                  disabled={loading} 
                  className={`w-full py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all font-main uppercase 
                    ${formData?.aceptoCondiciones && total > 0 ? 'bg-flavis-gold text-flavis-blue hover:scale-[1.02] active:scale-95' : 'bg-white/10 text-white/20 cursor-not-allowed'} 
                    ${isShaking ? 'animate-shake' : ''} 
                    ${loading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>

            {/* Slot 3: Información Importante (AJUSTADO Y ESTILIZADO) */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] animate-in flex flex-col gap-8 order-3 lg:order-3">
              <p className="text-[10px] uppercase font-black text-flavis-gold tracking-[0.3em] font-sans">
                Información Importante
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-white">
                {/* COLUMNA 1: CRONOGRAMA */}
                <div className="space-y-6">
                  <p className="font-main font-bold text-flavis-gold italic text-lg tracking-tight">Cronograma</p>
                  
                  <div className="space-y-5">
                    {/* CIERRE */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black opacity-40 tracking-widest font-sans">Cierre de pedidos</span>
                      <span className="font-secondary text-[15px] font-bold leading-tight">
                        {preVenta?.fechaCierre 
                          ? new Date(preVenta.fechaCierre).toLocaleString('es-PE', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) 
                          : '--'}
                      </span>
                    </div>

                    {/* ENTREGA */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black opacity-40 tracking-widest font-sans">Fecha de entrega</span>
                      <span className="font-secondary text-[15px] font-bold text-flavis-gold leading-tight">
                        {preVenta?.fechaEntrega 
                          ? new Date(preVenta.fechaEntrega + "T00:00:00").toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: '2-digit' }) 
                          : '--'}
                      </span>
                      <span className="text-[12px] opacity-70 italic font-secondary leading-none">
                        ({preVenta?.horarioEntrega || 'Horario por confirmar'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* COLUMNA 2: UBICACIÓN */}
                <div className="space-y-6 border-t sm:border-t-0 sm:border-l border-white/10 pt-6 sm:pt-0 sm:pl-8">
                  <p className="font-main font-bold text-flavis-gold italic text-lg tracking-tight">Ubicación</p>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black opacity-40 tracking-widest font-sans">Distrito</span>
                      <span className="font-secondary text-[15px] font-bold leading-tight">Santiago de Surco</span>
                      <span className="text-[12px] opacity-70 italic font-secondary">Ref. Parque Casuarinas</span>
                    </div>

                    <p className="text-[11px] leading-relaxed opacity-40 italic font-secondary pt-2">
                      * La ubicación exacta se compartirá por WhatsApp tras validar el pago.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- CONTENEDOR 2: DERECHA --- */}
          <div className="contents lg:flex lg:flex-col lg:gap-8">
            
            {/* Slot 2: Detalles de Pago */}
            <div className="bg-[#eef1e6] p-6 sm:p-8 rounded-[2.5rem] text-flavis-blue shadow-lg flex flex-col gap-8 border border-white/40 order-2 lg:order-1 no-select">
              <h3 className="text-2xl font-main font-bold italic tracking-tight">Detalles de Pago</h3>
              <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-stretch border-b border-[#326371]/10 pb-8 font-sans">
                <div className="w-full lg:w-5/12 flex-shrink-0 text-center lg:text-left">
                  <p className="font-bold text-[10px] mb-3 uppercase tracking-widest opacity-60 font-sans">Escanear QR</p>
                  <div className="w-full aspect-[2480/3508] bg-white rounded-2xl flex items-center justify-center border border-[#326371]/10 overflow-hidden shadow-sm img-protect">
                    {qrUrl && !qrUrl.includes('demo') ? <img src={qrUrl} alt="QR" className="w-full h-full object-contain p-2" /> : <span className="text-[10px] px-4 opacity-40 italic text-center">Cargando QR...</span>}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-3 flex-grow w-full lg:w-1/2">
                  <p className="font-bold text-[10px] mb-1 uppercase tracking-widest opacity-60">Transferencia Directa</p>
                  <div className="space-y-2 text-with-symbols font-sans">
                    <div className="bg-white/60 p-2 rounded-2xl border border-[#326371]/5 flex items-center justify-between">
                      <div><p className="text-[9px] uppercase font-black opacity-40 font-sans">Yape o Plin</p><p className="text-sm font-bold tracking-widest">933304850</p></div>
                      <CopyButton text="933304850" id="yape" />
                    </div>
                    <div className="bg-white/60 p-2 rounded-2xl border border-[#326371]/5 flex items-center justify-between">
                      <div><p className="text-[9px] uppercase font-black opacity-40 font-sans">BCP Soles</p><p className="text-sm font-bold tracking-widest">19310369862006</p></div>
                      <CopyButton text="19310369862006" id="bcp" />
                    </div>
                    <div className="bg-white/60 p-2 rounded-2xl border border-[#326371]/5 flex items-center justify-between">
                      <div><p className="text-[9px] uppercase font-black opacity-40 font-sans">Código CCI</p><p className="text-sm font-bold tracking-widest">00219311036986200610</p></div>
                      <CopyButton text="00219311036986200610" id="cci" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="block font-bold italic text-sm text-with-symbols font-secondary">Adjuntar Comprobante (Máx. 1 MB) *</p>
                {!previewUrl ? (
                  <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-[#326371]/5 transition-all group font-sans ${formErrors.comprobanteUrl ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-[#326371]/20'}`}>
                    <div className="flex items-center gap-3 font-sans">
                      <svg className={`w-5 h-5 ${formErrors.comprobanteUrl ? 'text-red-500' : 'text-[#326371]/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <p className={`text-xs font-bold uppercase ${formErrors.comprobanteUrl ? 'text-red-500' : 'text-[#326371]/60'}`}>Seleccionar Imagen</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={onFileUpload} />
                  </label>
                ) : (
                  <div className="flex items-center gap-4 animate-in">
                    <div className="relative w-20 h-20">
                      <img 
                        src={previewUrl} 
                        className="w-full h-full object-cover rounded-xl border border-[#326371] shadow-md img-protect" 
                        alt="Preview" 
                      />
                      <button 
                        onClick={onRemoveFile} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-lg font-sans z-50 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[10px] mt-3 font-black text-[#326371]/40 uppercase tracking-widest font-sans">Archivo Listo ✓</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 order-5 lg:order-2">
              <div className="flex items-start gap-3 px-4">
                <input 
                  type="checkbox" id="aceptoCondiciones" 
                  className={`w-5 h-5 mt-1 accent-flavis-gold cursor-pointer ${formErrors.aceptoCondiciones ? 'outline outline-2 outline-red-500 rounded' : ''}`} 
                  checked={formData?.aceptoCondiciones || false} onChange={handleCheckboxClick} />
                <label htmlFor="aceptoCondiciones" className="text-white text-xs sm:text-sm cursor-pointer leading-relaxed italic">
                  <span className="text-flavis-gold font-bold uppercase block text-[10px] mb-1 font-sans">Obligatorio</span>
                  He leído las condiciones sobre entrega, cronograma y recojo. *
                </label>
              </div>

              <div className="mt-2 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 font-sans no-select">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black text-flavis-gold uppercase tracking-[0.2em] mb-1 italic font-sans text-with-symbols">
                    Aviso Importante
                  </p>
                  <p className="text-[11px] text-white/60 font-bold leading-tight text-with-symbols">
                    Solo se procesarán pedidos con pago realizado.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 font-sans">
                  {/* BOTÓN INSTAGRAM (SÓLIDO) */}
                  <a 
                    href="https://www.instagram.com/flavis.pe" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:scale-105 active:scale-95 text-white px-5 py-2 rounded-full transition-all shadow-md group"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest font-sans">
                      ¡Siguenos!
                    </span>
                  </a>

                  {/* BOTÓN WHATSAPP DE DUDAS*/}
                  <button 
                    onClick={() => handleWhatsAppClick('footer')} 
                    className="flex items-center gap-2 bg-[#25D366] hover:scale-105 active:scale-95 text-white px-5 py-2 rounded-full transition-all shadow-md group font-sans"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">¿Dudas?</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default OrderForm;