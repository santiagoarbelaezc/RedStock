#!/bin/bash

echo "🚀 Iniciando proceso de Dockerización de RedStock..."

# Limpiar contenedores anteriores
echo "🧹 Limpiando ambiente..."
docker-compose down

# Construir imágenes (sin cache para asegurar cambios frescos)
echo "📦 Construyendo imágenes de Docker..."
docker-compose build --no-cache

# Levantar servicios en segundo plano
echo "🏗️  Levantando servicios..."
docker-compose up -d

echo "✅ ¡RedStock está corriendo!"
echo "------------------------------------------------"
echo "🌐 Frontend: http://localhost"
echo "🔌 Backend API: http://localhost:3000/api"
echo "🗄️  Database: localhost:3306 (user: redstock_user)"
echo "------------------------------------------------"
echo "💡 Usa 'docker-compose logs -f' para ver los logs."
