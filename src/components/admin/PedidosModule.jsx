import React, { useState, useEffect, useMemo} from 'react';
import api from '../../services/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingSpinner from '../common/LoadingSpinner';

// --- ICONOS VECTORIALES COMPARTIDOS ---
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Excel: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>,
  PDF: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13v4"/><path d="M10 13c0 1.1.9 2 2 2h.5c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2H10"/></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  WhatsApp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Delivery: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>,
  Store: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
};

const PedidosModule = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreVenta, setActivePreVenta] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  
  const [viewingOrder, setViewingOrder] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('activos'); 
  const [orderToToggle, setOrderToToggle] = useState(null); 
  
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

  // --- LÓGICA DE NOTIFICACIÓN (MARCAR COMO VISTO) ---
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

  const activeOrders = orders.filter(o => !o.anulado);

  // --- RESUMEN DE HORNEADO (DINÁMICO SEGÚN TAMAÑO DEL PACK) ---
  const bakingSummary = activeOrders.reduce((acc, order) => {
    order.detalles.forEach(det => {
      if (det.esPack && det.pack && det.pack.galletas) {
        det.pack.galletas.forEach(g => {
          acc[g.nombre] = (acc[g.nombre] || 0) + det.cantidad;
        });
      } else if (det.cookie) {
        const name = det.cookie.nombre;
        acc[name] = (acc[name] || 0) + det.cantidad;
      }
    });
    return acc;
  }, {});

  const totalRecaudado = activeOrders.reduce((acc, curr) => acc + (curr.montoTotal || 0), 0);

  const filteredOrdersList = orders
    .filter(o => activeTab === 'activos' ? !o.anulado : o.anulado)
    .filter(o => 
      `${o.cliente?.nombre} ${o.cliente?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente?.celular.includes(searchTerm)
    );

  const sortedOrders = [...filteredOrdersList].sort((a, b) => {
    if (a.visto !== b.visto) {
      return a.visto ? 1 : -1;
    }
    return b.id - a.id; 
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const toggleReady = async (id, currentStatus) => {
    try {
      const nuevoEstado = !currentStatus;
      await api.patch(`/pedidos/${id}/listo`, { estado: nuevoEstado });
      setOrders(prev => prev.map(o => 
        o.id === id ? { ...o, listo: nuevoEstado } : o
      ));
    } catch (err) {
      console.error("Error al actualizar estado de producción:", err);
      alert("No se pudo marcar como listo. Verifica la conexión.");
    }
  };

  const handleToggleAnulado = async () => {
    if (!orderToToggle) return;
    try {
      await api.patch(`/pedidos/${orderToToggle.id}/anular`);
      setOrders(prev => prev.map(o => 
        o.id === orderToToggle.id ? { ...o, anulado: !o.anulado } : o
      ));
      setOrderToToggle(null);
    } catch (err) {
      alert("Error al procesar la anulación");
    }
  };

  // --- LÓGICA DE PROGRESO INTERACTIVO (DINÁMICO SEGÚN TAMAÑO DEL PACK) ---
  const statsProduccion = useMemo(() => {
    const pedidosActivos = orders.filter(o => !o.anulado);
    let total = 0;
    let listas = 0;

    pedidosActivos.forEach(o => {
      const cantGalletasPedido = o.detalles.reduce((acc, det) => 
        // AHORA MULTIPLICA POR EL TAMAÑO REAL DEL PACK, NO POR 4
        acc + (det.esPack ? det.cantidad * (det.pack?.galletas?.length || 0) : det.cantidad), 0
      );
      
      total += cantGalletasPedido;
      if (o.listo) listas += cantGalletasPedido;
    });

    return {
      total,
      listas,
      porcentaje: total > 0 ? (listas / total) * 100 : 0
    };
  }, [orders]);

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
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Celular', key: 'celular', width: 15 },
      { header: 'Modalidad', key: 'tipo', width: 15 }, 
      { header: 'Dirección / Entrega', key: 'direccion', width: 45 }, 
      { header: 'Pedido', key: 'pedido', width: 40 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];

    orders.forEach((o, i) => {
      const direccionCompleta = o.tipoEntrega === 'DELIVERY'
        ? `${o.direccion?.distrito}: ${o.direccion?.detalle}${o.direccion?.referencia ? ` (Ref: ${o.direccion.referencia})` : ''}`
        : 'Recojo en Local (Surco)';

      const descripcionPedido = o.detalles.map(d => {
        const nombre = d.esPack ? `📦 Pack: ${d.pack?.nombre}` : d.cookie?.nombre;
        return `${d.cantidad}x ${nombre}`;
      }).join(", ");

      sheet2.addRow({
        id: i + 1,
        cliente: `${o.cliente?.nombre} ${o.cliente?.apellido}`,
        celular: o.cliente?.celular,
        tipo: o.tipoEntrega || 'RECOJO',
        direccion: direccionCompleta,
        pedido: descripcionPedido,
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
      head: [['#', 'Cliente', 'Celular', 'Modalidad', 'Entrega', 'Total']],
      body: activeOrders.map((o, i) => {
        const infoEntrega = o.tipoEntrega === 'DELIVERY'
          ? `${o.direccion?.distrito}: ${o.direccion?.detalle}`
          : 'Recojo en local';

        return [
          i + 1, 
          `${o.cliente?.nombre} ${o.cliente?.apellido}`,
          o.cliente?.celular,
          o.tipoEntrega || 'RECOJO',
          infoEntrega,
          `S/ ${o.montoTotal.toFixed(2)}`
        ];
      }),
      headStyles: { fillColor: [50, 99, 113] },
      styles: { fontSize: 8 } 
    });

    doc.save(`Flavis_Reporte_${activePreVenta?.nombreCampania || 'Ventas'}.pdf`);
  };

  // --- LÓGICA DE NOTIFICACIÓN WHATSAPP ---
  const handleNotify = async (order) => {
    const fecha = activePreVenta?.fechaEntrega 
      ? new Date(activePreVenta.fechaEntrega + "T00:00:00").toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: '2-digit' })
      : "Fecha por confirmar";

    const resumenGalletas = order.detalles
      .map(d => {
        const nombreItem = d.esPack ? `📦 Pack: ${d.pack?.nombre}` : d.cookie?.nombre;
        return `• ${d.cantidad}x ${nombreItem}`;
      })
      .join('%0A'); 

    const hug = "%F0%9F%AB%AC";
    const cookie = "%F0%9F%8D%AA";
    const location = "%F0%9F%93%8D";
    const motorizado = "%F0%9F%9B%B5";
    const alert = "%F0%9F%9A%A8";
    const warning = "%E2%9A%A0%EF%B8%8F";
    const heart = "%F0%9F%AA%B5";

    const esDelivery = order.tipoEntrega === 'DELIVERY';
    
    const infoLogistica = esDelivery 
      ? `*Dirección de Envío:*%0A${motorizado} ${order.direccion?.distrito} - ${order.direccion?.detalle}%0A_Ref: ${order.direccion?.referencia || 'Sin referencia'}_%0A`
      : `*Dirección de recojo:*%0A${location} Las gardenias 106, Surco (Ref. Parque Casuarinas)%0A`;

    const instrucciones = esDelivery
      ? `   1. Estar atento al celular en el rango de horario%0A` +
        `   2. El repartidor te llamará al llegar a tu dirección%0A` +
        `   3. Ten a la mano tu DNI para la entrega%0A%0A`
      : `   1. Acercarse a recepción%0A` + 
        `   2. Brindar el nombre que puso en el formulario%0A` +
        `   3. Le entregarán su cajita%0A%0A`;

    const mensaje = `Hola *${order.cliente?.nombre}* ${hug}%0A` +
      `Te escribo confirmando tu orden de *Flavis Cookies of the Week* ${cookie}%0A%0A` +
      `*Resumen de tu orden:*%0A${resumenGalletas}%0A%0A` +
      infoLogistica +
      `Horario: 11:00 am - 1:00 pm%0A` + 
      `${fecha.charAt(0).toUpperCase() + fecha.slice(1)}%0A%0A` +
      `*${esDelivery ? 'Para recibir tu pedido' : 'Al llegar (usted o su delivery)'} debe:*%0A%0A` +
      instrucciones +
      `${alert} *NO olvidar* 👇🏼%0A%0A` +
      `${warning} Estar presente dentro del horario indicado%0A` +
      `${warning} En caso de no poder recibirlo, se coordina el reenvío (costo adicional)%0A` +
      `${warning} Devoluciones con 48hr anticipación%0A` +
      `${warning} Mantener la caja en horizontal ${heart}`;

    window.open(`https://api.whatsapp.com/send?phone=51${order.cliente?.celular}&text=${mensaje}`, '_blank');
  };

  if (loading) return <LoadingSpinner mensaje="Cargando los pedidos..." />;

  return (
    <div className="animate-in pb-20 font-sans px-2">
      {/* --- CABECERA FUSIONADA --- */}
      <header className="mb-6">
        <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-1 tracking-tighter transition-colors">Ventas de la Semana</h2>
        <p className="text-flavis-blue/60 dark:text-white/40 uppercase tracking-widest text-[10px] font-black mb-6">
          Campaña: {activePreVenta?.nombreCampania || "No detectada"}
        </p>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          
          {/* PESTAÑAS */}
          <div className="flex bg-flavis-blue/5 dark:bg-white/5 p-1 rounded-2xl w-max shadow-sm">
            <button 
              onClick={() => { setActiveTab('activos'); setCurrentPage(1); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'activos' ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-md' : 'text-flavis-blue/40 dark:text-white/40 hover:text-flavis-blue'}`}
            >
              Activos ({orders.filter(o => !o.anulado).length})
            </button>
            <button 
              onClick={() => { setActiveTab('anulados'); setCurrentPage(1); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'anulados' ? 'bg-red-500 text-white shadow-md' : 'text-red-500/40 hover:text-red-500'}`}
            >
              Anulados ({orders.filter(o => o.anulado).length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3 items-center">
            {/* BUSCADOR */}
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <input 
                type="text"
                placeholder="Buscar cliente..."
                className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/5 p-3 pr-10 rounded-xl outline-none focus:border-flavis-gold shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-sm font-bold text-xs transition-colors text-flavis-blue dark:text-white"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 text-sm"><Icons.Search /></span>
            </div>

            {/* BOTONES EXPORTAR */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={exportToExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none text-center">
                <Icons.Excel /> Excel
              </button>
              <button onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none text-center">
                <Icons.PDF /> PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- TARJETAS 30/70 --- */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        
        {/* TARJETA 30%: Monto en Caja */}
        <div className="w-full lg:w-[30%] bg-white dark:bg-flavis-card-dark p-6 rounded-[2rem] border border-flavis-blue/5 dark:border-white/5 shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none transition-colors flex flex-col justify-center">
          <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-1">Monto en Caja</p>
          <p className="text-4xl font-black text-flavis-gold tracking-tighter font-sans truncate">
            S/ {totalRecaudado.toFixed(2)}
          </p>
        </div>

        {/* TARJETA 70%: Barra de Progreso */}
        {activePreVenta && (
          <div className="w-full lg:w-[70%] bg-white dark:bg-flavis-card-dark p-6 rounded-[2rem] border border-flavis-gold/20 shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none animate-in flex flex-col justify-center">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-flavis-blue/40 dark:text-white/30 mb-1">Estado del Horno</p>
                <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic">Progreso de Producción</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-flavis-gold font-sans">{statsProduccion.listas}</span>
                <span className="text-sm font-bold text-flavis-blue/20 dark:text-white/20 mx-1.5">/</span>
                <span className="text-sm font-bold text-flavis-blue/40 dark:text-white/40">{statsProduccion.total} Gllt.</span>
              </div>
            </div>
            <div className="w-full bg-flavis-blue/5 dark:bg-white/5 h-3.5 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-flavis-gold rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(184,153,90,0.5)]"
                style={{ width: `${statsProduccion.porcentaje}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* --- RESUMEN DE PRODUCCIÓN (HORIZONTAL SCROLL) --- */}
      <div className="mb-6 bg-white dark:bg-flavis-card-dark p-4 rounded-[2rem] border border-flavis-blue/5 dark:border-white/5 shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none flex items-center">
        <p className="text-[9px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest whitespace-nowrap mr-6 border-r border-flavis-blue/10 dark:border-white/10 pr-6 hidden sm:block">A Hornear:</p>
        <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar w-full items-center">
          {Object.entries(bakingSummary).map(([name, count]) => (
            <div key={name} className="flex-shrink-0 bg-flavis-gold/10 dark:bg-flavis-gold/5 border border-flavis-gold/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-lg font-black text-flavis-gold font-sans">{count}</span>
              <span className="text-[9px] font-black text-flavis-blue dark:text-white/80 uppercase tracking-tight">{name}</span>
            </div>
          ))}
          {Object.keys(bakingSummary).length === 0 && <p className="text-[10px] italic opacity-40 font-bold uppercase tracking-widest px-2">Esperando pedidos...</p>}
        </div>
      </div>

      {/* --- TABLA ULTRA-COMPACTA --- */}
      <div className="bg-white dark:bg-flavis-card-dark rounded-[2rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none overflow-hidden border border-flavis-blue/5 dark:border-white/5 transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px] md:min-w-full">
            <thead>
              <tr className="text-[9px] uppercase font-black text-flavis-blue/30 dark:text-white/30 tracking-[0.2em] border-b border-flavis-blue/5 dark:border-white/5 bg-gray-50/50 dark:bg-transparent">
                <th className="px-6 py-4 text-center w-24">Gestión</th> 
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Entrega / Dirección</th>
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4 text-center">Pago</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-flavis-blue/5 dark:divide-white/5">
              {currentOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`transition-all duration-300 group ${
                    !order.visto && !order.anulado
                    ? 'bg-green-50/40 dark:bg-green-900/10 border-l-4 border-green-500' 
                    : order.listo && !order.anulado 
                    ? 'bg-green-50/20 dark:bg-green-500/5' 
                    : 'hover:bg-[#f8f9f5] dark:hover:bg-white/5'
                  }`}
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[6px] uppercase opacity-40 font-black mb-1">Listo</span>
                        {activeTab === 'activos' ? (
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-green-600 cursor-pointer transition-transform active:scale-90" 
                            checked={order.listo || false} 
                            onChange={() => toggleReady(order.id, order.listo)} 
                          />
                        ) : (
                          <span className="text-[10px] text-flavis-blue/20 dark:text-white/20">—</span>
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[6px] uppercase opacity-40 font-black mb-1">Anular</span>
                        <input 
                          type="checkbox" 
                          checked={order.anulado || false}
                          onChange={() => setOrderToToggle(order)}
                          className={`w-3.5 h-3.5 cursor-pointer accent-red-600 transition-all ${order.anulado ? 'opacity-100' : 'opacity-20 hover:opacity-100 dark:opacity-40'}`}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3">
                    <div className="flex flex-col justify-center h-full">
                      <p className={`font-black text-xs uppercase tracking-tight leading-tight ${order.listo || order.anulado ? 'line-through opacity-40' : 'text-flavis-blue dark:text-white'}`}>
                        {order.cliente?.nombre} {order.cliente?.apellido}
                      </p>
                      <p className="text-[9px] font-bold text-flavis-blue/40 dark:text-white/30 tracking-widest mt-0.5">
                        {order.cliente?.celular}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-3">
                    <div className="flex flex-col gap-0.5 justify-center h-full">
                      <div className="flex items-center gap-1.5">
                        <span className="text-flavis-blue/50 dark:text-white/50">{order.tipoEntrega === 'DELIVERY' ? <Icons.Delivery /> : <Icons.Store />}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${order.tipoEntrega === 'DELIVERY' ? 'text-blue-500' : 'text-flavis-gold'}`}>
                          {order.tipoEntrega || 'RECOJO'}
                        </span>
                      </div>
                      {order.tipoEntrega === 'DELIVERY' ? (
                        <div className="leading-tight mt-1">
                          <p className="text-[10px] font-bold text-flavis-blue/90 dark:text-white/90 truncate max-w-[180px]">
                            {order.direccion?.distrito}
                          </p>
                          <p className="text-[9px] text-flavis-blue/60 dark:text-white/50 italic truncate max-w-[180px]">
                            {order.direccion?.detalle}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[9px] font-bold text-flavis-gold/80 italic mt-1">Surco (Gardenias)</p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-3">
                    <div className="space-y-0.5 py-1">
                      {order.detalles.slice(0, 2).map((det, idx) => {
                        const nombreProducto = det.esPack ? `📦 ${det.pack?.nombre}` : det.cookie?.nombre;
                        return (
                          <p key={idx} className={`text-[10px] font-bold truncate max-w-[200px] ${order.anulado ? 'text-red-300' : 'text-flavis-blue/80 dark:text-white/70'}`}>
                            <span className={`${order.anulado ? 'text-red-400' : 'text-flavis-gold'} font-black mr-1`}>{det.cantidad}x</span> {nombreProducto}
                          </p>
                        );
                      })}
                      {order.detalles.length > 2 && (
                        <button onClick={() => setViewingOrder(order)} className="text-[8px] font-black uppercase text-flavis-gold hover:underline mt-1 bg-flavis-gold/10 px-2 py-0.5 rounded">
                          + {order.detalles.length - 2} ítems
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-3 text-center">
                    <span className={`${order.anulado ? 'text-red-400' : 'text-flavis-gold font-black'} text-xs font-sans`}>
                      S/ {order.montoTotal.toFixed(2)}
                    </span>
                  </td>

                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2 h-full opacity-50 group-hover:opacity-100 transition-opacity">
                      
                      {/* BOTÓN VISTO */}
                      {!order.visto && !order.anulado && (
                        <button 
                          onClick={() => handleMarcarVisto(order.id)}
                          className="bg-green-500 text-white px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-md animate-pulse"
                        >
                          Visto
                        </button>
                      )}

                      {/* BOTÓN WHATSAPP VECTORIAL */}
                      <a href={`https://wa.me/51${order.cliente?.celular}`} target="_blank" rel="noreferrer" className={`flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/30 w-8 h-8 rounded-lg hover:bg-[#25D366] hover:text-white transition-all shadow-sm ${order.anulado ? 'grayscale opacity-30 pointer-events-none' : ''}`}>
                        <Icons.WhatsApp />
                      </a>
                      
                      {/* BOTÓN NOTIFICAR */}
                      {order.listo && !order.anulado && (
                        <button 
                          onClick={() => handleNotify(order)} 
                          className="flex items-center gap-1.5 bg-flavis-gold text-flavis-blue dark:bg-flavis-gold dark:text-flavis-dark px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm"
                        >
                          <Icons.Bell /> Notificar
                        </button>
                      )}

                      {/* BOTÓN VER VOUCHER (TEXTO CLARO) */}
                      <button onClick={() => setSelectedVoucher(order.comprobanteUrl)} className={`bg-flavis-blue/5 dark:bg-white/10 text-flavis-blue dark:text-white/80 px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-flavis-blue hover:text-white transition-all shadow-sm whitespace-nowrap ${order.anulado ? 'opacity-50' : ''}`}>
                        Ver Voucher
                      </button>

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
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 text-flavis-blue/40 dark:text-white/20 disabled:opacity-10 transition-opacity font-sans text-xs font-bold uppercase tracking-widest">« Atrás</button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-full font-black text-[10px] transition-all ${currentPage === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-flavis-card-dark text-flavis-blue/40 dark:text-white/30 border border-flavis-blue/5 dark:border-white/5 font-sans'}`}>{i + 1}</button>
            ))}
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 text-flavis-blue/40 dark:text-white/20 disabled:opacity-10 transition-opacity font-sans text-xs font-bold uppercase tracking-widest">Sig. »</button>
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
              {viewingOrder.detalles.map((det, idx) => {
                const nombreItem = det.esPack ? `📦 Pack: ${det.pack?.nombre}` : det.cookie?.nombre;
                return (
                  <div key={idx} className="flex justify-between items-center bg-white/50 dark:bg-white/5 p-3 rounded-2xl border border-flavis-blue/5">
                    <span className="text-sm font-bold text-flavis-blue dark:text-white/90">{nombreItem}</span>
                    <span className="bg-flavis-gold text-white px-3 py-1 rounded-full font-black text-xs">x{det.cantidad}</span>
                  </div>
                );
              })}
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