// Product data from RAB PKM Alata Craft
const initialProducts = [
    { kode: "PRD001", nama: "Benang Rajut", kategori: "Bahan Produksi", satuan: "unit", volume: 15, harga: 30000 },
    { kode: "PRD002", nama: "Alat Press Eceng Gondok", kategori: "Alat Produksi", satuan: "unit", volume: 1, harga: 2400000 },
    { kode: "PRD003", nama: "Serat Eceng Gondok Kering", kategori: "Bahan Baku", satuan: "paket", volume: 50, harga: 25000 },
    { kode: "PRD004", nama: "Lem Kayu Serbaguna", kategori: "Bahan Produksi", satuan: "paket", volume: 20, harga: 25000 },
    { kode: "PRD005", nama: "Mesin Pemotong Serat", kategori: "Alat Produksi", satuan: "unit", volume: 1, harga: 3500000 },
    { kode: "PRD006", nama: "Cat Kayu", kategori: "Bahan Produksi", satuan: "paket", volume: 16, harga: 85000 },
    { kode: "PRD007", nama: "Aksesoris Kerajinan", kategori: "Komponen Produksi", satuan: "unit", volume: 4, harga: 95000 },
    { kode: "PRD008", nama: "Gunting Serat Tebal", kategori: "Alat Produksi", satuan: "unit", volume: 20, harga: 125000 },
    { kode: "PRD009", nama: "Ember & Alat Pendukung", kategori: "Alat Produksi", satuan: "unit", volume: 3, harga: 50000 },
    { kode: "PRD010", nama: "Rumah Pengering Eceng Gondok", kategori: "Alat Produksi", satuan: "unit", volume: 4, harga: 2700000 },
    { kode: "PRD011", nama: "Cetakan Anyaman Tas", kategori: "Alat Produksi", satuan: "unit", volume: 10, harga: 300000 },
    { kode: "PRD012", nama: "Sarung Tangan Kerja", kategori: "Komponen Produksi", satuan: "unit", volume: 16, harga: 20000 },
    { kode: "PRD013", nama: "Timbangan Digital 30kg", kategori: "Alat Produksi", satuan: "unit", volume: 1, harga: 380000 }
];

// Global variables
let products = [];
let cart = [];
let transactionCounter = 1;
let filteredProducts = [];
let currentDailyStats = {
    totalSales: 0,
    totalTransactions: 0,
    date: new Date().toISOString().split('T')[0]
};

// Database instance
let db = null;

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const stockFilter = document.getElementById('stockFilter');
const allModals = document.querySelectorAll('.modal');
const toolsBtn = document.getElementById('toolsBtn');
const toolsDropdown = document.getElementById('toolsDropdown');
const invoiceBtn = document.getElementById('invoiceBtn');
const invoiceDropdown = document.getElementById('invoiceDropdown');
const dbInfoBtn = document.getElementById('dbInfoBtn');

// DB Error Screen Elements
const dbErrorFullscreen = document.getElementById('db-error-fullscreen');
const mainContentGrid = document.getElementById('main-content-grid');
const continueInFallbackBtn = document.getElementById('continue-in-fallback');
const tryReconnectBtn = document.getElementById('try-reconnect');


// Initialize database and load data
async function initializeDatabase() {
    try {
        db = window.alataCraftDB;
        await db.init();
        console.log('✅ Database initialized successfully');
        
        mainContentGrid.classList.remove('hidden');
        dbErrorFullscreen.classList.add('hidden');
        
        const existingProducts = await db.getProducts();
        
        if (existingProducts.length === 0) {
            console.log('🔄 First run detected, setting up initial data...');
            for (const product of initialProducts) {
                await db.saveProduct(product);
            }
            
            const categories = [...new Set(initialProducts.map(p => p.kategori))];
            for (let i = 0; i < categories.length; i++) {
                await db.saveCategory({ id: i + 1, name: categories[i] });
            }
            
            await db.setSetting('transactionCounter', 1);
            await db.setSetting('businessName', 'Alata Craft');
            await db.setSetting('businessAddress', 'JL.Kota Tengah No. 33 Gorontalo');
            await db.setSetting('businessPhone', '(021) 123-4567');
            
            console.log('✅ Initial data setup completed');
        } else {
            await db.migrateFromLocalStorage();
        }
        
        await loadData();
        showNotification('✅ Advanced Local Database Connected', 'success');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        
        mainContentGrid.classList.add('hidden');
        dbErrorFullscreen.classList.remove('hidden');

        loadDataFromLocalStorage();
    }
}

// Load data from database
async function loadData() {
    try {
        products = await db.getProducts();
        filteredProducts = [...products];
        
        transactionCounter = await db.getSetting('transactionCounter', 1);
        
        const todayStats = await db.getTodayStats();
        if (todayStats) {
            currentDailyStats = todayStats;
        }
        
        console.log('✅ Data loaded from database');
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showNotification('Error loading data from database', 'error');
    }
}

// Fallback localStorage functions
function loadDataFromLocalStorage() {
    products = JSON.parse(localStorage.getItem('alataCraftProducts') || '[]');
    if (products.length === 0) products = [...initialProducts];
    filteredProducts = [...products];
    transactionCounter = parseInt(localStorage.getItem('alataCraftCounter') || '1');
    const savedStats = localStorage.getItem('alataCraftStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        if (stats.date === new Date().toISOString().split('T')[0]) {
            currentDailyStats = stats;
        }
    }
}

// Save data to database
async function saveData() {
    try {
        if (db) {
            await db.setSetting('transactionCounter', transactionCounter);
            await db.put('dailyStats', currentDailyStats);
        } else {
            localStorage.setItem('alataCraftProducts', JSON.stringify(products));
            localStorage.setItem('alataCraftCounter', transactionCounter.toString());
            localStorage.setItem('alataCraftStats', JSON.stringify(currentDailyStats));
        }
    } catch (error) {
        console.error('❌ Error saving data:', error);
    }
}

// Utility functions
function getCurrentTime() {
    return new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function updateTransactionId() {
    document.getElementById('transactionId').textContent = transactionCounter.toString().padStart(3, '0');
}

function updateTime() {
    document.getElementById('currentTime').textContent = getCurrentTime();
}

function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('todaySales').textContent = formatCurrency(currentDailyStats.totalSales, true);
    document.getElementById('totalTransactions').textContent = currentDailyStats.totalTransactions;
    document.getElementById('avgTransaction').textContent = formatCurrency(
        currentDailyStats.totalTransactions > 0 ? currentDailyStats.totalSales / currentDailyStats.totalTransactions : 0, true
    );
}

function getStockStatus(product) {
    if (product.volume <= 0) return 'out';
    if (product.volume <= 5) return 'low';
    return 'normal';
}

// Product rendering
function renderProducts(productList = products) {
    productsGrid.innerHTML = '';
    
    productList.forEach(product => {
        const productCard = document.createElement('div');
        const stockStatus = getStockStatus(product);
        
        productCard.className = `card p-4 hover:scale-105 transition-all duration-200 cursor-pointer ${
            stockStatus === 'low' ? 'stock-low' : 
            stockStatus === 'out' ? 'stock-out' : 'stock-normal'
        }`;
        
        const categoryColors = {
            'Bahan Produksi': 'bg-blue-100 text-blue-800',
            'Alat Produksi': 'bg-green-100 text-green-800',
            'Bahan Baku': 'bg-yellow-100 text-yellow-800',
            'Komponen Produksi': 'bg-purple-100 text-purple-800'
        };

        const stockBadgeColors = {
            'normal': 'bg-green-100 text-green-800',
            'low': 'bg-orange-100 text-orange-800',
            'out': 'bg-red-100 text-red-800'
        };
        
        productCard.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs px-2 py-1 rounded-full ${categoryColors[product.kategori] || 'bg-gray-100 text-gray-800'}">${product.kategori}</span>
                    <span class="text-xs text-gray-500">${product.kode}</span>
                </div>
                
                <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2 flex-grow">${product.nama}</h3>
                
                <div class="text-sm text-gray-600 mb-3 space-y-1">
                    <div class="flex justify-between">
                        <span>Unit:</span>
                        <span>${product.satuan}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Stock:</span>
                        <span class="text-xs px-2 py-1 rounded-full ${stockBadgeColors[stockStatus]}">
                            ${product.volume} ${stockStatus === 'low' ? '⚠️' : stockStatus === 'out' ? '❌' : '✅'}
                        </span>
                    </div>
                </div>
                
                <div class="mt-auto">
                    <div class="text-lg font-bold text-primary-600 mb-3">${formatCurrency(product.harga, true)}</div>
                    <button 
                        onclick="addToCart('${product.kode}')" 
                        class="w-full btn-primary text-sm ${stockStatus === 'out' ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${stockStatus === 'out' ? 'disabled' : ''}
                    >
                        ${stockStatus === 'out' ? '❌ Out of Stock' : '➕ Add to Cart'}
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    if (productList.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <div class="text-4xl mb-4">🔍</div>
                <p class="text-lg mb-2">No products found</p>
                <p class="text-sm">Try adjusting your search or filter</p>
            </div>
        `;
    }
}

// Cart functions
function addToCart(productCode) {
    const product = products.find(p => p.kode === productCode);
    if (!product || product.volume <= 0) return;
    
    const existingItem = cart.find(item => item.kode === productCode);
    
    if (existingItem) {
        if (existingItem.quantity < product.volume) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.harga;
        } else {
            showNotification('❌ Insufficient stock!', 'error');
            return;
        }
    } else {
        cart.push({ ...product, quantity: 1, total: product.harga });
    }
    
    const productCard = event.target.closest('.card');
    productCard.classList.add('cart-add-animation');
    setTimeout(() => productCard.classList.remove('cart-add-animation'), 600);
    
    renderCart();
    updateCartTotals();
    showNotification('✅ Added to cart!', 'success');
}

function removeFromCart(productCode) {
    cart = cart.filter(item => item.kode !== productCode);
    renderCart();
    updateCartTotals();
}

function updateQuantity(productCode, change) {
    const item = cart.find(item => item.kode === productCode);
    const product = products.find(p => p.kode === productCode);
    
    if (item && product) {
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            removeFromCart(productCode);
        } else if (newQuantity <= product.volume) {
            item.quantity = newQuantity;
            item.total = item.quantity * item.harga;
            renderCart();
            updateCartTotals();
        } else {
            showNotification('❌ Insufficient stock!', 'error');
        }
    }
}

function renderCart() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = `${cartCount} item${cartCount !== 1 ? 's' : ''}`;
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.innerHTML = '';
        return;
    }
    
    emptyCart.style.display = 'none';
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'bg-gray-50 p-3 rounded-lg border border-gray-200';
        
        cartItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-sm text-gray-800 flex-1 pr-2">${item.nama}</h4>
                <button onclick="removeFromCart('${item.kode}')" class="text-red-500 hover:text-red-700 text-lg hover:bg-red-50 rounded p-1">
                    🗑️
                </button>
            </div>
            
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <button onclick="updateQuantity('${item.kode}', -1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center justify-center font-bold">−</button>
                    <span class="text-sm font-medium w-10 text-center">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.kode}', 1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center justify-center font-bold">+</button>
                </div>
                
                <div class="text-right">
                    <div class="text-xs text-gray-500">${formatCurrency(item.harga, true)} each</div>
                    <div class="font-semibold text-sm text-primary-600">${formatCurrency(item.total, true)}</div>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
}

function updateCartTotals() {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal;
    
    document.getElementById('itemCount').textContent = itemCount;
    document.getElementById('subtotal').textContent = formatCurrency(subtotal, true);
    document.getElementById('tax').textContent = formatCurrency(0, true);
    document.getElementById('total').textContent = formatCurrency(total, true);
    
    document.getElementById('checkoutBtn').disabled = cart.length === 0;
}

function clearCart() {
    cart = [];
    renderCart();
    updateCartTotals();
    showNotification('🗑️ Cart cleared!', 'info');
}

// Search and filter functions
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStock = stockFilter.value;
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.nama.toLowerCase().includes(searchTerm) || 
                            product.kategori.toLowerCase().includes(searchTerm) ||
                            product.kode.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === '' || product.kategori === selectedCategory;
        
        let matchesStock = true;
        if (selectedStock === 'in-stock') matchesStock = product.volume > 5;
        else if (selectedStock === 'low-stock') matchesStock = product.volume > 0 && product.volume <= 5;
        else if (selectedStock === 'out-of-stock') matchesStock = product.volume <= 0;
        
        return matchesSearch && matchesCategory && matchesStock;
    });
    
    renderProducts(filteredProducts);
}

// Modal management
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Checkout functions
function openCheckoutModal() {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('checkoutTotal').textContent = formatCurrency(total, true);
    document.getElementById('cashAmount').value = '';
    document.getElementById('changeAmount').textContent = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    
    document.getElementById('shopName').value = 'Alata Craft';
    document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];

    document.getElementById('checkoutItems').innerHTML = cart.map(item => `
        <div class="flex justify-between text-sm">
            <span>${item.nama} x${item.quantity}</span>
            <span>${formatCurrency(item.total, true)}</span>
        </div>
    `).join('');
    
    openModal('checkoutModal');
}

function calculateChange() {
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
    const change = cashAmount - total;
    
    const changeEl = document.getElementById('changeAmount');
    if (cashAmount > 0) {
        if (change >= 0) {
            changeEl.textContent = `💰 Change: ${formatCurrency(change, true)}`;
            changeEl.className = 'text-sm text-green-600 mt-2 font-medium';
        } else {
            changeEl.textContent = `❌ Insufficient: ${formatCurrency(Math.abs(change), true)} more needed`;
            changeEl.className = 'text-sm text-red-600 mt-2 font-medium';
        }
    } else {
        changeEl.textContent = '';
    }
}

async function processCheckout() {
    const paymentMethod = document.querySelector('.payment-method-btn.active').dataset.method;
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const customerName = document.getElementById('customerName').value.trim() || 'Customer';
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const shopName = document.getElementById('shopName').value.trim() || 'Alata Craft';
    const transactionDateValue = document.getElementById('transactionDate').value;
    const transactionDate = new Date(transactionDateValue).toISOString();
    
    if (paymentMethod === 'cash') {
        const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
        if (cashAmount < total) {
            showNotification('❌ Insufficient cash amount!', 'error');
            return;
        }
    }
    
    try {
        const transaction = {
            id: `TRX-${Date.now()}`,
            receiptNo: transactionCounter.toString().padStart(3, '0'),
            date: transactionDate,
            customer: customerName,
            customerAddress: customerAddress,
            shopName: shopName,
            items: [...cart],
            total: total,
            paymentMethod: paymentMethod,
            cashAmount: paymentMethod === 'cash' ? parseFloat(document.getElementById('cashAmount').value) : total,
            change: paymentMethod === 'cash' ? (parseFloat(document.getElementById('cashAmount').value) || 0) - total : 0
        };
        
        if (db) {
            await db.saveTransaction(transaction);
            for (const cartItem of cart) {
                const product = products.find(p => p.kode === cartItem.kode);
                if (product) {
                    const newStock = product.volume - cartItem.quantity;
                    await db.updateProductStock(cartItem.kode, newStock, 'sale', `Sold ${cartItem.quantity} units`);
                    product.volume = newStock;
                }
            }
        }
        
        currentDailyStats.totalSales += total;
        currentDailyStats.totalTransactions++;
        
        await generateReceipt(transaction);
        
        clearCart();
        closeModal('checkoutModal');
        transactionCounter++;
        updateTransactionId();
        updateStats();
        renderProducts(filteredProducts);
        await saveData();
        
        showNotification('✅ Transaction completed successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        showNotification('❌ Error processing transaction', 'error');
    }
}

// --- UNIFIED PRINT FUNCTION ---
function handlePrint(elementId) {
    const printSection = document.getElementById(elementId);
    if (!printSection) {
        console.error('Print Error: Element not found', elementId);
        return;
    }
    
    printSection.classList.add('printable');
    window.print();
    printSection.classList.remove('printable');
}

// Receipt functions
async function generateReceipt(transaction) {
    const addressHtml = transaction.customerAddress
        ? `<div>🏠 Address:</div><div class="font-medium">${transaction.customerAddress.replace(/\n/g, '<br>')}</div>`
        : '';
    
    let businessAddress = 'JL.Kota Tengah No. 33 Gorontalo'; // Fallback for non-db mode
    if (db) {
        businessAddress = await db.getSetting('businessAddress', 'JL.Kota Tengah No. 33 Gorontalo');
    }

    document.getElementById('receipt-content').innerHTML = `
        <div class="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <h2 class="text-xl font-bold text-gray-800">${transaction.shopName.toUpperCase()}</h2>
            <p class="text-xs text-gray-500">📍 ${businessAddress}</p>
        </div>
        <div class="mb-4 text-xs">
            <div class="grid grid-cols-2 gap-1">
                <div>📅 Date:</div><div class="font-mono">${new Date(transaction.date).toLocaleString('id-ID')}</div>
                <div>🧾 Receipt #:</div><div class="font-mono">#${transaction.receiptNo}</div>
                <div>👤 Customer:</div><div class="font-medium">${transaction.customer}</div>
                ${addressHtml}
            </div>
        </div>
        <table class="w-full text-xs">
            <thead><tr class="border-b border-gray-300"><th class="text-left py-2">Item</th><th class="text-center py-2">Qty</th><th class="text-right py-2">Total</th></tr></thead>
            <tbody>${transaction.items.map(item => `<tr><td class="py-1">${item.nama}</td><td class="text-center font-mono">${item.quantity}</td><td class="text-right font-mono">${formatCurrency(item.total, true)}</td></tr>`).join('')}</tbody>
        </table>
        <div class="border-t-2 border-dashed border-gray-400 pt-4 mt-4 space-y-2 text-sm">
            <div class="flex justify-between font-bold text-lg"><span>TOTAL:</span><span class="font-mono">${formatCurrency(transaction.total, true)}</span></div>
            ${transaction.paymentMethod === 'cash' ? `<div class="flex justify-between"><span>Cash:</span><span class="font-mono">${formatCurrency(transaction.cashAmount, true)}</span></div><div class="flex justify-between"><span>Change:</span><span class="font-mono">${formatCurrency(transaction.change, true)}</span></div>` : ''}
        </div>
        <div class="text-center mt-6 pt-4 border-t-2 border-dashed border-gray-400"><p class="text-sm font-bold">🙏 Thank you!</p></div>
    `;
    openModal('receiptModal');
}

// Transaction History
async function openHistoryModal() {
    document.getElementById('historyDate').value = new Date().toISOString().split('T')[0];
    await renderTransactionHistory();
    openModal('historyModal');
}

async function renderTransactionHistory() {
    const selectedDate = document.getElementById('historyDate').value;
    const historyContainer = document.getElementById('transactionHistory');
    
    try {
        let filteredHistory = [];
        if (db) {
            filteredHistory = selectedDate ? await db.getTransactionsByDate(selectedDate) : await db.getTransactions();
        }

        if (filteredHistory.length === 0) {
            historyContainer.innerHTML = `<div class="text-center py-8 text-gray-500"><div class="text-4xl mb-4">📋</div><p>No transactions found</p></div>`;
            return;
        }

        historyContainer.innerHTML = filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).map(transaction => `
            <div class="card p-4">
                <div class="flex flex-col md:flex-row justify-between items-start mb-3">
                    <div>
                        <h4 class="font-bold text-lg">Receipt #${transaction.receiptNo}</h4>
                        <p class="text-sm text-gray-600">${new Date(transaction.date).toLocaleString('id-ID')}</p>
                        <p class="text-sm text-gray-600">Customer: ${transaction.customer}</p>
                    </div>
                    <div class="text-left md:text-right mt-2 md:mt-0">
                        <div class="text-xl font-bold text-primary-600">${formatCurrency(transaction.total, true)}</div>
                        <div class="text-sm text-gray-600 capitalize">${transaction.paymentMethod === 'cash' ? '💵 Cash' : '🏦 Transfer'}</div>
                    </div>
                </div>
                <div class="border-t pt-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        ${transaction.items.map(item => `<div class="flex justify-between"><span>${item.nama} x${item.quantity}</span><span>${formatCurrency(item.total, true)}</span></div>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error loading transaction history:', error);
        historyContainer.innerHTML = `<div class="text-center py-8 text-red-500"><p>Error loading transactions</p></div>`;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[100] transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showDatabaseInfo() {
    if (db && db.db) {
        alert(`🗃️ Database Status: Connected
📊 Database: ${db.dbName} v${db.version}
💾 Storage: IndexedDB (Persistent Local Storage)
🔧 Features: Advanced queries, analytics, data export/import

Console Commands:
- dbManager.exportData() - Export all data
- dbManager.importData(jsonString) - Import data
- dbManager.getAnalytics() - View analytics`);
    } else {
        alert('❌ Database not available. Using fallback localStorage mode.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    stockFilter.addEventListener('change', filterProducts);
    document.getElementById('checkoutBtn').addEventListener('click', openCheckoutModal);
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
    dbInfoBtn.addEventListener('click', showDatabaseInfo);

    tryReconnectBtn.addEventListener('click', () => {
        tryReconnectBtn.textContent = 'Reloading...';
        tryReconnectBtn.disabled = true;
        location.reload();
    });

    continueInFallbackBtn.addEventListener('click', () => {
        dbErrorFullscreen.classList.add('hidden');
        mainContentGrid.classList.remove('hidden');
        showNotification('⚠️ Running in Fallback Mode. Data may not be saved.', 'error');
    });

    document.getElementById('confirmCheckout').addEventListener('click', processCheckout);
    document.getElementById('cashAmount').addEventListener('input', calculateChange);

    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('cashPayment').style.display = this.dataset.method === 'cash' ? 'block' : 'none';
        });
    });
    
    document.getElementById('historyDate').addEventListener('change', renderTransactionHistory);

    allModals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target.closest('.close-modal-btn') || e.target === modal) {
                 this.classList.add('hidden');
            }
        });
    });

    function setupDropdown(btn, dropdown) {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });
    }

    setupDropdown(toolsBtn, toolsDropdown);
    setupDropdown(invoiceBtn, invoiceDropdown);

    document.addEventListener('click', (e) => {
        if (toolsDropdown && !toolsBtn.parentElement.contains(e.target)) {
            toolsDropdown.classList.add('hidden');
        }
        if (invoiceDropdown && !invoiceBtn.parentElement.contains(e.target)) {
            invoiceDropdown.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            allModals.forEach(m => m.classList.add('hidden'));
            if (toolsDropdown) toolsDropdown.classList.add('hidden');
            if (invoiceDropdown) invoiceDropdown.classList.add('hidden');
        }
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'f') { e.preventDefault(); searchInput.focus(); }
            if (e.key === 'Enter' && cart.length > 0) { e.preventDefault(); openCheckoutModal(); }
        }
    });

    await initializeDatabase();
    renderProducts();
    renderCart();
    updateCartTotals();
    updateTime();
    updateTransactionId();
    updateStats();
    setInterval(updateTime, 1000);
    setInterval(saveData, 30000);
    
    if (!db) {
        showNotification('🌿 Welcome to Alata Craft POS System!', 'success');
    }
});

window.addEventListener('beforeunload', saveData);

window.dbManager = {
    async exportData() {
        if (!db) return;
        const data = await db.exportData();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        a.download = `alata-craft-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        console.log('✅ Data exported');
    },
    async importData(jsonString) {
        if (!db) return;
        if (await db.importData(jsonString)) {
            await loadData();
            renderProducts();
            updateStats();
            console.log('✅ Data imported');
        } else {
            console.error('❌ Import failed');
        }
    },
    async getAnalytics() {
        if (!db) return;
        const analytics = {
            topProducts: await db.getTopSellingProducts(5),
            salesReport: await db.getSalesReportByPeriod(
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date().toISOString().split('T')[0]
            )
        };
        console.log('📊 Analytics:', analytics);
        return analytics;
    }
};
