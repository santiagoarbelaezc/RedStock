@echo off
echo 🚀 Iniciando proceso de Dockerización de RedStock...

echo 🧹 Limpiando ambiente...
docker-compose down

echo 📦 Construyendo imagenes de Docker...
docker-compose build --no-cache

echo 🏗️  Levantando servicios...
docker-compose up -d

echo ✅ ¡RedStock esta corriendo!
echo ------------------------------------------------
echo 🌐 Frontend: http://localhost
echo 🔌 Backend API: http://localhost:3000/api
echo 🗄️  Database: localhost:3306 (user: redstock_user)
echo ------------------------------------------------
echo 💡 Usa 'docker-compose logs -f' para ver los logs.
pause
