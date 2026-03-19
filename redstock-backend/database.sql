-- ============================================================
--  RedStock — Script de base de datos
--  Motor: MySQL 8+
--  Crear la base y ejecutar: mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS redstock
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE redstock;

-- ─── Tabla: branches ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  address    VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── Tabla: users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50)  NOT NULL DEFAULT 'employee',
  branch_id  INT UNSIGNED NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

-- ─── Tabla: products ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  sku         VARCHAR(100) NOT NULL UNIQUE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── Tabla: inventory ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id  INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT          NOT NULL DEFAULT 0,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_branch  FOREIGN KEY (branch_id)  REFERENCES branches(id),
  CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY uq_inventory (branch_id, product_id)
) ENGINE=InnoDB;

-- ─── Tabla: transfers ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transfers (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  origin_branch_id      INT UNSIGNED NOT NULL,
  destination_branch_id INT UNSIGNED NOT NULL,
  status                ENUM('PENDING','IN_TRANSIT','RECEIVED','PARTIAL') NOT NULL DEFAULT 'PENDING',
  requested_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  received_at           TIMESTAMP NULL,
  CONSTRAINT fk_tr_origin FOREIGN KEY (origin_branch_id)      REFERENCES branches(id),
  CONSTRAINT fk_tr_dest   FOREIGN KEY (destination_branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

-- ─── Tabla: transfer_items ───────────────────────────────────
CREATE TABLE IF NOT EXISTS transfer_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transfer_id   INT UNSIGNED NOT NULL,
  product_id    INT UNSIGNED NOT NULL,
  requested_qty INT          NOT NULL,
  received_qty  INT          NULL,
  notes         TEXT         NULL,
  CONSTRAINT fk_ti_transfer FOREIGN KEY (transfer_id) REFERENCES transfers(id),
  CONSTRAINT fk_ti_product  FOREIGN KEY (product_id)  REFERENCES products(id)
) ENGINE=InnoDB;

-- ─── Tabla: sales ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id         INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  branch_id  INT UNSIGNED   NOT NULL,
  product_id INT UNSIGNED   NOT NULL,
  quantity   INT            NOT NULL,
  sale_date  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  total      DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_sale_branch  FOREIGN KEY (branch_id)  REFERENCES branches(id),
  CONSTRAINT fk_sale_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ─── Datos de ejemplo (opcional) ────────────────────────────
-- INSERT INTO branches (name, address) VALUES
--   ('Sucursal Central', 'Av. Principal 100'),
--   ('Sucursal Norte',   'Calle Norte 250');
