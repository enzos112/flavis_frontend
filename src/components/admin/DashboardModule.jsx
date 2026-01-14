import React, { useState, useEffect } from 'react';
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

  const filteredOrders = orders
    .filter(o => !o.anulado)
    .filter(o => 
      selectedPV === 'all' ? true : o.preVenta?.id?.toString() === selectedPV.toString()
    );

  const totalIngresos = filteredOrders.reduce((acc, curr) => acc + (curr.montoTotal || 0), 0);
  const totalOrdenes = filteredOrders.length;
  const ticketPromedio = totalOrdenes > 0 ? totalIngresos / totalOrdenes : 0;

  const salesTimeline = filteredOrders.reduce((acc, o) => {
    const date = new Date(o.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    if (!acc[date]) acc[date] = { total: 0, pvId: o.preVenta?.id, rawDate: new Date(o.fechaCreacion) };
    acc[date].total += o.montoTotal;
    return acc;
  }, {});

  const chartData = Object.entries(salesTimeline)
    .map(([name, data]) => ({ 
      name, 
      total: data.total, 
      pvId: data.pvId,
      rawDate: data.rawDate 
    }))
    .sort((a, b) => a.rawDate - b.rawDate);

  // --- LÓGICA DINÁMICA DE NOMBRES DE CAMPAÑA EN GRÁFICO ---
  const divisionLines = [];
  if (selectedPV === 'all' && chartData.length > 0) {
    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].pvId !== chartData[i - 1].pvId) {
        // Buscamos el nombre real de la campaña que inicia en este punto
        const campaniaIniciante = allPreventas.find(pv => pv.id === chartData[i].pvId);
        divisionLines.push({
          x: chartData[i].name,
          label: campaniaIniciante?.nombreCampania || 'Nueva Campaña'
        });
      }
    }
  }

  const cookieStats = filteredOrders.reduce((acc, o) => {
    if (o.detalles) {
      o.detalles.forEach(d => {
        const nombre = d.cookie?.nombre || "Desconocida";
        acc[nombre] = (acc[nombre] || 0) + d.cantidad;
      });
    }
    return acc;
  }, {});

  const topCookie = Object.entries(cookieStats).sort((a, b) => b[1] - a[1])[0] || ["---", 0];
  const pieData = Object.entries(cookieStats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const exportGlobalExcel = async () => {
    const workbook = new ExcelJS.Workbook();  
    const isAll = selectedPV === 'all';
    const pvData = allPreventas.find(pv => pv.id.toString() === selectedPV.toString());
    const sheetName = isAll ? 'Historial Total' : `Campaña ${pvData?.nombreCampania}`;
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
        cliente: `${o.cliente?.nombre} ${o.cliente?.apellido}`,
        celular: o.cliente?.celular,
        pedido: o.detalles?.map(d => `${d.cantidad}x ${d.cookie?.nombre}`).join(", "),
        monto: o.montoTotal.toFixed(2)
      });
    });

    sheet.getRow(1).font = { bold: true };
    sheet.addRow({});
    const totalRow = sheet.addRow({ pedido: 'TOTAL RECAUDADO EN ESTA VISTA:', monto: totalIngresos.toFixed(2) });
    totalRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = isAll ? 'Flavis_Historico_Total_Ventas' : `Flavis_Reporte_${pvData?.nombreCampania.replace(/\s+/g, '_')}`;
    saveAs(new Blob([buffer]), `${fileName}.xlsx`);
  };

  const sendDailySummary = () => {
    let mensaje = "";
    if (selectedPV === 'all') {
      const validOrders = orders.filter(o => !o.anulado);
      const salesByPV = validOrders.reduce((acc, o) => {
        const nombre = o.preVenta?.nombreCampania || "Sin nombre";
        acc[nombre] = (acc[nombre] || 0) + o.montoTotal;
        return acc;
      }, {});
      const mejorPV = Object.entries(salesByPV).sort((a, b) => b[1] - a[1])[0] || ["---", 0];
      mensaje = `📈 *FLAVIS - RECORRIDO HISTÓRICO*%0A%0A` +
        `✅ *Campañas evaluadas:* ${allPreventas.length}%0A` +
        `💰 *Ingresos Totales:* S/ ${totalIngresos.toFixed(2)}%0A` +
        `📦 *Pedidos Totales:* ${totalOrdenes}%0A` +
        `🎟️ *Ticket Promedio:* S/ ${ticketPromedio.toFixed(2)}%0A` +
        `⭐ *Cookie All-Star:* ${topCookie[0]}%0A%0A` +
        `🏆 *Campaña Récord:* ${mejorPV[0]} (S/ ${mejorPV[1].toFixed(2)})%0A%0A` +
        `_¡Flavis sigue creciendo!_ 🍪`;
    } else {
      const pvActual = allPreventas.find(pv => pv.id.toString() === selectedPV.toString());
      const totalGalletasVendidas = Object.values(cookieStats).reduce((a, b) => a + b, 0);
      mensaje = `📊 *REPORTE DE CAMPAÑA: ${pvActual?.nombreCampania}*%0A%0A` +
        `💰 *Ventas Totales:* S/ ${totalIngresos.toFixed(2)}%0A` +
        `📦 *N° de Pedidos:* ${totalOrdenes}%0A` +
        `🍪 *Galletas Horneadas:* ${totalGalletasVendidas}%0A` +
        `🎟️ *Gasto Promedio:* S/ ${ticketPromedio.toFixed(2)}%0A` +
        `⭐ *Más pedida:* ${topCookie[0]}%0A%0A` +
        `_Datos actualizados al momento._`;
    }
    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
  };

  // MetricCard ahora usa font-secondary para los valores numéricos
  const MetricCard = ({ title, value, color, isMainFont = false }) => (
    <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[2.5rem] shadow-sm border border-flavis-blue/5 dark:border-white/5 transition-all duration-300">
      <p className="text-[9px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-[0.2em] mb-2 font-sans">{title}</p>
      <p className={`text-3xl font-black tracking-tighter ${color} ${isMainFont ? 'font-main italic' : 'font-secondary text-with-symbols'}`}>
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
              <option value="all">Historial Total de Flavis</option>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <MetricCard title="Ventas Totales" value={`S/ ${totalIngresos.toFixed(2)}`} color="text-flavis-gold" />
        <MetricCard title="Órdenes" value={totalOrdenes.toString().padStart(2, '0')} color="text-flavis-blue dark:text-white/90" />
        <MetricCard title="Ticket Promedio" value={`S/ ${ticketPromedio.toFixed(2)}`} color="text-flavis-blue dark:text-white/90" />
        <MetricCard title="Galleta Estrella" value={topCookie[0]} color="text-flavis-blue dark:text-flavis-gold" isMainFont />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[3rem] shadow-xl border border-flavis-blue/5 dark:border-white/5 transition-all duration-300">
          <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic mb-8 transition-colors">Flujo de Ingresos</h3>
          <div className="h-72 w-full relative min-h-[350px]"> {/* Aumentado min-h para dar espacio al Label */}
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* Aumentado margin-top a 50 para que el nombre de campaña no se corte */}
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
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                      fontFamily: 'Prata, serif',
                      color: isDarkMode ? '#fff' : '#326371'
                    }} 
                  />
                  {/* --- LÍNEAS DE DIVISIÓN CON NOMBRE REAL DE CAMPAÑA --- */}
                  {divisionLines.map((line, idx) => (
                    <ReferenceLine key={idx} x={line.x} stroke={isDarkMode ? '#ffffff30' : '#ccc'} strokeDasharray="5 5">
                      <Label 
                        value={line.label} 
                        position="top" 
                        fill={isDarkMode ? '#b8995a' : '#326371'} 
                        fontSize={9} 
                        fontWeight="bold" 
                        offset={15} 
                        className="font-secondary italic"
                      />
                    </ReferenceLine>
                  ))}
                  <Area type="monotone" dataKey="total" stroke="#b8995a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-flavis-blue/20 dark:text-white/10 italic text-sm">Sin datos</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[3rem] shadow-xl border border-flavis-blue/5 dark:border-white/5 transition-all duration-300">
          <h3 className="text-xl font-main font-bold text-flavis-blue dark:text-white italic mb-8 transition-colors">Mix de Sabores</h3>
          <div className="h-72 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e3b44' : '#fff', 
                    borderRadius: '20px', 
                    border: 'none',
                    fontFamily: 'Prata, serif',
                    color: isDarkMode ? '#fff' : '#326371'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-2">
              {pieData.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                  <span className="text-[10px] font-bold text-flavis-blue dark:text-white/80 truncate font-secondary">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;