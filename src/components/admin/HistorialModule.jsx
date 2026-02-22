import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
registerLocale('es', es);

// --- ICONOS VECTORIALES COMPARTIDOS ---
const Icons = {
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
};

// --- MODAL 1: DETALLE DE GALLETAS ---
const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const costoEnvio = order.costoEnvio || 0;
  const subtotalProductos = order.montoTotal - costoEnvio; 

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-sm animate-in" onClick={onClose}>
      <div className="bg-[#eef1e6] dark:bg-flavis-card-dark w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/20 dark:border-white/5" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-flavis-blue/40 dark:text-white/40 hover:text-flavis-blue dark:hover:text-white transition-colors">
          <Icons.Close />
        </button>
        
        <h3 className="text-xl font-sans font-black text-flavis-blue dark:text-white uppercase tracking-tight mb-6 border-b border-flavis-blue/10 dark:border-white/10 pb-4">
          Detalle del Pedido
        </h3>

        <div className="space-y-6 font-secondary text-flavis-blue dark:text-white/90">
          <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-white/40 dark:border-white/5">
            <p className="text-[10px] uppercase font-black opacity-70 tracking-widest mb-3">
              Productos Seleccionados
            </p>
            
            <div className="space-y-3">
              {order.detalles.map((det, idx) => {
                let nombreItem = "Producto Desconocido";
                if (det.pack) {
                  nombreItem = `📦 Pack: ${det.pack.nombre}`;
                } else if (det.cookie) {
                  nombreItem = det.cookie.nombre;
                } else {
                  nombreItem = det.esPack ? "📦 Pack Especial" : "Galleta Individual";
                }

                return (
                  <div key={idx} className="flex justify-between items-center border-b border-flavis-blue/5 dark:border-white/5 pb-2">
                    <span className="font-bold text-sm">
                      <span className="text-flavis-gold font-sans">{det.cantidad}x</span> {nombreItem}
                    </span>
                    <span className="text-xs opacity-60 font-sans">
                      S/ {(det.precioUnitario * det.cantidad).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-flavis-blue/10 dark:border-white/10 space-y-2">
              <div className="flex justify-between text-[11px] opacity-60 uppercase font-black">
                <span>Subtotal Productos</span>
                <span className="font-sans">S/ {subtotalProductos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span className={order.tipoEntrega === 'DELIVERY' ? 'text-blue-500' : 'text-flavis-blue dark:text-white/80'}>
                  Envío ({order.tipoEntrega === 'DELIVERY' ? '🛵 Delivery' : '🏠 Recojo'})
                </span>
                <span className="font-sans">S/ {costoEnvio.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-xs uppercase tracking-widest opacity-40">Total Pagado</span>
                <span className="text-2xl font-black text-flavis-gold italic">
                  S/ {order.montoTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-2 space-y-2 text-[11px] font-medium opacity-70">
            <p className="flex justify-between">
              <span>Cliente:</span> 
              <span className="font-bold">{order.cliente?.nombre} {order.cliente?.apellido}</span>
            </p>
            <p className="flex justify-between">
              <span>Fecha:</span> 
              <span className="font-bold font-sans">
                {new Date(order.fechaCreacion).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-8 bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-blue py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-sans">
          Cerrar Detalle
        </button>
      </div>
    </div>
  );
};

// --- MODAL: PREVIEW DE VOUCHER ---
const VoucherPreviewModal = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-flavis-blue/95 backdrop-blur-md animate-in" onClick={onClose}>
      <div className="relative max-w-sm w-full bg-[#eef1e6] dark:bg-flavis-card-dark rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/5" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 bg-white/80 dark:bg-white/10 text-flavis-blue dark:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
            <Icons.Close />
        </button>
        <div className="p-10 pb-4">
            <h3 className="text-xl font-sans font-black text-flavis-blue dark:text-white uppercase tracking-tight">
              Comprobante
            </h3>
            <p className="text-[10px] font-sans uppercase font-bold opacity-60 text-flavis-blue dark:text-white tracking-widest mt-1">
              Vista Previa
            </p>
        </div>
        <div className="px-8 pb-10">
            <div className="rounded-[2rem] overflow-hidden border-4 border-white dark:border-white/5 shadow-inner bg-gray-200 dark:bg-flavis-dark aspect-[3/4] relative">
                <img 
                  src={imageUrl} 
                  alt="Voucher" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/400x600/326371/white?text=Imagen+No+Encontrada';
                  }}
                />
            </div>
            <div className="mt-6 space-y-3">
              <a href={imageUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full text-[10px] font-black uppercase text-flavis-blue/40 dark:text-white/40 hover:text-flavis-gold transition-colors">
                <span>🔗 Abrir original</span>
              </a>
              <button onClick={onClose} className="w-full bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-blue py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg font-sans hover:scale-[1.02] active:scale-95 transition-all">
                Cerrar
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const HistorialModule = () => {
  const [campanias, setCampanias] = useState([]);
  const [campaniaSeleccionada, setCampaniaSeleccionada] = useState(null);
  const [pedidosHistorial, setPedidosHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  // Estados de Búsqueda
  const [searchTermCampaign, setSearchTermCampaign] = useState('');
  const [searchDate, setSearchDate] = useState(null);
  const [searchTermCustomer, setSearchTermCustomer] = useState('');
  
  const [currentPageCamp, setCurrentPageCamp] = useState(1);
  const [currentPageOrders, setCurrentPageOrders] = useState(1);

  const campPerPage = 6;
  const ordersPerPage = 5;

  useEffect(() => { fetchCampanias(); }, []);

  const fetchCampanias = async () => {
    try {
        const res = await api.get('/preventas');
        const cerradas = res.data
        .filter(pv => !pv.activo)
        .sort((a, b) => b.id - a.id); 
        setCampanias(cerradas);
    } catch (err) { console.error("Error al cargar campañas", err); }
  };

  const verContenedor = async (cp) => {
    setLoading(true);
    setSearchTermCustomer('');
    setCurrentPageOrders(1);
    try {
      const res = await api.get(`/pedidos/preventa/${cp.id}`);
      setPedidosHistorial(res.data);
      setCampaniaSeleccionada(cp);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } catch (err) { console.error("Error", err); }
    finally { setLoading(false); }
  };

  // --- LÓGICA DE FILTRADO (TEXTO + FECHA) ---
  const filteredCampaigns = campanias.filter(cp => {
    const matchName = cp.nombreCampania.toLowerCase().includes(searchTermCampaign.toLowerCase());
    
    let matchDate = true;
    if (searchDate) {
      const pad = (n) => n < 10 ? '0' + n : n;
      const searchDateStr = `${searchDate.getFullYear()}-${pad(searchDate.getMonth() + 1)}-${pad(searchDate.getDate())}`;
      matchDate = cp.fechaEntrega && cp.fechaEntrega.startsWith(searchDateStr);
    }
    
    return matchName && matchDate;
  });

  const totalPagesCamp = Math.ceil(filteredCampaigns.length / campPerPage);
  const currentCampaigns = filteredCampaigns.slice((currentPageCamp - 1) * campPerPage, currentPageCamp * campPerPage);

  const validOrders = pedidosHistorial.filter(p => !p.anulado);
  const canceledCount = pedidosHistorial.filter(p => p.anulado).length;
  const filteredOrders = validOrders.filter(p => 
    `${p.cliente.nombre} ${p.cliente.apellido}`.toLowerCase().includes(searchTermCustomer.toLowerCase())
  );

  const totalPagesOrders = Math.ceil(filteredOrders.length / ordersPerPage);
  const currentOrders = filteredOrders.slice((currentPageOrders - 1) * ordersPerPage, currentPageOrders * ordersPerPage);

  return (
    <div className="animate-in pb-20 font-sans px-2">
      
      {/* MODALES SIEMPRE DISPONIBLES */}
      <OrderDetailModal order={selectedOrder} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
      <VoucherPreviewModal imageUrl={selectedVoucher} isOpen={isVoucherOpen} onClose={() => setIsVoucherOpen(false)} />

      {/* --- NIVEL 1: DIRECTORIO DE CAMPAÑAS --- */}
      {!campaniaSeleccionada && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-main font-black text-flavis-blue dark:text-white italic tracking-tighter mb-2">
                Historial de Campañas
              </h2>
              <p className="text-[10px] uppercase font-black tracking-widest text-flavis-blue/40 dark:text-white/30">
                Selecciona una campaña para auditar
              </p>
            </div>
            
            {/* BUSCADORES (TEXTO + FECHA) */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Buscador de Texto */}
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" placeholder="Buscar por nombre..." 
                  className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/5 p-4 pr-12 rounded-2xl outline-none focus:border-flavis-gold shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none transition-all font-bold text-sm text-flavis-blue dark:text-white" 
                  value={searchTermCampaign} onChange={(e) => {setSearchTermCampaign(e.target.value); setCurrentPageCamp(1);}} 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30"><Icons.Search /></span>
              </div>
              
              {/* Buscador de Fecha */}
              <div className="relative w-full sm:w-64">
                <DatePicker
                  selected={searchDate}
                  onChange={(date) => { setSearchDate(date); setCurrentPageCamp(1); }}
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                  placeholderText="Filtrar por fecha..."
                  className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/5 p-4 pr-12 rounded-2xl outline-none focus:border-flavis-gold shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none transition-all font-bold text-sm text-flavis-blue dark:text-white"
                />
                {searchDate ? (
                  <button 
                    onClick={() => { setSearchDate(null); setCurrentPageCamp(1); }} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-bold text-[10px] hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Icons.Close />
                  </button>
                ) : (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30"><Icons.Calendar /></span>
                )}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {currentCampaigns.map(cp => (
              <button 
                key={cp.id} 
                onClick={() => verContenedor(cp)} 
                className="bg-white dark:bg-flavis-card-dark p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-blue/5 dark:border-white/5 text-left group hover:-translate-y-1 hover:shadow-xl hover:border-flavis-gold dark:hover:border-flavis-gold transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-flavis-gold/10 rounded-bl-[4rem] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                <p className="text-[9px] uppercase font-black mb-2 tracking-widest text-flavis-blue/40 dark:text-white/40">
                  Contenedor Cerrado
                </p>
                <h3 className="font-main font-black text-2xl text-flavis-blue dark:text-white uppercase leading-tight mb-4 group-hover:text-flavis-gold transition-colors">
                  {cp.nombreCampania}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="bg-flavis-blue/5 dark:bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-flavis-blue/60 dark:text-white/60 font-sans flex items-center gap-2">
                    <Icons.Calendar /> {cp.fechaEntrega}
                  </span>
                </div>
              </button>
            ))}
            
            {/* MENSAJE DE VACÍO (Con texto condicional) */}
            {currentCampaigns.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/50 dark:bg-flavis-card-dark/50 border border-dashed border-flavis-blue/10 dark:border-white/5 rounded-[3rem]">
                <span className="text-4xl mb-4 opacity-20 dark:opacity-10"><Icons.Calendar /></span>
                <p className="text-flavis-blue/50 dark:text-white/40 font-bold text-xs uppercase tracking-widest text-center">
                  {searchDate 
                    ? "No hubo entregas en esta fecha" 
                    : "No se encontraron campañas"}
                </p>
                {searchDate && (
                  <button onClick={() => setSearchDate(null)} className="mt-4 text-[9px] font-black uppercase text-flavis-gold hover:underline">
                    Ver todas las fechas
                  </button>
                )}
              </div>
            )}
          </div>

          {totalPagesCamp > 1 && (
            <div className="flex justify-center items-center gap-2 pb-10">
              {[...Array(totalPagesCamp)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPageCamp(i + 1)} className={`w-10 h-10 rounded-full font-black text-xs transition-all ${currentPageCamp === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-white/5 text-flavis-blue/40 border border-flavis-blue/5 dark:border-white/5'}`}>
                    {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- NIVEL 2: VISTA DE AUDITORÍA (DRILL-DOWN) --- */}
      {campaniaSeleccionada && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          
          {/* BOTÓN VOLVER (NUEVO DISEÑO AMARILLO) */}
          <button 
            onClick={() => setCampaniaSeleccionada(null)} 
            className="mb-8 flex items-center gap-2 bg-flavis-gold text-flavis-blue px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all group w-max"
          >
            <span className="group-hover:-translate-x-1 transition-transform"><Icons.Back /></span> 
            Volver a Campañas
          </button>

          <div className="bg-white dark:bg-flavis-card-dark rounded-[3rem] p-8 md:p-10 shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-blue/5 dark:border-white/5">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-flavis-blue/40 dark:text-white/30 mb-1">
                  Auditando Registros
                </p>
                <h3 className="text-3xl font-main font-black text-flavis-blue dark:text-white italic tracking-tighter">
                  {campaniaSeleccionada.nombreCampania}
                </h3>
              </div>
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="w-full bg-flavis-blue/5 dark:bg-flavis-dark border border-transparent focus:border-flavis-gold p-4 pr-10 rounded-2xl outline-none text-xs font-bold transition-all text-flavis-blue dark:text-white shadow-inner" 
                  value={searchTermCustomer} 
                  onChange={(e) => {setSearchTermCustomer(e.target.value); setCurrentPageOrders(1);}} 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30"><Icons.Search /></span>
              </div>
            </div>

            {/* PANEL DE VERIFICACIÓN RÁPIDA (PÍLDORAS) */}
            <div className="flex flex-wrap gap-3 mb-8 border-t border-flavis-blue/5 dark:border-white/5 pt-6">
              <div className="bg-flavis-blue/5 dark:bg-white/5 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-flavis-blue/60 dark:text-white/60">
                Total Válidos: <span className="text-flavis-blue dark:text-white text-xs ml-1">{validOrders.length}</span>
              </div>
              <div className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                Guardados: <span className="text-xs ml-1">{validOrders.filter(p => p.guardarDatos).length}</span>
              </div>
              <div className="bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                Anónimos: <span className="text-xs ml-1">{validOrders.filter(p => !p.guardarDatos).length}</span>
              </div>
              {canceledCount > 0 && (
                <div className="bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                  Anulados: <span className="text-xs ml-1">{canceledCount}</span>
                </div>
              )}
            </div>

            {/* TABLA DE AUDITORÍA */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="text-[9px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-[0.2em] border-b border-flavis-blue/5 dark:border-white/5">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4 text-center">Entrega</th>
                    <th className="px-6 py-4">Fecha Pedido</th>
                    <th className="px-6 py-4 text-center">Total</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-flavis-blue/5 dark:divide-white/5">
                  {currentOrders.map(p => (
                    <tr key={p.id} className="hover:bg-flavis-blue/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <p className="font-sans font-black text-sm text-flavis-blue dark:text-white uppercase tracking-tight">
                            {p.guardarDatos ? `${p.cliente?.nombre} ${p.cliente?.apellido}` : "Cliente Anónimo"}
                          </p>
                          {p.detalles?.some(d => d.esPack) && (
                            <div className="flex gap-1 mt-1.5">
                              <span className="text-[7px] font-black bg-flavis-gold text-flavis-blue px-2 py-0.5 rounded uppercase tracking-tighter">
                                Pack Incluido
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${p.tipoEntrega === 'DELIVERY' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-flavis-gold/10 text-flavis-gold'}`}>
                          {p.tipoEntrega === 'DELIVERY' ? '🛵 Delivery' : '🏠 Recojo'}
                        </span>
                      </td>
                      <td className="px-6 py-5 opacity-70 text-flavis-blue dark:text-white/70 font-bold text-[11px] font-sans tracking-tight">
                          {new Date(p.fechaCreacion).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-flavis-gold font-sans text-sm">
                        S/ {p.montoTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-right font-sans">
                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {setSelectedOrder(p); setIsDetailOpen(true);}} className="flex items-center gap-1.5 text-[9px] font-black uppercase bg-flavis-blue/5 dark:bg-white/5 text-flavis-blue dark:text-white px-3 py-2 rounded-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all">
                            <Icons.Eye /> Detalle
                          </button>
                          <button onClick={() => {setSelectedVoucher(p.comprobanteUrl); setIsVoucherOpen(true);}} className="flex items-center gap-1.5 text-[9px] font-black uppercase bg-flavis-blue/5 dark:bg-white/5 text-flavis-blue dark:text-white px-3 py-2 rounded-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all">
                            Voucher
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-flavis-blue/40 font-bold text-xs uppercase tracking-widest">
                        No hay pedidos que coincidan con la búsqueda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- PAGINACIÓN PEDIDOS --- */}
            {totalPagesOrders > 1 && (
              <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-flavis-blue/5 dark:border-white/5">
                {[...Array(totalPagesOrders)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPageOrders(i + 1)} className={`w-8 h-8 rounded-full font-black text-[10px] transition-all ${currentPageOrders === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-flavis-card-dark text-flavis-blue/40 dark:text-white/30 border border-flavis-blue/5 dark:border-white/5'}`}>
                      {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialModule;