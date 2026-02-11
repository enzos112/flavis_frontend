import React, { useState, useEffect } from 'react';
import api from './services/api';
import CookieCard from './components/CookieCard';
import OrderForm from './components/OrderForm';
import Login from './components/Login';
import Intranet from './components/Intranet';

const initialState = {
  nombres: '',
  apellidos: '',
  celular: '',
  comprobanteUrl: '',
  guardarDatos: false,
  aceptoCondiciones: false,
  tipoEntrega: 'RECOJO',
  direccion: { distrito: '', detalle: '', referencia: '' }
};

function App() {
  const [cookies, setCookies] = useState([]);
  const [packs, setPacks] = useState([]);
  const [cart, setCart] = useState({}); 
  const [formData, setFormData] = useState(initialState);
  
  const [view, setView] = useState('form');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [lockLevel, setLockLevel] = useState(() => parseInt(localStorage.getItem('flavis_lock_level') || '0'));
  const [formErrors, setFormErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [successDeliveryType, setSuccessDeliveryType] = useState('RECOJO');
  
  const [selectedCookie, setSelectedCookie] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false); 
  const [preVenta, setPreVenta] = useState(null); 
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false); 
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [customerNameForModal, setCustomerNameForModal] = useState(''); 
  const isClosed = !preVenta || preVenta.activo === false || preVenta.isClosed === true; 
  const [showWarningModal, setShowWarningModal] = useState(false); 
  const [showWholesaleModal, setShowWholesaleModal] = useState(false);

  useEffect(() => {
    const VERSION = "2.5"; 
    if (localStorage.getItem('flavis_v') !== VERSION) {
      localStorage.clear();
      localStorage.setItem('flavis_v', VERSION);
      window.location.reload();
    }
  }, []);
  
  // --- DETECTAR RUTA SECRETA PARA LOGIN ---
  useEffect(() => {
    const path = window.location.pathname;
    
    // Si la URL es flavis-cookies.vercel.app/acceso-flavis-2026 o /login
    if (path === '/acceso-flavis-2026' || path === '/login') {
      setView('login');
    }
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/preventas/activa').catch(() => null),
      api.get('/cookies/activas').catch(() => []),
      api.get('/packs').catch(() => []) // NUEVO: Carga de packs
    ]).then(([pvRes, cookiesRes, packsRes]) => {
      // --- Procesar Pre-Venta (Mismo bloque) ---
      if (pvRes?.data) {
        const pv = pvRes.data;
        if (pv.activo === false || pv.activo === 0) {
          pv.isClosed = true;
        } else {
          const ahora = new Date();
          const fin = new Date(pv.fechaCierre);
          const stockAgotado = Number(pv.stockActual) >= Number(pv.stockMaximo);
          const fechaExpirada = ahora > fin;
          pv.isClosed = fechaExpirada || stockAgotado;
        }
        setPreVenta(pv);
      } else {
        setPreVenta(null);
      }

      // --- Procesar Catálogo ---
      if (cookiesRes?.data) setCookies(cookiesRes.data);
      if (packsRes?.data) setPacks(packsRes.data.filter(p => p.activo));
      
    }).finally(() => {
      setIsAppReady(true);
    });
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

  // --- LÓGICA DE PERSISTENCIA JWT ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAdmin(true);
      setAdminUser(JSON.parse(storedUser));
      setView('admin'); 
    }
  }, []);

  // 2. Temporizador (Fase 2): Resetear nivel de bloqueo si ya pasó mucho tiempo
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

  const updateQuantity = (key, delta) => {
    setCart(prev => ({ 
      ...prev, 
      [key]: Math.max(0, (prev[key] || 0) + delta) 
    }));
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

  const totalCookies = cookies.reduce((acc, c) => acc + (c.precio * (cart[`c_${c.id}`] || 0)), 0);
  const totalPacks = packs.reduce((acc, p) => acc + (p.precio * (cart[`p_${p.id}`] || 0)), 0);
  const total = totalCookies + totalPacks;

  const handleOrder = async (logisticaData) => {
  const { celular, nombres, apellidos, comprobanteUrl, aceptoCondiciones, guardarDatos } = formData;
  const { tipoEntrega, costoEnvio, direccion } = logisticaData;

  const cookiesFromPacks = packs.reduce((acc, p) => acc + ((cart[`p_${p.id}`] || 0) * 4), 0);
  const cookiesIndividual = cookies.reduce((acc, c) => acc + (cart[`c_${c.id}`] || 0), 0);
  const totalCookiesOrdered = cookiesIndividual + cookiesFromPacks;

  if (preVenta && (preVenta.stockActual + totalCookiesOrdered > preVenta.stockMaximo)) {
    setErrorModal({ show: true, message: '¡Lo sentimos! No hay stock suficiente para esta combinación.' });
    return;
  }

  const errors = {};
  if (!nombres?.trim()) errors.nombres = true;
  if (!apellidos?.trim()) errors.apellidos = true;
  if (!celular || celular.length < 9) errors.celular = true;
  if (!comprobanteUrl) errors.comprobanteUrl = true;
  if (!aceptoCondiciones) errors.aceptoCondiciones = true;
  if (total === 0) errors.total = true;

  if (tipoEntrega === 'DELIVERY') {
    if (!direccion?.distrito) errors.direccion = true;
    if (!direccion?.detalle?.trim()) errors.direccion = true;
  }

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors); 
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    return;
  }

  const detalles = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([key, qty]) => {
      const [type, id] = key.split('_'); 
      const numericId = parseInt(id);

      if (type === 'c') {
        const item = cookies.find(c => c.id === numericId);
        return {
          cookie: { id: numericId },
          cantidad: qty,
          precioUnitario: item ? item.precio : 0,
          esPack: false
        };
      } else {
        const item = packs.find(p => p.id === numericId);
        return {
          pack: { id: numericId }, 
          cantidad: qty,
          precioUnitario: item ? item.precio : 0,
          esPack: true 
        };
      }
    });

  const pedido = {
    guardarDatos: guardarDatos,
    cliente: { nombre: nombres, apellido: apellidos, celular: celular },
    tipoEntrega: tipoEntrega,
    costoEnvio: costoEnvio,
    direccion: direccion,
    montoTotal: total + costoEnvio,
    comprobanteUrl: comprobanteUrl,
    detalles: detalles 
  };

  try {
    setLoading(true);
    await api.post('/pedidos', pedido);
    
    setCustomerNameForModal(nombres);
    setSuccessDeliveryType(tipoEntrega);
    
    setShowOrderSuccessModal(true);

    setLockLevel(0);
    localStorage.removeItem('flavis_lock_level');
    localStorage.removeItem('flavis_temp_form');
    setIsExistingCustomer(false);
    setCart({});
    setPreviewUrl(null);
    setFormData(initialState); 
    setFormErrors({}); 

  } catch (err) {
    console.error("Error en API:", err);
    setErrorModal({ show: true, message: 'Error al procesar el pedido. Verifica tu conexión o el comprobante.' });
  } finally { 
    setLoading(false); 
  }
};

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ email: data.email, rol: data.rol }));
    setIsAdmin(true);
    setAdminUser({ email: data.email, rol: data.rol });
    setView('admin'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAdmin(false);
    setAdminUser(null);
    setView('form');
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-[#326371] flex flex-col items-center justify-center p-4">
        <img src="/Logo-Flavis.png" alt="Cargando..." className="w-48 md:w-64 animate-pulse mb-8" />
        <div className="w-10 h-10 border-4 border-flavis-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/40 font-secondary text-[10px] uppercase tracking-[0.3em] mt-8 font-bold">
          Preparando el horno...
        </p>
      </div>
    );
  }

  if (view === 'login') return <Login onLogin={handleLogin} onBack={() => setView('form')} />;
  if (view === 'admin' && isAdmin) return <Intranet onLogout={handleLogout} />;
  return (
    <div className="min-h-screen bg-[#326371] pb-20 px-4 md:px-10 relative">
      {/* --- MODAL DE BLOQUEO POR INTENTOS --- */}
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
        {isClosed ? (
          /* --- VISTA: PRE-VENTA CERRADA --- */
          <div className="mt-[5px] animate-in">
            <OrderForm 
              isClosed={isClosed} 
              preVenta={preVenta} 
              formData={formData} 
              setFormData={setFormData}
              selectedCookie={selectedCookie}
              isDetailModalOpen={isDetailModalOpen}
              setIsDetailModalOpen={setIsDetailModalOpen}
              packs={packs}
              cookies={cookies}
              successDeliveryType={successDeliveryType}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              showWarningModal={showWarningModal}
              setShowWarningModal={setShowWarningModal}
              isShaking={isShaking}
              setIsShaking={setIsShaking}
              successOrder={showOrderSuccessModal}
              setSuccessOrder={setShowOrderSuccessModal}
            />
          </div>
        ) : (
          /* --- VISTA: PRE-VENTA ABIERTA --- */
          <>
            {/* --- SECCIÓN 1: PACKS ESPECIALES --- */}
            {packs.filter(p => p.activo).length > 0 && (
              <section className="mt-12 mb-10 animate-in">
                <h2 className="text-2xl sm:text-3xl text-center text-flavis-gold mb-4 font-secondary font-bold tracking-tight uppercase px-6 text-balance">
                  Packs Especiales
                </h2>
                <p className="text-[10px] text-center text-white/40 uppercase tracking-[0.3em] mb-12 font-bold">
                  La combinación perfecta para compartir
                </p>
                <div className="flex overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory gap-6 pb-10 scrollbar-hide px-8 lg:px-0 lg:justify-center py-10 -my-10">
                  {packs.filter(p => p.activo).map(pack => (
                    <div key={`p_${pack.id}`} className="w-[280px] sm:w-[300px] flex-shrink-0 snap-start transition-transform hover:scale-[1.02]">
                      <CookieCard 
                        cookie={pack} 
                        isPack={true}
                        quantity={cart[`p_${pack.id}`] || 0} 
                        onUpdate={(delta) => updateQuantity(`p_${pack.id}`, delta)} 
                        onOpenModal={(p) => { 
                          setSelectedCookie(p); 
                          setIsDetailModalOpen(true); 
                        }} 
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* --- SECCIÓN 2: INDIVIDUALES --- */}
            {cookies.filter(c => c.activo).length > 0 && (
              <section className={`${packs.filter(p => p.activo).length > 0 ? 'mt-20' : 'mt-12'} mb-20 animate-in`}>
                <h2 className="text-xl sm:text-2xl text-center text-white/70 mb-8 font-secondary font-bold tracking-tight uppercase px-6">
                  Elige tus favoritas
                </h2>

                <div className="relative">
                  <div className="flex overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory gap-6 pb-10 scrollbar-hide px-8 lg:px-0 lg:justify-center py-10 -my-10">
                    {cookies.filter(c => c.activo).map(cookie => (
                      <div key={`c_${cookie.id}`} className="w-[280px] sm:w-[300px] flex-shrink-0 snap-start transition-transform hover:scale-[1.02]">
                        <CookieCard 
                          cookie={cookie} 
                          isPack={false}
                          quantity={cart[`c_${cookie.id}`] || 0} 
                          onUpdate={(delta) => updateQuantity(`c_${cookie.id}`, delta)} 
                          onOpenModal={(c) => { 
                            setSelectedCookie(c); 
                            setIsDetailModalOpen(true); 
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* --- FORMULARIO DE PEDIDO --- */}
            <OrderForm 
              isClosed={isClosed} 
              formData={formData} 
              setFormData={setFormData} 
              onFileUpload={handleFileUpload} 
              onPhoneBlur={handlePhoneBlur} 
              isExistingCustomer={isExistingCustomer} 
              qrUrl={preVenta?.qrUrl}
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
              setFormErrors={setFormErrors}
              isShaking={isShaking}
              setIsShaking={setIsShaking}
              selectedCookie={selectedCookie}
              isDetailModalOpen={isDetailModalOpen}
              setIsDetailModalOpen={setIsDetailModalOpen}
              successOrder={showOrderSuccessModal} 
              setSuccessOrder={setShowOrderSuccessModal} 
              successName={customerNameForModal} 
              packs={packs}
              successDeliveryType={successDeliveryType}
              showWarningModal={showWarningModal}
              setShowWarningModal={setShowWarningModal}
            />
          </>
        )}
      </main>

      {/* --- MODAL DE ERROR --- */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[400] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border-t-8 border-red-500 animate-in">
            <h2 className="text-2xl font-main font-bold text-red-600 mb-2 italic tracking-tight">Aviso de Flavis</h2>
            <p className="font-secondary text-gray-700 leading-relaxed font-bold">{errorModal.message}</p>
            <button onClick={() => setErrorModal({ show: false, message: '' })} className="mt-6 bg-[#326371] text-white px-10 py-2 rounded-full font-bold uppercase tracking-widest text-xs">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;