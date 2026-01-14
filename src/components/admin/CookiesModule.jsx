import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CookiesModule = () => {
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // ESTADO PARA BUSCADOR
  const [searchTerm, setSearchTerm] = useState("");
  
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: '' });

  const [newCookie, setNewCookie] = useState({
    nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true
  });
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => { cargarCookies(); }, []);

  const cargarCookies = async () => {
    try {
      const res = await api.get('/cookies');
      setCookies(res.data);
    } catch (err) { console.error("Error al cargar galletas", err); }
  };

  // Lógica de métrica
  const activeCookiesCount = cookies.filter(c => c.activo).length;

  // Lógica de filtrado por buscador
  const filteredCookies = cookies.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const solicitarEliminacion = (id) => {
    setConfirmModal({ show: true, id });
  };

  const ejecutarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ show: false, id: null });
    try {
      await api.delete(`/cookies/${id}`);
      cargarCookies();
      setAlertModal({ show: true, title: "¡Éxito!", message: "La galleta ha sido eliminada del sistema." });
    } catch (err) {
      setAlertModal({ 
        show: true, 
        title: "No se puede eliminar", 
        message: "Esta galleta ya tiene pedidos asociados. Por seguridad, te recomendamos usar la opción 'Ocultar' en lugar de borrarla." 
      });
    }
  };

  const prepararEdicion = (cookie) => {
    setNewCookie({ ...cookie, descripcion: cookie.descripcion || '' });
    setEditingId(cookie.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setEditingId(null);
    setNewCookie({ nombre: '', descripcion: '', precio: '', imagenUrl: '', activo: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const precioNum = parseFloat(newCookie.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setAlertModal({ 
        show: true, 
        title: "Precio Inválido", 
        message: "Por favor, ingresa un precio válido y mayor a cero." 
      });
      return;
    }

    const centavosTotales = Math.round(precioNum * 100);
    if (centavosTotales % 10 !== 0) {
      setAlertModal({ 
        show: true, 
        title: "Formato de Precio", 
        message: "Los céntimos deben ser en escalas de 10 (ej: .10, .20, .50). No se permiten valores como .23 o .29." 
      });
      return;
    }
    
    try {
      setLoading(true);
      if (editingId) await api.put(`/cookies/${editingId}`, newCookie);
      else await api.post('/cookies', newCookie);
      cerrarFormulario();
      cargarCookies();
    } catch (err) {
      setAlertModal({ show: true, title: "Error", message: "Hubo un problema al guardar los datos." });
    } finally { setLoading(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('multipartFile', file);
    try {
      setUploadingImg(true);
      const res = await api.post('/cookies/upload', data);
      setNewCookie({ ...newCookie, imagenUrl: res.data.url });
    } catch (err) {
        setAlertModal({ show: true, title: "Error de Carga", message: "No se pudo subir la imagen." });
    } finally { setUploadingImg(false); }
  };

  const toggleVisibilidad = async (cookie) => {
    try {
      await api.put(`/cookies/${cookie.id}`, { ...cookie, activo: !cookie.activo });
      cargarCookies();
    } catch (err) { 
        setAlertModal({ show: true, title: "Error", message: "No se pudo cambiar el estado de visibilidad." });
    }
  };

  return (
    <div className="animate-in relative font-sans"> 
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-2 tracking-tighter transition-colors">Catálogo de Galletas</h2>
          <button 
            onClick={() => showForm ? cerrarFormulario() : setShowForm(true)}
            className="bg-[#326371] dark:bg-flavis-gold text-white dark:text-flavis-dark px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
          >
            {showForm ? 'Cerrar' : '+ Nueva Galleta'}
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Buscar galleta por nombre..."
            className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/10 p-4 pr-12 rounded-2xl outline-none focus:border-flavis-gold transition-all text-flavis-blue dark:text-white placeholder-flavis-blue/40 dark:placeholder-white/20 font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 dark:opacity-40">🔍</span>
        </div>
      </header>

      {!showForm && (
        <div className="mb-10 max-w-xs">
          <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[2.5rem] shadow-sm border border-flavis-blue/5 dark:border-white/5 transition-colors">
            <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-2 font-sans">Galletas Activas</p>
            <p className="text-5xl font-black text-flavis-blue dark:text-white tracking-tighter">
              {activeCookiesCount.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] shadow-xl border border-[#326371]/5 dark:border-white/5 mb-12 max-w-2xl animate-in transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic">{editingId ? 'Editando Galleta' : 'Nueva Galleta'}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60">Nombre</label>
                <input required type="text" placeholder="Ej: Choco Chips" className="w-full bg-[#f8f9f5] dark:bg-flavis-dark border border-[#326371]/10 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-flavis-gold transition-all text-flavis-blue dark:text-white placeholder-flavis-blue/40 dark:placeholder-white/10 font-bold" 
                  value={newCookie.nombre} onChange={e => setNewCookie({...newCookie, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60">Precio (S/)</label>
                <input 
                    required 
                    type="number" 
                    step="0.10" 
                    placeholder="0.00" 
                    className="w-full bg-[#f8f9f5] dark:bg-flavis-dark border border-[#326371]/10 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-flavis-gold transition-all text-flavis-blue dark:text-white placeholder-flavis-blue/40 dark:placeholder-white/10 font-bold"
                    value={newCookie.precio} 
                    onChange={e => setNewCookie({...newCookie, precio: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-2">
                <input type="checkbox" id="activo" checked={newCookie.activo} onChange={(e) => setNewCookie({...newCookie, activo: e.target.checked})} className="w-5 h-5 accent-[#326371] dark:accent-flavis-gold cursor-pointer"/>
                <label htmlFor="activo" className="text-sm font-bold text-flavis-blue dark:text-white/80 cursor-pointer">Mostrar en formulario</label>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60">Descripción</label>
              <textarea placeholder="Ingresa una descripción..." className="w-full bg-[#f8f9f5] dark:bg-flavis-dark border border-[#326371]/10 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-flavis-gold transition-all h-24 text-flavis-blue dark:text-white placeholder-flavis-blue/40 dark:placeholder-white/10 font-bold resize-none"
                value={newCookie.descripcion} onChange={e => setNewCookie({...newCookie, descripcion: e.target.value})}></textarea>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60">Imagen</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-[#f8f9f5] dark:bg-flavis-dark rounded-2xl border-2 border-dashed border-[#326371]/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                  {newCookie.imagenUrl ? <img src={newCookie.imagenUrl} className="w-full h-full object-cover" alt="Preview" /> : <span className="text-2xl">📸</span>}
                </div>
                <label className="cursor-pointer bg-[#326371]/10 dark:bg-white/5 hover:bg-[#326371]/20 dark:hover:bg-white/10 text-[#326371] dark:text-white/60 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                  Subir Foto
                  <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                </label>
                {uploadingImg && <span className="text-[10px] font-bold animate-pulse text-flavis-gold uppercase">Subiendo...</span>}
              </div>
            </div>

            <button disabled={loading || uploadingImg} type="submit" className="w-full bg-flavis-gold text-flavis-blue py-4 rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-md disabled:opacity-50">
              {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Publicar en Catálogo'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCookies.map(cookie => (
          <div key={cookie.id} className={`bg-white dark:bg-flavis-card-dark p-6 rounded-[2.5rem] border border-[#326371]/5 dark:border-white/5 shadow-sm transition-all group ${!cookie.activo ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="w-full h-48 bg-[#f8f9f5] dark:bg-flavis-dark rounded-[2rem] mb-6 overflow-hidden relative transition-colors">
              <img src={cookie.imagenUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cookie.nombre} />
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-main font-bold text-xl text-flavis-blue dark:text-white italic transition-colors">{cookie.nombre}</h3>
              <p className="text-flavis-gold font-bold transition-colors">S/ {cookie.precio.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-2 mt-4 font-sans">
                <div className="flex gap-2">
                    <button onClick={() => prepararEdicion(cookie)} className="flex-1 py-2 bg-[#326371]/10 dark:bg-white/5 text-[#326371] dark:text-white/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:dark:bg-white/10 transition-colors">Editar</button>
                    <button onClick={() => toggleVisibilidad(cookie)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${cookie.activo ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                        {cookie.activo ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>
                <button onClick={() => solicitarEliminacion(cookie.id)} className="w-full py-2 bg-red-50 dark:bg-red-900/10 text-red-400 dark:text-red-400/80 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-all">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 dark:bg-flavis-dark/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#eef1e6] dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl animate-in font-sans transition-colors border border-transparent dark:border-white/5">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">⚠️</div>
            <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-4 italic">¿Estás segura?</h2>
            <p className="text-sm text-flavis-blue/70 dark:text-white/60 mb-8 font-sans transition-colors">Esta acción eliminará la galleta permanentemente del catálogo.</p>
            <div className="flex gap-3 font-bold">
              <button onClick={() => setConfirmModal({show: false, id: null})} className="flex-1 py-3 text-flavis-blue dark:text-white/40 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
              <button onClick={ejecutarEliminar} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {alertModal.show && (
        <div className="fixed inset-0 bg-black/60 dark:bg-flavis-dark/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-flavis-gold animate-in font-sans transition-colors">
            <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-2 italic transition-colors">{alertModal.title}</h2>
            <p className="text-sm text-gray-600 dark:text-white/60 mb-8 font-sans leading-relaxed font-bold transition-colors">{alertModal.message}</p>
            <button onClick={() => setAlertModal({show: false, message: '', title: ''})} className="bg-[#326371] dark:bg-flavis-gold text-white dark:text-flavis-dark px-10 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest transition-colors">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookiesModule;