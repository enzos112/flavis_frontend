import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ReferenceLine, Label, PieChart, Pie, Cell 
} from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingSpinner from '../common/LoadingSpinner';

// --- ICONOS VECTORIALES COMPARTIDOS ---
const Icons = {
  Excel: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>,
  PDF: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13v4"/><path d="M10 13c0 1.1.9 2 2 2h.5c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2H10"/></svg>,
  WhatsApp: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  TrendUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Box: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Equals: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-flavis-gold"><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/></svg>
};

// --- COMPONENTE TOOLTIP REUTILIZABLE ---
const InfoTooltip = ({ text }) => (
  <div className="relative group inline-flex items-center justify-center ml-1.5 cursor-help">
    <span className="w-4 h-4 rounded-full bg-flavis-blue/10 dark:bg-white/10 text-flavis-blue/60 dark:text-white/60 flex items-center justify-center text-[10px] font-black group-hover:bg-flavis-gold group-hover:text-white transition-all shadow-sm">
      ?
    </span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-[#1e3b44] dark:bg-white text-white dark:text-flavis-blue text-[10px] font-secondary font-medium tracking-normal normal-case leading-relaxed text-center rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-white/10 dark:border-flavis-blue/10">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e3b44] dark:border-t-white"></div>
    </div>
  </div>
);

const DashboardModule = ({ isDarkMode }) => {
  const [orders, setOrders] = useState([]);
  const [allPreventas, setAllPreventas] = useState([]);
  const [egresos, setEgresos] = useState([]); 
  
  const [selectedPV, setSelectedPV] = useState('last5');
  const [loading, setLoading] = useState(true);
  const [trophyView, setTrophyView] = useState('individuales');

  const chartTextColor = isDarkMode ? '#ffffff60' : '#32637160';
  const gridColor = isDarkMode ? '#ffffff10' : '#eee';
  const COLORS = ['#326371', '#b8995a', '#7a9ba5', '#d4c39d', '#1e3b44'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pvRes, ordersRes, egresosRes] = await Promise.all([
        api.get('/preventas'),
        api.get('/pedidos'),
        api.get('/egresos').catch(() => ({ data: [] }))
      ]);
      
      const sortedPVs = (pvRes.data || []).sort((a, b) => b.id - a.id);
      setAllPreventas(sortedPVs);
      setOrders(ordersRes.data || []);
      setEgresos(egresosRes.data || []);

      const campaniaActiva = sortedPVs.find(pv => pv.activo);
      if (campaniaActiva) {
        setSelectedPV(campaniaActiva.id.toString());
      } else {
        setSelectedPV('last5');
      }

    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    if (selectedPV === 'all') return 'Historial Total (Todo)';
    if (selectedPV === 'last5') return 'Últimas 5 Campañas';
    const pv = allPreventas.find(p => p.id.toString() === selectedPV.toString());
    return pv ? pv.nombreCampania : 'Campaña';
  };

  const filteredOrders = useMemo(() => {
    const valid = orders.filter(o => !o.anulado);
    if (selectedPV === 'all') return valid; 
    
    if (selectedPV === 'last5') {
      const last5Ids = allPreventas.slice(0, 5).map(pv => pv.id);
      return valid.filter(o => last5Ids.includes(o.preVenta?.id));
    }
    
    return valid.filter(o => o.preVenta?.id?.toString() === selectedPV.toString());
  }, [orders, selectedPV, allPreventas]);

  const filteredEgresos = useMemo(() => {
    if (selectedPV === 'all') return egresos; 
    
    if (selectedPV === 'last5') {
      const last5Ids = allPreventas.slice(0, 5).map(pv => pv.id);
      return egresos.filter(e => last5Ids.includes(e.preVenta?.id || e.preVentaId));
    }
    
    return egresos.filter(e => (e.preVenta?.id?.toString() || e.preVentaId?.toString()) === selectedPV.toString());
  }, [egresos, selectedPV, allPreventas]);

  const isCampaniaCerrada = useMemo(() => {
    if (selectedPV === 'all' || selectedPV === 'last5') return true; 
    const currentPv = allPreventas.find(p => p.id.toString() === selectedPV.toString());
    return currentPv ? !currentPv.activo : false;
  }, [selectedPV, allPreventas]);

  // --- LÓGICA DE CÁLCULOS FINANCIEROS ---
  const totalRecaudado = filteredOrders.reduce((acc, curr) => acc + (curr.montoTotal || 0), 0);
  
  const costoProduccionTotal = filteredOrders.reduce((acc, o) => {
    const costoPedido = o.detalles?.reduce((sum, d) => {
      const costo = d.costoUnitario ?? (d.esPack ? (d.pack?.costoProduccion || 0) : (d.cookie?.costoProduccion || 0));
      return sum + (costo * d.cantidad);
    }, 0) || 0;
    return acc + costoPedido;
  }, 0);

  const displayEgresos = filteredEgresos.reduce((acc, curr) => acc + curr.monto, 0); 
  const displayUtilidad = totalRecaudado - costoProduccionTotal - displayEgresos; 

  const totalPedidos = filteredOrders.length;
  const ticketPromedio = totalPedidos > 0 ? totalRecaudado / totalPedidos : 0;  

  const totalGalletasCalculadas = filteredOrders.reduce((acc, o) => {
    const galletasEnPedido = o.detalles?.reduce((sum, d) => 
      sum + (d.esPack ? d.cantidad * (d.pack?.galletas?.length || 0) : d.cantidad), 0
    ) || 0;
    return acc + galletasEnPedido;
  }, 0);

  const displayGalletas = isCampaniaCerrada ? totalGalletasCalculadas.toString() : "En curso...";
  const galletasSubtitle = isCampaniaCerrada ? "Volumen de producción final" : "Se calculará al cerrar";

  // --- INTELIGENCIA DE NEGOCIOS (SEPARADO INDIVIDUALES Y PACKS) ---
  const { cookiesTrophies, packsTrophies, pieData } = useMemo(() => {
    const statsCookies = {};
    const statsPacks = {};
    const flavorStats = {};

    filteredOrders.forEach(o => {
      if (o.detalles) {
        o.detalles.forEach(d => {
          const isPack = d.esPack;
          const cantidad = d.cantidad;
          const pUnitario = d.precioUnitario || 0;
          const cUnitario = d.costoUnitario ?? (isPack ? (d.pack?.costoProduccion || 0) : (d.cookie?.costoProduccion || 0));
          const utilidadNetaPorVenta = (pUnitario - cUnitario) * cantidad;
          const margenFijo = pUnitario - cUnitario;

          if (isPack && d.pack && d.pack.galletas) {
            d.pack.galletas.forEach(g => {
              flavorStats[g.nombre] = (flavorStats[g.nombre] || 0) + cantidad;
            });
          } else if (d.cookie) {
            flavorStats[d.cookie.nombre] = (flavorStats[d.cookie.nombre] || 0) + cantidad;
          }

          if (isPack) {
            const nombre = d.pack?.nombre || 'Pack Eliminado';
            if (!statsPacks[nombre]) statsPacks[nombre] = { nombre, unidadesVendidas: 0, utilidadTotal: 0, margenFijo };
            statsPacks[nombre].unidadesVendidas += cantidad;
            statsPacks[nombre].utilidadTotal += utilidadNetaPorVenta;
            statsPacks[nombre].margenFijo = margenFijo;
          } else {
            const nombre = d.cookie?.nombre || 'Galleta Eliminada';
            if (!statsCookies[nombre]) statsCookies[nombre] = { nombre, unidadesVendidas: 0, utilidadTotal: 0, margenFijo };
            statsCookies[nombre].unidadesVendidas += cantidad;
            statsCookies[nombre].utilidadTotal += utilidadNetaPorVenta;
            statsCookies[nombre].margenFijo = margenFijo;
          }
        });
      }
    });

    const getWinners = (stats) => {
      const list = Object.values(stats);
      if (list.length === 0) return { topVentas: null, topGanancia: null, topMargen: null };
      return {
        topVentas: [...list].sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)[0],
        topGanancia: [...list].sort((a, b) => b.utilidadTotal - a.utilidadTotal)[0],
        topMargen: [...list].sort((a, b) => b.margenFijo - a.margenFijo)[0],
      };
    };

    const torta = Object.entries(flavorStats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return { cookiesTrophies: getWinners(statsCookies), packsTrophies: getWinners(statsPacks), pieData: torta };
  }, [filteredOrders]);

  const chartOrders = useMemo(() => {
    const validOrders = orders.filter(o => !o.anulado);
    if (selectedPV === 'all' || selectedPV === 'last5') {
      const last5Ids = allPreventas.slice(0, 5).map(pv => pv.id);
      return validOrders.filter(o => last5Ids.includes(o.preVenta?.id));
    }
    return validOrders.filter(o => o.preVenta?.id?.toString() === selectedPV.toString());
  }, [orders, selectedPV, allPreventas]);

  const chartData = useMemo(() => {
    const salesTimeline = chartOrders.reduce((acc, o) => {
      const date = new Date(o.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) acc[date] = { total: 0, pvId: o.preVenta?.id, campaniaName: o.preVenta?.nombreCampania, rawDate: new Date(o.fechaCreacion) };
      acc[date].total += o.montoTotal;
      return acc;
    }, {});

    return Object.entries(salesTimeline).map(([name, data]) => ({ name, total: data.total, pvId: data.pvId, campaniaName: data.campaniaName, rawDate: data.rawDate })).sort((a, b) => a.rawDate - b.rawDate);
  }, [chartOrders]);

  const divisionLines = useMemo(() => {
    if ((selectedPV !== 'all' && selectedPV !== 'last5') || chartData.length === 0) return [];
    const lines = [];
    const uniquePVIds = [...new Set(chartData.map(d => d.pvId))];
    uniquePVIds.forEach((id) => {
      const firstOccurence = chartData.find(d => d.pvId === id);
      if (firstOccurence) lines.push({ x: firstOccurence.name, label: firstOccurence.campaniaName });
    });
    return lines;
  }, [chartData, selectedPV]);

  const exportGlobalExcel = async () => {
    const workbook = new ExcelJS.Workbook();  
    const sheetName = selectedPV === 'all' ? 'Historial_Total' : selectedPV === 'last5' ? 'Ultimas_5_Campanias' : 'Reporte_Campania';
    const sheet = workbook.addWorksheet(sheetName);
    
    sheet.columns = [
      { header: 'Campaña', key: 'campania', width: 25 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Pedido Detallado', key: 'pedido', width: 50 },
      { header: 'Ingreso (S/)', key: 'monto', width: 15 },
      { header: 'Costo Insumos (S/)', key: 'costo', width: 18 },
      { header: 'Utilidad Bruta (S/)', key: 'utilidad', width: 20 }
    ];

    filteredOrders.forEach(o => {
      let costoPedido = 0;
      const detallesPedido = o.detalles?.map(d => {
        const name = d.esPack ? `📦 Pack: ${d.pack?.nombre}` : d.cookie?.nombre;
        const costo = d.costoUnitario ?? (d.esPack ? (d.pack?.costoProduccion || 0) : (d.cookie?.costoProduccion || 0));
        costoPedido += (costo * d.cantidad);
        return `${d.cantidad}x ${name}`;
      }).join(", ");

      const utilidadPedido = o.montoTotal - costoPedido;

      sheet.addRow({
        campania: o.preVenta?.nombreCampania || 'N/A',
        fecha: new Date(o.fechaCreacion).toLocaleDateString(),
        cliente: o.cliente?.guardarDatos ? `${o.cliente.nombre} ${o.cliente.apellido}` : 'ANÓNIMO',
        pedido: detallesPedido,
        monto: o.montoTotal.toFixed(2),
        costo: costoPedido.toFixed(2),
        utilidad: utilidadPedido.toFixed(2)
      });
    });

    sheet.addRow({});
    sheet.addRow({ pedido: 'RESUMEN TOTAL FINANCIERO:', monto: totalRecaudado.toFixed(2), costo: costoProduccionTotal.toFixed(2), utilidad: (totalRecaudado - costoProduccionTotal).toFixed(2) }).font = { bold: true };
    sheet.addRow({});
    sheet.addRow({ pedido: '--- ANÁLISIS DE PRODUCTOS ---' }).font = { bold: true, italic: true };
    sheet.addRow({ pedido: 'INDIVIDUAL - Más Vendida (Volumen):', monto: cookiesTrophies.topVentas?.nombre || 'N/A' });
    sheet.addRow({ pedido: 'INDIVIDUAL - Mina de Oro (Utilidad Total):', monto: cookiesTrophies.topGanancia?.nombre || 'N/A' });
    sheet.addRow({ pedido: 'PACK - Más Vendido (Volumen):', monto: packsTrophies.topVentas?.nombre || 'N/A' });
    sheet.addRow({ pedido: 'PACK - Mina de Oro (Utilidad Total):', monto: packsTrophies.topGanancia?.nombre || 'N/A' });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Flavis_Finanzas_${sheetName}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const titulo = getReportTitle();
    
    doc.setFontSize(18);
    doc.text(`Flavis - Reporte: ${titulo}`, 14, 20);
    doc.setFontSize(12);
    doc.text("Resumen de Órdenes", 14, 30);
    
    autoTable(doc, {
      startY: 35,
      head: [['Fecha', 'Cliente', 'Campaña', 'Total', 'Utilidad Bruta']],
      body: filteredOrders.map(o => {
        let costoP = o.detalles?.reduce((sum, d) => sum + ((d.costoUnitario || 0) * d.cantidad), 0) || 0;
        return [
          new Date(o.fechaCreacion).toLocaleDateString(),
          o.cliente?.guardarDatos ? `${o.cliente.nombre}` : 'ANÓNIMO',
          o.preVenta?.nombreCampania || 'N/A',
          `S/ ${o.montoTotal.toFixed(2)}`,
          `S/ ${(o.montoTotal - costoP).toFixed(2)}`
        ]
      }),
      headStyles: { fillColor: [50, 99, 113] },
      styles: { fontSize: 9 } 
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text("Análisis de Productos Estrella:", 14, finalY);
    doc.setFontSize(10);
    doc.text(`Galleta con más utilidad: ${cookiesTrophies.topGanancia?.nombre || 'N/A'}`, 14, finalY + 8);
    doc.text(`Pack con más utilidad: ${packsTrophies.topGanancia?.nombre || 'N/A'}`, 14, finalY + 14);

    doc.save(`Flavis_Reporte_${titulo.replace(/\s+/g, '_')}.pdf`);
  };

  const sendDailySummary = () => {
    const emojiCookie = "%F0%9F%8D%AA", emojiChart = "%F0%9F%93%88", emojiTrophy = "%F0%9F%8F%86";
    const titulo = getReportTitle().toUpperCase();

    const mensaje = `${emojiChart} *FLAVIS - ${titulo}*%0A%0A` +
            `*Ingresos (Caja):* S/ ${totalRecaudado.toFixed(2)}%0A` +
            `*Costo Insumos:* -S/ ${costoProduccionTotal.toFixed(2)}%0A` +
            `*Egresos Oper.:* -S/ ${displayEgresos.toFixed(2)}%0A` +
            `*Ganancia Libre:* S/ ${displayUtilidad.toFixed(2)}%0A%0A` +
            `*N° de Pedidos:* ${totalPedidos}%0A%0A` +
            `${emojiTrophy} *TOP INDIVIDUAL:* ${cookiesTrophies.topGanancia?.nombre || 'N/A'}%0A` + 
            `${emojiTrophy} *TOP PACK:* ${packsTrophies.topGanancia?.nombre || 'N/A'}%0A%0A` + 
            `_Flavis Dashboard_ ${emojiCookie}`;
            
    window.open(`https://api.whatsapp.com/send?text=${mensaje}`, '_blank');
  };

  const MetricCard = ({ title, value, subtitle }) => (
    <div className="bg-white dark:bg-flavis-card-dark p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-blue/5 dark:border-white/5 transition-all text-center">
      <p className="text-[9px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-1 truncate">{title}</p>
      <p className="text-xl font-black tracking-tighter text-flavis-blue dark:text-white font-sans">{value}</p>
      {subtitle && <p className="text-[8px] font-bold opacity-30 mt-1 uppercase truncate tracking-widest">{subtitle}</p>}
    </div>
  );

  // --- SUB-COMPONENTE DE TARJETAS DE TROFEOS ---
  const TrophyCards = ({ trophies, labelType }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <div className="group bg-flavis-blue dark:bg-flavis-card-dark p-6 rounded-[2rem] shadow-lg border border-flavis-blue/5 transition-all text-white relative flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-7xl animate-pulse group-hover:scale-110 transition-transform duration-700">🏆</div>
        </div>
        
        <div className="relative z-10">
          <div className="text-[9px] uppercase font-black tracking-widest mb-1 opacity-70 flex items-center">
            Más Vendido (Volumen)
            <InfoTooltip text="El favorito del público. Es el producto que más unidades ha movido, independientemente de su precio." />
          </div>
          <p className="text-xl font-main font-bold italic tracking-tighter text-flavis-gold truncate">{trophies.topVentas ? trophies.topVentas.nombre : 'N/A'}</p>
          <p className="text-[9px] font-bold opacity-70 mt-1 uppercase tracking-widest">{trophies.topVentas ? `${trophies.topVentas.unidadesVendidas} ${labelType} despachadas` : '--'}</p>
        </div>
      </div>

      <div className="group bg-[#1e3b44] dark:bg-flavis-card-dark p-6 rounded-[2rem] shadow-lg border border-flavis-blue/5 transition-all text-white relative flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-7xl animate-pulse group-hover:scale-110 transition-transform duration-700">💰</div>
        </div>

        <div className="relative z-10">
          <div className="text-[9px] uppercase font-black tracking-widest mb-1 text-green-400 flex items-center">
            Mina de Oro (Ganancia Total)
            <InfoTooltip text="El campeón financiero. El producto que más dinero neto (libre) ha sumado a tu caja fuerte por volumen de ventas." />
          </div>
          <p className="text-xl font-main font-bold italic tracking-tighter text-white truncate">{trophies.topGanancia ? trophies.topGanancia.nombre : 'N/A'}</p>
          <p className="text-[9px] font-bold opacity-70 mt-1 uppercase tracking-widest">{trophies.topGanancia ? `Dejó S/ ${trophies.topGanancia.utilidadTotal.toFixed(2)} libres` : '--'}</p>
        </div>
      </div>

      <div className="group bg-gradient-to-br from-flavis-gold to-[#9a7d45] dark:from-flavis-gold/20 dark:to-flavis-gold/5 p-6 rounded-[2rem] shadow-lg border border-flavis-gold/30 transition-all text-white relative flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-20 text-7xl animate-pulse group-hover:scale-110 transition-transform duration-700">💎</div>
        </div>

        <div className="relative z-10">
          <div className="text-[9px] uppercase font-black tracking-widest mb-1 text-white/80 dark:text-flavis-gold flex items-center">
            Mejor Margen (Por Unidad)
            <InfoTooltip text="El más rentable individualmente. Es el que te deja mayor ganancia limpia en el bolsillo por cada unidad vendida." />
          </div>
          <p className="text-xl font-main font-bold italic tracking-tighter text-white truncate">{trophies.topMargen ? trophies.topMargen.nombre : 'N/A'}</p>
          <p className="text-[9px] font-bold text-white/90 dark:text-white/60 mt-1 uppercase tracking-widest">{trophies.topMargen ? `Ganas S/ ${trophies.topMargen.margenFijo.toFixed(2)} por ${labelType}` : '--'}</p>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner mensaje="Analizando estadísticas..." />;

  return (
    <div className="animate-in pb-20 font-sans px-2">
      
      {/* --- HEADER --- */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic tracking-tighter transition-colors">Análisis Financiero</h2>
          <p className="text-[10px] uppercase font-black tracking-widest text-flavis-blue/40 dark:text-white/30 mt-1">Resultados consolidados y utilidad real</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/5 p-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-flavis-blue dark:text-white outline-none focus:border-flavis-gold shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none cursor-pointer transition-all"
            value={selectedPV} onChange={(e) => setSelectedPV(e.target.value)}
          >
            <option value="last5">Últimas 5 Campañas</option>
            <option value="all">Historial Total (Todo)</option>
            {allPreventas.map(pv => (<option key={pv.id} value={pv.id}>Campaña: {pv.nombreCampania}</option>))}
          </select>
          <button onClick={exportGlobalExcel} className="flex items-center gap-1.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-5 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-[0_8px_30px_rgba(50,99,113,0.06)]">
            <Icons.Excel /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-1.5 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 px-5 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-white transition-all shadow-[0_8px_30px_rgba(50,99,113,0.06)]">
            <Icons.PDF /> PDF
          </button>
          <button onClick={sendDailySummary} className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] px-5 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all shadow-[0_8px_30px_rgba(50,99,113,0.06)]">
            <Icons.WhatsApp /> Reporte
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-flavis-card-dark rounded-[3rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] border border-flavis-blue/5 p-8 lg:p-10 mb-6 transition-all">
        <p className="text-[10px] font-black uppercase tracking-widest text-flavis-blue/40 mb-6 text-center lg:text-left">Ecuación de Rentabilidad ({getReportTitle()})</p>
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
          
          <div className="flex-1 w-full text-center bg-flavis-blue/5 p-5 rounded-[2rem]">
            <div className="text-[9px] uppercase font-black text-flavis-blue/50 tracking-widest mb-2 flex items-center justify-center gap-2">
              <Icons.TrendUp /> Ingresos Totales
              <InfoTooltip text="Dinero total cobrado a los clientes en la tienda (incluye ventas de galletas y servicios de delivery)." />
            </div>
            <p className="text-3xl font-black tracking-tighter text-flavis-blue font-sans">S/ {totalRecaudado.toFixed(2)}</p>
            <p className="text-[8px] font-bold opacity-40 mt-1 uppercase tracking-widest">Cobrado al cliente</p>
          </div>
          
          <div className="hidden xl:flex"><Icons.Minus /></div>
          
          <div className="flex-1 w-full text-center bg-orange-50 p-5 rounded-[2rem] border border-orange-100">
            <div className="text-[9px] uppercase font-black text-orange-400 tracking-widest mb-2 flex items-center justify-center gap-2">
              <Icons.Box /> Costo Insumos
              <InfoTooltip text="Dinero reservado automáticamente por el sistema para reponer los ingredientes de los productos que ya vendiste." />
            </div>
            <p className="text-3xl font-black tracking-tighter text-orange-500/80 font-sans">S/ {costoProduccionTotal.toFixed(2)}</p>
            <p className="text-[8px] font-bold opacity-40 mt-1 uppercase tracking-widest text-orange-500">Receta (Auto)</p>
          </div>
          
          <div className="hidden xl:flex"><Icons.Minus /></div>
          
          <div className="flex-1 w-full text-center bg-red-50 p-5 rounded-[2rem] border border-red-100">
            <div className="text-[9px] uppercase font-black text-red-400 tracking-widest mb-2 flex items-center justify-center gap-2">
              Egresos Oper.
              <InfoTooltip text="Gastos extras que registraste manualmente en el sistema (ej: cajas de empaque, pago a motorizado, publicidad)." />
            </div>
            <p className="text-3xl font-black tracking-tighter text-red-500/80 font-sans">S/ {displayEgresos.toFixed(2)}</p>
            <p className="text-[8px] font-bold opacity-40 mt-1 uppercase tracking-widest text-red-400">Gastos extra</p>
          </div>
          
          <div className="hidden xl:flex"><Icons.Equals /></div>
          
          <div className="flex-[1.2] w-full text-center bg-flavis-gold/10 p-5 rounded-[2rem] border-2 border-flavis-gold/30 relative">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-flavis-gold/20 rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10">
              <div className="text-[10px] uppercase font-black text-flavis-gold tracking-widest mb-1 flex items-center justify-center">
                Ganancia Libre
                <InfoTooltip text="Tu Utilidad Neta real. Es el dinero que te queda 100% libre para tu bolsillo tras descontar insumos y gastos extras." />
              </div>
              <p className="text-4xl lg:text-4xl font-black tracking-tighter text-green-600 font-sans">S/ {displayUtilidad.toFixed(2)}</p>
              <p className="text-[8px] font-bold opacity-60 mt-2 uppercase tracking-widest text-flavis-gold">Utilidad Neta Real</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">        
        <MetricCard title="Total Pedidos" value={totalPedidos.toString().padStart(2, '0')} subtitle="Confirmados en el periodo" />
        <MetricCard title="Galletas Elaboradas" value={displayGalletas} subtitle={galletasSubtitle} />
        <MetricCard title="Ticket Promedio" value={`S/ ${ticketPromedio.toFixed(2)}`} subtitle="Gasto promedio por cliente" />
      </div>

      <div className="mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
          <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic">
            Análisis de Productos Estrella
          </h3>
          
          <div className="flex bg-flavis-blue/5 dark:bg-white/5 p-1 rounded-2xl w-max shadow-inner">
            <button 
              onClick={() => setTrophyView('individuales')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trophyView === 'individuales' ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-md' : 'text-flavis-blue/40 dark:text-white/40 hover:text-flavis-blue dark:hover:text-white'}`}
            >
              Individuales
            </button>
            <button 
              onClick={() => setTrophyView('packs')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trophyView === 'packs' ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-md' : 'text-flavis-blue/40 dark:text-white/40 hover:text-flavis-blue dark:hover:text-white'}`}
            >
              Packs / Cajas
            </button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {trophyView === 'individuales' ? (
            <TrophyCards trophies={cookiesTrophies} labelType="unidades" />
          ) : (
            <TrophyCards trophies={packsTrophies} labelType="cajas" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[3rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-blue/5 dark:border-white/5 transition-all">
          <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic mb-8">Flujo de Ingresos</h3>
          <div className="h-72 w-full min-h-[350px]"> 
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 50, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b8995a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b8995a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontWeight: 'bold'}} className="font-secondary" />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontWeight: 'bold'}} className="font-secondary" />
                <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontFamily: 'Prata, serif', backgroundColor: isDarkMode ? '#1e3b44' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
                {divisionLines.map((line, idx) => (
                  <ReferenceLine key={idx} x={line.x} stroke="#ccc" strokeDasharray="5 5">
                    <Label value={line.label} position="top" fill={isDarkMode ? "#ffffff80" : "#326371"} fontSize={9} fontWeight="bold" offset={15} />
                  </ReferenceLine>
                ))}
                <Area type="monotone" dataKey="total" stroke="#b8995a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[3rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-flavis-blue/5 dark:border-white/5 transition-all">
          <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic mb-8">Sabores más preparados</h3>
          <div className="h-72 w-full flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontFamily: 'Prata, serif', fontSize: '12px', backgroundColor: isDarkMode ? '#1e3b44' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 pl-4 pr-2 overflow-y-auto max-h-[210px] custom-scrollbar">
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 border-b border-flavis-blue/5 dark:border-white/5 pb-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                      <span className="text-[10px] font-black text-flavis-blue dark:text-white truncate uppercase tracking-tight">{entry.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-flavis-gold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default DashboardModule;