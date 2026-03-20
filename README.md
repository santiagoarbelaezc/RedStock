<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&animation=fadeIn&text=RedStock%20-%20Inventory%20Manager&fontSize=40" />
</div>

<h1 align="center">📦 RedStock - Gestión de Inventario Multisucursal</h1>

<h3 align="center">🚀 Plataforma avanzada para el control de stock, traslados y métricas empresariales</h3>

<p align="center">
  Aplicación web full‑stack diseñada para optimizar la logística entre múltiples puntos de venta.<br>
  <b>Frontend:</b> Angular 18 (Standalone) + Tailwind CSS | <b>Backend:</b> Node.js + Express + MySQL
</p>

---

## 📋 **Descripción del Proyecto**

**RedStock** es una solución integral para organizaciones que operan con múltiples sucursales. Permite una visibilidad global del inventario, facilitando la colaboración entre sedes mediante un sistema de solicitudes y confirmaciones de traslados, respaldado por analíticas en tiempo real.

> ⚠️ **Estado del Proyecto:** Refactorizado y funcional para producción.

---

## 🏗️ **Core Logic: Traslados (Transfers)**

El corazón de RedStock es su motor de **Traslados Inteligentes**:
- Una sucursal puede solicitar productos a otra basándose en la visibilidad de stock global.
- El sistema gestiona estados (`PENDING`, `IN_TRANSIT`, `COMPLETED`, `INCOMPLETE`).
- La sucursal de destino confirma la recepción, ajustando automáticamente el inventario de ambos puntos.

---

## 🔧 **Stack Tecnológico**

### **Frontend (Angular 18)**
<div align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
</div>

### **Backend (Node.js & Express)**
<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black" />
</div>

### **Base de Datos**
<div align="center">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Raw_SQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
</div>

### **Infraestructura**
<div align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</div>

> 🐳 **Infraestructura:** Toda la solución se ejecuta mediante **contenedores Docker**. Base de datos, backend y frontend orquestados con Docker Compose.

---

## 🚀 **Estado de Desarrollo**

| Componente | Estado | Detalles |
|---|---|---|
| **Backend API** | ✅ Completado | Endpoints de Branches, Inventory, Products, Transfers y Auth. |
| **Frontend UI** | ✅ Refactorizado | Arquitectura de componentes separados (HTML/CSS/TS) y optimización de UX. |
| **Dashboard** | ✅ Funcional | Métricas de ventas, stock bajo y comparativa mensual con Chart.js. |
| **Autenticación** | ✅ Protegido | Guards de Angular y Middlewares de JWT implementados. |
| **Docker** | ✅ Requerido | Toda la solución debe ejecutarse utilizando contenedores Docker. |

---

## 🖥️ **Características Principales**

### **🔍 Gestión de Inventario**
- Control centralizado de productos y SKUs.
- Actualización de stock por sucursal con validación de permisos.
- Alertas visuales para productos con bajo stock.

### **🔄 Sistema de Traslados**
- Flujo de solicitud origen-destino.
- Trazabilidad total: fecha de pedido, estado del envío y notas de confirmación.
- Validación de existencias antes de permitir la solicitud.

### **📊 Dashboard de Analíticas**
- Gráficos de líneas para evolución mensual de ingresos.
- Gráficos circulares para distribución de estado de inventario.
- Listado dinámico de alertas urgentes para la gerencia.

### **🐳 Contenedores Docker**
- Cada servicio (frontend, backend, base de datos) corre en su propio contenedor aislado.
- Orquestación completa con `docker-compose.yml`.
- Variables de entorno gestionadas de forma segura por servicio.
- Red interna entre contenedores sin exponer puertos innecesarios.

---

## 📦 **Arquitectura del Código (Frontend)**

El proyecto utiliza una estructura modular limpia:
- **`core/`**: Servicios, modelos, guards e interceptores (Lógica central).
- **`shared/`**: Componentes UI reutilizables (Modales, Tablas, Navbars).
- **`features/`**: Módulos de negocio (Inventory, Transfers, Dashboard) con componentes desacoplados.
- **`layout/`**: Estructura base de la aplicación.

---

## 🐳 **Arquitectura Docker**

```
redstock/
├── docker-compose.yml          # Orquestador principal
├── redstock-backend/
│   ├── Dockerfile              # Imagen del backend (Node.js)
│   └── .env                    # Variables de entorno del backend
└── redstock-frontend/
    └── Dockerfile              # Imagen del frontend (Angular + Nginx)
```

### **Servicios definidos en `docker-compose.yml`**

| Servicio | Imagen Base | Puerto | Descripción |
|---|---|---|---|
| `db` | `mysql:8` | `3306` | Base de datos MySQL |
| `backend` | `node:20-alpine` | `3000` | API REST con Express |
| `frontend` | `nginx:alpine` | `80` | Angular servido con Nginx |

---

## ⚙️ **Cómo ejecutar el proyecto**

### 🐳 Con Docker (Recomendado)

> **Requisito:** Tener [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados.

```bash
# 1. Clonar el repositorio
git clone https://github.com/santiagoarbelaezc/redstock.git
cd redstock

# 2. Configurar variables de entorno
cp redstock-backend/.env.example redstock-backend/.env
# Edita el archivo .env con tus credenciales si es necesario

# 3. Levantar todos los servicios
docker compose up --build

# 4. Acceder a la aplicación
# Frontend → http://localhost:80
# Backend  → http://localhost:3000
```

```bash
# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (reinicia la BD)
docker compose down -v
```

### 💻 Sin Docker (Desarrollo Local)

#### Backend
```bash
cd redstock-backend
npm install
# Configura el archivo .env con tus credenciales de MySQL
npm start
```

#### Frontend
```bash
cd redstock-frontend
npm install
ng serve
```

---

## 👨‍💻 **Desarrollador**

<div align="center">
Santiago Arbelaez Contreras  
Junior Full Stack Developer  
Estudiante de Ingeniería de Sistemas – Universidad del Quindío

<br>
<a href="https://github.com/santiagoarbelaezc">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>
<img width="10" />
<a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/">
  <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
</a>
<img width="10" />
<a href="https://portfolio-santiagoa.web.app/portfolio">
  <img src="https://img.shields.io/badge/Portfolio-6C63FF?style=for-the-badge&logo=sparkles&logoColor=white" />
</a>
</div>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=90&section=footer&animation=fadeIn" />
</div>
