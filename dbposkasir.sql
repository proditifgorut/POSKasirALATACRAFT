-- SQL Schema for Alata Craft POS System
-- This schema is designed to mirror the structure used in the IndexedDB implementation.

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`name`) VALUES
('Alat Produksi'),
('Bahan Baku'),
('Bahan Produksi'),
('Komponen Produksi');

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `kode` varchar(50) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `satuan` varchar(50) DEFAULT NULL,
  `volume` int(11) NOT NULL DEFAULT 0,
  `harga` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`kode`),
  KEY `kategori` (`kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`kode`, `nama`, `kategori`, `satuan`, `volume`, `harga`) VALUES
('PRD001', 'Benang Rajut', 'Bahan Produksi', 'unit', 15, 30000.00),
('PRD002', 'Alat Press Eceng Gondok', 'Alat Produksi', 'unit', 1, 2400000.00),
('PRD003', 'Serat Eceng Gondok Kering', 'Bahan Baku', 'paket', 50, 25000.00),
('PRD004', 'Lem Kayu Serbaguna', 'Bahan Produksi', 'paket', 20, 25000.00),
('PRD005', 'Mesin Pemotong Serat', 'Alat Produksi', 'unit', 1, 3500000.00),
('PRD006', 'Cat Kayu', 'Bahan Produksi', 'paket', 16, 85000.00),
('PRD007', 'Aksesoris Kerajinan', 'Komponen Produksi', 'unit', 4, 95000.00),
('PRD008', 'Gunting Serat Tebal', 'Alat Produksi', 'unit', 20, 125000.00),
('PRD009', 'Ember & Alat Pendukung', 'Alat Produksi', 'unit', 3, 50000.00),
('PRD010', 'Rumah Pengering Eceng Gondok', 'Alat Produksi', 'unit', 4, 2700000.00),
('PRD011', 'Cetakan Anyaman Tas', 'Alat Produksi', 'unit', 10, 300000.00),
('PRD012', 'Sarung Tangan Kerja', 'Komponen Produksi', 'unit', 16, 20000.00),
('PRD013', 'Timbangan Digital 30kg', 'Alat Produksi', 'unit', 1, 380000.00);

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `daily_stats`
--

CREATE TABLE `daily_stats` (
  `date` date NOT NULL,
  `totalSales` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalTransactions` int(11) NOT NULL DEFAULT 0,
  `totalItems` int(11) NOT NULL DEFAULT 0,
  `averageTransaction` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `inventory_logs`
--

CREATE TABLE `inventory_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productCode` varchar(50) NOT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `oldStock` int(11) DEFAULT NULL,
  `newStock` int(11) DEFAULT NULL,
  `change` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL COMMENT 'e.g., sale, manual, initial',
  `notes` text DEFAULT NULL,
  `date` datetime NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productCode` (`productCode`),
  CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`productCode`) REFERENCES `products` (`kode`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key`, `value`) VALUES
('businessAddress', 'Jl. Kerajinan No. 123, Indonesia'),
('businessName', 'Alata Craft'),
('businessPhone', '(021) 123-4567'),
('transactionCounter', '1');

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(50) NOT NULL,
  `receiptNo` varchar(50) NOT NULL,
  `date` datetime NOT NULL,
  `customer` varchar(255) DEFAULT 'Customer',
  `total` decimal(15,2) NOT NULL,
  `paymentMethod` varchar(50) NOT NULL,
  `cashAmount` decimal(15,2) DEFAULT NULL,
  `changeAmount` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(50) NOT NULL,
  `product_kode` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_sale` decimal(10,2) NOT NULL,
  `total` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `product_kode` (`product_kode`),
  CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaction_items_ibfk_2` FOREIGN KEY (`product_kode`) REFERENCES `products` (`kode`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
