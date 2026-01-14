import React, { useState } from 'react';

// --- MODAL 1: INFORMACIÓN DE ENTREGA (ACTIVO) ---
const InfoModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-flavis-blue/90 backdrop-blur-sm animate-in">
      <div className="bg-[#eef1e6] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/20">
        <h3 className="text-3xl font-main text-flavis-blue italic mb-6 border-b border-flavis-blue/10 pb-4 tracking-tighter text-with-symbols">¿Cómo es la entrega? 👇</h3>
        
        <div className="space-y-6 font-secondary text-flavis-blue leading-relaxed">
          <div>
            <p className="font-bold mb-3 text-lg italic flex items-center gap-2">📦 Delivery:</p>
            <div className="space-y-3 text-[15px] font-medium opacity-95">
              <p>• Envía un motorizado a la ubicación que enviaré por WhatsApp en la fecha y hora indicada.</p>
              <p>• Solo Lima. Asegúrate de que tu motorizado pueda llegar a Santiago de Surco.</p>
            </div>

            <div className="mt-4 bg-flavis-gold/15 p-4 rounded-2xl border border-flavis-gold/30">
              <p className="text-[13px] leading-snug font-secondary text-flavis-blue font-bold text-with-symbols">
                (Solo envío la ubicación exacta una vez completada la compra)
              </p>
              <p className="text-[11px] mt-1 font-sans font-black text-flavis-blue/50 uppercase tracking-wider">
                Ref: Parque Casuarinas, Santiago de Surco
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-flavis-blue/5">
            <p className="font-bold mb-2 text-lg italic flex items-center gap-2 text-with-symbols">🤍 Recojo:</p>
            <p className="text-[15px] font-medium opacity-95">
              Dirígete a la ubicación que te enviaré por WhatsApp y consulta por tu pedido con tu nombre.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3">
            <button onClick={onAccept} className="w-full bg-flavis-blue text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all font-sans">He leído y acepto</button>
            <button onClick={onClose} className="w-full py-2 text-flavis-blue/40 text-[9px] font-bold uppercase tracking-widest font-sans">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL 2: DINÁMICA DE PEDIDOS (CERRADO) ---
const ClosedInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-flavis-blue/90 backdrop-blur-sm animate-in">
      <div className="bg-[#eef1e6] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/20">
        <h3 className="text-3xl font-main text-flavis-blue italic mb-6 border-b border-flavis-blue/10 pb-4 tracking-tighter text-with-symbols">Nuestra Dinámica 🍪</h3>
        
        <div className="space-y-6 font-secondary text-flavis-blue text-sm leading-relaxed">
          <div>
            <p className="font-bold mb-2 text-base italic text-with-symbols">✨ Pre-Ventas Semanales</p>
            <p className="opacity-90">Horneamos lotes exclusivos por temporada. Cada semana abrimos el formulario por tiempo limitado o hasta agotar stock.</p>
          </div>

          <div>
            <p className="font-bold mb-2 text-base italic text-with-symbols">📍 Entrega y Recojo</p>
            <p className="opacity-90 text-with-symbols">Atendemos en Santiago de Surco (Ref. Parque Casuarinas). Puedes recoger tu pedido o enviar a tu motorizado favorito en el horario indicado al momento de tu compra.</p>
          </div>

          <div className="bg-flavis-gold/15 p-5 rounded-2xl border border-flavis-gold/30">
            <p className="font-bold text-[11px] uppercase tracking-widest mb-2 font-sans text-flavis-blue/70">Aviso de Seguridad:</p>
            <p className="text-[13px] leading-normal font-secondary text-flavis-blue font-medium">
              Por seguridad mutua, la ubicación exacta y detalles de contacto se comparten por WhatsApp únicamente tras confirmar la validación de tu pedido.
            </p>
          </div>
        </div>

        <div className="mt-8">
            <button onClick={onClose} className="w-full bg-flavis-blue text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all font-sans">Entendido</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL 3: COMPRAS MAYORISTAS (+20 GALLETAS) ---
const WholesaleModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const cookieEmoji = String.fromCodePoint(0x1F36A);
  const wholesaleText = encodeURIComponent(`Hola! Quisiera realizar un pedido mayorista de galletas ${cookieEmoji}`);
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-flavis-blue/95 backdrop-blur-md animate-in">
      <div className="bg-[#eef1e6] w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-white/20">
        <div className="text-5xl mb-4 text-with-symbols">🍪✨</div>
        <h3 className="text-2xl font-main text-flavis-blue italic mb-4 tracking-tighter text-with-symbols">¡Pedido Especial!</h3>
        <p className="font-secondary text-flavis-blue text-sm leading-relaxed mb-8 text-with-symbols">
          Para pedidos mayores a <span className="font-bold text-with-symbols">20 unidades</span>, nos gusta coordinar directamente para asegurar que tus galletas lleguen frescas y perfectas.
        </p>
        <div className="flex flex-col gap-3">
          <a 
            href={`https://wa.me/51933304850?text=${wholesaleText}`} 
            target="_blank" 
            rel="noreferrer"
            className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 font-sans"
          >
            Contactar por WhatsApp
          </a>
          <button onClick={onClose} className="w-full py-2 text-flavis-blue/40 text-[9px] font-bold uppercase tracking-widest font-sans">Regresar al formulario</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL 4: DETALLE DE GALLETA (RECUPERADO) ---
const CookieDetailModal = ({ cookie, isOpen, onClose }) => {
  if (!isOpen || !cookie) return null;
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-flavis-blue/95 backdrop-blur-md animate-in" onClick={onClose}>
      <div className="bg-[#eef1e6] w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/20" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 bg-white/80 text-flavis-blue w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-sans font-bold hover:scale-110 transition-all">✕</button>
        
        <div className="h-64 w-full img-protect">
          <img src={cookie.imagenUrl} alt={cookie.nombre} className="w-full h-full object-cover" />
        </div>
        
        <div className="p-10">
          <h3 className="text-3xl font-main text-flavis-blue italic mb-2 tracking-tighter">{cookie.nombre}</h3>
          <p className="text-flavis-gold font-bold text-xl mb-6 italic text-with-symbols font-secondary">S/ {cookie.precio.toFixed(2)}</p>
          
          <div className="space-y-4">
            <p className="text-[10px] uppercase font-black text-flavis-blue/30 tracking-[0.2em] font-sans">Descripción</p>
            <p className="font-secondary text-flavis-blue/80 text-sm leading-relaxed text-with-symbols">
              {cookie.descripcion || "Una creación artesanal horneada con los mejores ingredientes para alegrar tu semana. ✨"}
            </p>
          </div>
          
          <button onClick={onClose} className="w-full mt-10 bg-flavis-blue text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all font-sans">Cerrar Detalle</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL 5: ÉXITO DEL PEDIDO (GRACIAS) ---
const SuccessModal = ({ isOpen, onClose, customerName }) => {
  if (!isOpen) return null;
  const firstName = customerName ? customerName.trim().split(' ')[0] : 'Cookie Lover';

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-flavis-blue/95 backdrop-blur-md animate-in">
      <div className="bg-[#eef1e6] w-full max-w-sm rounded-[3rem] p-12 text-center shadow-2xl relative border border-white/10">
        <div className="w-20 h-20 bg-flavis-gold/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 text-with-symbols">🍪</div>
        <h2 className="text-3xl font-main text-flavis-blue italic mb-4 tracking-tighter text-with-symbols">
          ¡Gracias, {firstName}!
        </h2>
        <div className="space-y-2 text-sm font-secondary text-flavis-blue/70 leading-relaxed mb-10 text-with-symbols">
          <p>Tu pedido ha sido registrado con éxito.</p>
          <p>Estamos preparando tu pedido con mucho amor. ✨</p>
          <p className="font-bold italic text-flavis-gold">¡Pronto nos veremos para la entrega!</p>
        </div>
        <button onClick={onClose} className="w-full bg-flavis-blue text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg hover:scale-105 transition-all text-with-symbols font-sans font-sans">
          ¡GENIAL!
        </button>
      </div>
    </div>
  );
};

const CLOSED_MESSAGE = (
  <>
    ¡Nuestros hornos están tomando un breve descanso! 🍪<br />
    <span className="text-sm font-normal block mt-2 opacity-80 font-secondary text-with-symbols">
      Estamos preparando la próxima <span className="font-bold border-b border-flavis-gold">producción</span> para sorprenderte. Vuelve pronto para no quedarte sin tus favoritas. ✨
    </span>
  </>
);

