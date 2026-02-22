import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

// --- ICONOS VECTORIALES (REEMPLAZO DE EMOJIS) ---
const Icons = {
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Delete: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Insumos: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>,
  Publicidad: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  Logistica: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="2" y="4" rx="2"/><path d="M2 8h16"/><path d="M2 16h16"/><path d="M22 8v8"/></svg>,
  Servicios: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Otros: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
};

const EgresosModule = () => {
    const [egresos, setEgresos] = useState([]);
    const [allPreventas, setAllPreventas] = useState([]); 
    const [selectedPreVentaId, setSelectedPreVentaId] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [formData, setFormData] = useState({
        monto: '',
        descripcion: '',
        categoria: 'INSUMOS'
    });

    const categorias = [
        { id: 'INSUMOS', label: 'Insumos', icon: <Icons.Insumos />},
        { id: 'PUBLICIDAD', label: 'Publicidad', icon: <Icons.Publicidad /> },
        { id: 'LOGISTICA', label: 'Logística', icon: <Icons.Logistica />},
        { id: 'SERVICIOS', label: 'Servicios', icon: <Icons.Servicios /> },
        { id: 'OTROS', label: 'Otros Gastos', icon: <Icons.Otros /> }
    ];

    useEffect(() => { 
        fetchInitialData(); 
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const pvRes = await api.get('/preventas');
            
            if (pvRes.data && pvRes.data.length > 0) {
                const sortedPVs = pvRes.data.sort((a, b) => b.id - a.id);
                setAllPreventas(sortedPVs);
                
                const activa = sortedPVs.find(pv => pv.activo);
                const defaultId = activa ? activa.id : sortedPVs[0].id;
                
                setSelectedPreVentaId(defaultId);
                fetchEgresos(defaultId);
            } else {
                 setLoading(false);
            }
        } catch (err) { 
            console.error("Error cargando datos iniciales:", err);
            setLoading(false);
        }
    };

    const fetchEgresos = async (preVentaId) => {
        try {
            setLoading(true);
            const res = await api.get(`/egresos/preventa/${preVentaId}`);
            setEgresos(res.data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error cargando egresos:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreVentaChange = (e) => {
        const id = e.target.value;
        setSelectedPreVentaId(id);
        fetchEgresos(id);
        setShowForm(false); // Cerramos el form si cambia de campaña para evitar confusiones
    };

    const handleEdit = (egreso) => {
        setFormData({
            monto: egreso.monto,
            descripcion: egreso.descripcion,
            categoria: egreso.categoria
        });
        setEditingId(egreso.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Tomamos el ID de la campaña que está viendo actualmente (selectedPreVentaId)
            const payload = { 
                ...formData, 
                monto: parseFloat(formData.monto),
                preVentaId: parseInt(selectedPreVentaId) 
            };

            if (editingId) {
                await api.put(`/egresos/${editingId}`, payload);
            } else {
                await api.post('/egresos', payload);
            }

            setFormData({ monto: '', descripcion: '', categoria: 'INSUMOS' });
            setShowForm(false);
            setEditingId(null);
            fetchEgresos(selectedPreVentaId);

        } catch (err) { 
            alert(err.response?.data || "Error al procesar el registro"); 
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/egresos/${deleteConfirmId}`);
            setDeleteConfirmId(null);
            fetchEgresos(selectedPreVentaId);
        } catch (err) { alert("No se pudo eliminar"); }
    };

    const totalGeneral = egresos.reduce((acc, curr) => acc + curr.monto, 0);

    const sortedEgresos = [...egresos].sort((a, b) => b.id - a.id);
    const totalPages = Math.ceil(sortedEgresos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentEgresos = sortedEgresos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (loading) return <LoadingSpinner mensaje="Contabilizando gastos..." />;

    return (
        <div className="animate-in pb-20 font-sans px-2">
            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
                <div>
                    <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic tracking-tighter transition-colors">Egresos</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest">
                            Mostrando campaña:
                        </p>
                        <select 
                            className="bg-flavis-blue/5 dark:bg-white/5 border-none p-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-flavis-blue dark:text-white outline-none cursor-pointer"
                            value={selectedPreVentaId}
                            onChange={handlePreVentaChange}
                        >
                            {allPreventas.map(pv => (
                                <option key={pv.id} value={pv.id}>
                                    {pv.nombreCampania} {!pv.activo && '(Cerrada)'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {allPreventas.length > 0 && (
                    <button 
                        onClick={() => {
                            setShowForm(!showForm);
                            if (!showForm) {
                                setEditingId(null);
                                setFormData({ monto: '', descripcion: '', categoria: 'INSUMOS' });
                            }
                        }}
                        className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all ${showForm ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:text-red-400' : 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-blue hover:scale-105 active:scale-95'}`}
                    >
                        {showForm ? '✕ Cancelar' : '+ Agregar Gasto'}
                    </button>
                )}
            </header>

            {/* --- CARDS DE RESUMEN (LAYOUT 30/70) --- */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                <div className="w-full lg:w-[30%] bg-white dark:bg-flavis-card-dark p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-blue/5 dark:border-white/5 transition-colors flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-[0.2em] mb-2">Inversión Total</p>
                    <p className="text-4xl font-black text-red-500/80 dark:text-red-400 tracking-tighter leading-none font-sans">
                        S/ {totalGeneral.toFixed(2)}
                    </p>
                </div>
                
                <div className="w-full lg:w-[70%] bg-white dark:bg-flavis-card-dark p-6 rounded-[2rem] border border-flavis-blue/5 dark:border-white/5 shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none transition-colors flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-[0.2em] mb-3">Desglose de Gastos</p>
                    <div className="flex flex-wrap gap-2">
                        {categorias.map(cat => {
                            const montoCat = egresos.filter(e => e.categoria === cat.id).reduce((a, b) => a + b.monto, 0);
                            if (montoCat > 0) {
                                return (
                                    <div key={cat.id} className="bg-flavis-blue/5 dark:bg-white/5 border border-transparent px-4 py-2 rounded-xl flex items-center gap-2">
                                        <span className="text-flavis-blue/50 dark:text-white/50">{cat.icon}</span>
                                        <span className="text-[9px] font-black text-flavis-blue dark:text-white uppercase tracking-wider">{cat.label}</span>
                                        <span className="text-[11px] font-bold text-flavis-gold ml-1">S/ {montoCat.toFixed(2)}</span>
                                    </div>
                                );
                            }
                            return null;
                        })}
                        {totalGeneral === 0 && <p className="text-[10px] font-bold text-flavis-blue/30 dark:text-white/20 italic py-1 uppercase tracking-widest">Sin gastos registrados en esta campaña</p>}
                    </div>
                </div>
            </div>

            {/* --- FORMULARIO INLINE COMPACTO --- */}
            {showForm && (
                <div className="mb-6 bg-white dark:bg-flavis-card-dark p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-gold/30 animate-in slide-in-from-top-4">
                    <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-4 items-end">
                        
                        <div className="w-full lg:w-32">
                            <label className="block ml-2 mb-1.5 text-[9px] font-black uppercase tracking-widest text-flavis-blue/50 dark:text-white/50">Monto</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-flavis-blue/40">S/</span>
                                <input required type="number" step="0.10" min="0.00" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})}
                                    className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border-none py-3 pl-8 pr-3 rounded-xl text-xs font-bold text-flavis-blue dark:text-white outline-none transition-all shadow-inner focus:ring-2 ring-flavis-gold/20" />
                            </div>
                        </div>

                        <div className="w-full lg:w-48">
                            <label className="block ml-2 mb-1.5 text-[9px] font-black uppercase tracking-widest text-flavis-blue/50 dark:text-white/50">Categoría</label>
                            <select className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border-none py-3 px-4 rounded-xl text-xs font-bold text-flavis-blue dark:text-white outline-none cursor-pointer shadow-inner appearance-none"
                                value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                            </select>
                        </div>

                        <div className="w-full flex-1">
                            <label className="block ml-2 mb-1.5 text-[9px] font-black uppercase tracking-widest text-flavis-blue/50 dark:text-white/50">Concepto / Descripción</label>
                            <input required type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}
                                className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border-none py-3 px-4 rounded-xl text-xs font-bold text-flavis-blue dark:text-white outline-none transition-all shadow-inner focus:ring-2 ring-flavis-gold/20" placeholder="Ej: Cajas para envíos" />
                        </div>

                        <div className="w-full lg:w-auto">
                            <button type="submit" className="w-full bg-flavis-gold text-flavis-blue py-3 px-8 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-md hover:brightness-110 active:scale-95 transition-all h-[40px]">
                                {editingId ? 'Guardar' : 'Registrar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- TABLA COMPACTA DE REGISTROS --- */}
            <div className="bg-white dark:bg-flavis-card-dark rounded-[2rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-blue/5 dark:border-white/5 transition-colors overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="text-[9px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-[0.2em] font-sans border-b border-flavis-blue/5 dark:border-white/5 bg-gray-50/50 dark:bg-transparent">
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Concepto / Descripción</th>
                                <th className="px-6 py-4 text-right">Inversión</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="font-sans divide-y divide-flavis-blue/5 dark:divide-white/5">
                            {currentEgresos.map((e) => {
                                const categoriaObj = categorias.find(c => c.id === e.categoria) || categorias[4];
                                return (
                                    <tr key={e.id} className="hover:bg-flavis-blue/5 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-flavis-blue/60 dark:text-white/60 flex items-center gap-2 w-max">
                                                {categoriaObj.icon} {categoriaObj.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-flavis-blue dark:text-white/90 truncate max-w-[250px]">
                                            {e.descripcion}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-red-500/80 dark:text-red-400 text-sm">
                                            S/ {e.monto.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(e)} className="w-8 h-8 flex items-center justify-center bg-flavis-blue/5 dark:bg-white/10 text-flavis-blue dark:text-white rounded-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all shadow-sm">
                                                    <Icons.Edit />
                                                </button>
                                                <button onClick={() => setDeleteConfirmId(e.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                    <Icons.Delete />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {egresos.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-[10px] uppercase font-black text-flavis-blue/30 dark:text-white/20 tracking-widest">
                                        Sin gastos registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PAGINACIÓN --- */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentPage(i + 1)} 
                            className={`w-8 h-8 rounded-full font-black text-[10px] transition-all ${currentPage === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-flavis-card-dark text-flavis-blue/40 dark:text-white/30 border border-flavis-blue/5 dark:border-white/5'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* --- MODAL DE ELIMINACIÓN --- */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-md z-[700] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-red-500 animate-in zoom-in duration-300">
                        <div className="flex justify-center mb-6">
                            <Icons.Warning />
                        </div>
                        <h3 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-2 italic tracking-tighter">¿Eliminar gasto?</h3>
                        <p className="text-sm text-flavis-blue/60 dark:text-white/50 mb-8 font-bold">Esta acción no se puede deshacer y afectará el cálculo de tu Utilidad Real.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-red-600 transition-colors">Sí, Eliminar</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="w-full py-3 text-flavis-blue/40 dark:text-white/30 font-bold uppercase text-[9px] tracking-widest hover:text-flavis-blue dark:hover:text-white transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EgresosModule;