import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Label, PieChart, Pie, Cell 
} from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const DashboardModule = ({ isDarkMode }) => {
  const [orders, setOrders] = useState([]);
  const [allPreventas, setAllPreventas] = useState([]);
  const [selectedPV, setSelectedPV] = useState('all');
  const [loading, setLoading] = useState(true);

  const chartTextColor = isDarkMode ? '#ffffff60' : '#32637160';
  const gridColor = isDarkMode ? '#ffffff10' : '#eee';
  const COLORS = ['#326371', '#b8995a', '#7a9ba5', '#d4c39d', '#1e3b44'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pvRes, ordersRes] = await Promise.all([
        api.get('/preventas'),
        api.get('/pedidos')
      ]);
      
      const sortedPVs = (pvRes.data || []).sort((a, b) => b.id - a.id);
      setAllPreventas(sortedPVs);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRADO DE ÓRDENES (REGLA: NO ANULADOS + REGLA: ÚLTIMAS 3 CAMPAÑAS) ---
  const filteredOrders = orders
    .filter(o => !o.anulado) // Solo pedidos válidos
    .filter(o => {
      if (selectedPV === 'all') {
        // En vista general, solo mostramos lo que pertenece a las últimas 3 campañas cargadas
        return allPreventas.some(pv => pv.id === o.preVenta?.id);
      }
      return o.preVenta?.id?.toString() === selectedPV.toString();
    });

  // --- LÓGICA DE CÁLCULOS FILTRADOS (FASE 1) ---
  const totalRecaudado = filteredOrders.reduce((acc, curr) => acc + (curr.montoTotal || 0), 0);
  const totalEnvios = filteredOrders.reduce((acc, curr) => acc + (curr.costoEnvio || 0), 0);
  const totalVentaGalletas = totalRecaudado - totalEnvios;
  
  const totalOrdenes = filteredOrders.length;
  const ticketPromedio = totalOrdenes > 0 ? totalVentaGalletas / totalOrdenes : 0;

  // --- PROCESAMIENTO DE TIEMPO PARA EL GRÁFICO ---
  const salesTimeline = filteredOrders.reduce((acc, o) => {
    const date = new Date(o.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    if (!acc[date]) {
      acc[date] = { 
        total: 0, 
        pvId: o.preVenta?.id, 
        rawDate: new Date(o.fechaCreacion),
        campaniaName: o.preVenta?.nombreCampania 
      };
    }
    acc[date].total += o.montoTotal;
    return acc;
  }, {});

  // --- LÓGICA DE FILTRADO PARA EL GRÁFICO (REGLA: ÚLTIMAS 3 CON DATOS) ---
  const chartOrders = useMemo(() => {
    const validOrders = orders.filter(o => !o.anulado);
    
    if (selectedPV === 'all') {
      // 1. Identificamos los IDs de las últimas 3 campañas que sí tienen pedidos
      const campaignsWithOrders = [...new Set(validOrders.map(o => o.preVenta?.id))]
        .sort((a, b) => b - a)
        .slice(0, 3);
        
      // 2. Filtramos pedidos solo de esas 3 campañas para el gráfico
      return validOrders.filter(o => campaignsWithOrders.includes(o.preVenta?.id));
    }
    
    // Si hay una campaña específica seleccionada, solo mostramos esa
    return validOrders.filter(o => o.preVenta?.id?.toString() === selectedPV.toString());
  }, [orders, selectedPV]);

  // --- GENERACIÓN DE DATOS DEL GRÁFICO ---
  const chartData = useMemo(() => {
    const salesTimeline = chartOrders.reduce((acc, o) => {
      const date = new Date(o.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) {
        acc[date] = { total: 0, pvId: o.preVenta?.id, campaniaName: o.preVenta?.nombreCampania, rawDate: new Date(o.fechaCreacion) };
      }
      acc[date].total += o.montoTotal;
      return acc;
    }, {});

    return Object.entries(salesTimeline)
      .map(([name, data]) => ({ name, total: data.total, pvId: data.pvId, campaniaName: data.campaniaName, rawDate: data.rawDate }))
      .sort((a, b) => a.rawDate - b.rawDate);
  }, [chartOrders]);

  // --- LÓGICA DE TRIPLE LÍNEA DIVISORIA (ESTÁTICA Y MÓVIL) ---
  const divisionLines = useMemo(() => {
    if (selectedPV !== 'all' || chartData.length === 0) return [];
    
    const lines = [];
    const uniquePVIds = [...new Set(chartData.map(d => d.pvId))];

    uniquePVIds.forEach((id) => {
      // Encontramos el primer punto de datos que pertenece a esta campaña
      const firstOccurence = chartData.find(d => d.pvId === id);
      if (firstOccurence) {
        lines.push({
          x: firstOccurence.name,
          label: firstOccurence.campaniaName
        });
      }
    });
    return lines;
  }, [chartData, selectedPV]);

  const cookieStats = filteredOrders.reduce((acc, o) => {
    if (o.detalles) {
      o.detalles.forEach(d => {
        if (d.esPack && d.pack && d.pack.galletas) {
          d.pack.galletas.forEach(g => {
            acc[g.nombre] = (acc[g.nombre] || 0) + d.cantidad;
          });
        } else if (d.cookie) {
          const nombre = d.cookie.nombre;
          acc[nombre] = (acc[nombre] || 0) + d.cantidad;
        }
      });
    }
    return acc;
  }, {});

  const topCookie = Object.entries(cookieStats).sort((a, b) => b[1] - a[1])[0] || ["---", 0];
  const pieData = Object.entries(cookieStats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // --- EXPORTACIÓN A EXCEL CON REGLA DE PRIVACIDAD ---
  const exportGlobalExcel = async () => {
    const workbook = new ExcelJS.Workbook();  
    const isAll = selectedPV === 'all';
    const pvData = allPreventas.find(pv => pv.id.toString() === selectedPV.toString());
    const sheetName = isAll ? 'Historial Flavis' : `Campania_${pvData?.nombreCampania.substring(0, 15)}`;
    const sheet = workbook.addWorksheet(sheetName);
    
    sheet.columns = [
      { header: 'Campaña', key: 'campania', width: 25 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Celular', key: 'celular', width: 15 },
      { header: 'Pedido Detallado', key: 'pedido', width: 50 },
      { header: 'Total (S/)', key: 'monto', width: 15 }
    ];

    filteredOrders.forEach(o => {
      sheet.addRow({
        campania: o.preVenta?.nombreCampania || 'N/A',
        fecha: new Date(o.fechaCreacion).toLocaleDateString(),
        cliente: o.cliente?.guardarDatos ? `${o.cliente.nombre} ${o.cliente.apellido}` : 'ANÓNIMO',
        celular: o.cliente?.guardarDatos ? o.cliente.celular : 'OCULTO',
        pedido: o.detalles?.map(d => {
          const name = d.esPack ? `📦 Pack: ${d.pack?.nombre}` : d.cookie?.nombre;
          return `${d.cantidad}x ${name}`;
        }).join(", "),
        monto: o.montoTotal.toFixed(2)
      });
    });

    sheet.addRow({});
    const totalRow = sheet.addRow({ 
      pedido: 'RESUMEN TOTAL DE INGRESOS (Caja):', 
      monto: totalRecaudado.toFixed(2) 
    });
    totalRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = isAll ? 'Flavis_Historico_Privacidad' : `Reporte_Campaña_${pvData?.nombreCampania.replace(/\s+/g, '_')}`;
    saveAs(new Blob([buffer]), `${fileName}.xlsx`);
  };

  const sendDailySummary = () => {
    let mensaje = "";
    const emojiCookie = "%F0%9F%8D%AA", emojiChart = "%F0%9F%93%88", emojiMoney = "%F0%9F%92%B0", emojiBox = "%F0%9F%93%A6";

    if (selectedPV === 'all') {
      // REPORTE GLOBAL: Usa todos los datos históricos
      mensaje = `${emojiChart} *FLAVIS - RECORRIDO HISTÓRICO*%0A%0A` +
        `*Ingresos Totales:* S/ ${totalIngresos.toFixed(2)}%0A` +
        `*Pedidos Totales:* ${totalOrdenes}%0A` +
        `*Cookie All-Star:* ${topCookie[0]}%0A%0A` +
        `_¡Flavis sigue creciendo!_ ${emojiCookie}`;
    } else {
      // REPORTE ESPECÍFICO: Solo la campaña seleccionada
      const pvActual = allPreventas.find(pv => pv.id.toString() === selectedPV.toString());
      mensaje = `${emojiChart} *REPORTE DE CAMPAÑA: ${pvActual?.nombreCampania}*%0A%0A` +
              `*Ventas Totales:* S/ ${totalRecaudado.toFixed(2)}%0A` +
              `*Neto Galletas:* S/ ${totalVentaGalletas.toFixed(2)}%0A` +
              `*Caja Delivery:* S/ ${totalEnvios.toFixed(2)}%0A` +
              `*N° de Pedidos:* ${totalOrdenes}%0A%0A`;
    }
    window.open(`https://api.whatsapp.com/send?text=${mensaje}`, '_blank');
  };

  const MetricCard = ({ title, value, color, isMainFont = false }) => (
    <div className="bg-white dark:bg-flavis-card-dark p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-flavis-blue/5 dark:border-white/5 transition-all duration-300 min-w-0 flex flex-col justify-center">
      <p className="text-[9px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-[0.2em] mb-2 font-sans truncate">
        {title}
      </p>
      <p className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter leading-tight break-words ${color} ${isMainFont ? 'font-main italic' : 'font-secondary text-with-symbols'}`}>
        {value}
      </p>
    </div>
  );

  if (loading) return <div className="p-20 text-center font-sans font-bold text-flavis-blue dark:text-flavis-gold animate-pulse">Analizando campañas pasadas...</div>;

  return (
    <div className="animate-in pb-20 font-sans">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-2 tracking-tighter transition-colors">Análisis de Negocio</h2>
          <div className="flex items-center gap-3">
            <select 
              className="bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/10 p-3 rounded-xl text-[11px] font-black uppercase text-flavis-blue dark:text-white/90 outline-none focus:border-flavis-gold shadow-sm cursor-pointer transition-all font-sans"
              value={selectedPV}
              onChange={(e) => setSelectedPV(e.target.value)}
            >
              <option value="all">Historial Total</option>
              {allPreventas.map(pv => (
                <option key={pv.id} value={pv.id}>Campaña: {pv.nombreCampania}</option>
              ))}
            </select>
            <button onClick={exportGlobalExcel} className="bg-flavis-blue dark:bg-white/10 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md font-sans">
              Descargar Excel
            </button>
            <button onClick={sendDailySummary} className="bg-flavis-gold text-flavis-blue px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md font-sans">
              WhatsApp
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">        
        <MetricCard title="Neto Galletas" value={`S/ ${totalVentaGalletas.toFixed(2)}`} color="text-flavis-gold" />
        <MetricCard title="Caja Delivery" value={`S/ ${totalEnvios.toFixed(2)}`} color="text-flavis-blue dark:text-white/90" />
        <MetricCard title="Órdenes" value={totalOrdenes.toString().padStart(2, '0')} color="text-flavis-blue dark:text-white/90" />
        <MetricCard title="Ticket Promedio" value={`S/ ${ticketPromedio.toFixed(2)}`} color="text-flavis-blue dark:text-white/90" />
        <MetricCard title="Galleta Estrella" value={topCookie[0]} color="text-flavis-blue dark:text-flavis-gold" isMainFont />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* GRÁFICO CON TRIPLE LÍNEA DIVISORIA */}
        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[3rem] shadow-xl border border-flavis-blue/5 dark:border-white/5 transition-all duration-300">
          <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic mb-8 transition-colors">Flujo de Ingresos</h3>
          <div className="h-72 w-full relative min-h-[350px]"> 
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e3b44' : '#fff', 
                    borderRadius: '20px', border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    fontFamily: 'Prata, serif', color: isDarkMode ? '#fff' : '#326371'
                  }} 
                />
                
                {/* TRIPLE LÍNEA DIVISORIA DINÁMICA */}
                {divisionLines.map((line, idx) => (
                  <ReferenceLine key={idx} x={line.x} stroke={isDarkMode ? '#ffffff30' : '#ccc'} strokeDasharray="5 5">
                    <Label 
                      value={line.label} 
                      position="top" 
                      fill={isDarkMode ? '#b8995a' : '#326371'} 
                      fontSize={9} fontWeight="bold" 
                      offset={15} className="font-secondary italic"
                    />
                  </ReferenceLine>
                ))}

                <Area type="monotone" dataKey="total" stroke="#b8995a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MIX DE SABORES (LEYENDA DETALLADA RECUPERADA) */}
        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[3rem] shadow-xl border border-flavis-blue/5 dark:border-white/5 transition-all duration-300">
          <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic mb-8 transition-colors">Mix de Sabores</h3>
          <div className="h-72 w-full flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e3b44' : '#fff', borderRadius: '20px', border: 'none', fontFamily: 'Prata, serif', color: isDarkMode ? '#fff' : '#326371' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* LEYENDA DETALLADA LADO DERECHO CON SCROLL LIMITADO */}
            <div className="w-1/2 pl-4 pr-2 overflow-y-auto max-h-[210px] custom-scrollbar">
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between gap-2 border-b border-flavis-blue/5 dark:border-white/5 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{backgroundColor: COLORS[index % COLORS.length]}} 
                      />
                      <span className="text-[10px] font-black text-flavis-blue dark:text-white/80 truncate font-sans uppercase tracking-tight">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-flavis-gold font-sans ml-1">
                      {entry.value}
                    </span>
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