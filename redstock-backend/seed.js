require('dotenv').config();
const mysql = require('mysql2/promise');

// 1. Configuración de Precios
const PRODUCT_PRICES = {
  1: 85000, 2: 65000, 3: 95000, 4: 75000, 5: 180000, 
  6: 220000, 7: 150000, 8: 45000, 9: 55000, 10: 40000
};

// 2. Reglas de Sucursales
const BRANCH_RULES = {
  1: { name: 'Norte', minUnits: 1, maxUnits: 5, minSales: 80, maxSales: 120 },
  2: { name: 'Sur', minUnits: 1, maxUnits: 4, minSales: 60, maxSales: 90 },
  3: { name: 'Centro', minUnits: 1, maxUnits: 6, minSales: 40, maxSales: 100 },
  4: { 
    name: 'Occidente', 
    growth: true, 
    start: { minUnits: 1, maxUnits: 3, minSales: 40, maxSales: 60 },
    end: { minUnits: 1, maxUnits: 6, minSales: 80, maxSales: 110 }
  }
};

async function seed() {
  let connection;
  try {
    // A. Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🚀 Conectado a la base de datos para el seeding...');

    // B. Limpiar tablas
    console.log('🧹 Limpiando registros anteriores...');
    await connection.query('DELETE FROM inventory_movements');
    await connection.query('ALTER TABLE inventory_movements AUTO_INCREMENT = 1');
    await connection.query('DELETE FROM sales');
    await connection.query('ALTER TABLE sales AUTO_INCREMENT = 1');

    const now = new Date();
    let totalInserted = 0;
    const statsByBranch = { 1: { count: 0, revenue: 0 }, 2: { count: 0, revenue: 0 }, 3: { count: 0, revenue: 0 }, 4: { count: 0, revenue: 0 } };
    const statsByMonth = {};

    // C. Generar ventas para los últimos 6 meses
    for (let m = 5; m >= 0; m--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthName = targetDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
      
      console.log(`\n📅 Generando datos para: ${monthName}`);
      statsByMonth[monthName] = 0;

      for (let branchId = 1; branchId <= 4; branchId++) {
        let rule = BRANCH_RULES[branchId];
        
        // Logica de crecimiento para la sucursal 4
        if (rule.growth) {
          const progress = (5 - m) / 5;
          rule = {
            minUnits: Math.round(rule.start.minUnits + (rule.end.minUnits - rule.start.minUnits) * progress),
            maxUnits: Math.round(rule.start.maxUnits + (rule.end.maxUnits - rule.start.maxUnits) * progress),
            minSales: Math.round(rule.start.minSales + (rule.end.minSales - rule.start.minSales) * progress),
            maxSales: Math.round(rule.start.maxSales + (rule.end.maxSales - rule.start.maxSales) * progress),
          };
        }

        // --- MOVIMIENTOS DE ENTRADA (Reposición Mensual) ---
        const replenishment = [];
        for (let pid = 1; pid <= 10; pid++) {
          const qty = Math.floor(Math.random() * 50) + 100; // Entran 100-150 unidades
          replenishment.push([branchId, pid, 'IN', qty, null, 'replenishment', targetDate]);
        }
        await connection.query(
          'INSERT INTO inventory_movements (branch_id, product_id, type, quantity, reference_id, reference_type, created_at) VALUES ?',
          [replenishment]
        );

        // --- VENTAS ---
        const numSales = Math.floor(Math.random() * (rule.maxSales - rule.minSales + 1)) + rule.minSales;
        const salesData = [];
        const movementsData = [];

        for (let s = 0; s < numSales; s++) {
          const productId = Math.floor(Math.random() * 10) + 1;
          const quantity = Math.floor(Math.random() * (rule.maxUnits - rule.minUnits + 1)) + rule.minUnits;
          const total = quantity * PRODUCT_PRICES[productId];
          
          const day = Math.floor(Math.random() * daysInMonth) + 1;
          const hour = Math.floor(Math.random() * 24);
          const minute = Math.floor(Math.random() * 60);
          const saleDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), day, hour, minute);

          salesData.push([branchId, productId, quantity, total, saleDate]);
          
          statsByBranch[branchId].count++;
          statsByBranch[branchId].revenue += total;
          statsByMonth[monthName]++;
          totalInserted++;
        }

        // D. Insertar en lotes de 50
        const batchSize = 50;
        for (let i = 0; i < salesData.length; i += batchSize) {
          const batchSales = salesData.slice(i, i + batchSize);
          const [result] = await connection.query(
            'INSERT INTO sales (branch_id, product_id, quantity, total, sale_date) VALUES ?',
            [batchSales]
          );
          
          // Registrar movimientos OUT para estas ventas (usamos sale_date como created_at)
          const batchMovements = batchSales.map(s => [s[0], s[1], 'OUT', s[2], null, 'sale', s[4]]);
          await connection.query(
            'INSERT INTO inventory_movements (branch_id, product_id, type, quantity, reference_id, reference_type, created_at) VALUES ?',
            [batchMovements]
          );
        }
        process.stdout.write('.');
      }
    }

    // E. Mostrar resumen final
    console.log('\n\n✅ Seeding completado con éxito.');
    console.log('-----------------------------------');
    console.log(`📊 TOTAL REGISTROS: ${totalInserted}`);
    console.log('-----------------------------------');
    
    console.log('\n📍 VENTAS POR SUCURSAL:');
    for (const [id, stat] of Object.entries(statsByBranch)) {
      console.log(` - ${BRANCH_RULES[id].name}: ${stat.count} registros | $${stat.revenue.toLocaleString()}`);
    }

    console.log('\n📅 VENTAS POR MES:');
    for (const [month, count] of Object.entries(statsByMonth)) {
      console.log(` - ${month}: ${count} registros`);
    }
    console.log('-----------------------------------');

  } catch (err) {
    console.error('❌ Error durante el seeding:', err.message);
  } finally {
    if (connection) await connection.end();
    console.log('\n👋 Conexión cerrada. El dashboard debería mostrar ya las tendencias reales.');
  }
}

seed();
