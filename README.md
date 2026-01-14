# 🛒 Flavis Cookies - Client App & Intranet

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

Interfaz dual para el ecosistema Flavis: un formulario estético para clientes y una Intranet administrativa robusta para el control de campañas y fidelización.

---

## 🚀 Módulos Destacados

* **Order Engine:** Sistema de compra con validación de stock en tiempo real y carga de comprobantes vía Cloudinary.
* **Intranet Admin:** Dashboard con métricas de ventas y gestión de campañas de preventa semanales.
* **Customer Collective:** Ranking inteligente de clientes basado en inversión total (CLV) y recurrencia.

---

## 🔧 Configuración Previa

Antes de iniciar el proyecto, es necesario configurar la conexión con la API. Crea un archivo llamado `.env` en la raíz del proyecto (este archivo está ignorado por Git) y añade la siguiente variable:

```env
VITE_API_URL=http://localhost:8080/api

