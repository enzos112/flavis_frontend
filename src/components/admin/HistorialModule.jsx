import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// --- MODAL 1: DETALLE DE GALLETAS (VERSION FINAL RESILIENTE) ---
const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const costoEnvio = order.costoEnvio || 0;
  const subtotalProductos = order.montoTotal - costoEnvio; 

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-flavis-blue/90 backdrop-blur-sm animate-in" onClick={onClose}>
      <div className="bg-[#eef1e6] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/20" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-flavis-blue/40 hover:text-flavis-blue font-bold transition-colors">✕</button>
        
        <h3 className="text-xl font-sans font-black text-flavis-blue uppercase tracking-tight mb-6 border-b border-flavis-blue/10 pb-4">
          Detalle del Pedido
        </h3>

        <div className="space-y-6 font-secondary text-flavis-blue">
          <div className="bg-white/50 p-6 rounded-3xl border border-white/40">
            <p className="text-[10px] uppercase font-black opacity-70 text-flavis-blue tracking-widest mb-3">
              Productos Seleccionados
            </p>
            
            <div className="space-y-3">
              {order.detalles.map((det, idx) => {
                // LÓGICA MEJORADA: Priorizamos el objeto Pack por encima del flag booleano
                let nombreItem = "Producto Desconocido";
                
                if (det.pack) {
                  nombreItem = `📦 Pack: ${det.pack.nombre}`;
                } else if (det.cookie) {
                  nombreItem = det.cookie.nombre;
                } else {
                  // Fallback para pedidos MUY antiguos sin relaciones
                  nombreItem = det.esPack ? "📦 Pack Especial" : "Galleta Individual";
                }

                return (
                  <div key={idx} className="flex justify-between items-center border-b border-flavis-blue/5 pb-2">
                    <span className="font-bold text-sm">
                      <span className="text-flavis-gold font-sans">{det.cantidad}x</span> {nombreItem}
                    </span>
                    <span className="text-xs opacity-60 font-sans text-with-symbols">
                      S/ {(det.precioUnitario * det.cantidad).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* DESGLOSE FINANCIERO CORREGIDO */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-flavis-blue/10 space-y-2">
              <div className="flex justify-between text-[11px] opacity-60 uppercase font-black">
                <span>Subtotal Productos</span>
                <span className="font-sans">S/ {subtotalProductos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span className={order.tipoEntrega === 'DELIVERY' ? 'text-blue-500' : 'text-flavis-blue'}>
                  Envío ({order.tipoEntrega === 'DELIVERY' ? '🛵 Delivery' : '🏠 Recojo'})
                </span>
                <span className="font-sans">S/ {costoEnvio.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-xs uppercase tracking-widest opacity-40">Total Pagado</span>
                <span className="text-2xl font-black text-flavis-gold text-with-symbols italic">
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
            <p className="flex justify-between text-with-symbols">
              <span>Fecha:</span> 
              <span className="font-bold">
                {new Date(order.fechaCreacion).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-8 bg-flavis-blue text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-flavis-gold transition-all font-sans">
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
      <div className="relative max-w-sm w-full bg-[#eef1e6] rounded-[3rem] overflow-hidden shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 bg-white/80 text-flavis-blue w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold hover:scale-110 transition-all">✕</button>
        <div className="p-10 pb-4">
            <h3 className="text-xl font-sans font-black text-flavis-blue uppercase tracking-tight">
              Comprobante de Pago
            </h3>
            <p className="text-[10px] font-sans uppercase font-bold opacity-60 text-flavis-blue tracking-widest mt-1">
              Vista Previa del Historial
            </p>
        </div>
        <div className="px-8 pb-10">
            <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-inner bg-gray-200 aspect-[3/4] img-protect group relative">
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
              <a href={imageUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full text-[10px] font-black uppercase text-flavis-blue/40 hover:text-flavis-gold transition-colors">
                <span>🔗 Abrir original</span>
              </a>
              <button onClick={onClose} className="w-full bg-flavis-blue text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg font-sans hover:bg-flavis-gold hover:text-flavis-blue transition-all">
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

  const [searchTermCampaign, setSearchTermCampaign] = useState('');
  const [searchTermCustomer, setSearchTermCustomer] = useState('');
  const [currentPageCamp, setCurrentPageCamp] = useState(1);
  const [currentPageOrders, setCurrentPageOrders] = useState(1);

  const campPerPage = 3;
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
    } catch (err) { console.error("Error", err); }
    finally { setLoading(false); }
  };

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const filteredCampaigns = campanias.filter(cp => cp.nombreCampania.toLowerCase().includes(searchTermCampaign.toLowerCase()));
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
    <div className="p-6 font-secondary text-flavis-blue dark:text-white transition-colors animate-in">
      <h2 className="text-4xl font-sans font-black text-flavis-blue dark:text-white uppercase tracking-tighter mb-10">
        Historial de Campañas
      </h2>

      {/* MODALES */}
      <OrderDetailModal order={selectedOrder} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
      <VoucherPreviewModal imageUrl={selectedVoucher} isOpen={isVoucherOpen} onClose={() => setIsVoucherOpen(false)} />

      {/* BÚSQUEDA Y CARDS */}
      <div className="mb-8 max-w-md">
        <label className="block text-[10px] uppercase font-black opacity-70 text-flavis-blue dark:text-white/70 tracking-widest mb-2 ml-2 font-sans">
          Buscar Campaña
        </label>
        <input type="text" placeholder="Ej: Enero..." className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-flavis-gold transition-all font-bold text-sm font-sans" value={searchTermCampaign} onChange={(e) => {setSearchTermCampaign(e.target.value); setCurrentPageCamp(1);}} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {currentCampaigns.map(cp => (
          <button key={cp.id} onClick={() => verContenedor(cp)} className={`p-8 rounded-[2.5rem] border transition-all text-left relative overflow-hidden ${campaniaSeleccionada?.id === cp.id ? 'bg-flavis-gold border-flavis-gold text-flavis-blue shadow-2xl scale-[1.02]' : 'bg-white dark:bg-flavis-card-dark border-flavis-blue/10 text-flavis-blue dark:text-white hover:border-flavis-gold hover:shadow-lg'}`}>
            <p className={`text-[10px] uppercase font-black mb-1 opacity-80 font-sans ${campaniaSeleccionada?.id === cp.id ? 'text-flavis-blue' : 'text-flavis-blue/70 dark:text-white/60'}`}>
              Contenedor Cerrado
            </p>
            <h3 className="font-sans font-black text-xl uppercase leading-tight mb-4">
              {cp.nombreCampania}
            </h3>
            <p className="text-[11px] font-medium opacity-70 text-with-symbols font-sans">📅 Entrega: {cp.fechaEntrega}</p>
          </button>
        ))}
      </div>

      {/* --- PAGINACIÓN CAMPAÑAS --- */}
      {totalPagesCamp > 1 && (
        <div className="flex justify-center gap-2 mt-4 mb-12">
          {[...Array(totalPagesCamp)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPageCamp(i + 1)} className={`w-8 h-8 rounded-full font-bold text-[10px] transition-all ${currentPageCamp === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-white/5 text-flavis-blue/40 border border-flavis-blue/5'}`}>
                {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* SECCIÓN TABLA */}
      {campaniaSeleccionada && (
      <div className="bg-white dark:bg-flavis-card-dark rounded-[3rem] p-10 shadow-2xl border border-flavis-blue/5 dark:border-white/5 animate-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
          <h3 className="text-2xl font-bold text-flavis-gold">Pedidos de: {campaniaSeleccionada.nombreCampania}</h3>
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="bg-flavis-blue/5 dark:bg-white/5 border border-transparent focus:border-flavis-gold p-3 px-6 rounded-2xl outline-none text-sm font-bold min-w-[250px]" 
            value={searchTermCustomer} 
            onChange={(e) => {setSearchTermCustomer(e.target.value); setCurrentPageOrders(1);}} 
          />
        </div>

        {/* PANEL DE VERIFICACIÓN RÁPIDA */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-flavis-blue/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-flavis-blue/50 border border-flavis-blue/5">
            Total Válidos: {validOrders.length}
          </div>
          <div className="bg-green-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-green-600">
            Guardados: {validOrders.filter(p => p.guardarDatos).length}
          </div>
          <div className="bg-gray-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500">
            Anónimos: {validOrders.filter(p => !p.guardarDatos).length}
          </div>
          
          {/* INDICADOR DE ANULADOS (SOLO NÚMERO) */}
          {canceledCount > 0 && (
            <div className="bg-red-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500/10">
              Anulados: {canceledCount}
            </div>
          )}
        </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] uppercase font-black text-flavis-blue/70 dark:text-white/60 tracking-[0.2em] font-sans">
                  <th className="px-6 pb-2">Cliente</th>
                  <th className="px-6 pb-2 text-center">Entrega</th>
                  <th className="px-6 pb-2">Fecha Pedido</th>
                  <th className="px-6 pb-2 text-center">Total</th>
                  <th className="px-6 pb-2 text-right">Acciones</th>
              </tr>
              </thead>
              <tbody>
                {currentOrders.map(p => (
                  <tr key={p.id} className="bg-flavis-blue/5 dark:bg-white/5 hover:bg-flavis-blue/10 dark:hover:bg-white/10 transition-colors">
                    <td className="px-6 py-5 rounded-l-2xl">
                      <div className="flex flex-col">
                        <p className="font-sans font-black text-sm text-flavis-blue dark:text-white uppercase tracking-tight">
                          {p.guardarDatos ? `${p.cliente?.nombre} ${p.cliente?.apellido}` : "Cliente Anónimo"}
                        </p>
                        {p.detalles?.some(d => d.esPack) && (
                          <div className="flex gap-1 mt-1">
                            <span className="text-[7px] font-black bg-flavis-gold text-flavis-blue px-2 py-0.5 rounded uppercase tracking-tighter">
                              Pack Incluido
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.tipoEntrega === 'DELIVERY' ? 'bg-flavis-gold/20 text-flavis-blue' : 'bg-flavis-blue/10 text-flavis-blue/50'}`}>
                        {p.tipoEntrega === 'DELIVERY' ? '🛵 Delivery' : '🏠 Recojo'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-with-symbols opacity-80 text-flavis-blue dark:text-white/70 font-bold text-xs font-sans">
                        {new Date(p.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-flavis-gold font-sans">
                      S/ {p.montoTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-right rounded-r-2xl space-x-3 font-sans">
                      <button onClick={() => {setSelectedOrder(p); setIsDetailOpen(true);}} className="text-[10px] font-black uppercase text-flavis-blue/80 dark:text-white/80 hover:text-flavis-gold transition-all border-b-2 border-current">Detalle</button>
                      <button onClick={() => {setSelectedVoucher(p.comprobanteUrl); setIsVoucherOpen(true);}} className="text-[10px] font-black uppercase text-flavis-gold hover:text-flavis-gold/80 transition-all border-b-2 border-current">Ver Pago</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- PAGINACIÓN PEDIDOS --- */}
          {totalPagesOrders > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalPagesOrders)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPageOrders(i + 1)} className={`w-8 h-8 rounded-full font-bold text-[10px] transition-all ${currentPageOrders === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-white/5 text-flavis-blue/40 border border-flavis-blue/5'}`}>
                    {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="h-20"></div>
    </div>
  );
};

export default HistorialModule;