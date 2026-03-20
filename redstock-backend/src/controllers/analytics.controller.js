const SaleModel = require('../models/sale.model');
const InventoryModel = require('../models/inventory.model');
const InventoryMovementModel = require('../models/inventoryMovement.model');
const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response.util');

// GET /api/analytics/:branchId/sales/current-month
const getCurrentMonthSales = async (req, res, next) => {
  try {
    const { branchId } = req.params;

    const [kpis] = await pool.query(`
      SELECT 
        COUNT(*) as total_ventas,
        SUM(total) as total_ingresos,
        SUM(quantity) as total_productos_vendidos
      FROM sales
      WHERE branch_id = ?
      AND MONTH(sale_date) = MONTH(CURRENT_DATE())
      AND YEAR(sale_date) = YEAR(CURRENT_DATE())
    `, [branchId]);

    const [bestProduct] = await pool.query(`
      SELECT p.name, SUM(s.quantity) as cantidad, SUM(s.total) as total
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.branch_id = ?
      AND MONTH(s.sale_date) = MONTH(CURRENT_DATE())
      AND YEAR(s.sale_date) = YEAR(CURRENT_DATE())
      GROUP BY p.id
      ORDER BY cantidad DESC
      LIMIT 1
    `, [branchId]);

    const [bestDay] = await pool.query(`
      SELECT DATE(sale_date) as fecha, SUM(total) as total
      FROM sales
      WHERE branch_id = ?
      AND MONTH(sale_date) = MONTH(CURRENT_DATE())
      AND YEAR(sale_date) = YEAR(CURRENT_DATE())
      GROUP BY DATE(sale_date)
      ORDER BY total DESC
      LIMIT 1
    `, [branchId]);

    const daysInMonth = new Date().getDate();
    const avgDaily = (kpis[0].total_ingresos || 0) / daysInMonth;

    return successResponse(res, {
      ...kpis[0],
      producto_mas_vendido: bestProduct[0] || null,
      mejor_dia: bestDay[0] || null,
      promedio_diario: avgDaily
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/sales/comparison
const getSalesComparison = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        MONTH(sale_date) as mes,
        YEAR(sale_date) as anio,
        COUNT(*) as total_ventas,
        SUM(total) as total_ingresos
      FROM sales
      WHERE branch_id = ?
      AND sale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(sale_date), MONTH(sale_date)
      ORDER BY anio ASC, mes ASC
    `, [branchId]);

    const dataWithVariation = rows.map((row, index) => {
      let variacion = 0;
      if (index > 0) {
        const prev = rows[index - 1].total_ingresos;
        variacion = prev > 0 ? ((row.total_ingresos - prev) / prev) * 100 : 0;
      }
      return { ...row, variacion_porcentual: variacion };
    });

    return successResponse(res, dataWithVariation);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/inventory/behavior
const getInventoryBehavior = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.name, p.sku,
        SUM(CASE WHEN im.type = 'IN' THEN im.quantity ELSE 0 END) as entradas,
        SUM(CASE WHEN im.type = 'OUT' THEN im.quantity ELSE 0 END) as salidas,
        SUM(CASE WHEN im.type = 'TRANSFER_IN' THEN im.quantity ELSE 0 END) as transferencias_recibidas,
        SUM(CASE WHEN im.type = 'TRANSFER_OUT' THEN im.quantity ELSE 0 END) as transferencias_enviadas,
        i.quantity as stock_actual
      FROM products p
      LEFT JOIN inventory_movements im ON im.product_id = p.id AND im.branch_id = ?
        AND im.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
      LEFT JOIN inventory i ON i.product_id = p.id AND i.branch_id = ?
      GROUP BY p.id, p.name, p.sku, i.quantity
    `, [branchId, branchId]);

    return successResponse(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/inventory/low-stock
const getLowStock = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.id, p.name, p.sku,
        i.quantity as stock_actual,
        (SELECT b2.name FROM inventory i2 JOIN branches b2 ON i2.branch_id = b2.id 
         WHERE i2.product_id = p.id AND i2.branch_id != ? ORDER BY i2.quantity DESC LIMIT 1) as sucursal_sugerida,
        (SELECT MAX(i2.quantity) FROM inventory i2 WHERE i2.product_id = p.id AND i2.branch_id != ?) as stock_disponible
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.branch_id = ? AND i.quantity <= 5
      ORDER BY i.quantity ASC
    `, [branchId, branchId, branchId]);

    return successResponse(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/products/top-selling
const getTopSellingProducts = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const [totalRevenueRow] = await pool.query(`
      SELECT SUM(total) as total FROM sales 
      WHERE branch_id = ? AND MONTH(sale_date) = MONTH(CURRENT_DATE()) AND YEAR(sale_date) = YEAR(CURRENT_DATE())
    `, [branchId]);
    
    const totalRevenue = totalRevenueRow[0].total || 1;

    const [rows] = await pool.query(`
      SELECT 
        p.name, p.sku,
        SUM(s.quantity) as cantidad_vendida,
        SUM(s.total) as total_ingresos,
        (SUM(s.total) / ? * 100) as porcentaje_del_total
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.branch_id = ?
      AND MONTH(s.sale_date) = MONTH(CURRENT_DATE())
      AND YEAR(s.sale_date) = YEAR(CURRENT_DATE())
      GROUP BY p.id
      ORDER BY total_ingresos DESC
      LIMIT 5
    `, [totalRevenue, branchId]);

    return successResponse(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/transfers/summary
const getTransfersSummary = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN origin_branch_id = ? THEN 1 END) as total_enviados,
        COUNT(CASE WHEN destination_branch_id = ? THEN 1 END) as total_recibidos,
        COUNT(CASE WHEN status = 'PARTIAL' AND (origin_branch_id = ? OR destination_branch_id = ?) THEN 1 END) as total_con_faltantes,
        COUNT(CASE WHEN status = 'PENDING' AND (origin_branch_id = ? OR destination_branch_id = ?) THEN 1 END) as total_pendientes,
        COUNT(CASE WHEN status = 'IN_TRANSIT' AND (origin_branch_id = ? OR destination_branch_id = ?) THEN 1 END) as total_en_transito
      FROM transfers
    `, [branchId, branchId, branchId, branchId, branchId, branchId, branchId, branchId]);

    const [mostRequested] = await pool.query(`
      SELECT p.name, COUNT(*) as solicitudes
      FROM transfer_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transfers t ON ti.transfer_id = t.id
      WHERE t.destination_branch_id = ?
      GROUP BY p.id
      ORDER BY solicitudes DESC
      LIMIT 1
    `, [branchId]);

    return successResponse(res, {
      ...rows[0],
      producto_mas_solicitado: mostRequested[0] || null
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/global/ranking
const getGlobalRanking = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.id, b.name,
        COUNT(s.id) as total_ventas,
        SUM(s.total) as total_ingresos
      FROM branches b
      LEFT JOIN sales s ON s.branch_id = b.id
        AND MONTH(s.sale_date) = MONTH(CURRENT_DATE())
        AND YEAR(s.sale_date) = YEAR(CURRENT_DATE())
      GROUP BY b.id, b.name
      ORDER BY total_ingresos DESC
    `);

    return successResponse(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/sales/daily
const getDailySalesCurrentMonth = async (req, res, next) => {
  try {
    const { branchId } = req.params;

    const query = `
      SELECT DAY(sale_date) as dia, SUM(total) as ingresos, COUNT(*) as ventas
      FROM sales
      WHERE branch_id = ? AND MONTH(sale_date) = ? AND YEAR(sale_date) = ?
      GROUP BY DAY(sale_date)
      ORDER BY dia ASC
    `;

    const now = new Date();
    const [current] = await pool.query(query, [branchId, now.getMonth() + 1, now.getFullYear()]);
    
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [previous] = await pool.query(query, [branchId, lastMonthDate.getMonth() + 1, lastMonthDate.getFullYear()]);

    return successResponse(res, {
      mes_actual: current,
      mes_anterior: previous
    });
  } catch (err) {
    next(err);
  }
};
// GET /api/analytics/global/summary
const getGlobalSummary = async (req, res, next) => {
  try {
    const [kpis] = await pool.query(`
      SELECT 
        SUM(total) as total_ingresos_acumulados,
        COUNT(*) as total_ventas_acumuladas,
        SUM(CASE WHEN MONTH(sale_date) = MONTH(CURRENT_DATE()) AND YEAR(sale_date) = YEAR(CURRENT_DATE()) THEN total ELSE 0 END) as ingresos_mes_actual,
        COUNT(CASE WHEN MONTH(sale_date) = MONTH(CURRENT_DATE()) AND YEAR(sale_date) = YEAR(CURRENT_DATE()) THEN 1 END) as ventas_mes_actual
      FROM sales
    `);

    const [bestBranch] = await pool.query(`
      SELECT b.name, SUM(s.total) as ingresos
      FROM sales s
      JOIN branches b ON s.branch_id = b.id
      WHERE MONTH(s.sale_date) = MONTH(CURRENT_DATE())
      AND YEAR(s.sale_date) = YEAR(CURRENT_DATE())
      GROUP BY b.id
      ORDER BY ingresos DESC
      LIMIT 1
    `);

    const [worstBranch] = await pool.query(`
      SELECT b.name, SUM(s.total) as ingresos
      FROM sales s
      JOIN branches b ON s.branch_id = b.id
      WHERE MONTH(s.sale_date) = MONTH(CURRENT_DATE())
      AND YEAR(s.sale_date) = YEAR(CURRENT_DATE())
      GROUP BY b.id
      ORDER BY ingresos ASC
      LIMIT 1
    `);

    return successResponse(res, {
      ...kpis[0],
      mejor_sucursal_mes: bestBranch[0] || null,
      peor_sucursal_mes: worstBranch[0] || null
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/global/income-by-branch
const getIncomeByBranch = async (req, res, next) => {
  try {
    const [totalRevenueRow] = await pool.query('SELECT SUM(total) as total FROM sales');
    const globalTotal = totalRevenueRow[0].total || 1;

    const [rows] = await pool.query(`
      SELECT 
        b.name as branch_name,
        SUM(s.total) as total_ingresos,
        COUNT(s.id) as total_ventas,
        (SUM(s.total) / ? * 100) as porcentaje_del_total
      FROM branches b
      LEFT JOIN sales s ON b.id = s.branch_id
      GROUP BY b.id
      ORDER BY total_ingresos DESC
    `, [globalTotal]);

    return successResponse(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/global/monthly-comparison
const getMonthlyComparison = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        MONTH(s.sale_date) as mes,
        YEAR(s.sale_date) as anio,
        b.name as branch_name,
        SUM(s.total) as total_ingresos
      FROM sales s
      JOIN branches b ON s.branch_id = b.id
      WHERE s.sale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY anio, mes, b.id
      ORDER BY anio ASC, mes ASC
    `);

    // Transformar para que el frontend reciba un objeto por mes con columnas por sucursal
    // o un formato que Chart.js maneje bien para múltiples líneas.
    return successResponse(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/global/top-products
const getTopProductsGlobal = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.name, p.sku,
        SUM(s.quantity) as cantidad_total,
        SUM(s.total) as ingresos_totales,
        (SELECT b2.name FROM sales s2 JOIN branches b2 ON s2.branch_id = b2.id 
         WHERE s2.product_id = p.id GROUP BY b2.id ORDER BY SUM(s2.quantity) DESC LIMIT 1) as sucursal_lider
      FROM sales s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.id
      ORDER BY ingresos_totales DESC
      LIMIT 10
    `);

    return successResponse(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/global/transfers-summary
const getTransfersGlobalSummary = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        status, COUNT(*) as cantidad
      FROM transfers
      GROUP BY status
    `);

    const [mostActive] = await pool.query(`
      SELECT b.name, COUNT(*) as total
      FROM (
        SELECT origin_branch_id as branch_id FROM transfers
        UNION ALL
        SELECT destination_branch_id as branch_id FROM transfers
      ) as t
      JOIN branches b ON t.branch_id = b.id
      GROUP BY b.id
      ORDER BY total DESC
      LIMIT 3
    `);

    return successResponse(res, {
      por_estado: rows,
      sucursales_mas_activas: mostActive
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCurrentMonthSales,
  getSalesComparison,
  getInventoryBehavior,
  getLowStock,
  getTopSellingProducts,
  getTransfersSummary,
  getGlobalRanking,
  getDailySalesCurrentMonth,
  getGlobalSummary,
  getIncomeByBranch,
  getMonthlyComparison,
  getTopProductsGlobal,
  getTransfersGlobalSummary
};