const OrderForm = ({ 
  formData = {}, setFormData, onFileUpload, onPhoneBlur, isExistingCustomer, 
  qrUrl, previewUrl, onRemoveFile, loading, isSearching, preVenta, 
  cart, cookies, total, handleOrder, formErrors, isShaking, 
  successOrder, setSuccessOrder, successName,
  selectedCookie, setSelectedCookie, isDetailModalOpen, setIsDetailModalOpen 
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [showWholesaleModal, setShowWholesaleModal] = useState(false);

  const isClosed = !preVenta || preVenta.isClosed;

  const validateAndOrder = () => {
    const totalQuantity = Object.values(cart).reduce((a, b) => a + b, 0);
    if (totalQuantity > 20) {
      setShowWholesaleModal(true);
      return;
    }
    handleOrder();
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
      
      <CookieDetailModal cookie={selectedCookie} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
      
      {/* Sincronizado con el nombre que el usuario escribe */}
      <SuccessModal isOpen={successOrder} onClose={() => setSuccessOrder(false)} customerName={successName} />

      {isClosed ? (
        <div className="p-16 bg-[#eef1e6]/10 border-2 border-dashed border-flavis-gold/30 rounded-[3rem] text-center animate-in font-secondary">
          <div className="text-6xl mb-6 opacity-40 font-sans text-with-symbols">🍪</div>
          <h2 className="text-4xl text-flavis-gold font-main font-bold italic mb-4 tracking-tight text-with-symbols">Próximamente nueva Pre-Venta</h2>
          <div className="text-white/90 max-w-lg mx-auto leading-relaxed mb-8">
            {CLOSED_MESSAGE}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button 
              onClick={() => setShowClosedModal(true)} 
              className="bg-flavis-gold text-flavis-blue px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl font-sans"
            >
              ¿Cómo funcionan nuestros pedidos?
            </button>
            
            {/* NUEVO BOTÓN DE DUDAS ESTILIZADO */}
            <a 
              href={`https://wa.me/51933304850?text=${encodeURIComponent("¡Hola! Tengo una duda sobre la próxima preventa de Flavis \uD83C\uDF6A")}`}
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 bg-[#25D366] hover:scale-105 active:scale-95 text-white px-8 py-3 rounded-full transition-all shadow-xl font-sans font-black uppercase text-[10px] tracking-widest"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Escríbenos por dudas</span>
            </a>
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
                  {cookies.filter(c => cart[c.id] > 0).length > 0 ? (
                    cookies.filter(c => cart[c.id] > 0).map(cookie => (
                      <div key={cookie.id} className="flex justify-between items-center border-b border-white/5 pb-2 font-secondary">
                        <span className="text-sm font-bold text-with-symbols"><span className="text-flavis-gold font-sans">{cart[cookie.id]}x</span> {cookie.nombre}</span>
                        <span className="text-xs opacity-60 font-sans text-with-symbols">S/ {(cookie.precio * cart[cookie.id]).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-white/30 py-4">Aún no has elegido galletas...</p>
                  )}
                </div>
                <div className="pt-2">
                   <div className="text-4xl font-bold text-flavis-gold mb-6 italic text-right tracking-tighter text-with-symbols font-secondary">Total: S/ {total.toFixed(2)}</div>
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

            {/* Slot 3: Info Importante */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] animate-in flex flex-col gap-6 order-3 lg:order-3">
              <p className="text-[10px] uppercase font-black text-flavis-gold tracking-[0.3em] font-sans">Información Importante</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white text-sm leading-relaxed">
                <div className="space-y-2">
                  <p className="font-bold text-flavis-gold italic text-base">Cronograma</p>
                  <p className="text-with-symbols">
                    <span className="opacity-60 text-xs">Cierre:</span> <br/> 
                    <span className="font-secondary text-base font-bold">
                      {preVenta?.fechaCierre ? new Date(preVenta.fechaCierre).toLocaleString('es-PE', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}
                    </span>
                  </p>
                  <p className="text-with-symbols">
                    <span className="opacity-60 text-xs">Entrega:</span> <br/> 
                    <span className="font-secondary text-2xl font-bold text-flavis-gold">
                      {preVenta?.fechaEntrega ? new Date(preVenta.fechaEntrega + "T00:00:00").toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: '2-digit' }) : '--'}
                    </span> 
                    <br/> 
                    <span className="text-sm opacity-80 italic font-secondary text-with-symbols">
                      ({preVenta?.horarioEntrega})
                    </span>
                  </p>
                </div>
                <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                  <p className="font-bold text-flavis-gold italic text-base">Ubicación</p>
                  <p><br/> <span className="font-bold italic">Santiago de Surco</span> <br/> <span className="text-xs opacity-80">Ref. Parque Casuarinas</span></p>
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

                  {/* BOTÓN WHATSAPP DE DUDAS (BLINDADO) */}
                  <button 
                    onClick={() => {
                      const cookie = String.fromCodePoint(0x1F36A);
                      const msg = encodeURIComponent(`¡Hola! Tengo una duda sobre los pedidos de Flavis ${cookie}`);
                      window.open(`https://wa.me/51933304850?text=${msg}`, '_blank');
                    }}
                    className="flex items-center gap-2 bg-[#25D366] hover:scale-105 active:scale-95 text-white px-8 py-3 rounded-full transition-all shadow-xl font-sans font-black uppercase text-[10px] tracking-widest"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Escríbenos por dudas</span>
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