-- =============================================
-- PARTE 1: CONFIGURACIÓN
-- =============================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS redstock 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE redstock;

-- =============================================
-- PARTE 2: CREAR TABLAS
-- =============================================

CREATE TABLE IF NOT EXISTS branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee',
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_product (branch_id, product_id)
);

CREATE TABLE IF NOT EXISTS transfers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    origin_branch_id INT NOT NULL,
    destination_branch_id INT NOT NULL,
    status ENUM('PENDING','IN_TRANSIT','RECEIVED','PARTIAL') DEFAULT 'PENDING',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP NULL,
    FOREIGN KEY (origin_branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transfer_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transfer_id INT NOT NULL,
    product_id INT NOT NULL,
    requested_qty INT NOT NULL,
    received_qty INT DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    product_id INT NOT NULL,
    type ENUM('IN','OUT','TRANSFER_IN','TRANSFER_OUT') NOT NULL,
    quantity INT NOT NULL,
    reference_id INT NULL,
    reference_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =============================================
-- PARTE 3: INSERTAR DATOS MAESTROS
-- =============================================

INSERT IGNORE INTO branches (id, name, address) VALUES
(1, 'Sucursal Norte',    'Calle 80 #45-23, Bogotá'),
(2, 'Sucursal Sur',      'Av. 1 de Mayo #32-10, Bogotá'),
(3, 'Sucursal Centro',   'Carrera 7 #15-40, Bogotá'),
(4, 'Sucursal Occidente','Calle 13 #90-15, Bogotá');

INSERT IGNORE INTO users (id, name, email, password, role, branch_id) VALUES
(1, 'Super Admin', 'superadmin@redstock.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin', NULL),
(2, 'Admin Norte', 'admin.norte@redstock.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(3, 'Employee Sur', 'employee.sur@redstock.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 2),
(4, 'Andrés Ríos',     'andres@redstock.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',    3),
(5, 'Valentina Cruz',  'valentina@redstock.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',    4),
(6, 'Miguel Herrera',  'miguel@redstock.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 1),
(7, 'Sofia Morales',   'sofia@redstock.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 2),
(8, 'Juan Castillo',   'juan@redstock.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 3),
(9, 'Daniela Vargas',  'daniela@redstock.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 4);

INSERT IGNORE INTO products (id, name, description, sku) VALUES
(1,  'Camisa Manga Larga',  'Camisa formal manga larga',   'CAM-ML-001'),
(2,  'Camisa Manga Corta',  'Camisa casual manga corta',   'CAM-MC-002'),
(3,  'Pantalón Clásico',    'Pantalón de vestir clásico',  'PAN-CL-003'),
(4,  'Pantalón Casual',     'Pantalón casual slim fit',    'PAN-CA-004'),
(5,  'Chaqueta Ejecutiva',  'Chaqueta formal ejecutiva',   'CHA-EJ-005'),
(6,  'Zapatos Formales',    'Zapatos de cuero formales',   'ZAP-FO-006'),
(7,  'Zapatos Casuales',    'Zapatos casuales urbanos',    'ZAP-CA-007'),
(8,  'Cinturón de Cuero',   'Cinturón cuero genuino',      'CIN-CU-008'),
(9,  'Corbata Seda',        'Corbata 100% seda',           'COR-SE-009'),
(10, 'Bufanda Lana',        'Bufanda de lana importada',   'BUF-LA-010');

INSERT IGNORE INTO inventory (branch_id, product_id, quantity) VALUES
(1,1,30),(1,2,25),(1,3,20),(1,4,15),(1,5,10),(1,6,12),(1,7,18),(1,8,40),(1,9,22),(1,10,3),
(2,1,10),(2,2,5),(2,3,8),(2,4,20),(2,5,2),(2,6,15),(2,7,9),(2,8,30),(2,9,4),(2,10,25),
(3,1,5),(3,2,18),(3,3,12),(3,4,3),(3,5,20),(3,6,7),(3,7,14),(3,8,2),(3,9,16),(3,10,11),
(4,1,20),(4,2,2),(4,3,25),(4,4,10),(4,5,8),(4,6,3),(4,7,22),(4,8,15),(4,9,30),(4,10,6);

-- =============================================
-- PARTE 4: DATOS DE VENTAS Y MOVIMIENTOS (SIMULADOS)
-- =============================================

-- Inserción de movimientos de reposición inicial (Mes 1)
INSERT IGNORE INTO inventory_movements (branch_id, product_id, type, quantity, reference_type, created_at)
SELECT b.id, p.id, 'IN', 120, 'replenishment', '2025-10-01 08:00:00'
FROM branches b, products p;

-- Simulación de ventas (Muestra reducida para el script, siguiendo tendencias)
-- Sucursal 1 (Fuerte)
INSERT IGNORE INTO sales (branch_id, product_id, quantity, sale_date, total) VALUES
(1, 1, 2, '2025-10-05 10:30:00', 170000), (1, 5, 1, '2025-10-12 15:45:00', 180000),
(1, 3, 3, '2025-11-02 11:20:00', 285000), (1, 6, 2, '2025-11-20 18:10:00', 440000),
(1, 2, 4, '2025-12-10 09:15:00', 260000), (1, 7, 1, '2025-12-24 14:30:00', 150000),
(1, 4, 2, '2026-01-08 12:00:00', 150000), (1, 8, 5, '2026-01-15 16:20:00', 225000),
(1, 1, 3, '2026-02-04 10:00:00', 255000), (1, 9, 2, '2026-02-28 17:40:00', 110000),
(1, 10, 1, '2026-03-05 11:30:00', 40000), (1, 2, 3, '2026-03-15 15:00:00', 195000);

-- Sucursal 4 (Crecimiento)
INSERT IGNORE INTO sales (branch_id, product_id, quantity, sale_date, total) VALUES
(4, 1, 1, '2025-10-10 14:00:00', 85000), (4, 3, 1, '2025-11-15 11:00:00', 95000),
(4, 5, 2, '2025-12-05 10:30:00', 360000), (4, 2, 3, '2026-01-20 16:00:00', 195000),
(4, 6, 4, '2026-02-12 12:45:00', 880000), (4, 7, 5, '2026-03-10 18:20:00', 750000),
(4, 4, 6, '2026-03-18 14:15:00', 450000);

-- Movimientos correspondientes a las ventas anteriores (OUT)
INSERT IGNORE INTO inventory_movements (branch_id, product_id, type, quantity, reference_id, reference_type, created_at)
SELECT branch_id, product_id, 'OUT', quantity, id, 'sale', sale_date FROM sales;

-- Reposiciones mensuales (Mes 2 a 6)
INSERT IGNORE INTO inventory_movements (branch_id, product_id, type, quantity, reference_type, created_at)
SELECT b.id, p.id, 'IN', 100, 'replenishment', '2025-11-01 08:00:00' FROM branches b, products p;
INSERT IGNORE INTO inventory_movements (branch_id, product_id, type, quantity, reference_type, created_at)
SELECT b.id, p.id, 'IN', 100, 'replenishment', '2025-12-01 08:00:00' FROM branches b, products p;
INSERT IGNORE INTO inventory_movements (branch_id, product_id, type, quantity, reference_type, created_at)
SELECT b.id, p.id, 'IN', 130, 'replenishment', '2026-01-01 08:00:00' FROM branches b, products p;
INSERT IGNORE INTO inventory_movements (branch_id, product_id, type, quantity, reference_type, created_at)
SELECT b.id, p.id, 'IN', 110, 'replenishment', '2026-02-01 08:00:00' FROM branches b, products p;
INSERT IGNORE INTO inventory_movements (branch_id, product_id, type, quantity, reference_type, created_at)
SELECT b.id, p.id, 'IN', 150, 'replenishment', '2026-03-01 08:00:00' FROM branches b, products p;

-- =============================================
-- PARTE 5: VERIFICACIÓN
-- =============================================

-- SELECT COUNT(*) as total_branches FROM branches;
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT COUNT(*) as total_inventory FROM inventory;
-- SELECT COUNT(*) as total_sales FROM sales;
-- SELECT COUNT(*) as total_movements FROM inventory_movements;
-- SELECT b.name, COUNT(s.id) as ventas, SUM(s.total) as ingresos
--   FROM branches b LEFT JOIN sales s ON s.branch_id = b.id
--   GROUP BY b.id, b.name;
