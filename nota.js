document.addEventListener('DOMContentLoaded', () => {
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

    // --- NOTA PAGE LOGIC ---
    const itemsBody = document.getElementById('nota-items-body');
    const grandTotalEl = document.getElementById('grandTotal');
    const dateInput = document.getElementById('form-nota-date');
    const noInput = document.getElementById('form-nota-no');
    const templateSelector = document.getElementById('nota-template-selector');
    const notaWrapper = document.getElementById('nota-wrapper');

    // Set default values
    dateInput.value = new Date().toISOString().split('T')[0];
    noInput.value = `NT/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`;

    // Template switcher logic
    templateSelector.addEventListener('change', (e) => {
        notaWrapper.className = ''; // Clear existing template classes
        notaWrapper.classList.add(e.target.value);
    });

    const calculateTotals = () => {
        let grandTotal = 0;
        itemsBody.querySelectorAll('tr').forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const total = qty * price;
            row.querySelector('.item-total').textContent = formatCurrency(total, true);
            grandTotal += total;
        });
        grandTotalEl.textContent = formatCurrency(grandTotal, true);
    };

    const addRow = (focus = false) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-1"><input type="text" class="input-field item-name" placeholder="Nama barang"></td>
            <td class="p-1"><input type="number" class="input-field item-qty" value="1" min="1" style="width: 80px;"></td>
            <td class="p-1"><input type="number" class="input-field item-price" placeholder="0"></td>
            <td class="p-1 text-right item-total font-medium" style="width: 150px;">${formatCurrency(0, true)}</td>
            <td class="p-1 text-center"><button class="text-red-500 hover:text-red-700 remove-row-btn p-2 rounded-full hover:bg-red-100 transition-colors">✖</button></td>
        `;
        itemsBody.appendChild(row);

        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
            calculateTotals();
        });
        row.querySelectorAll('input').forEach(input => input.addEventListener('input', calculateTotals));
        
        if (focus) {
            row.querySelector('.item-name').focus();
        }
    };

    document.getElementById('addRowBtn').addEventListener('click', () => addRow(true));
    
    document.getElementById('generateNotaBtn').addEventListener('click', () => {
        // 1. Populate the printable area
        const companyName = document.getElementById('form-nota-company-name').value || 'Nama Toko';
        const companyAddress = document.getElementById('form-nota-company-address').value || 'Alamat Toko';
        const companyPhone = document.getElementById('form-nota-company-phone').value || 'Telepon';

        document.getElementById('print-nota-company-name').textContent = companyName;
        document.getElementById('print-nota-company-details').textContent = `${companyAddress} | Phone: ${companyPhone}`;
        
        document.getElementById('print-nota-customer').textContent = document.getElementById('form-nota-customer').value || '-';
        document.getElementById('print-nota-customer-sign').textContent = document.getElementById('form-nota-customer').value || ' ';
        document.getElementById('print-nota-no').textContent = noInput.value;
        const date = new Date(dateInput.value);
        document.getElementById('print-nota-date').textContent = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const printItemsBody = document.getElementById('print-nota-items-body');
        printItemsBody.innerHTML = '';
        let subtotal = 0;
        let itemIndex = 1;
        itemsBody.querySelectorAll('tr').forEach(row => {
            const name = row.querySelector('.item-name').value;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            if (name && qty > 0 && price > 0) {
                const total = qty * price;
                subtotal += total;
                const printRow = document.createElement('tr');
                printRow.innerHTML = `
                    <td class="col-no">${itemIndex++}</td>
                    <td class="col-item">${name}</td>
                    <td class="col-qty">${qty}</td>
                    <td class="col-price">${formatCurrency(price)}</td>
                    <td class="col-total">${formatCurrency(total)}</td>
                `;
                printItemsBody.appendChild(printRow);
            }
        });

        document.getElementById('print-nota-subtotal').textContent = formatCurrency(subtotal, true);
        document.getElementById('print-nota-total').textContent = formatCurrency(subtotal, true);

        // 2. Trigger print dialog
        handlePrint('nota-printable-area');
    });

    // Add initial row on page load
    addRow();
    calculateTotals();
});
