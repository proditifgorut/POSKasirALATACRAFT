document.addEventListener('DOMContentLoaded', async () => {
    // --- DATABASE & GLOBAL VARIABLES ---
    let db;
    let allProducts = [];
    let allCategories = [];
    
    // --- DOM ELEMENTS ---
    const productsTableBody = document.getElementById('productsTableBody');
    const addNewProductBtn = document.getElementById('addNewProductBtn');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const productModalTitle = document.getElementById('productModalTitle');
    const productKodeInput = document.getElementById('productKode');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const catalogSearchInput = document.getElementById('catalogSearchInput');
    const catalogCategoryFilter = document.getElementById('catalogCategoryFilter');
    const productKategoriSelect = document.getElementById('productKategori');

    // --- UTILITY FUNCTIONS ---
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    const openModal = (modalEl) => modalEl.classList.remove('hidden');
    const closeModal = (modalEl) => modalEl.classList.add('hidden');
    
    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[100] transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // --- INITIALIZATION ---
    async function initializeCatalog() {
        try {
            db = window.alataCraftDB;
            await db.init();
            await loadData();
            renderProducts();
            setupEventListeners();
        } catch (error) {
            console.error("Catalog initialization failed:", error);
            showNotification("Failed to load product catalog.", "error");
        }
    }

    async function loadData() {
        allProducts = await db.getProducts();
        allCategories = await db.getCategories();
        populateCategoryFilters();
    }

    function populateCategoryFilters() {
        // For main filter
        catalogCategoryFilter.innerHTML = '<option value="">All Categories</option>';
        allCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            catalogCategoryFilter.appendChild(option);
        });

        // For modal form
        productKategoriSelect.innerHTML = '';
        allCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            productKategoriSelect.appendChild(option);
        });
    }

    // --- RENDERING ---
    function renderProducts() {
        productsTableBody.innerHTML = '';
        const searchTerm = catalogSearchInput.value.toLowerCase();
        const category = catalogCategoryFilter.value;

        const filteredProducts = allProducts.filter(p => {
            const matchesSearch = p.nama.toLowerCase().includes(searchTerm) || p.kode.toLowerCase().includes(searchTerm);
            const matchesCategory = category === '' || p.kategori === category;
            return matchesSearch && matchesCategory;
        });

        if (filteredProducts.length === 0) {
            productsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-gray-500">No products found.</td></tr>`;
            return;
        }

        filteredProducts.forEach(product => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900">${product.kode}</td>
                <td class="px-6 py-4">${product.nama}</td>
                <td class="px-6 py-4">${product.kategori}</td>
                <td class="px-6 py-4 text-center">${product.volume}</td>
                <td class="px-6 py-4 text-right">${formatCurrency(product.harga)}</td>
                <td class="px-6 py-4 text-center">
                    <button class="font-medium text-primary-600 hover:underline mr-4 edit-btn" data-kode="${product.kode}">Edit</button>
                    <button class="font-medium text-red-600 hover:underline delete-btn" data-kode="${product.kode}">Delete</button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });
    }

    // --- CRUD OPERATIONS ---
    function handleFormSubmit(event) {
        event.preventDefault();
        const isEditing = !!productKodeInput.readOnly;
        
        const productData = {
            kode: productKodeInput.value.trim(),
            nama: document.getElementById('productNama').value.trim(),
            kategori: document.getElementById('productKategori').value,
            satuan: document.getElementById('productSatuan').value.trim(),
            volume: parseInt(document.getElementById('productVolume').value, 10),
            harga: parseFloat(document.getElementById('productHarga').value)
        };

        // --- FIX: Add validation for unique product code on creation ---
        if (!isEditing) {
            const codeExists = allProducts.some(p => p.kode.toLowerCase() === productData.kode.toLowerCase());
            if (codeExists) {
                showNotification(`Product code "${productData.kode}" already exists. Please use a unique code.`, "error");
                return;
            }
        }

        if (!productData.kode || !productData.nama || !productData.kategori || !productData.satuan) {
            showNotification("Please fill all required fields.", "error");
            return;
        }

        saveProduct(productData, isEditing);
    }

    async function saveProduct(productData, isEditing) {
        try {
            await db.saveProduct(productData);
            await loadData();
            renderProducts();
            closeModal(productModal);
            showNotification(`Product ${isEditing ? 'updated' : 'saved'} successfully!`);
        } catch (error) {
            console.error("Save product error:", error);
            showNotification("Error saving product.", "error");
        }
    }

    function openProductForm(product = null) {
        productForm.reset();
        if (product) {
            // Edit mode
            productModalTitle.textContent = 'Edit Product';
            productKodeInput.value = product.kode;
            productKodeInput.readOnly = true; // Prevent changing primary key
            productKodeInput.classList.add('bg-gray-100', 'cursor-not-allowed');

            document.getElementById('productNama').value = product.nama;
            document.getElementById('productKategori').value = product.kategori;
            document.getElementById('productSatuan').value = product.satuan;
            document.getElementById('productVolume').value = product.volume;
            document.getElementById('productHarga').value = product.harga;
        } else {
            // Create mode
            productModalTitle.textContent = 'Add New Product';
            productKodeInput.readOnly = false;
            productKodeInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
        }
        openModal(productModal);
    }

    function confirmDeletion(kode) {
        openModal(deleteConfirmModal);
        confirmDeleteBtn.dataset.kode = kode;
    }

    async function executeDelete() {
        const kode = confirmDeleteBtn.dataset.kode;
        try {
            await db.deleteProduct(kode);
            await loadData();
            renderProducts();
            closeModal(deleteConfirmModal);
            showNotification("Product deleted successfully.");
        } catch (error) {
            console.error("Delete product error:", error);
            showNotification("Error deleting product.", "error");
        }
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        addNewProductBtn.addEventListener('click', () => openProductForm());
        productForm.addEventListener('submit', handleFormSubmit);
        
        // Use event delegation for table buttons
        productsTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const kode = e.target.dataset.kode;
                const product = allProducts.find(p => p.kode === kode);
                if (product) openProductForm(product);
            }
            if (e.target.classList.contains('delete-btn')) {
                const kode = e.target.dataset.kode;
                confirmDeletion(kode);
            }
        });

        confirmDeleteBtn.addEventListener('click', executeDelete);
        cancelDeleteBtn.addEventListener('click', () => closeModal(deleteConfirmModal));
        
        catalogSearchInput.addEventListener('input', renderProducts);
        catalogCategoryFilter.addEventListener('change', renderProducts);

        // Close modals
        [productModal, deleteConfirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
            modal.querySelector('.close-modal-btn')?.addEventListener('click', () => closeModal(modal));
        });
    }

    // --- START THE APP ---
    initializeCatalog();
});
