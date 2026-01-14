import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ClientesModule = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos"); // todos, nuevos, recurrentes, vip, inactivos
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const clientesPerPage = 8;

  // --- ESTADO DE ORDENAMIENTO DINÁMICO ---
  const [sortConfig, setSortConfig] = useState({ key: 'totalGastado', direction: 'desc' });

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) { console.error("Error", err); }
    finally { setLoading(false); }
  };

  // --- LÓGICA DE RANKING & ESTADO ---
  const getRank = (pedidos, gasto, ultimaCompra) => {
    const hoy = new Date();
    const fechaCompra = ultimaCompra ? new Date(ultimaCompra) : null;
    const diasInactivo = fechaCompra ? (hoy - fechaCompra) / (1000 * 60 * 60 * 24) : 999;

    if (diasInactivo > 60) return { label: "Inactivo", icon: "💤", color: "bg-red-100 text-red-600 dark:bg-red-900/20" };
    if (gasto >= 500 || pedidos >= 15) return { label: "VIP Flavis", icon: "👑", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" };
    if (gasto >= 200 || pedidos >= 8) return { label: "Gold Master", icon: "🥇", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20" };
    if (pedidos >= 4) return { label: "Silver", icon: "🥈", color: "text-gray-500 bg-gray-100 dark:bg-white/10" };
    return { label: "Bronze", icon: "🥉", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20" };
  };

  // --- FUNCIÓN PARA CAMBIAR EL ORDEN (RESTAURADA) ---
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // --- INDICADOR VISUAL DE ORDEN ---
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-20 text-[8px]">⇅</span>;
    return <span className="ml-1 text-flavis-gold text-[8px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  // --- EXPORTAR CLIENTES ---
  const exportClientesExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Lista de Clientes');
    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Celular', key: 'celular', width: 15 },
      { header: 'Pedidos', key: 'pedidos', width: 10 },
      { header: 'Inversión Total', key: 'gasto', width: 15 }
    ];
    clientes.forEach(c => sheet.addRow({ nombre: c.nombre, apellido: c.apellido, celular: c.celular, pedidos: c.totalPedidos, gasto: c.totalGastado }));
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Flavis_Directorio_Clientes.xlsx`);
  };

  // --- FILTRADO ---
  let processedClientes = clientes.filter(c => {
    const matchesSearch = `${c.nombre} ${c.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) || c.celular.includes(searchTerm);
    if (filterType === "nuevos") {
      const sieteDias = new Date(); sieteDias.setDate(sieteDias.getDate() - 7);
      return matchesSearch && new Date(c.fechaRegistro) >= sieteDias;
    }
    if (filterType === "recurrentes") return matchesSearch && (c.totalPedidos || 0) > 1;
    return matchesSearch;
  });

  // --- ORDENAMIENTO ROBUSTO (RESTAURADO) ---
  processedClientes.sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    // Manejo especial para fechas
    if (sortConfig.key === 'fechaUltimaCompra') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
    } else {
        valA = valA || 0;
        valB = valB || 0;
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(processedClientes.length / clientesPerPage);
  const currentClientes = processedClientes.slice((currentPage - 1) * clientesPerPage, currentPage * clientesPerPage);

  if (loading) return <div className="p-20 text-center font-sans font-bold text-flavis-blue animate-pulse">Analizando lealtad...</div>;

  return (
    <div className="animate-in pb-20 font-secondary text-flavis-blue dark:text-white">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-4xl font-main font-bold italic mb-4 tracking-tighter text-with-symbols">Base de Clientes</h2>
          <div className="flex flex-wrap gap-2 font-sans">
            {['todos', 'nuevos', 'recurrentes'].map((type) => (
              <button key={type} onClick={() => { setFilterType(type); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark' : 'bg-white dark:bg-white/5 border border-flavis-blue/5'}`}>{type}</button>
            ))}
            <button onClick={exportClientesExcel} className="bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all font-sans">Excel</button>
          </div>
        </div>
        <div className="relative w-full md:w-80 font-sans">
          <input type="text" placeholder="Buscar por nombre o celular..." className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 p-4 rounded-2xl outline-none focus:border-flavis-gold text-sm font-bold" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
      </header>

      <div className="bg-white dark:bg-flavis-card-dark rounded-[2.5rem] shadow-xl overflow-hidden border border-flavis-blue/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-[#f8f9f5] dark:bg-white/5 text-flavis-blue/40 dark:text-white/30 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-6">Cliente & Nivel</th>
                
                {/* CABECERAS CON ONCLICK Y ICONO DINÁMICO */}
                <th 
                  className={`px-8 py-6 cursor-pointer hover:text-flavis-gold transition-colors ${sortConfig.key === 'fechaUltimaCompra' ? 'text-flavis-gold' : ''}`} 
                  onClick={() => requestSort('fechaUltimaCompra')}
                >
                  Última Compra <SortIcon columnKey="fechaUltimaCompra" />
                </th>
                
                <th 
                  className={`px-8 py-6 text-center cursor-pointer hover:text-flavis-gold transition-colors ${sortConfig.key === 'totalPedidos' ? 'text-flavis-gold' : ''}`}
                  onClick={() => requestSort('totalPedidos')}
                >
                  Pedidos <SortIcon columnKey="totalPedidos" />
                </th>
                
                <th 
                  className={`px-8 py-6 text-center cursor-pointer hover:text-flavis-gold transition-colors ${sortConfig.key === 'totalGastado' ? 'text-flavis-gold' : ''}`}
                  onClick={() => requestSort('totalGastado')}
                >
                  Inversión Total <SortIcon columnKey="totalGastado" />
                </th>
                
                <th className="px-8 py-6">Notas</th>
                <th className="px-8 py-6 text-right font-sans">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-flavis-blue/5">
              {currentClientes.map((c) => {
                const rank = getRank(c.totalPedidos || 0, c.totalGastado || 0, c.fechaUltimaCompra);
                return (
                  <tr key={c.celular} className="hover:bg-[#f8f9f5]/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-sm text-with-symbols">{c.nombre} {c.apellido}</p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${rank.color}`}>{rank.icon} {rank.label}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold opacity-60 text-with-symbols font-sans">
                      {c.fechaUltimaCompra ? new Date(c.fechaUltimaCompra).toLocaleDateString() : "---"}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="bg-flavis-gold/10 text-flavis-gold px-3 py-1 rounded-full font-black text-xs font-sans text-with-symbols">
                        {c.totalPedidos || 0}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-sm text-flavis-blue dark:text-flavis-gold text-with-symbols font-sans">
                        S/ {(c.totalGastado || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6"><p className="text-[10px] opacity-40 italic truncate max-w-[120px] text-with-symbols">{c.notas || "Sin notas..."}</p></td>
                    <td className="px-8 py-6 text-right font-sans">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedCliente(c)} className="w-8 h-8 flex items-center justify-center bg-flavis-blue/5 rounded-xl hover:bg-flavis-gold transition-all">📝</button>
                        <a href={`https://wa.me/51${c.celular}`} target="_blank" rel="noreferrer" className="flex items-center justify-center bg-green-500 text-white w-8 h-8 rounded-xl hover:scale-110 shadow-sm transition-all text-xs">💬</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAGINACIÓN VISUAL --- */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8 font-sans">
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentPage(i + 1)} 
              className={`w-8 h-8 rounded-full font-bold text-[10px] transition-all ${currentPage === i + 1 ? 'bg-flavis-gold text-white shadow-lg scale-110' : 'bg-white dark:bg-white/5 text-flavis-blue/40 border border-flavis-blue/5'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientesModule;