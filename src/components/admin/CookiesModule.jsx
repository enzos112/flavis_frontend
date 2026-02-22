import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

// --- ICONOS VECTORIALES COMPARTIDOS ---
const Icons = {
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  EyeOff: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  ImagePlaceholder: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
};

const CookiesModule = () => {
  // --- 1. ESTADOS PRINCIPALES ---
  const [activeTab, setActiveTab] = useState('individuales'); 
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
    nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true, stockActual: 0, costoProduccion: ''
  });

  const [newPack, setNewPack] = useState({
    nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true,
    galletasIds: [], costoProduccion: ''
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
        api.get('/packs').catch(() => ({ data: [] }))
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

  // --- 6. GESTIÓN DE PACKS (LÓGICA DINÁMICA DE CANTIDAD) ---
  const handleUpdateQuantity = (cookieId, delta) => {
    setNewPack(prev => {
      const currentIds = [...prev.galletasIds];
      if (delta === 1) {
        // Añadir una instancia del ID
        currentIds.push(cookieId);
      } else {
        // Quitar solo una instancia del ID
        const index = currentIds.indexOf(cookieId);
        if (index > -1) {
          currentIds.splice(index, 1);
        }
      }
      return { ...prev, galletasIds: currentIds };
    });
  };

  const getCountForFlavor = (cookieId) => {
    return newPack.galletasIds.filter(id => id === cookieId).length;
  };

  // --- 7. SUBMIT FORMULARIOS Y VALIDACIÓN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentForm = activeTab === 'individuales' ? newCookie : newPack;
    const precio = parseFloat(currentForm.precio);
    const costo = parseFloat(currentForm.costoProduccion);

    if (costo >= precio) {
      setAlertModal({ 
        show: true, 
        title: "Revisa los Costos", 
        message: "El Costo de Producción no puede ser mayor o igual al Precio de Venta. Estarías perdiendo dinero." 
      });
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'individuales') {
        const cookieData = { ...newCookie, precio, costoProduccion: costo };
        if (editingId) {
          await api.put(`/cookies/${editingId}`, cookieData);
        } else {
          await api.post('/cookies', cookieData);
        }
      } else {
        // CAMBIO: Validación dinámica. Ahora permite cualquier cantidad mayor a 0.
        if (newPack.galletasIds.length === 0) {
          setAlertModal({ show: true, title: "Pack Incompleto", message: "Debes seleccionar al menos una galleta para crear el pack." });
          setLoading(false);
          return;
        }
        const packData = { ...newPack, precio, costoProduccion: costo };
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
        stockActual: item.stockActual || 0 ,
        costoProduccion: item.costoProduccion || ''
      });
    } else {
      setNewPack({ 
        ...item, 
        descripcion: item.descripcion || '',
        costoProduccion: item.costoProduccion || '',
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
    setNewCookie({ nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true, stockActual: 0, costoProduccion: '' });
    setNewPack({ nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true, galletasIds: [], costoProduccion: '' });
  };

  const ejecutarEliminar = async () => {
    const { id, type } = confirmModal;
    setConfirmModal({ show: false, id: null, type: 'cookie' });
    try {
      const endpoint = type === 'cookie' ? `/cookies/${id}` : `/packs/${id}`;
      await api.delete(endpoint);
      cerrarFormulario();
      cargarDatos();
      setAlertModal({ show: true, title: "¡Eliminado!", message: "El registro ha sido borrado." });
    } catch (err) {
      setAlertModal({ show: true, title: "Protegido", message: "Este ítem tiene pedidos asociados y no puede eliminarse. Mejor ocúltalo de la tienda." });
    }
  };

  const toggleVisibilidad = async (item) => {
    try {
      const endpoint = activeTab === 'individuales' ? `/cookies/${item.id}` : `/packs/${item.id}`;
      const body = activeTab === 'individuales' 
        ? { ...item, activo: !item.activo }
        : { ...item, activo: !item.activo, galletasIds: item.galletas ? item.galletas.map(g => g.id) : [] };

      await api.put(endpoint, body);
      cargarDatos();
    } catch (err) { 
      setAlertModal({ show: true, title: "Error", message: "No se pudo actualizar el estado." });
    }
  };
  
  if (loading) {
    return <LoadingSpinner mensaje="Cargando catálogo..." />;
  }

  return (
    <div className="animate-in relative font-sans px-2"> 
      {/* HEADER CON TABS */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-4 tracking-tighter transition-colors">
              Catálogo de Productos
            </h2>
            <div className="flex bg-flavis-blue/5 dark:bg-white/5 p-1 rounded-2xl w-max">
              <button 
                onClick={() => { setActiveTab('individuales'); setShowForm(false); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'individuales' ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-md' : 'text-flavis-blue/40 dark:text-white/40 hover:text-flavis-blue dark:hover:text-white'}`}
              >
                Individuales
              </button>
              <button 
                onClick={() => { setActiveTab('packs'); setShowForm(false); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'packs' ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-md' : 'text-flavis-blue/40 dark:text-white/40 hover:text-flavis-blue dark:hover:text-white'}`}
              >
                Packs / Cajas
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-64">
              <input 
                type="text" placeholder="Buscar producto..." 
                className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/5 p-3 pr-10 rounded-xl outline-none focus:border-flavis-gold font-bold text-xs transition-colors text-flavis-blue dark:text-white shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
            </div>
            <button 
              onClick={() => showForm ? cerrarFormulario() : setShowForm(true)}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all ${showForm ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' : 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark'}`}
            >
              {showForm ? '✕ Cancelar' : activeTab === 'individuales' ? '+ Nueva Galleta' : '+ Nuevo Pack'}
            </button>
          </div>
        </div>
      </header>

      {/* FORMULARIO DESPLEGABLE */}
      {showForm && (
        <div className="bg-white dark:bg-flavis-card-dark p-8 md:p-12 rounded-[3rem] border border-flavis-blue/5 dark:border-white/5 mb-12 max-w-5xl mx-auto animate-in slide-in-from-top-4 shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="border-b border-flavis-blue/5 dark:border-white/5 pb-6">
                <h3 className="text-2xl font-main font-black text-flavis-blue dark:text-white italic tracking-tighter">
                {editingId ? 'Editando Registro' : 'Nuevo Registro'}
                </h3>
                <p className="text-[10px] uppercase font-bold text-flavis-blue/40 dark:text-white/30 tracking-widest mt-1">
                    {activeTab === 'individuales' ? 'Galleta Individual' : 'Pack / Caja Múltiple'}
                </p>
            </div>
            
            {/* SECCIÓN 1: DATOS BÁSICOS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <label className="block text-[9px] uppercase font-black opacity-40 mb-2 ml-2 tracking-widest text-flavis-blue dark:text-white">Nombre del Producto</label>
                  <input required type="text" className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border-none p-4 rounded-2xl text-sm font-bold text-flavis-blue dark:text-white focus:ring-2 ring-flavis-gold/20 outline-none transition-all shadow-inner" 
                    value={activeTab === 'individuales' ? newCookie.nombre : newPack.nombre} 
                    onChange={e => activeTab === 'individuales' ? setNewCookie({...newCookie, nombre: e.target.value}) : setNewPack({...newPack, nombre: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-[9px] uppercase font-black opacity-40 mb-2 ml-2 tracking-widest text-flavis-blue dark:text-white">Costo (S/)</label>
                    <input required type="number" step="0.10" min="0" className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border-none p-4 rounded-2xl text-sm font-bold text-flavis-blue dark:text-white focus:ring-2 ring-flavis-gold/20 outline-none transition-all shadow-inner"
                        value={activeTab === 'individuales' ? newCookie.costoProduccion : newPack.costoProduccion} 
                        onChange={e => activeTab === 'individuales' ? setNewCookie({...newCookie, costoProduccion: e.target.value}) : setNewPack({...newPack, costoProduccion: e.target.value})} 
                    />
                    </div>
                    <div>
                    <label className="block text-[9px] uppercase font-black opacity-40 mb-2 ml-2 tracking-widest text-flavis-blue dark:text-white">Precio Público (S/)</label>
                    <input required type="number" step="0.10" min="0" className="w-full bg-flavis-gold/10 dark:bg-flavis-gold/5 border-2 border-flavis-gold/20 p-4 rounded-2xl text-sm font-black text-flavis-gold focus:ring-2 ring-flavis-gold/40 outline-none transition-all"
                        value={activeTab === 'individuales' ? newCookie.precio : newPack.precio} 
                        onChange={e => activeTab === 'individuales' ? setNewCookie({...newCookie, precio: e.target.value}) : setNewPack({...newPack, precio: e.target.value})} 
                    />
                    </div>
                </div>
              </div>

              <div className="md:col-span-5">
                <label className="block text-[9px] uppercase font-black opacity-40 mb-2 ml-2 tracking-widest text-flavis-blue dark:text-white">Descripción breve</label>
                <textarea 
                  placeholder="Ej: Masa de vainilla con chispas de chocolate..."
                  className="w-full h-[calc(100%-24px)] bg-flavis-blue/5 dark:bg-flavis-dark border-none p-5 rounded-3xl text-sm font-bold text-flavis-blue dark:text-white resize-none focus:ring-2 ring-flavis-gold/20 outline-none transition-all shadow-inner"
                  value={activeTab === 'individuales' ? newCookie.descripcion : newPack.descripcion}
                  onChange={e => activeTab === 'individuales' 
                    ? setNewCookie({...newCookie, descripcion: e.target.value}) 
                    : setNewPack({...newPack, descripcion: e.target.value})}
                />
              </div>
            </div>

            {/* SECCIÓN 2: LÓGICA DE SELECCIÓN (ACTUALIZADA) */}
            {activeTab === 'packs' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-7 bg-flavis-blue/5 dark:bg-flavis-dark p-6 rounded-[2.5rem] border border-flavis-blue/5 dark:border-white/5">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <label className="block text-[10px] uppercase font-black opacity-70 tracking-widest text-flavis-blue dark:text-white">
                      Catálogo de Sabores
                    </label>
                    <span className="bg-flavis-gold text-flavis-blue px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm">
                      Total: {newPack.galletasIds.length} galletas
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                    {cookies.map(c => {
                      const count = getCountForFlavor(c.id);
                      return (
                        <div key={c.id} className="bg-white dark:bg-white/5 p-3 rounded-2xl flex items-center justify-between border border-transparent hover:border-flavis-gold/30 transition-all group">
                          <span className="text-[10px] font-bold uppercase truncate pr-2 text-flavis-blue dark:text-white/80 group-hover:text-flavis-gold transition-colors">
                            {c.nombre}
                          </span>
                          
                          <div className="flex items-center gap-3 bg-flavis-blue/5 dark:bg-flavis-dark px-2 py-1 rounded-xl">
                            <button 
                              type="button" 
                              onClick={() => handleUpdateQuantity(c.id, -1)}
                              className="w-6 h-6 flex items-center justify-center text-flavis-blue/40 hover:text-red-500 transition-colors disabled:opacity-10"
                              disabled={count === 0}
                            >
                              <Icons.Minus />
                            </button>
                            <span className="text-xs font-black text-flavis-blue dark:text-white min-w-[15px] text-center">
                              {count}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => handleUpdateQuantity(c.id, 1)}
                              className="w-6 h-6 flex items-center justify-center text-flavis-blue/40 hover:text-green-500 transition-colors"
                            >
                              <Icons.Plus />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-5 bg-flavis-gold/5 rounded-[2.5rem] p-6 border border-flavis-gold/20 self-stretch flex flex-col min-h-[300px]">
                  <p className="text-[10px] font-black uppercase text-flavis-gold mb-6 tracking-widest text-center">Contenido del Pack</p>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {/* Agrupamos visualmente los IDs únicos para mostrar "Sabor x Cantidad" */}
                    {[...new Set(newPack.galletasIds)].map(id => {
                      const g = cookies.find(c => c.id === id);
                      const qty = getCountForFlavor(id);
                      return g ? (
                        <div key={id} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-flavis-gold/10 animate-in fade-in">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-2 h-2 rounded-full bg-flavis-gold shadow-[0_0_8px_rgba(184,153,90,0.8)]"></div>
                            <span className="text-[10px] font-black text-flavis-blue dark:text-white/90 uppercase truncate">{g.nombre}</span>
                          </div>
                          <span className="bg-flavis-gold text-flavis-blue px-3 py-1 rounded-lg font-black text-[10px]">x{qty}</span>
                        </div>
                      ) : null;
                    })}
                    
                    {newPack.galletasIds.length === 0 && (
                      <div className="h-full flex items-center justify-center flex-col opacity-30 gap-4 mt-10">
                        <Icons.ImagePlaceholder />
                        <p className="text-[9px] text-center italic font-bold uppercase tracking-widest">
                          Usa los botones para añadir galletas al pack
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 3: IMAGEN Y BOTONES DE ACCIÓN */}
            <div className="pt-8 border-t border-flavis-blue/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-24 h-24 bg-flavis-blue/5 dark:bg-flavis-dark rounded-3xl border-2 border-dashed border-flavis-blue/20 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                    {(activeTab === 'individuales' ? newCookie.imagenUrl : newPack.imagenUrl) ? (
                        <img src={activeTab === 'individuales' ? newCookie.imagenUrl : newPack.imagenUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : <Icons.ImagePlaceholder />}
                    </div>
                    <div className="space-y-2">
                        <label className="cursor-pointer inline-flex items-center bg-flavis-blue/5 dark:bg-white/5 text-flavis-blue dark:text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-flavis-blue/10 dark:hover:bg-white/10 transition-colors">
                            Subir Foto
                            <input type="file" onChange={(e) => handleImageUpload(e, activeTab === 'individuales' ? 'cookie' : 'pack')} className="hidden" accept="image/*" />
                        </label>
                        {uploadingImg ? (
                            <p className="text-[9px] font-bold text-flavis-gold animate-pulse">Cargando imagen...</p>
                        ) : (
                            <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">JPG/PNG. Máx 5MB.</p>
                        )}
                    </div>
                </div>

                <div className="flex w-full md:w-auto gap-4">
                    {editingId && (
                        <button 
                            type="button" 
                            onClick={() => setConfirmModal({show: true, id: editingId, type: activeTab === 'individuales' ? 'cookie' : 'pack'})}
                            className="px-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-500 hover:text-white transition-colors"
                        >
                            Eliminar
                        </button>
                    )}
                    <button disabled={loading || uploadingImg} type="submit" className="flex-1 md:flex-none px-10 py-4 bg-flavis-gold text-flavis-blue rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Confirmar Creación'}
                    </button>
                </div>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE TARJETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map(item => {
          const costo = item.costoProduccion || 0;
          const margen = item.precio - costo;
          
          return (
          <div key={item.id} className={`relative bg-white dark:bg-flavis-card-dark p-6 rounded-[2.5rem] border border-flavis-blue/5 dark:border-white/5 hover:shadow-xl transition-all duration-300 group shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none ${!item.activo ? 'opacity-70 grayscale-[0.3]' : ''}`}>
            
            <button 
                onClick={() => prepararEdicion(item)} 
                className="absolute top-8 right-8 z-10 bg-white/90 dark:bg-flavis-dark/90 backdrop-blur-sm p-3 rounded-xl shadow-lg text-flavis-blue dark:text-white opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:text-flavis-gold dark:hover:text-flavis-gold flex items-center justify-center"
                title="Editar producto"
            >
                <Icons.Edit />
            </button>

            {activeTab === 'packs' && (
              <div className="absolute top-8 left-8 z-10 bg-flavis-gold text-flavis-blue text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-md">
                Pack x{item.galletas?.length || 0}
              </div>
            )}

            <div className="w-full h-48 bg-flavis-blue/5 dark:bg-flavis-dark rounded-[1.5rem] mb-5 overflow-hidden">
              <img src={item.imagenUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.nombre} />
            </div>

            <div className="flex flex-col gap-1 mb-5">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-sans font-black text-base text-flavis-blue dark:text-white uppercase tracking-tight leading-tight">{item.nombre}</h3>
                <p className="text-flavis-gold font-black font-sans text-xl tracking-tighter whitespace-nowrap">S/ {item.precio.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold text-flavis-blue/50 dark:text-white/40 uppercase tracking-widest bg-flavis-blue/5 dark:bg-white/5 px-2 py-1 rounded-md">
                  Costo: S/ {costo.toFixed(2)}
                </span>
                <span className="text-[9px] font-black text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 uppercase tracking-widest px-2 py-1 rounded-md">
                  Margen: S/ {margen.toFixed(2)}
                </span>
              </div>
            </div>

            <button 
                onClick={() => toggleVisibilidad(item)} 
                className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${
                    item.activo 
                    ? 'bg-flavis-blue/5 dark:bg-white/5 text-flavis-blue dark:text-white/80 hover:bg-flavis-blue/10 dark:hover:bg-white/10' 
                    : 'bg-flavis-gold text-flavis-blue hover:brightness-110'
                }`}
            >
              {item.activo ? <><Icons.EyeOff /> Ocultar de Tienda</> : <><Icons.Eye /> Mostrar en Tienda</>}
            </button>
          </div>
        )})}
      </div>

      {/* PAGINACIÓN */}
      {!showForm && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 pb-10">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 text-flavis-blue/40 disabled:opacity-10 font-bold font-sans">« Atrás</button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-full font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-white/5 text-flavis-blue/70 border border-flavis-blue/5 font-sans'}`}>{i + 1}</button>
            ))}
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 text-flavis-blue/40 disabled:opacity-10 font-bold font-sans">Sig. »</button>
        </div>
      )}

      {/* MODALES DE ALERTA Y CONFIRMACIÓN */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#eef1e6] dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-red-500 animate-in zoom-in">
            <div className="flex justify-center mb-6">
              <Icons.Warning />
            </div>
            <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-4 italic tracking-tighter">¿Borrar del registro?</h2>
            <p className="text-sm text-flavis-blue/70 dark:text-white/60 mb-8 font-bold">Esta acción no se puede deshacer.</p>
            <div className="flex flex-col gap-3 font-bold">
              <button onClick={ejecutarEliminar} className="w-full bg-red-500 text-white py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-lg">Sí, Eliminar</button>
              <button onClick={() => setConfirmModal({show: false, id: null})} className="w-full py-3 text-flavis-blue/50 dark:text-white/40 uppercase tracking-widest text-[9px]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {alertModal.show && (
        <div className="fixed inset-0 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-flavis-gold animate-in zoom-in">
            <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-4 italic tracking-tighter">{alertModal.title}</h2>
            <p className="text-sm text-gray-600 dark:text-white/70 mb-8 font-bold leading-relaxed">{alertModal.message}</p>
            <button onClick={() => setAlertModal({show: false, message: '', title: ''})} className="w-full bg-flavis-gold text-flavis-blue py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookiesModule;