import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import api from './services/api';
import CookieCard from './components/CookieCard';
import OrderForm from './components/OrderForm';
import Login from './components/Login';
import Intranet from './components/Intranet';

function App() {
  const [cookies, setCookies] = useState([]);
  const [cart, setCart] = useState({});
  
  // SISTEMA DE PESTAÑAS: 'form', 'login', 'admin'
  const [view, setView] = useState('form');
  const [isAdmin, setIsAdmin] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  const [lockLevel, setLockLevel] = useState(() => parseInt(localStorage.getItem('flavis_lock_level') || '0'));
  const [formErrors, setFormErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);

  // 1. Estado actualizado con nombres y apellidos por separado
  const [formData, setFormData] = useState({ 
    nombres: '', 
    apellidos: '', 
    celular: '', 
    comprobanteUrl: '', 
    guardarDatos: false, 
    aceptoCondiciones: false 
  });
  
  const [selectedCookie, setSelectedCookie] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // NUEVO: Estado para abrir el modal de detalle
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false); 
  const [preVenta, setPreVenta] = useState(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Modales del sistema
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false); 
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [customerNameForModal, setCustomerNameForModal] = useState(''); 

  // 1. EFECTO DE CARGA INICIAL (Corregido Punto 1: Sincronización)
useEffect(() => {
  api.get('/preventas/activa')
    .then(res => {
      const pv = res.data;
      if (pv) {
        const ahora = new Date();
        const fin = new Date(pv.fechaCierre);
        
        // CORRECCIÓN PUNTO 1: Validación ultra-estricta de stock
        // Si el stock actual es igual o mayor al máximo (y el máximo es > 0), se cierra.
        const stockAgotado = pv.stockMaximo > 0 && (pv.stockActual >= pv.stockMaximo);
        const fechaExpirada = ahora > fin;

        pv.isClosed = fechaExpirada || stockAgotado;
        
        // Log para que tú mismo verifiques en consola si el stock está llegando bien
        console.log("Estado Pre-Venta:", { stockAgotado, fechaExpirada, total: pv.isClosed });
      }
      setPreVenta(pv);
    })
    .catch(err => {
      console.warn("Servidor fuera de línea o sin campaña activa.");
      setPreVenta(null); 
    });

  api.get('/cookies/activas')
    .then(res => setCookies(res.data))
    .catch(err => setCookies([]));
}, []);

  useEffect(() => {
    const savedData = localStorage.getItem('flavis_temp_form');
    if (savedData) setFormData(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    localStorage.setItem('flavis_lock_level', lockLevel.toString());
  }, [lockLevel]);

  useEffect(() => {
    localStorage.setItem('flavis_temp_form', JSON.stringify(formData));
  }, [formData]);

  // 2. Temporizador Pro (Fase 2): Resetear nivel de bloqueo si ya pasó mucho tiempo
  useEffect(() => {
    const expiration = localStorage.getItem('flavis_lock_until');
    if (expiration) {
      const expirationTime = parseInt(expiration);
      const now = Date.now();
      const remaining = Math.round((expirationTime - now) / 1000);

      if (remaining > 0) {
        setIsLocked(true);
        setLockTimeRemaining(remaining);
      } else {
        // PRO: Si el bloqueo expiró hace más de 10 minutos, reseteamos el nivel a 0
        if (now > expirationTime + (600 * 1000)) {
          setLockLevel(0);
          localStorage.setItem('flavis_lock_level', '0');
        }
        localStorage.removeItem('flavis_lock_until');
        setIsLocked(false);
      }
    }
  }, []);

  // EFECTO 3: El temporizador del bloqueo
  useEffect(() => {
    let timer;
    if (isLocked && lockTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            localStorage.removeItem('flavis_lock_until');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimeRemaining]);

  // --- LÓGICA DE FORMATEO AESTHETIC ---
  const formatCierre = (dateString) => {
    if (!dateString) return "Cargando...";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long', day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  const formatEntrega = (dateString) => {
    if (!dateString) return "TBD";
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long', day: '2-digit', month: '2-digit'
    }).format(date);
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
  };

  useEffect(() => {
    if (formData.celular.length < 9) {
      if (isExistingCustomer) {
        setIsExistingCustomer(false);
        setFormData(prev => ({ 
          ...prev, 
          nombres: '', 
          apellidos: '', 
          guardarDatos: false 
        }));
      }
    }
  }, [formData.celular, isExistingCustomer]);

  const updateQuantity = (id, delta) => {
    setCart(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  };

  const hasTooManyConsecutive = (str) => /(.)\1{4,}/.test(str);

  const handlePhoneBlur = async () => {
    const { celular } = formData;
    if (celular.length < 9) return;

    if (!celular.startsWith('9')) {
      setErrorModal({ show: true, message: 'El número de teléfono debe ser real y comenzar con el dígito 9.' });
      return;
    }
    if (hasTooManyConsecutive(celular)) {
      setErrorModal({ show: true, message: 'Número inválido: No se permiten más de 4 dígitos iguales consecutivos.' });
      return;
    }

    try {
      setIsSearching(true);
      const res = await api.get(`/clientes/buscar?telefono=${celular}`);
      if (res.data) {
        setFormData(prev => ({ 
          ...prev, 
          nombres: toTitleCase(res.data.nombre), 
          apellidos: toTitleCase(res.data.apellido), 
          guardarDatos: true 
        }));
        setIsExistingCustomer(true);
      }
    } catch (err) {
      setIsExistingCustomer(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setErrorModal({ show: true, message: '¡Imagen muy pesada! El límite es de 1MB para el comprobante.' });
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    const data = new FormData();
    data.append('multipartFile', file);
    
    try {
      setLoading(true);
      const res = await api.post('/cookies/upload', data);
      setFormData(prev => ({ ...prev, comprobanteUrl: res.data.url }));
      setFormErrors(prev => ({ ...prev, comprobanteUrl: false })); 
      setShowUploadModal(true);
    } catch (err) {
      setErrorModal({ show: true, message: 'Error al subir la imagen. Intenta de nuevo.' });
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, comprobanteUrl: '' }));
    setPreviewUrl(null);
  };

  const total = cookies.reduce((acc, cookie) => acc + (cookie.precio * (cart[cookie.id] || 0)), 0);

  // 2. FUNCIÓN handleOrder (Corregido Punto 3: Temporizador Inmediato)
const handleOrder = async () => {
    const { celular, nombres, apellidos, comprobanteUrl, aceptoCondiciones } = formData;
    const totalQuantity = Object.values(cart).reduce((a, b) => a + b, 0);

    if (preVenta && (preVenta.stockActual + totalQuantity > preVenta.stockMaximo)) {
      setErrorModal({ show: true, message: '¡Lo sentimos! Ya no queda stock suficiente.' });
      return;
    }

    const errors = {};
    if (!nombres?.trim()) errors.nombres = true;
    if (!apellidos?.trim()) errors.apellidos = true;
    if (!celular || celular.length < 9) errors.celular = true;
    if (!comprobanteUrl) errors.comprobanteUrl = true;
    if (!aceptoCondiciones) errors.aceptoCondiciones = true;
    if (total === 0) errors.total = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      const newAttempts = failedAttempts + 1;
      if (newAttempts >= 4) {
        const nextLevel = lockLevel + 1;
        const seconds = nextLevel === 1 ? 30 : nextLevel === 2 ? 60 : 120;
        const expiration = Date.now() + (seconds * 1000);
        localStorage.setItem('flavis_lock_until', expiration.toString());
        localStorage.setItem('flavis_lock_level', nextLevel.toString());
        setLockLevel(nextLevel);
        setLockTimeRemaining(seconds);
        setIsLocked(true);
        setFailedAttempts(0);
      } else { setFailedAttempts(newAttempts); }
      return;
    }

    const pedido = {
      cliente: { nombre: nombres, apellido: apellidos, celular: celular, guardarDatos: formData.guardarDatos },
      montoTotal: total,
      comprobanteUrl,
      detalles: Object.keys(cart).filter(id => cart[id] > 0).map(id => ({
        cookie: { id: parseInt(id) },
        cantidad: cart[id],
        precioUnitario: cookies.find(c => c.id === parseInt(id)).precio
      }))
    };

    try {
      setLoading(true);
      await api.post('/pedidos', pedido);
      
      // Capturamos el primer nombre para el modal antes de borrar
      const firstName = nombres.trim().split(' ')[0];
      setCustomerNameForModal(firstName);
      
      // DISPARAMOS EL MODAL
      setShowOrderSuccessModal(true);

      // LIMPIEZA
      setLockLevel(0);
      localStorage.removeItem('flavis_lock_level');
      localStorage.removeItem('flavis_temp_form');
      setCart({});
      setIsExistingCustomer(false);
      setPreviewUrl(null);
      setFormData({ nombres: '', apellidos: '', celular: '', comprobanteUrl: '', guardarDatos: false, aceptoCondiciones: false });
      setFailedAttempts(0);
      setFormErrors({});
    } catch (err) {
      setErrorModal({ show: true, message: 'Error al procesar el pedido.' });
    } finally { setLoading(false); }
  };

  const handleLogin = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data) {
        setIsAdmin(true);
        setView('admin');
      }
    } catch (err) { throw err; }
  };

  if (view === 'login') return <Login onLogin={handleLogin} onBack={() => setView('form')} />;
  if (view === 'admin' && isAdmin) return <Intranet onLogout={() => { setIsAdmin(false); setView('form'); }} />;

  return (
    <div className="min-h-screen bg-[#326371] pb-20 px-4 md:px-10 relative">
      <Analytics />
      {isLocked && (
        <div className="fixed inset-0 bg-flavis-blue/95 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in">
          <div className="bg-[#eef1e6] p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-2 border-flavis-gold font-secondary">
            <div className="text-5xl mb-6">⏳</div>
            <h2 className="text-2xl font-main font-bold text-flavis-blue mb-4 tracking-tight">Un momento</h2>
            <p className="text-flavis-blue/80 text-sm leading-relaxed mb-8">
              Hiciste varios intentos sin llenar los datos necesarios. Por seguridad, vuelve a intentarlo en:
            </p>
            <div className="text-5xl font-secondary font-bold text-flavis-gold mb-2 tabular-nums">
              {Math.floor(lockTimeRemaining / 60)}:{String(lockTimeRemaining % 60).padStart(2, '0')}
            </div>
            <p className="text-[10px] uppercase font-black text-flavis-blue/30 tracking-widest mt-6">
              Tus datos se mantienen guardados
            </p>
          </div>
        </div>
      )}

      <header className="pt-12 pb-0 flex flex-col items-center">
        <img src="/Logo-Flavis.png" alt="Flavis" className="w-64 md:w-80" />
        <p className="text-white/60 font-secondary uppercase tracking-[0.4em] text-[10px] md:text-xs mt-4 border-t border-white/10 pt-4 w-48 text-center font-bold tracking-widest">
          de la semana
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {!preVenta || preVenta.isClosed ? (
          <div className="mt-[5px] animate-in">
             <OrderForm 
                preVenta={preVenta} 
                formData={formData} 
                setFormData={setFormData}
                selectedCookie={selectedCookie}
                isDetailModalOpen={isDetailModalOpen}
                setIsDetailModalOpen={setIsDetailModalOpen}
             />
          </div>
        ) : (
          <>
            <section className="mt-12 mb-20 animate-in">
              <h2 className="text-3xl text-center text-flavis-gold mb-12 font-secondary font-bold tracking-tight uppercase">
                Elige tus favoritas
              </h2>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 scrollbar-hide px-2 py-10 -my-10">
                {cookies.map(cookie => (
                  <div key={cookie.id} className="min-w-[280px] md:min-w-[calc(25%-18px)] flex-shrink-0 snap-start">
                    <CookieCard 
                      cookie={cookie} 
                      quantity={cart[cookie.id] || 0} 
                      onUpdate={(delta) => updateQuantity(cookie.id, delta)} 
                      onOpenModal={(c) => { 
                        setSelectedCookie(c); 
                        setIsDetailModalOpen(true); 
                      }} 
                    />
                  </div>
                ))}
              </div>
            </section>

            <OrderForm 
              formData={formData} 
              setFormData={setFormData} 
              onFileUpload={handleFileUpload} 
              onPhoneBlur={handlePhoneBlur} 
              isExistingCustomer={isExistingCustomer} 
              qrUrl={preVenta?.qrUrl?.includes('demo') ? null : preVenta?.qrUrl}
              previewUrl={previewUrl} 
              onRemoveFile={handleRemoveFile} 
              loading={loading} 
              isSearching={isSearching}
              preVenta={preVenta} 
              cart={cart} 
              cookies={cookies} 
              total={total} 
              handleOrder={handleOrder}
              formErrors={formErrors} 
              isShaking={isShaking}
              selectedCookie={selectedCookie}
              isDetailModalOpen={isDetailModalOpen}
              setIsDetailModalOpen={setIsDetailModalOpen}
              // --- ESTAS TRES LÍNEAS SON LA CORRECCIÓN ---
              successOrder={showOrderSuccessModal} // Nombre corregido
              setSuccessOrder={setShowOrderSuccessModal} // Nombre corregido
              successName={customerNameForModal} // Prop añadida para no perder el nombre
            />
          </>
        )}
      </main>

      {errorModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border-t-8 border-red-500 animate-in">
            <h2 className="text-2xl font-main font-bold text-red-600 mb-2 italic tracking-tight">Aviso de Flavis</h2>
            <p className="font-secondary text-gray-700 leading-relaxed font-bold">{errorModal.message}</p>
            <button onClick={() => setErrorModal({ show: false, message: '' })} className="mt-6 bg-[#326371] text-white px-10 py-2 rounded-full font-bold uppercase tracking-widest text-xs">Entendido</button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setView('login')}
        className="fixed bottom-6 left-6 z-[100] w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm group"
        title="Acceso Intranet"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40 group-hover:text-flavis-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>
    </div>
  );
}

export default App;