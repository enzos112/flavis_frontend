import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ onLogin, onBack }) => {
  const [credentials, setCredentials] = useState({ email: '', pass: '' });
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.pass) {
        setError(true);
        return;
    }

    try {
      setIsSubmitting(true);
      setError(false);
      
      const res = await api.post('/auth/login', credentials);
      
      onLogin(res.data); 
      
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef1e6] flex items-center justify-center p-4 font-secondary">
      <div className="bg-white p-12 rounded-[3rem] max-w-md w-full shadow-xl border border-[#326371]/5">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-main font-bold text-flavis-blue italic tracking-tighter">Panel Administrativo</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 mt-2 font-bold text-flavis-blue">Acceso para Administradores</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* ETIQUETA CORREGIDA */}
            <label className="block text-xs uppercase font-bold text-flavis-blue mb-2 ml-4 tracking-widest">Correo Electrónico</label>
            <input 
              type="email" 
              // PLACEHOLDER CORREGIDO
              placeholder="admin@flavis.com"
              className="w-full bg-[#f8f9f5] border border-[#326371]/10 p-4 rounded-2xl outline-none focus:border-flavis-gold transition-all text-sm text-flavis-blue placeholder-flavis-blue/50"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            />
          </div>

          <div>
            {/* ETIQUETA CORREGIDA */}
            <label className="block text-xs uppercase font-bold text-flavis-blue mb-2 ml-4 tracking-widest">Contraseña</label>
            <input 
              type="password" 
              // PLACEHOLDER CORREGIDO
              placeholder="••••••••"
              className="w-full bg-[#f8f9f5] border border-[#326371]/10 p-4 rounded-2xl outline-none focus:border-flavis-gold transition-all text-sm text-flavis-blue placeholder-flavis-blue/50"
              value={credentials.pass}
              onChange={(e) => setCredentials({...credentials, pass: e.target.value})}
            />
          </div>
          
          {error && <p className="text-red-500 text-xs text-center font-bold italic animate-shake">Credenciales incorrectas o campos vacíos</p>}
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#326371] text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
          
          <button type="button" onClick={onBack} className="w-full text-[#326371]/80 text-[10px] font-bold uppercase tracking-widest mt-2 hover:text-[#326371]">
            Volver al Formulario de Pedidos
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;