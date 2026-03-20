# RedStock - Gestión de Inventario Multi-Sucursal

Plataforma integral para el control de inventario, traslados entre sedes, gestión de ventas y analítica de datos.

## 🚀 Stack Tecnológico
- **Frontend**: Angular 17+ / Tailwind CSS
- **Backend**: Node.js / Express (Arquitectura Model-Controller)
- **Base de Datos**: MySQL 8.0
- **Contenedores**: Docker / Docker Compose

## 🛠️ Requisitos Previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
- [Docker Compose](https://docs.docker.com/compose/install/) instalado.

## 📦 Instalación y Ejecución

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repo>
   cd RedStock
   ```

2. **Configurar variables de entorno**:
   Copia el archivo `.env.example` (o crea uno nuevo) en la raíz con:
   ```env
   DB_ROOT_PASSWORD=rootpassword
   DB_NAME=redstock
   DB_USER=redstock_user
   DB_PASSWORD=redstock_pass
   JWT_SECRET=redstock_jwt_secret_2024
   ```

3. **Iniciar con un solo comando**:
   - **Windows**: Ejecuta el archivo `start.bat`
   - **Linux/Mac**: 
     ```bash
     chmod +x start.sh
     ./start.sh
     ```

4. **Acceder a la aplicación**:
   - **Frontend**: [http://localhost](http://localhost)
   - **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
   - **Base de Datos**: `localhost:3306`

## 👥 Usuarios de Prueba

| Rol | Email | Password | Sucursal (Initial) |
| :--- | :--- | :--- | :--- |
| **Admin** | andres@redstock.com | admin123 | Kennedy |
| **Manager** | maria@redstock.com | manager123 | Suba |
| **User** | carlos@redstock.com | user123 | Chapinero |

## 📂 Estructura del Proyecto
```text
RedStock/
├── redstock-frontend/      # Angular SPA
├── redstock-backend/       # Express API
├── docker-compose.yml       # Orquestación de contenedores
├── .env                     # Configuración global
└── README.md                # Esta guía
```

## 🏗️ Endpoints Principales
- `POST /api/auth/login` - Autenticación JWT
- `GET /api/inventory` - Inventario global/sucursal
- `GET /api/sales` - Historial de ventas
- `POST /api/transfers` - Crear traslados
- `GET /api/analytics/global` - Resumen estadístico
