import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
registerLocale('es', es);

const PreVentaModule = () => {
  const [preVenta, setPreVenta] = useState({
    nombreCampania: '',
    fechaApertura: null,
    fechaCierre: null,
    fechaEntrega: null,
    horarioEntrega: '',
    qrUrl: '',
    activo: true,
    stockMaximo: 100,
    stockActual: 0
  });

  const [totalVendidas, setTotalVendidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await api.get('/preventas/activa');
      
      if (res.data) {
        setPreVenta({
          ...res.data,
          fechaApertura: res.data.fechaApertura ? new Date(res.data.fechaApertura) : null,
          fechaCierre: res.data.fechaCierre ? new Date(res.data.fechaCierre) : null,
          fechaEntrega: res.data.fechaEntrega ? new Date(res.data.fechaEntrega + "T00:00:00") : null,
          stockMaximo: res.data.stockMaximo || 100,
          stockActual: res.data.stockActual || 0 
        });
      } else {

        const historyRes = await api.get('/preventas');
        const ultimaCampania = historyRes.data.sort((a, b) => b.id - a.id)[0];

        setPreVenta(prev => ({
          ...prev, 
          id: null,
          nombreCampania: '',
          fechaApertura: null,
          fechaCierre: null,
          fechaEntrega: null,
          activo: true,
          stockMaximo: 100,
          stockActual: 0,
          qrUrl: ultimaCampania ? ultimaCampania.qrUrl : prev.qrUrl,
          horarioEntrega: ultimaCampania ? ultimaCampania.horarioEntrega : prev.horarioEntrega
        }));
      }
    } catch (err) { 
      console.error("Error al cargar datos", err); 
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const pvRes = await api.get('/preventas/activa');
      if (pvRes.data && pvRes.data.id) {
        const ordersRes = await api.get(`/pedidos/preventa/${pvRes.data.id}`);
        const total = ordersRes.data.reduce((acc, order) => {
          const qty = order.detalles.reduce((sum, det) => sum + det.cantidad, 0);
          return acc + qty;
        }, 0);
        setTotalVendidas(total);
      }
    } catch (err) { console.error("Error al calcular stock", err); }
  };

  const formatFechaParaJava = (date) => {
    if (!date) return null;
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (preVenta.stockMaximo < preVenta.stockActual) {
      setAlertModal({ 
        show: true, 
        title: "Error de Stock", 
        message: `No puedes fijar un límite de ${preVenta.stockMaximo} porque ya has vendido ${preVenta.stockActual} galletas en esta campaña.` 
      });
      return;
    }

    if (preVenta.fechaApertura && preVenta.fechaCierre && preVenta.fechaApertura >= preVenta.fechaCierre) {
      setAlertModal({ show: true, title: "Error de Fechas", message: "La fecha de apertura debe ser anterior a la de cierre." });
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        ...preVenta,
        fechaApertura: formatFechaParaJava(preVenta.fechaApertura),
        fechaCierre: formatFechaParaJava(preVenta.fechaCierre),
        fechaEntrega: preVenta.fechaEntrega ? preVenta.fechaEntrega.toISOString().split('T')[0] : null
      };

      if (preVenta.id) await api.put(`/preventas/${preVenta.id}`, dataToSend);
      else await api.post('/preventas', dataToSend);

      setAlertModal({ show: true, title: "¡Éxito!", message: "Configuración actualizada correctamente." });
      cargarDatos();
    } catch (err) {
      setAlertModal({ show: true, title: "Error", message: "No se pudo guardar." });
    } finally { setLoading(false); }
  };

  const formatFechaLocal = (date) => {
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('multipartFile', file);
    try {
      setUploadingImg(true);
      const res = await api.post('/cookies/upload', data);
      setPreVenta({ ...preVenta, qrUrl: res.data.url });
    } catch (err) {
       setAlertModal({ show: true, title: "Error", message: "Error al subir QR" });
    } finally { setUploadingImg(false); }
  };

  const inputStyle = "w-full bg-[#f8f9f5] dark:bg-flavis-dark border border-[#326371]/10 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-flavis-gold transition-all text-flavis-blue dark:text-white font-bold text-sm cursor-pointer font-sans";
  const hoy = new Date();

  return (
  <div className="animate-in pb-20 font-sans">
    <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-10 text-center sm:text-left transition-colors">
      Configuración de Pre-Venta
    </h2>

    {/* INDICADORES DE STOCK */}
    <div className="mb-10 max-w-xs">
      <div className="bg-white dark:bg-flavis-card-dark p-8 rounded-[2.5rem] shadow-sm border border-flavis-blue/5 dark:border-white/5 transition-colors">
        <p className="text-[10px] uppercase font-black text-flavis-blue/40 dark:text-white/30 tracking-widest mb-2">Stock Disponible</p>
        <p className={`text-5xl font-black tracking-tighter transition-colors ${preVenta.stockMaximo - preVenta.stockActual <= 0 ? 'text-red-500' : 'text-flavis-gold'}`}>
          {Math.max(0, preVenta.stockMaximo - preVenta.stockActual)}
        </p>
        <p className="text-[9px] font-bold text-flavis-blue/30 dark:text-white/20 mt-2">
          Vendidas (Campaña Actual): {preVenta.stockActual} | Límite: {preVenta.stockMaximo}
        </p>
      </div>
    </div>

    <div className="bg-white dark:bg-flavis-card-dark p-6 sm:p-10 rounded-[3rem] shadow-xl border border-[#326371]/5 dark:border-white/5 max-w-4xl mx-auto lg:mx-0 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* FILA 1: NOMBRE Y HORARIO PERMANENTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60 font-sans transition-colors">Nombre de la Campaña</label>
            <input required type="text" className={inputStyle}
              value={preVenta.nombreCampania} onChange={e => setPreVenta({...preVenta, nombreCampania: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60 font-sans transition-colors">Rango Horario de Entrega</label>
            <input required type="text" placeholder="Ej: 4:00 PM - 8:00 PM" className={inputStyle}
              value={preVenta.horarioEntrega} onChange={e => setPreVenta({...preVenta, horarioEntrega: e.target.value})} />
          </div>
        </div>

        {/* FILA 2: CALENDARIOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="custom-datepicker">
            <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60 font-sans">Fecha Apertura</label>
            <DatePicker
              selected={preVenta.fechaApertura}
              onChange={(date) => setPreVenta({...preVenta, fechaApertura: date})}
              minDate={hoy} 
              maxDate={preVenta.fechaCierre}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Hora"
              dateFormat="dd/MM/yyyy HH:mm"
              locale="es"
              className={inputStyle}
              portalId="root"
              placeholderText="Seleccionar inicio"
            />
          </div>

          <div className="custom-datepicker">
            <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60 font-sans">Fecha Cierre</label>
            <DatePicker
              selected={preVenta.fechaCierre}
              onChange={(date) => setPreVenta({...preVenta, fechaCierre: date})}
              minDate={preVenta.fechaApertura || hoy}
              maxDate={preVenta.fechaEntrega} 
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Hora"
              dateFormat="dd/MM/yyyy HH:mm"
              locale="es"
              className={inputStyle}
              portalId="root"
              placeholderText="Seleccionar fin"
            />
          </div>

          <div className="custom-datepicker">
            <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60 font-sans">Día de Entrega</label>
            <DatePicker
              selected={preVenta.fechaEntrega}
              onChange={(date) => setPreVenta({...preVenta, fechaEntrega: date})}
              minDate={preVenta.fechaCierre || preVenta.fechaApertura || hoy} 
              dateFormat="dd/MM/yyyy"
              locale="es"
              className={inputStyle}
              placeholderText="Seleccionar día"
            />
          </div>
        </div>

        {/* FILA 3: LÍMITE DE STOCK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#326371]/5 dark:border-white/5 pt-8">
          <div>
            <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/40 mb-2 ml-2 tracking-widest opacity-60 font-sans">
              Límite Total de Galletas
            </label>
            <input 
              required 
              type="number" 
              className={inputStyle}
              min={preVenta.stockActual} 
              value={preVenta.stockMaximo} 
              onChange={e => {
                const valor = parseInt(e.target.value) || 0;
                setPreVenta({ ...preVenta, stockMaximo: Math.max(valor, preVenta.stockActual) });
              }} 
            />
            <p className="text-[9px] mt-2 ml-2 text-flavis-blue/40 italic">
              Mínimo permitido: {preVenta.stockActual} (Ventas ID {preVenta.id})
            </p>
          </div>
        </div>

        {/* FILA 4: QR (PERMANENTE) */}
        <div className="flex flex-col items-center border-t border-[#326371]/5 dark:border-white/5 pt-8">
          <label className="block text-xs uppercase font-bold text-flavis-blue dark:text-white/40 mb-6 tracking-widest font-sans">Código QR de Pago</label>
          <div className="relative group">
            <div className="w-44 h-44 bg-[#f8f9f5] dark:bg-flavis-dark rounded-[2.5rem] border-2 border-dashed border-[#326371]/20 dark:border-white/10 flex items-center justify-center overflow-hidden">
              {preVenta.qrUrl ? <img src={preVenta.qrUrl} className="w-full h-full object-contain p-4" alt="QR" /> : <span className="text-4xl opacity-20 dark:opacity-10 font-sans">📸</span>}
              {uploadingImg && <div className="absolute inset-0 bg-white/80 dark:bg-flavis-dark/80 flex items-center justify-center text-[10px] font-bold animate-pulse text-flavis-gold uppercase font-sans">Subiendo...</div>}
            </div>
            <label className="absolute -bottom-4 left-1/2 -translate-x-1/2 cursor-pointer bg-flavis-blue dark:bg-flavis-gold text-white dark:text-flavis-dark px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all font-sans">
              Cambiar QR
              <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
            </label>
          </div>
        </div>

        <button disabled={loading || uploadingImg} type="submit" className="w-full bg-flavis-gold text-flavis-blue py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg text-sm mt-8 font-sans">
          {loading ? 'Guardando...' : 'Actualizar Sistema'}
        </button>
      </form>
    </div>

    {/* MODAL DE ALERTA */}
    {alertModal.show && (
      <div className="fixed inset-0 bg-black/60 dark:bg-flavis-dark/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-flavis-gold animate-in">
          <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-2 italic">{alertModal.title}</h2>
          <p className="text-sm text-gray-600 dark:text-white/60 mb-8 font-sans leading-relaxed font-bold">{alertModal.message}</p>
          <button onClick={() => setAlertModal({show: false, message: '', title: ''})} className="bg-[#326371] dark:bg-flavis-gold text-white dark:text-flavis-dark px-10 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest font-sans transition-all">Entendido</button>
        </div>
      </div>
    )}
  </div>
  );
};

export default PreVentaModule;