import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
registerLocale('es', es);

// --- ICONOS VECTORIALES COMPARTIDOS ---
const Icons = {
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
};

const PreVentaModule = () => {
  const [preVenta, setPreVenta] = useState({
    nombreCampania: '',
    fechaApertura: null,
    fechaCierre: null,
    fechaEntrega: null,
    horarioEntrega: '',   
    horarioDelivery: '', 
    horarioRecojo: '',    
    qrUrl: '',
    activo: true,
    stockMaximo: 100,
    stockActual: 0
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: '' });
  
  const [isEditing, setIsEditing] = useState(false);

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
          stockActual: res.data.stockActual || 0,
          horarioDelivery: res.data.horarioDelivery || res.data.horarioEntrega || '',
          horarioRecojo: res.data.horarioRecojo || res.data.horarioEntrega || ''
        });
        setIsEditing(false); 
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
          horarioDelivery: ultimaCampania ? (ultimaCampania.horarioDelivery || ultimaCampania.horarioEntrega) : '',
          horarioRecojo: ultimaCampania ? (ultimaCampania.horarioRecojo || ultimaCampania.horarioEntrega) : '',
          horarioEntrega: ultimaCampania ? ultimaCampania.horarioEntrega : ''
        }));
        setIsEditing(true); 
      }
    } catch (err) { 
      console.error("Error al cargar datos", err); 
    }
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
        fechaEntrega: preVenta.fechaEntrega ? preVenta.fechaEntrega.toISOString().split('T')[0] : null,
        horarioEntrega: preVenta.horarioRecojo 
      };

      if (preVenta.id) await api.put(`/preventas/${preVenta.id}`, dataToSend);
      else await api.post('/preventas', dataToSend);

      setAlertModal({ show: true, title: "¡Éxito!", message: "Configuración actualizada correctamente." });
      setIsEditing(false); 
      cargarDatos();
    } catch (err) {
      setAlertModal({ show: true, title: "Error", message: "No se pudo guardar." });
    } finally { setLoading(false); }
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

  const inputStyle = `w-full p-4 rounded-2xl outline-none transition-all font-bold text-sm font-sans ${isEditing ? 'bg-[#f8f9f5] dark:bg-flavis-dark border border-[#326371]/10 dark:border-white/10 focus:border-flavis-gold text-flavis-blue dark:text-white cursor-text shadow-inner' : 'bg-transparent border border-dashed border-[#326371]/20 dark:border-white/10 text-flavis-blue/60 dark:text-white/50 cursor-not-allowed pointer-events-none opacity-80'}`;
  
  const hoy = new Date();

  return (
  <div className="animate-in pb-20 font-sans px-2">
    <h2 className="text-4xl font-main font-bold text-flavis-blue dark:text-white italic mb-10 text-center sm:text-left transition-colors">
      Configuración de Campaña
    </h2>

    {/* TARJETA PRINCIPAL */}
    <div className="bg-white dark:bg-flavis-card-dark p-6 sm:p-10 rounded-[3rem] shadow-[0_8px_30px_rgba(50,99,113,0.06)] dark:shadow-none border border-[#326371]/5 dark:border-white/5 max-w-5xl mx-auto transition-all duration-300">
      
      {/* CABECERA INTERNA: INDICADOR DE STOCK INTEGRADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-flavis-blue/5 dark:bg-white/5 p-6 rounded-[2rem] mb-8 border border-flavis-blue/5 dark:border-white/5">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-flavis-blue/50 dark:text-white/40 mb-1">Estado de la Campaña</p>
          <h3 className="text-2xl font-main font-black text-flavis-blue dark:text-white uppercase tracking-tighter">
            Stock Disp: <span className={preVenta.stockMaximo - preVenta.stockActual <= 0 ? 'text-red-500' : 'text-flavis-gold'}>{Math.max(0, preVenta.stockMaximo - preVenta.stockActual)}</span>
          </h3>
          <p className="text-[9px] font-bold text-flavis-blue/50 dark:text-white/40 tracking-widest mt-1">
            Vendidas: {preVenta.stockActual} / Límite: {preVenta.stockMaximo}
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={(e) => { e.preventDefault(); setIsEditing(true); }} 
            className="mt-4 sm:mt-0 flex items-center gap-2 bg-white dark:bg-flavis-card-dark text-flavis-blue dark:text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-flavis-blue/10 dark:border-white/10 hover:bg-flavis-gold hover:text-flavis-blue dark:hover:bg-flavis-gold dark:hover:text-flavis-blue transition-all duration-300 active:scale-95"
          >
            <Icons.Edit /> Editar Campaña
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* CONTENEDOR DOS COLUMNAS */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO DE TEXTO */}
          <div className="flex-1 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/60 mb-2 ml-2 tracking-widest opacity-80 font-sans">Nombre de la Campaña</label>
                <input required type="text" className={inputStyle} disabled={!isEditing}
                  value={preVenta.nombreCampania} onChange={e => setPreVenta({...preVenta, nombreCampania: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/60 mb-2 ml-2 tracking-widest opacity-80 font-sans">Límite Galletas</label>
                <input 
                  required type="number" className={inputStyle} disabled={!isEditing} min={preVenta.stockActual} value={preVenta.stockMaximo} 
                  onChange={e => {
                    const valor = parseInt(e.target.value) || 0;
                    setPreVenta({ ...preVenta, stockMaximo: Math.max(valor, preVenta.stockActual) });
                  }} 
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="custom-datepicker">
                <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/60 mb-2 ml-2 tracking-widest opacity-80 font-sans">Apertura</label>
                <DatePicker
                  disabled={!isEditing} selected={preVenta.fechaApertura} onChange={(date) => setPreVenta({...preVenta, fechaApertura: date})}
                  minDate={hoy} maxDate={preVenta.fechaCierre} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="Hora" dateFormat="dd/MM/yy HH:mm" locale="es"
                  className={inputStyle} portalId="root" placeholderText="Inicio"
                />
              </div>
              <div className="custom-datepicker">
                <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/60 mb-2 ml-2 tracking-widest opacity-80 font-sans">Cierre</label>
                <DatePicker
                  disabled={!isEditing} selected={preVenta.fechaCierre} onChange={(date) => setPreVenta({...preVenta, fechaCierre: date})}
                  minDate={preVenta.fechaApertura || hoy} maxDate={preVenta.fechaEntrega} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="Hora" dateFormat="dd/MM/yy HH:mm" locale="es"
                  className={inputStyle} portalId="root" placeholderText="Fin"
                />
              </div>
              <div className="custom-datepicker">
                <label className="block text-[10px] uppercase font-bold text-flavis-blue dark:text-white/60 mb-2 ml-2 tracking-widest opacity-80 font-sans">Día Entrega</label>
                <DatePicker
                  disabled={!isEditing} selected={preVenta.fechaEntrega} onChange={(date) => setPreVenta({...preVenta, fechaEntrega: date})}
                  minDate={preVenta.fechaCierre || preVenta.fechaApertura || hoy} dateFormat="dd/MM/yyyy" locale="es"
                  className={inputStyle} placeholderText="Seleccionar"
                />
              </div>
            </div>

            {/* Horarios Separados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-flavis-gold/5 dark:bg-flavis-gold/10 p-5 rounded-3xl border border-flavis-gold/20">
              <div>
                <label className="block text-[10px] uppercase font-black text-flavis-gold mb-2 ml-2 tracking-widest font-sans flex items-center gap-1">🛵 Horario Delivery</label>
                <input required type="text" placeholder="Ej: 11:00 AM - 1:00 PM" className={inputStyle} disabled={!isEditing}
                  value={preVenta.horarioDelivery} onChange={e => setPreVenta({...preVenta, horarioDelivery: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-flavis-gold mb-2 ml-2 tracking-widest font-sans flex items-center gap-1">🏠 Horario Recojo</label>
                <input required type="text" placeholder="Ej: 4:00 PM - 8:00 PM" className={inputStyle} disabled={!isEditing}
                  value={preVenta.horarioRecojo} onChange={e => setPreVenta({...preVenta, horarioRecojo: e.target.value})} />
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: CÓDIGO QR GIGANTE */}
          <div className="w-full lg:w-72 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-flavis-blue/10 dark:border-white/10 pt-8 lg:pt-0 lg:pl-10">
            <p className="text-[10px] uppercase font-black tracking-widest text-flavis-blue/50 dark:text-white/40 mb-4 text-center">Código QR Actual</p>
            
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-[#f8f9f5] dark:bg-flavis-dark rounded-3xl border-2 border-dashed border-[#326371]/20 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner relative group">
              {preVenta.qrUrl ? (
                <img src={preVenta.qrUrl} className="w-full h-full object-contain p-2" alt="QR de Pago" />
              ) : (
                <Icons.Camera />
              )}
              {uploadingImg && <div className="absolute inset-0 bg-white/80 dark:bg-flavis-dark/80 flex items-center justify-center text-[10px] font-bold animate-pulse text-flavis-gold uppercase font-sans">Subiendo...</div>}
            </div>

            {/* BOTÓN SUBIR QR SOLO VISIBLE EN MODO EDICIÓN */}
            <div className="mt-6 h-10"> 
              {isEditing ? (
                <label className="cursor-pointer flex items-center gap-2 bg-flavis-blue dark:bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-flavis-gold hover:text-flavis-blue transition-all">
                  <Icons.Upload />
                  Subir / Cambiar QR
                  <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" disabled={uploadingImg}/>
                </label>
              ) : (
                <p className="text-[9px] font-bold text-flavis-blue/40 dark:text-white/30 uppercase tracking-widest italic flex items-center gap-2">
                  <Icons.CheckCircle /> Vinculado al formulario
                </p>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER: BOTONES DE ACCIÓN */}
        {isEditing && (
          <div className="flex justify-end gap-4 border-t border-[#326371]/5 dark:border-white/5 pt-8 mt-8">
            {preVenta.id && (
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); cargarDatos(); }} 
                className="px-8 py-4 bg-gray-100 dark:bg-white/5 text-flavis-blue/50 dark:text-white/50 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button disabled={loading || uploadingImg} type="submit" className="px-10 py-4 bg-flavis-gold text-flavis-blue rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg text-[10px]">
              {loading ? 'Guardando...' : 'Confirmar Cambios'}
            </button>
          </div>
        )}
      </form>
    </div>

    {/* MODAL DE ALERTA */}
    {alertModal.show && (
      <div className="fixed inset-0 bg-flavis-blue/90 dark:bg-flavis-dark/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-flavis-card-dark p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-t-8 border-flavis-gold animate-in">
          <h2 className="text-2xl font-main font-bold text-flavis-blue dark:text-white mb-2 italic tracking-tighter">{alertModal.title}</h2>
          <p className="text-sm text-gray-600 dark:text-white/60 mb-8 font-sans leading-relaxed font-bold">{alertModal.message}</p>
          <button onClick={() => setAlertModal({show: false, message: '', title: ''})} className="bg-[#326371] dark:bg-flavis-gold text-white dark:text-flavis-dark px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95">Entendido</button>
        </div>
      </div>
    )}
  </div>
  );
};

export default PreVentaModule;