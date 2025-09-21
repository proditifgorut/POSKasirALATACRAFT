// Alata Craft Local Database - IndexedDB Implementation
class AlataCraftDB {
    constructor() {
        this.dbName = 'AlataCraftPOS';
        this.version = 1;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productsStore = db.createObjectStore('products', { keyPath: 'kode' });
                    productsStore.createIndex('nama', 'nama', { unique: false });
                    productsStore.createIndex('kategori', 'kategori', { unique: false });
                    productsStore.createIndex('harga', 'harga', { unique: false });
                }

                // Transactions store
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionsStore = db.createObjectStore('transactions', { keyPath: 'id' });
                    transactionsStore.createIndex('date', 'date', { unique: false });
                    transactionsStore.createIndex('customer', 'customer', { unique: false });
                    transactionsStore.createIndex('total', 'total', { unique: false });
                    transactionsStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
                }

                // Customers store
                if (!db.objectStoreNames.contains('customers')) {
                    const customersStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                    customersStore.createIndex('name', 'name', { unique: false });
                    customersStore.createIndex('phone', 'phone', { unique: true });
                    customersStore.createIndex('email', 'email', { unique: true });
                }

                // Categories store
                if (!db.objectStoreNames.contains('categories')) {
                    const categoriesStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    categoriesStore.createIndex('name', 'name', { unique: true });
                }

                // Daily stats store
                if (!db.objectStoreNames.contains('dailyStats')) {
                    const statsStore = db.createObjectStore('dailyStats', { keyPath: 'date' });
                    statsStore.createIndex('totalSales', 'totalSales', { unique: false });
                    statsStore.createIndex('totalTransactions', 'totalTransactions', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Inventory logs store
                if (!db.objectStoreNames.contains('inventoryLogs')) {
                    const inventoryStore = db.createObjectStore('inventoryLogs', { keyPath: 'id', autoIncrement: true });
                    inventoryStore.createIndex('productCode', 'productCode', { unique: false });
                    inventoryStore.createIndex('date', 'date', { unique: false });
                    inventoryStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.add(data);
    }

    async put(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.put(data);
    }

    async get(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.delete(key);
    }

    async clear(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.clear();
    }

    // Products operations
    async getProducts() {
        return await this.getAll('products');
    }

    async getProduct(kode) {
        return await this.get('products', kode);
    }

    async saveProduct(product) {
        return await this.put('products', product);
    }

    async deleteProduct(kode) {
        return await this.delete('products', kode);
    }

    async getProductsByCategory(category) {
        const transaction = this.db.transaction(['products'], 'readonly');
        const store = transaction.objectStore(products);
        const index = store.index('kategori');
        return new Promise((resolve, reject) => {
            const request = index.getAll(category);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async searchProducts(searchTerm) {
        const products = await this.getProducts();
        return products.filter(product => 
            product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.kategori.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    async updateProductStock(kode, newStock, logType = 'manual', notes = '') {
        const product = await this.getProduct(kode);
        if (product) {
            const oldStock = product.volume;
            product.volume = newStock;
            
            // Save updated product
            await this.saveProduct(product);
            
            // Log inventory change
            await this.logInventoryChange({
                productCode: kode,
                productName: product.nama,
                oldStock: oldStock,
                newStock: newStock,
                change: newStock - oldStock,
                type: logType,
                notes: notes,
                date: new Date().toISOString(),
                timestamp: Date.now()
            });
            
            return product;
        }
        return null;
    }

    // Transactions operations
    async saveTransaction(transaction) {
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        let dailyStats = await this.get('dailyStats', today);
        
        if (!dailyStats) {
            dailyStats = {
                date: today,
                totalSales: 0,
                totalTransactions: 0,
                totalItems: 0,
                averageTransaction: 0
            };
        }
        
        dailyStats.totalSales += transaction.total;
        dailyStats.totalTransactions += 1;
        dailyStats.totalItems += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
        dailyStats.averageTransaction = dailyStats.totalSales / dailyStats.totalTransactions;
        
        await Promise.all([
            this.put('transactions', transaction),
            this.put('dailyStats', dailyStats)
        ]);
        
        return transaction;
    }

    async getTransactions() {
        return await this.getAll('transactions');
    }

    async getTransaction(id) {
        return await this.get('transactions', id);
    }

    async getTransactionsByDate(date) {
        const transactions = await this.getTransactions();
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
            return transactionDate === date;
        });
    }

    async getTransactionsByDateRange(startDate, endDate) {
        const transactions = await this.getTransactions();
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    // Daily stats operations
    async getDailyStats(date) {
        return await this.get('dailyStats', date);
    }

    async getTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        return await this.getDailyStats(today);
    }

    async getStatsRange(startDate, endDate) {
        const allStats = await this.getAll('dailyStats');
        return allStats.filter(stat => stat.date >= startDate && stat.date <= endDate);
    }

    // Customers operations
    async saveCustomer(customer) {
        return await this.put('customers', customer);
    }

    async getCustomers() {
        return await this.getAll('customers');
    }

    async getCustomer(id) {
        return await this.get('customers', id);
    }

    async findCustomerByPhone(phone) {
        const customers = await this.getCustomers();
        return customers.find(customer => customer.phone === phone);
    }

    async findCustomerByEmail(email) {
        const customers = await this.getCustomers();
        return customers.find(customer => customer.email === email);
    }

    // Categories operations
    async getCategories() {
        return await this.getAll('categories');
    }

    async saveCategory(category) {
        return await this.put('categories', category);
    }

    // Settings operations
    async getSetting(key, defaultValue = null) {
        const setting = await this.get('settings', key);
        return setting ? setting.value : defaultValue;
    }

    async setSetting(key, value) {
        return await this.put('settings', { key, value });
    }

    // Inventory logs
    async logInventoryChange(log) {
        return await this.add('inventoryLogs', log);
    }

    async getInventoryLogs(productCode = null, limit = 100) {
        const logs = await this.getAll('inventoryLogs');
        let filteredLogs = productCode ? 
            logs.filter(log => log.productCode === productCode) : 
            logs;
        
        // Sort by timestamp descending and limit results
        return filteredLogs
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // Data migration from localStorage
    async migrateFromLocalStorage() {
        try {
            // Migrate products
            const savedProducts = localStorage.getItem('alataCraftProducts');
            if (savedProducts) {
                const products = JSON.parse(savedProducts);
                for (const product of products) {
                    await this.saveProduct(product);
                }
                console.log('✅ Products migrated to IndexedDB');
            }

            // Migrate transaction history
            const savedHistory = localStorage.getItem('alataCraftHistory');
            if (savedHistory) {
                const transactions = JSON.parse(savedHistory);
                for (const transaction of transactions) {
                    await this.put('transactions', transaction);
                }
                console.log('✅ Transactions migrated to IndexedDB');
            }

            // Migrate daily stats
            const savedStats = localStorage.getItem('alataCraftStats');
            if (savedStats) {
                const stats = JSON.parse(savedStats);
                await this.put('dailyStats', stats);
                console.log('✅ Daily stats migrated to IndexedDB');
            }

            // Migrate counter
            const savedCounter = localStorage.getItem('alataCraftCounter');
            if (savedCounter) {
                await this.setSetting('transactionCounter', parseInt(savedCounter));
                console.log('✅ Transaction counter migrated to IndexedDB');
            }

            return true;
        } catch (error) {
            console.error('❌ Migration error:', error);
            return false;
        }
    }

    // Analytics and reports
    async getTopSellingProducts(limit = 10) {
        const transactions = await this.getTransactions();
        const productSales = {};

        transactions.forEach(transaction => {
            transaction.items.forEach(item => {
                if (!productSales[item.kode]) {
                    productSales[item.kode] = {
                        kode: item.kode,
                        nama: item.nama,
                        totalQuantity: 0,
                        totalRevenue: 0,
                        transactionCount: 0
                    };
                }
                productSales[item.kode].totalQuantity += item.quantity;
                productSales[item.kode].totalRevenue += item.total;
                productSales[item.kode].transactionCount += 1;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, limit);
    }

    async getSalesReportByPeriod(startDate, endDate) {
        const transactions = await this.getTransactionsByDateRange(startDate, endDate);
        
        const report = {
            period: { startDate, endDate },
            totalTransactions: transactions.length,
            totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
            totalItems: transactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
            averageTransaction: 0,
            paymentMethods: {
                cash: { count: 0, total: 0 },
                transfer: { count: 0, total: 0 }
            },
            dailyBreakdown: {}
        };

        report.averageTransaction = report.totalTransactions > 0 ? report.totalRevenue / report.totalTransactions : 0;

        transactions.forEach(transaction => {
            // Payment methods
            report.paymentMethods[transaction.paymentMethod].count += 1;
            report.paymentMethods[transaction.paymentMethod].total += transaction.total;

            // Daily breakdown
            const date = new Date(transaction.date).toISOString().split('T')[0];
            if (!report.dailyBreakdown[date]) {
                report.dailyBreakdown[date] = {
                    transactions: 0,
                    revenue: 0,
                    items: 0
                };
            }
            report.dailyBreakdown[date].transactions += 1;
            report.dailyBreakdown[date].revenue += transaction.total;
            report.dailyBreakdown[date].items += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
        });

        return report;
    }

    // Database backup and restore
    async exportData() {
        const data = {
            products: await this.getProducts(),
            transactions: await this.getTransactions(),
            customers: await this.getCustomers(),
            categories: await this.getCategories(),
            dailyStats: await this.getAll('dailyStats'),
            settings: await this.getAll('settings'),
            inventoryLogs: await this.getInventoryLogs(null, 1000),
            exportDate: new Date().toISOString(),
            version: this.version
        };
        
        return JSON.stringify(data, null, 2);
    }

    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Clear existing data
            await this.clear('products');
            await this.clear('transactions');
            await this.clear('customers');
            await this.clear('categories');
            await this.clear('dailyStats');
            await this.clear('settings');
            await this.clear('inventoryLogs');

            // Import data
            if (data.products) {
                for (const item of data.products) {
                    await this.saveProduct(item);
                }
            }

            if (data.transactions) {
                for (const item of data.transactions) {
                    await this.put('transactions', item);
                }
            }

            if (data.customers) {
                for (const item of data.customers) {
                    await this.put('customers', item);
                }
            }

            if (data.categories) {
                for (const item of data.categories) {
                    await this.put('categories', item);
                }
            }

            if (data.dailyStats) {
                for (const item of data.dailyStats) {
                    await this.put('dailyStats', item);
                }
            }

            if (data.settings) {
                for (const item of data.settings) {
                    await this.put('settings', item);
                }
            }

            if (data.inventoryLogs) {
                for (const item of data.inventoryLogs) {
                    await this.add('inventoryLogs', item);
                }
            }

            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }

    // Database maintenance
    async optimizeDatabase() {
        // Clean up old inventory logs (keep only last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const cutoffTimestamp = sixMonthsAgo.getTime();

        const logs = await this.getAll('inventoryLogs');
        const transaction = this.db.transaction(['inventoryLogs'], 'readwrite');
        const store = transaction.objectStore('inventoryLogs');

        for (const log of logs) {
            if (log.timestamp < cutoffTimestamp) {
                await store.delete(log.id);
            }
        }

        console.log('✅ Database optimized');
        return true;
    }
}

// Create global database instance
window.alataCraftDB = new AlataCraftDB();
