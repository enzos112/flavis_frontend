import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import LoadingSpinner from '../common/LoadingSpinner';
// --- ICONOS VECTORIALES  ---
const Icons = {
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Legend: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>,
  Gold: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Silver: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Bronze: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Inactive: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/></svg>
};

// --- MODAL: EDITAR NOTA DEL CLIENTE ---
const EditNoteModal = ({ cliente, isOpen, onClose, onSave }) => {
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) setNota(cliente.notas || "");
  }, [cliente]);

  if (!isOpen || !cliente) return null;

  const handleSave = async () => {
    setLoading(true);
    await onSave({ ...cliente, notas: nota });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-sm animate-in">
      <div className="bg-[#eef1e6] dark:bg-flavis-card-dark w-[95%] sm:w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative border border-white/20 flex flex-col max-h-[90vh]">
        <h3 className="text-xl font-sans font-black text-flavis-blue dark:text-white uppercase tracking-tight mb-2">
          Notas del Cliente
        </h3>
        <p className="text-[11px] font-sans font-bold text-flavis-blue/50 dark:text-white/40 uppercase tracking-widest mb-6">
          {cliente.nombre} {cliente.apellido}
        </p>

        <textarea
          className="w-full h-32 bg-white/50 dark:bg-flavis-dark border border-flavis-blue/10 dark:border-white/5 rounded-2xl p-5 outline-none focus:border-flavis-gold transition-all text-sm font-bold text-flavis-blue dark:text-white resize-none mb-6 shadow-inner"
          placeholder="Escribe algo sobre este cliente..."
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-blue py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            {loading ? "Guardando..." : "Guardar Nota"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-flavis-blue/50 dark:text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-flavis-blue dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientesModule = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos"); 
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const clientesPerPage = 8;

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

  // --- LÓGICA DE RANKING CON SVGS ---
  const getRank = (pedidos, gasto, ultimaCompra) => {
    const hoy = new Date();
    const fechaCompra = ultimaCompra ? new Date(ultimaCompra) : null;
    const diasInactivo = fechaCompra ? (hoy - fechaCompra) / (1000 * 60 * 60 * 24) : 999;

    if (diasInactivo > 60) return { label: "Inactivo", icon: <Icons.Inactive />, color: "bg-red-50 text-red-500 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30" };

    if (gasto > 600) return { 
      label: "Legend", 
      icon: <Icons.Legend />, 
      color: "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30" 
    };

    if (gasto >= 250) return { 
      label: "Gold", 
      icon: <Icons.Gold />, 
      color: "bg-flavis-gold/10 text-flavis-gold border border-flavis-gold/20" 
    };

    if (gasto >= 50) return { 
      label: "Silver", 
      icon: <Icons.Silver />, 
      color: "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-400" 
    };

    return { 
      label: "Bronze", 
      icon: <Icons.Bronze />, 
      color: "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30 dark:text-orange-400" 
    };
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-20 text-[8px]">⇅</span>;
    return <span className="ml-1 text-flavis-gold text-[8px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  const exportClientesExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Lista de Clientes');
    
    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Celular', key: 'celular', width: 15 },
      { header: 'Pedidos', key: 'pedidos', width: 10 },
      { header: 'Inversión Total (S/)', key: 'gasto', width: 18 },
      { header: 'Nivel', key: 'nivel', width: 15 } 
    ];

    clientes.forEach(c => {
      const rank = getRank(c.totalPedidos || 0, c.totalGastado || 0, c.fechaUltimaCompra);
      
      let nivelLimpio = rank.label.split(' ')[0]; 

      sheet.addRow({ 
        nombre: c.nombre, 
        apellido: c.apellido, 
        celular: c.celular, 
        pedidos: c.totalPedidos || 0, 
        gasto: (c.totalGastado || 0).toFixed(2),
        nivel: nivelLimpio 
      });
    });

    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Flavis_Directorio_Clientes_${new Date().toLocaleDateString()}.xlsx`);
  };

  let processedClientes = clientes.filter(c => {
    const matchesSearch = `${c.nombre} ${c.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) || c.celular.includes(searchTerm);
    if (!c.guardarDatos) return false;

    if (filterType === "nuevos") {
      const sieteDias = new Date(); sieteDias.setDate(sieteDias.getDate() - 7);
      return matchesSearch && new Date(c.fechaRegistro) >= sieteDias;
    }
    if (filterType === "recurrentes") return matchesSearch && (c.totalPedidos || 0) > 1;
    return matchesSearch;
  });

  processedClientes.sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

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

 const handleSaveNote = async (updatedCliente) => {
    try {
      const celular = updatedCliente.celular;

      if (!celular) {
        console.error("Error: No se encontró el celular del cliente");
        return;
      }

      await api.put(`/clientes/${celular}/notas`, { 
        notas: updatedCliente.notas 
      });
      
      setClientes(prev => prev.map(c => 
        c.celular === celular ? { ...c, notas: updatedCliente.notas } : c
      ));
      
      setSelectedCliente(null);
    } catch (err) {
      console.error("Error al guardar la nota:", err.response?.data || err.message);
    }
  };

  const totalPages = Math.ceil(processedClientes.length / clientesPerPage);
  const currentClientes = processedClientes.slice((currentPage - 1) * clientesPerPage, currentPage * clientesPerPage);

  if (loading) return <LoadingSpinner mensaje="Analizando lealtad..." />;

  return (
    <div className="animate-in pb-20 font-secondary text-flavis-blue dark:text-white px-2">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-main font-bold italic mb-4 tracking-tighter text-with-symbols transition-colors">Base de Clientes</h2>
          <div className="flex flex-wrap items-center gap-3 font-sans">
            <div className="flex bg-flavis-blue/5 dark:bg-white/5 p-1 rounded-2xl w-max">
                {['todos', 'nuevos', 'recurrentes'].map((type) => (
                <button key={type} onClick={() => { setFilterType(type); setCurrentPage(1); }} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark shadow-md' : 'text-flavis-blue/40 dark:text-white/40 hover:text-flavis-blue dark:hover:text-white'}`}>{type}</button>
                ))}
            </div>
            <button onClick={exportClientesExcel} className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                Excel
            </button>
          </div>
        </div>
        <div className="relative w-full md:w-80 font-sans">
          <input type="text" placeholder="Buscar por nombre o celular..." className="w-full bg-white dark:bg-flavis-card-dark border border-flavis-blue/10 dark:border-white/5 p-4 pr-12 rounded-2xl outline-none focus:border-flavis-gold text-sm font-bold shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none transition-colors" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
        </div>
      </header>

      <div className="bg-white dark:bg-flavis-card-dark rounded-[2.5rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none overflow-hidden border border-flavis-blue/5 dark:border-white/5 transition-colors">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-[#fcfbf8] dark:bg-transparent text-flavis-blue/50 dark:text-white/40 text-[9px] uppercase font-black tracking-[0.2em] border-b border-flavis-blue/5 dark:border-white/5 font-sans">
                <th className="px-8 py-5">Cliente & Nivel</th>
                
                <th 
                  className={`px-8 py-5 cursor-pointer hover:text-flavis-gold transition-colors ${sortConfig.key === 'fechaUltimaCompra' ? 'text-flavis-gold' : ''}`} 
                  onClick={() => requestSort('fechaUltimaCompra')}
                >
                  Última Compra <SortIcon columnKey="fechaUltimaCompra" />
                </th>
                
                <th 
                  className={`px-8 py-5 text-center cursor-pointer hover:text-flavis-gold transition-colors ${sortConfig.key === 'totalPedidos' ? 'text-flavis-gold' : ''}`}
                  onClick={() => requestSort('totalPedidos')}
                >
                  Pedidos <SortIcon columnKey="totalPedidos" />
                </th>
                
                <th 
                  className={`px-8 py-5 text-center cursor-pointer hover:text-flavis-gold transition-colors ${sortConfig.key === 'totalGastado' ? 'text-flavis-gold' : ''}`}
                  onClick={() => requestSort('totalGastado')}
                >
                  Inversión Total <SortIcon columnKey="totalGastado" />
                </th>
                
                <th className="px-8 py-5">Notas</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-flavis-blue/5 dark:divide-white/5 font-sans">
              {currentClientes.map((c) => {
                const rank = getRank(c.totalPedidos || 0, c.totalGastado || 0, c.fechaUltimaCompra);
                return (
                  <tr key={c.celular} className="hover:bg-flavis-blue/5 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-start gap-1.5">
                        <p className="font-black text-sm text-flavis-blue dark:text-white uppercase tracking-tight leading-none">
                          {c.nombre} {c.apellido}
                        </p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1.5 ${rank.color}`}>
                          {rank.icon} {rank.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold opacity-70 text-flavis-blue dark:text-white/80">
                      {c.fechaUltimaCompra ? new Date(c.fechaUltimaCompra).toLocaleDateString() : "---"}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="bg-flavis-gold/10 dark:bg-flavis-gold/5 text-flavis-gold px-3 py-1 rounded-md font-black text-xs">
                        {c.totalPedidos || 0}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="font-black text-sm text-flavis-blue dark:text-flavis-gold">
                        S/ {(c.totalGastado || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[10px] font-bold text-flavis-blue/50 dark:text-white/40 italic truncate max-w-[150px]">
                        {c.notas || "Sin notas..."}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedCliente(c)} className="w-8 h-8 flex items-center justify-center bg-flavis-blue/5 dark:bg-white/10 text-flavis-blue dark:text-white rounded-lg hover:bg-flavis-gold hover:text-flavis-blue transition-all shadow-sm">
                            <Icons.Edit />
                        </button>
                        <a 
                          href={`https://api.whatsapp.com/send?phone=51${c.celular}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center justify-center bg-[#25D366]/10 text-[#25D366] w-8 h-8 rounded-lg hover:bg-[#25D366] hover:text-white shadow-sm transition-all"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {currentClientes.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-[10px] uppercase font-black text-flavis-blue/30 dark:text-white/20 tracking-widest">
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>
            <EditNoteModal 
              cliente={selectedCliente} 
              isOpen={!!selectedCliente} 
              onClose={() => setSelectedCliente(null)} 
              onSave={handleSaveNote}
            />
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
              className={`w-8 h-8 rounded-full font-black text-[10px] transition-all ${
                currentPage === i + 1 
                  ? 'bg-flavis-gold text-white shadow-lg scale-110' 
                  : 'bg-white dark:bg-flavis-card-dark text-flavis-blue/50 dark:text-white/40 border border-flavis-blue/5 dark:border-white/5'
              }`}
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