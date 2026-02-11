import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CookiesModule = () => {
  // --- 1. ESTADOS PRINCIPALES ---
  const [activeTab, setActiveTab] = useState('individuales'); // 'individuales' o 'packs'
  const [cookies, setCookies] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, type: 'cookie' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: '' });

  // --- 2. ESTADOS DE FORMULARIOS ---
  const [newCookie, setNewCookie] = useState({
    nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true, stockActual: 0
  });

  const [newPack, setNewPack] = useState({
    nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true,
    galletasIds: [] // Aquí guardaremos los IDs de las 4 galletas
  });

  const [uploadingImg, setUploadingImg] = useState(false);

  // --- 3. CARGA DE DATOS ---
  useEffect(() => { 
    cargarDatos(); 
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resCookies, resPacks] = await Promise.all([
        api.get('/cookies'),
        api.get('/packs').catch(() => ({ data: [] })) // Fallback si aún no existe el endpoint
      ]);
      setCookies(resCookies.data);
      setPacks(resPacks.data || []);
    } catch (err) { 
      console.error("Error al cargar catálogo", err); 
    } finally {
      setLoading(false);
    }
  };

  // --- 4. LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const dataToDisplay = activeTab === 'individuales' ? cookies : packs;
  
  const filteredItems = dataToDisplay.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab]);

  // --- 5. MANEJO DE IMÁGENES ---
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('multipartFile', file);
    try {
      setUploadingImg(true);
      const res = await api.post('/cookies/upload', data);
      if (type === 'cookie') {
        setNewCookie({ ...newCookie, imagenUrl: res.data.url });
      } else {
        setNewPack({ ...newPack, imagenUrl: res.data.url });
      }
    } catch (err) {
      setAlertModal({ show: true, title: "Error de Carga", message: "No se pudo subir la imagen." });
    } finally { setUploadingImg(false); }
  };

  // --- 6. GESTIÓN DE PACKS (LÓGICA DE SELECCIÓN) ---
  const toggleCookieInPack = (cookieId) => {
    setNewPack(prev => {
      const exists = prev.galletasIds.includes(cookieId);
      if (exists) {
        return { ...prev, galletasIds: prev.galletasIds.filter(id => id !== cookieId) };
      }
      if (prev.galletasIds.length < 4) {
        return { ...prev, galletasIds: [...prev.galletasIds, cookieId] };
      }
      return prev; // No permite más de 4
    });
  };

  // --- 7. SUBMIT FORMULARIOS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'individuales') {
        const cookieData = { ...newCookie, precio: parseFloat(newCookie.precio) };
        if (editingId) {
          await api.put(`/cookies/${editingId}`, cookieData);
        } else {
          await api.post('/cookies', cookieData);
        }
      } else {
        // VALIDACIÓN DE PACK
        if (newPack.galletasIds.length !== 4) {
          setAlertModal({ show: true, title: "Pack Incompleto", message: "Un pack debe tener exactamente 4 galletas seleccionadas." });
          setLoading(false);
          return;
        }
        const packData = { ...newPack, precio: parseFloat(newPack.precio) };
        if (editingId) {
          await api.put(`/packs/${editingId}`, packData);
        } else {
          await api.post('/packs', packData);
        }
      }
      
      cerrarFormulario();
      cargarDatos();
      setAlertModal({ show: true, title: "¡Éxito!", message: "Cambios guardados correctamente." });
    } catch (err) {
      setAlertModal({ show: true, title: "Error", message: "No se pudo guardar la información." });
    } finally { setLoading(false); }
  };

  const prepararEdicion = (item) => {
    if (activeTab === 'individuales') {
      setNewCookie({ 
        ...item, 
        descripcion: item.descripcion || '',
        stockActual: item.stockActual || 0 
      });
    } else {

      setNewPack({ 
        ...item, 
        descripcion: item.descripcion || '',
        galletasIds: item.galletas ? item.galletas.map(g => g.id) : [] 
      });
    }
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setEditingId(null);
    setNewCookie({ nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true, stockActual: 0 });
    setNewPack({ nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true, galletasIds: [] });
  };

  const ejecutarEliminar = async () => {
    const { id, type } = confirmModal;
    setConfirmModal({ show: false, id: null, type: 'cookie' });
    try {
      const endpoint = type === 'cookie' ? `/cookies/${id}` : `/packs/${id}`;
      await api.delete(endpoint);
      cargarDatos();
      setAlertModal({ show: true, title: "¡Eliminado!", message: "El registro ha sido borrado." });
    } catch (err) {
      setAlertModal({ show: true, title: "Protegido", message: "Este ítem tiene pedidos asociados y no puede eliminarse. Mejor ocúltalo." });
    }
  };

  const toggleVisibilidad = async (item) => {
    try {
      const endpoint = activeTab === 'individuales' ? `/cookies/${item.id}` : `/packs/${item.id}`;
      
      const body = activeTab === 'individuales' 
        ? { ...item, activo: !item.activo }
        : {
            nombre: item.nombre,
            descripcion: item.descripcion,
            precio: item.precio,
            imagenUrl: item.imagenUrl,
            activo: !item.activo,
            galletasIds: item.galletas ? item.galletas.map(g => g.id) : []
          };

      await api.put(endpoint, body);
      cargarDatos();
    } catch (err) { 
      console.error("Error al cambiar visibilidad:", err);
      setAlertModal({ 
        show: true, 
        title: "Error de Permisos", 
        message: "No se pudo actualizar el estado. Verifica tu sesión de admin." 
      });
    }
  };

  return (
    <div className="animate-in relative font-sans"> 
      {/* HEADER CON TABS */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-4 tracking-tighter">
              Gestión de Inventario
            </h2>
            <div className="flex bg-flavis-blue/5 dark:bg-white/5 p-1 rounded-2xl w-max">
              <button 
                onClick={() => { setActiveTab('individuales'); setShowForm(false); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'individuales' ? 'bg-flavis-blue text-white shadow-md' : 'text-flavis-blue/40 dark:text-white/40'}`}
              >
                Individuales
              </button>
              <button 
                onClick={() => { setActiveTab('packs'); setShowForm(false); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'packs' ? 'bg-flavis-gold text-flavis-blue shadow-md' : 'text-flavis-blue/40 dark:text-white/40'}`}
              >
                Packs de 4
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-64">
              <input 
                type="text" placeholder="Buscar..." 
                className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 p-3 pr-10 rounded-xl outline-none focus:border-flavis-gold font-bold text-xs"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
            </div>
            <button 
              onClick={() => showForm ? cerrarFormulario() : setShowForm(true)}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all ${showForm ? 'bg-red-500 text-white' : 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-blue'}`}
            >
              {showForm ? 'Cancelar' : activeTab === 'individuales' ? '+ Galleta' : '+ Nuevo Pack'}
            </button>
          </div>
        </div>
      </header>

      {/* FORMULARIO DINÁMICO */}
      {showForm && (
        <div className="bg-white dark:bg-flavis-card-dark p-8 md:p-12 rounded-[3rem] shadow-xl border border-flavis-blue/5 mb-12 max-w-5xl mx-auto animate-in">
          <form onSubmit={handleSubmit} className="space-y-10">
            <h3 className="text-2xl font-sans font-black text-flavis-blue dark:text-white uppercase tracking-tighter border-b border-flavis-blue/5 pb-4">
              {editingId ? 'Editar' : 'Crear'} {activeTab === 'individuales' ? 'Galleta' : 'Pack de 4'}
            </h3>
            
            {/* SECCIÓN 1: DATOS BÁSICOS Y DESCRIPCIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-black opacity-40 mb-2 ml-2 tracking-widest text-flavis-blue dark:text-white">Nombre</label>
                  <input required type="text" className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border-none p-4 rounded-2xl text-sm font-bold text-flavis-blue dark:text-white focus:ring-2 ring-flavis-gold/20 outline-none transition-all" 
                    value={activeTab === 'individuales' ? newCookie.nombre : newPack.nombre} 
                    onChange={e => activeTab === 'individuales' ? setNewCookie({...newCookie, nombre: e.target.value}) : setNewPack({...newPack, nombre: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black opacity-40 mb-2 ml-2 tracking-widest text-flavis-blue dark:text-white">Precio de Venta (S/)</label>
                  <input required type="number" step="0.10" className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border-none p-4 rounded-2xl text-sm font-bold text-flavis-blue dark:text-white focus:ring-2 ring-flavis-gold/20 outline-none transition-all"
                    value={activeTab === 'individuales' ? newCookie.precio : newPack.precio} 
                    onChange={e => activeTab === 'individuales' ? setNewCookie({...newCookie, precio: e.target.value}) : setNewPack({...newPack, precio: e.target.value})} 
                  />
                </div>
              </div>

              <div className="md:col-span-5">
                <label className="block text-[10px] uppercase font-black opacity-40 mb-2 ml-2 tracking-widest text-flavis-blue dark:text-white">Descripción del Pack</label>
                <textarea 
                  placeholder="Ej: Ideal para regalo, incluye los 4 sabores estrella..."
                  className="w-full h-[calc(100%-28px)] bg-flavis-blue/5 dark:bg-flavis-dark border-none p-5 rounded-3xl text-sm font-bold text-flavis-blue dark:text-white resize-none focus:ring-2 ring-flavis-gold/20 outline-none transition-all"
                  value={activeTab === 'individuales' ? newCookie.descripcion : newPack.descripcion}
                  onChange={e => activeTab === 'individuales' 
                    ? setNewCookie({...newCookie, descripcion: e.target.value}) 
                    : setNewPack({...newPack, descripcion: e.target.value})}
                />
              </div>
            </div>

            {/* SECCIÓN 2: LÓGICA DE SELECCIÓN (SOLO PARA PACKS) */}
            {activeTab === 'packs' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* SELECTOR DE GALLETAS */}
                <div className="md:col-span-7 bg-flavis-blue/5 dark:bg-flavis-dark p-8 rounded-[2.5rem] border border-flavis-blue/5">
                  <label className="block text-[10px] uppercase font-black opacity-70 mb-6 text-center tracking-[0.2em] text-flavis-blue dark:text-white">
                    Selecciona 4 Galletas ({newPack.galletasIds.length}/4)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                    {cookies.map(c => (
                      <button 
                        key={c.id} type="button"
                        onClick={() => toggleCookieInPack(c.id)}
                        className={`p-3 rounded-2xl text-[9px] font-black uppercase transition-all border leading-tight min-h-[60px] flex items-center justify-center text-center break-words ${
                          newPack.galletasIds.includes(c.id) 
                            ? 'bg-flavis-gold border-flavis-gold text-flavis-blue shadow-lg scale-[1.02]' 
                            : 'bg-white dark:bg-white/5 border-transparent text-flavis-blue/60 dark:text-white/40 hover:border-flavis-gold/30'
                        }`}
                      >
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RESUMEN VISUAL */}
                <div className="md:col-span-5 bg-flavis-gold/5 rounded-[2.5rem] p-8 border border-flavis-gold/10 self-stretch flex flex-col">
                  <p className="text-[10px] font-black uppercase text-flavis-gold mb-6 tracking-widest text-center">Contenido del Pack</p>
                  <div className="space-y-3 flex-1">
                    {newPack.galletasIds.length > 0 ? (
                      newPack.galletasIds.map(id => {
                        const g = cookies.find(c => c.id === id);
                        return g ? (
                          <div key={id} className="flex items-center gap-3 bg-white dark:bg-white/5 p-3 rounded-2xl shadow-sm border border-flavis-gold/5 animate-in">
                            <div className="w-2 h-2 rounded-full bg-flavis-gold shadow-[0_0_10px_rgba(184,153,90,0.5)]"></div>
                            <span className="text-[11px] font-black text-flavis-blue dark:text-white/80 uppercase truncate">{g.nombre}</span>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] text-center italic opacity-40 font-bold uppercase tracking-widest">Esperando selección...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 3: IMAGEN */}
            <div className="pt-6 border-t border-flavis-blue/5">
              <label className="block text-[10px] uppercase font-black opacity-40 mb-4 ml-2 tracking-widest text-flavis-blue dark:text-white">Diseño del Pack</label>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48 bg-flavis-blue/5 dark:bg-flavis-dark rounded-[2.5rem] border-2 border-dashed border-flavis-blue/10 flex items-center justify-center overflow-hidden shadow-inner">
                  {(activeTab === 'individuales' ? newCookie.imagenUrl : newPack.imagenUrl) ? (
                    <img src={activeTab === 'individuales' ? newCookie.imagenUrl : newPack.imagenUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : <span className="text-4xl grayscale opacity-20">🖼️</span>}
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <label className="cursor-pointer inline-flex items-center bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-blue px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
                    🚀 Subir Diseño Personalizado
                    <input type="file" onChange={(e) => handleImageUpload(e, activeTab === 'individuales' ? 'cookie' : 'pack')} className="hidden" accept="image/*" />
                  </label>
                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Formatos: JPG, PNG. Máx 5MB.</p>
                  {uploadingImg && <div className="flex items-center gap-2 justify-center md:justify-start"><span className="w-2 h-2 bg-flavis-gold rounded-full animate-ping"></span><span className="text-[10px] font-black text-flavis-gold uppercase">Subiendo...</span></div>}
                </div>
              </div>
            </div>

            <button disabled={loading || uploadingImg} type="submit" className="w-full bg-flavis-gold text-flavis-blue py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Sincronizando...' : editingId ? '✓ Guardar Cambios' : '★ Publicar en Catálogo'}
            </button>
          </form>
        </div>
      )}

      {/* LISTADO DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentItems.map(item => (
          <div key={item.id} className={`bg-white dark:bg-flavis-card-dark p-6 rounded-[2.5rem] border border-flavis-blue/5 shadow-sm transition-all group ${!item.activo ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="w-full h-48 bg-flavis-blue/5 dark:bg-flavis-dark rounded-[2rem] mb-6 overflow-hidden relative">
              <img src={item.imagenUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.nombre} />
              {activeTab === 'packs' && (
                <div className="absolute top-4 right-4 bg-flavis-gold text-flavis-blue text-[8px] font-black px-3 py-1 rounded-full uppercase">Pack x4</div>
              )}
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-sans font-black text-lg text-flavis-blue dark:text-white uppercase tracking-tight">{item.nombre}</h3>
              <p className="text-flavis-gold font-black font-sans">S/ {item.precio.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-2 font-sans">
              <div className="flex gap-2">
                <button onClick={() => prepararEdicion(item)} className="flex-1 py-2.5 bg-flavis-blue/5 dark:bg-white/5 text-flavis-blue dark:text-white/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-flavis-blue/10 transition-colors">Editar</button>
                <button onClick={() => toggleVisibilidad(item)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${item.activo ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                  {item.activo ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <button onClick={() => setConfirmModal({show: true, id: item.id, type: activeTab === 'individuales' ? 'cookie' : 'pack'})} className="w-full py-2.5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACIÓN */}
      {!showForm && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 pb-10">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 text-flavis-blue/40 disabled:opacity-10 font-bold">« Atrás</button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-full font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-white/5 text-flavis-blue/70 border border-flavis-blue/5'}`}>{i + 1}</button>
            ))}
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 text-flavis-blue/40 disabled:opacity-10 font-bold">Sig. »</button>
        </div>
      )}

      {/* MODALES (Confirmación y Alerta) */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-flavis-blue/90 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#eef1e6] dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border border-white/20">
            <div className="text-4xl mb-6">⚠️</div>
            <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-4 italic">¿Segura?</h2>
            <p className="text-sm text-flavis-blue/70 dark:text-white/60 mb-8">Esta acción eliminará el registro permanentemente.</p>
            <div className="flex gap-3 font-bold">
              <button onClick={() => setConfirmModal({show: false, id: null})} className="flex-1 py-3 text-flavis-blue dark:text-white/40 uppercase text-[10px]">Cancelar</button>
              <button onClick={ejecutarEliminar} className="flex-1 bg-red-500 text-white py-3 rounded-xl uppercase text-[10px] shadow-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {alertModal.show && (
        <div className="fixed inset-0 bg-flavis-blue/90 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-flavis-gold">
            <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-2 italic">{alertModal.title}</h2>
            <p className="text-sm text-gray-600 dark:text-white/60 mb-8 font-bold leading-relaxed">{alertModal.message}</p>
            <button onClick={() => setAlertModal({show: false, message: '', title: ''})} className="bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-blue px-10 py-3 rounded-full font-black uppercase text-[10px]">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookiesModule;