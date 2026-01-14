import React, { useState, useEffect } from 'react';
import api from '../../services/api';
// --- LIBRERÍAS SEGURAS ---
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PedidosModule = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreVenta, setActivePreVenta] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  
  const [viewingOrder, setViewingOrder] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [readyOrders, setReadyOrders] = useState([]); 
  const [activeTab, setActiveTab] = useState('activos'); // 'activos' o 'anulados'
  const [orderToToggle, setOrderToToggle] = useState(null); // Para el modal de confirmación
  
  const ordersPerPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const pvRes = await api.get('/preventas/activa');
      if (pvRes.data && pvRes.data.id) {
        setActivePreVenta(pvRes.data);
        const ordersRes = await api.get(`/pedidos/preventa/${pvRes.data.id}`);
        setOrders(ordersRes.data);
      }
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVA LÓGICA DE NOTIFICACIÓN (MARCAR COMO VISTO) ---
  const handleMarcarVisto = async (id) => {
    try {
      await api.patch(`/pedidos/${id}/visto`);
      setOrders(prev => prev.map(o => 
        o.id === id ? { ...o, visto: true } : o
      ));
    } catch (err) {
      console.error("Error al marcar como visto:", err);
    }
  };

  // --- LÓGICA DE NEGOCIO (Solo cuenta pedidos NO anulados para producción y caja) ---
  const activeOrders = orders.filter(o => !o.anulado);

  const bakingSummary = activeOrders.reduce((acc, order) => {
    order.detalles.forEach(det => {
      const name = det.cookie.nombre;
      acc[name] = (acc[name] || 0) + det.cantidad;
    });
    return acc;
  }, {});

  const totalRecaudado = activeOrders.reduce((acc, curr) => acc + (curr.montoTotal || 0), 0);

  // Filtrado por pestaña y búsqueda
  const filteredOrders = orders
    .filter(o => activeTab === 'activos' ? !o.anulado : o.anulado)
    .filter(o => 
      `${o.cliente?.nombre} ${o.cliente?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente?.celular.includes(searchTerm)
    );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const toggleReady = (id) => {
    setReadyOrders(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // --- NUEVA LÓGICA DE ANULACIÓN ---
  const handleToggleAnulado = async () => {
    if (!orderToToggle) return;
    try {
      await api.patch(`/pedidos/${orderToToggle.id}/anular`);
      // Actualizar estado local para evitar recargar toda la página
      setOrders(prev => prev.map(o => 
        o.id === orderToToggle.id ? { ...o, anulado: !o.anulado } : o
      ));
      setOrderToToggle(null);
    } catch (err) {
      alert("Error al procesar la anulación");
    }
  };

  // --- EXPORTACIÓN A EXCEL ---
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet1 = workbook.addWorksheet('Resumen Hornado');
    sheet1.columns = [
      { header: 'Galleta', key: 'name', width: 30 },
      { header: 'Total a Hornear', key: 'qty', width: 20 }
    ];
    Object.entries(bakingSummary).forEach(([name, qty]) => {
      sheet1.addRow({ name, qty });
    });
    sheet1.getRow(1).font = { bold: true };

    const sheet2 = workbook.addWorksheet('Lista de Pedidos');
    sheet2.columns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Celular', key: 'celular', width: 15 },
      { header: 'Pedido', key: 'pedido', width: 50 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];
    orders.forEach((o, i) => {
      sheet2.addRow({
        id: i + 1,
        cliente: `${o.cliente?.nombre} ${o.cliente?.apellido}`,
        celular: o.cliente?.celular,
        pedido: o.detalles.map(d => `${d.cantidad}x ${d.cookie.nombre}`).join(", "),
        total: `S/ ${o.montoTotal.toFixed(2)}`,
        estado: o.anulado ? 'ANULADO' : 'ACTIVO'
      });
    });
    sheet2.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Flavis_Reporte_${activePreVenta?.nombreCampania || 'Ventas'}.xlsx`);
  };

  // --- EXPORTACIÓN A PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Flavis - Reporte: ${activePreVenta?.nombreCampania || 'Campaña'}`, 14, 20);
    
    doc.setFontSize(12);
    doc.text("1. Resumen de Producción (Solo Activos)", 14, 30);
    autoTable(doc, {
      startY: 35,
      head: [['Galleta', 'Total a Hornear']],
      body: Object.entries(bakingSummary).map(([name, qty]) => [name, qty]),
      headStyles: { fillColor: [184, 153, 90] }
    });

    doc.text("2. Lista de Pedidos (Válidos)", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['#', 'Cliente', 'Celular', 'Pedido', 'Total']],
      body: activeOrders.map((o, i) => [
        i + 1, 
        `${o.cliente?.nombre} ${o.cliente?.apellido}`,
        o.cliente?.celular,
        o.detalles.map(d => `${d.cantidad}x ${d.cookie.nombre}`).join(", "),
        `S/ ${o.montoTotal.toFixed(2)}`
      ]),
      headStyles: { fillColor: [50, 99, 113] }
    });

    doc.save(`Flavis_Reporte_${activePreVenta?.nombreCampania || 'Ventas'}.pdf`);
  };

  const handleNotify = async (order) => {
    // Formatear la fecha de entrega (Ej: Sábado 06/12)
    const fecha = activePreVenta?.fechaEntrega 
      ? new Date(activePreVenta.fechaEntrega + "T00:00:00").toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: '2-digit' })
      : "Fecha por confirmar";

    // Formatear el resumen de galletas (Sin precios)
    const resumenGalletas = order.detalles
      .map(d => `• ${d.cantidad}x ${d.cookie.nombre}`)
      .join('%0A'); // %0A es el salto de línea en URL

    const mensaje = `Hola *${order.cliente?.nombre}* 🫂%0A` +
      `Te escribo confirmando tu orden de *Flavis Cookies of the Week* 🍪%0A%0A` +
      `*Resumen de tu orden:*%0A${resumenGalletas}%0A%0A` +
      `*Dirección de recojo:*%0A📍Las gardenias 106, Surco%0A` +
      `Horario: ${activePreVenta?.horarioEntrega || '3pm - 6pm'}%0A` +
      `${fecha.charAt(0).toUpperCase() + fecha.slice(1)}%0A%0A` +
      `*Al llegar (usted o su delivery) debe:*%0A%0A` +
      `   1. Acercarse a recepción%0A` +
      `   2. Brindar el nombre que puso en el formulario%0A` +
      `   3. Le entregarán su cajita%0A%0A` +
      `🚨 *NO olvidar* 👇🏼%0A%0A` +
      `⚠️ Debe llegar dentro del horario%0A` +
      `⚠️ En caso de no poder recogerlo, se coordina para el día siguiente%0A` +
      `⚠️ Devoluciones con 48hr anticipación%0A` +
      `⚠️ Mantener la caja en horizontal%0A%0A` +
      `Sin más, estoy feliz de hornearte tu postrecito de finde, no dudes en consultar si algo no quedó claro 🩵`;

    window.open(`https://wa.me/51${order.cliente?.celular}?text=${mensaje}`, '_blank');
  };


  if (loading) return <div className="p-20 text-center font-sans font-bold text-flavis-blue dark:text-flavis-gold animate-pulse">Cargando base de datos de Flavis...</div>;

  return (
    <div className="animate-in pb-20 font-sans px-2">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-2 tracking-tighter transition-colors">Ventas de la Semana</h2>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-flavis-blue/60 dark:text-white/40 uppercase tracking-widest text-[10px] font-black mr-2">
              Campaña: {activePreVenta?.nombreCampania || "No detectada"}
            </p>
            <button onClick={exportToExcel} className="bg-green-600/10 text-green-700 dark:bg-green-600/20 dark:text-green-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-green-600 hover:text-white transition-all border border-green-600/20 flex items-center gap-2 shadow-sm">
              <span>Excel</span>
            </button>
            <button onClick={exportToPDF} className="bg-red-600/10 text-red-700 dark:bg-red-600/20 dark:text-red-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all border border-red-600/20 flex items-center gap-2 shadow-sm">
              <span>PDF</span>
            </button>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Buscar por nombre o celular..."
            className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/10 p-4 pr-12 rounded-2xl outline-none focus:border-flavis-gold shadow-sm font-bold text-sm transition-all text-flavis-blue dark:text-white placeholder-flavis-blue/20 dark:placeholder-white/20"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 dark:opacity-40 transition-opacity">🔍</span>
        </div>
      </header>

      {/* --- SELECTOR DE PESTAÑAS --- */}
      <div className="flex gap-4 mb-8 border-b border-flavis-blue/5 dark:border-white/5 pb-4">
        <button 
          onClick={() => { setActiveTab('activos'); setCurrentPage(1); }}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'activos' ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-lg' : 'text-flavis-blue/40 dark:text-white/30 hover:bg-flavis-blue/5 dark:hover:bg-white/5'}`}
        >
          Pedidos Activos ({orders.filter(o => !o.anulado).length})
        </button>
        <button 
          onClick={() => { setActiveTab('anulados'); setCurrentPage(1); }}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'anulados' ? 'bg-red-500 text-white shadow-lg' : 'text-red-500/40 dark:text-red-400/40 hover:bg-red-500/5'}`}
        >
          Papelera / Anulados ({orders.filter(o => o.anulado).length})
        </button>
      </div>

      <div className="mb-10">
        <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-4 ml-4">Resumen de producción (Total Galletas)</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(bakingSummary).map(([name, count]) => (
            <div key={name} className="bg-flavis-gold/10 dark:bg-flavis-gold/5 border border-flavis-gold/20 dark:border-flavis-gold/10 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-sm transition-colors">
              <span className="text-2xl font-black text-flavis-gold font-sans">{count}</span>
              <span className="text-[11px] font-black text-flavis-blue dark:text-white/80 uppercase tracking-tight">{name}</span>
            </div>
          ))}
          {Object.keys(bakingSummary).length === 0 && <p className="text-xs italic opacity-40 dark:opacity-20 ml-4">Esperando pedidos...</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[2.5rem] shadow-sm border border-flavis-blue/5 dark:border-white/5 transition-colors">
          <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-2">Total Clientes (Válidos)</p>
          <p className="text-5xl font-black text-flavis-blue dark:text-white tracking-tighter font-sans">
            {activeOrders.length.toString().padStart(2, '0')}
          </p>
        </div>
        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[2.5rem] shadow-sm border border-flavis-blue/5 dark:border-white/5 transition-colors">
          <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-2">Monto en Caja (Neto)</p>
          <p className="text-5xl font-black text-flavis-gold tracking-tighter font-sans">
            S/ {totalRecaudado.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-flavis-card-dark rounded-[2.5rem] shadow-xl overflow-hidden border border-flavis-blue/5 dark:border-white/5 transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px] md:min-w-full">
            <thead>
              <tr className="text-[10px] uppercase font-black text-flavis-blue/30 dark:text-white/30 tracking-[0.2em] border-b border-flavis-blue/5 dark:border-white/5">
                <th className="px-8 py-6 text-center">Listo</th>
                <th className="px-8 py-6 text-center">Anular</th>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Pedido</th>
                <th className="px-8 py-6 text-center">Pago</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-flavis-blue/5 dark:divide-white/5">
              {currentOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`transition-all duration-500 ${
                    !order.visto && !order.anulado
                    ? 'bg-green-100/40 dark:bg-green-900/10 border-l-4 border-green-500' 
                    : readyOrders.includes(order.id) && !order.anulado 
                    ? 'bg-green-50/50 dark:bg-green-500/5' 
                    : 'hover:bg-[#f8f9f5]/50 dark:hover:bg-white/5'
                  }`}
                >
                  <td className="px-8 py-6 text-center">
                    {activeTab === 'activos' ? (
                      <input type="checkbox" className="w-5 h-5 accent-green-600 cursor-pointer transition-transform active:scale-90" checked={readyOrders.includes(order.id)} onChange={() => toggleReady(order.id)} />
                    ) : (
                      <span className="text-red-500 text-lg">⚠️</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <input 
                      type="checkbox" 
                      checked={order.anulado}
                      onChange={() => setOrderToToggle(order)}
                      className={`w-5 h-5 cursor-pointer accent-red-600 transition-all ${order.anulado ? 'opacity-100' : 'opacity-20 hover:opacity-100 dark:opacity-40'}`}
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className={`font-bold text-sm ${readyOrders.includes(order.id) || order.anulado ? 'line-through opacity-50' : 'text-flavis-blue dark:text-white'}`}>
                        {order.cliente?.nombre} {order.cliente?.apellido}
                      </p>
                      <p className="text-[10px] font-bold text-flavis-blue/40 dark:text-white/30 tracking-tighter font-sans">{order.cliente?.celular}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      {order.detalles.slice(0, 2).map((det, idx) => (
                        <p key={idx} className={`text-[11px] font-bold ${order.anulado ? 'text-red-300 dark:text-red-900/40' : 'text-flavis-blue/70 dark:text-white/60'}`}>
                          <span className={`${order.anulado ? 'text-red-400 dark:text-red-900/60' : 'text-flavis-gold'} font-black mr-1 font-sans`}>{det.cantidad}x</span> {det.cookie.nombre}
                        </p>
                      ))}
                      {order.detalles.length > 2 && (
                        <button onClick={() => setViewingOrder(order)} className={`text-[9px] font-black uppercase tracking-tighter hover:underline block mt-1 ${order.anulado ? 'text-red-400' : 'text-flavis-gold'}`}>
                          + {order.detalles.length - 2} sabores más...
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`${order.anulado ? 'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400' : 'bg-flavis-gold/10 dark:bg-flavis-gold/5 text-flavis-gold'} px-4 py-1.5 rounded-full font-black text-xs transition-colors font-sans`}>
                      S/ {order.montoTotal.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      {/* BOTÓN MARCAR COMO VISTO */}
                      {!order.visto && !order.anulado && (
                        <button 
                          onClick={() => handleMarcarVisto(order.id)}
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-md animate-pulse"
                        >
                          Marcar visto
                        </button>
                      )}

                      <a href={`https://wa.me/51${order.cliente?.celular}`} target="_blank" rel="noreferrer" className={`flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 w-8 h-8 rounded-xl hover:bg-green-500 dark:hover:bg-green-600 hover:text-white transition-all shadow-sm ${order.anulado ? 'grayscale opacity-30 pointer-events-none' : ''}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                      
                      {readyOrders.includes(order.id) && !order.anulado && (
                        <button 
                          onClick={() => handleNotify(order)} 
                          className="bg-flavis-gold text-flavis-blue dark:bg-flavis-gold dark:text-flavis-dark h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md flex items-center gap-1 animate-in"
                        >
                          <span>Notificar</span>
                          <span className="text-[12px]">🔔</span>
                        </button>
                      )}

                      <button onClick={() => setSelectedVoucher(order.comprobanteUrl)} className={`bg-flavis-blue dark:bg-white/10 text-white dark:text-white/80 h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm flex items-center justify-center ${order.anulado ? 'opacity-50' : ''}`}>Voucher</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAGINACIÓN --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 text-flavis-blue/40 dark:text-white/20 disabled:opacity-10 transition-opacity font-sans">« Atrás</button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-full font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-flavis-card-dark text-flavis-blue/40 dark:text-white/30 border border-flavis-blue/5 dark:border-white/5 font-sans'}`}>{i + 1}</button>
            ))}
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 text-flavis-blue/40 dark:text-white/20 disabled:opacity-10 transition-opacity font-sans">Sig. »</button>
        </div>
      )}

      {/* --- MODALES --- */}

      {orderToToggle && (
        <div className="fixed inset-0 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-flavis-gold animate-in">
            <h3 className="text-2xl font-main font-bold text-flavis-blue dark:text-white italic mb-4">¿Estás segura?</h3>
            <p className="text-sm text-flavis-blue/60 dark:text-white/50 mb-8 leading-relaxed">
              Vas a {orderToToggle.anulado ? 'restaurar' : 'anular'} el pedido de <span className="font-bold text-flavis-blue dark:text-flavis-gold">{orderToToggle.cliente?.nombre}</span>.
              {!orderToToggle.anulado && " El monto se restará de caja y las galletas volverán al stock."}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleToggleAnulado} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-lg transition-all ${orderToToggle.anulado ? 'bg-green-600' : 'bg-red-500'}`}>
                Sí, {orderToToggle.anulado ? 'Restaurar' : 'Anular'} Pedido
              </button>
              <button onClick={() => setOrderToToggle(null)} className="w-full py-3 text-flavis-blue/40 dark:text-white/20 text-[9px] font-bold uppercase tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {viewingOrder && (
        <div className="fixed inset-0 bg-flavis-blue/80 dark:bg-flavis-dark/90 backdrop-blur-md z-[500] flex items-center justify-center p-4" onClick={() => setViewingOrder(null)}>
          <div className="bg-[#eef1e6] dark:bg-flavis-card-dark p-8 rounded-[3rem] max-w-sm w-full shadow-2xl animate-in border border-white/20 dark:border-white/5" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-main font-bold text-flavis-blue dark:text-white italic mb-2 tracking-tighter">Detalle del Pedido</h3>
            <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-6 border-b border-flavis-blue/5 dark:border-white/5 pb-4">Cliente: {viewingOrder.cliente?.nombre} {viewingOrder.cliente?.apellido}</p>
            <div className="space-y-4 mb-8">
              {viewingOrder.detalles.map((det, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/50 dark:bg-white/5 p-3 rounded-2xl border border-flavis-blue/5 dark:border-white/5 transition-colors">
                  <span className="text-sm font-bold text-flavis-blue dark:text-white/90">{det.cookie.nombre}</span>
                  <span className="bg-flavis-gold text-white dark:text-flavis-dark px-3 py-1 rounded-full font-black text-xs font-sans">x{det.cantidad}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewingOrder(null)} className="w-full bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">Cerrar Detalle</button>
          </div>
        </div>
      )}

      {selectedVoucher && (
        <div className="fixed inset-0 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-md z-[500] flex items-center justify-center p-4" onClick={() => setSelectedVoucher(null)}>
          <div className="relative max-w-sm w-full animate-in" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 text-white text-3xl font-light hover:scale-110 transition-transform" onClick={() => setSelectedVoucher(null)}>✕</button>
            <img src={selectedVoucher} className="w-full rounded-[3rem] shadow-2xl border-4 border-white/10 dark:border-white/5" alt="Voucher" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosModule;