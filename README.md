```markdown
# 🛒 Flavis Cookies - Client App & Intranet
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

Interfaz dual para el ecosistema Flavis: un formulario estético para clientes y una Intranet administrativa robusta para el control de campañas y fidelización.

## 🚀 Módulos Destacados
* **Order Engine:** Sistema de compra con validación de stock en tiempo real y carga de comprobantes.
* **Intranet Admin:** Dashboard con métricas de ventas y gestión de campañas de preventa.
* **Customer Collective:** Ranking inteligente de clientes basado en inversión total y recurrencia.

## 🔧 Configuración Previa
Crea un archivo `.env` en la raíz del proyecto (este archivo no se sube a GitHub) con la siguiente variable:

```env
VITE_API_URL=http://localhost:8080/api


📦 Instalación
Clona el repositorio:

Bash

git clone [https://github.com/tu-usuario/flavis-frontend.git](https://github.com/tu-usuario/flavis-frontend.git)
Instala las dependencias de Node:

Bash

npm install
Inicia el modo desarrollo:

Bash

npm run dev
📐 Estructura de Estilos
El proyecto utiliza una paleta personalizada definida en tailwind.config.js:

Flavis Blue: #326371

Flavis Gold: (Colores dorados para niveles y énfasis)

Fonts: Combinación de fuentes Serif para elegancia e Italic para toques de autor.


---

### 💡 Recomendación Final para tu GitHub

Al ser archivos `.md` (Markdown), GitHub les aplicará automáticamente el formato profesional (los badges de colores, las cajas de código, etc.). 

**Un detalle clave:** Como estás trabajando con **MySQL**, asegúrate de que en tu código Java (`application.properties`) no hayas dejado el puerto `5432` (que es de Postgres) y que uses el puerto `3306` que es el estándar de MySQL.

¿Te gustaría que te ayude a crear un pequeño **Script de Inicialización SQL** para q
