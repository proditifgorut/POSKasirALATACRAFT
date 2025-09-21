document.addEventListener('DOMContentLoaded', () => {
    // --- UNIFIED PRINT FUNCTION ---
    function handlePrint(elementId) {
        const printSection = document.getElementById(elementId);
        if (!printSection) {
            console.error('Print Error: Element not found', elementId);
            return;
        }
        
        document.body.classList.add('printing-shipping-label');
        printSection.classList.add('printable');
        
        window.print();
        
        printSection.classList.remove('printable');
        document.body.classList.remove('printing-shipping-label');
    }

    // --- DOM ELEMENTS ---
    const form = document.getElementById('shipping-label-form');
    const itemsBody = document.getElementById('label-items-body');
    const addLabelItemBtn = document.getElementById('addLabelItemBtn');
    const generateLabelBtn = document.getElementById('generateLabelBtn');
    const shippingCostInput = document.getElementById('form-label-shipping-cost');

    // Total display elements in the form
    const formGoodsTotalEl = document.getElementById('form-goods-total');
    const formShippingTotalEl = document.getElementById('form-shipping-total');
    const formOverallTotalEl = document.getElementById('form-overall-total');

    // --- DEFAULT VALUES ---
    const today = new Date();
    document.getElementById('form-label-order-id').value = `AC-${Date.now()}`;
    document.getElementById('form-label-order-date').value = today.toISOString().split('T')[0];

    // --- TOTALS CALCULATION ---
    const updateFormTotals = () => {
        let goodsTotal = 0;
        itemsBody.querySelectorAll('.flex.gap-2').forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            goodsTotal += qty * price;
        });

        const shippingCost = parseFloat(shippingCostInput.value) || 0;
        const overallTotal = goodsTotal + shippingCost;

        formGoodsTotalEl.textContent = formatCurrency(goodsTotal, true);
        formShippingTotalEl.textContent = formatCurrency(shippingCost, true);
        formOverallTotalEl.textContent = formatCurrency(overallTotal, true);
    };

    // --- ITEM ROW MANAGEMENT ---
    const addItemRow = () => {
        const row = document.createElement('div');
        row.className = 'flex gap-2 items-center';
        row.innerHTML = `
            <input type="text" class="input-field item-name flex-grow" placeholder="Product Name">
            <input type="number" class="input-field item-qty w-20" value="1" min="1" placeholder="Qty">
            <input type="number" class="input-field item-price w-32" value="0" min="0" placeholder="Price/item">
            <button class="text-red-500 hover:text-red-700 remove-row-btn p-2 rounded-full hover:bg-red-100 transition-colors">✖</button>
        `;
        itemsBody.appendChild(row);

        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
            updateFormTotals(); // Update totals when row is removed
        });

        // Add event listeners to new inputs
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateFormTotals);
        });

        updateFormTotals(); // Update totals when new row is added
    };

    addLabelItemBtn.addEventListener('click', addItemRow);
    // Add one initial item row
    addItemRow();

    // --- DATA POPULATION & PRINTING ---
    const populateAndPrint = () => {
        // Calculate totals
        let goodsTotal = 0;
        const itemsData = [];
        itemsBody.querySelectorAll('.flex.gap-2').forEach(row => {
            const name = row.querySelector('.item-name').value;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            if (name && qty > 0) {
                goodsTotal += qty * price;
                itemsData.push({ name, qty });
            }
        });

        const shippingCost = parseFloat(document.getElementById('form-label-shipping-cost').value) || 0;
        const totalPayment = goodsTotal + shippingCost;

        // Populate Preview
        document.getElementById('print-label-courier-logo').textContent = document.getElementById('form-label-courier').value;
        document.getElementById('print-label-service-type').textContent = document.getElementById('form-label-service').value;
        document.getElementById('print-label-awb').textContent = document.getElementById('form-label-awb').value;
        document.getElementById('print-label-order-id').textContent = document.getElementById('form-label-order-id').value;
        const orderDate = new Date(document.getElementById('form-label-order-date').value);
        document.getElementById('print-label-order-date').textContent = orderDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

        document.getElementById('print-label-total-payment').textContent = formatCurrency(totalPayment, true);
        document.getElementById('print-label-goods-total').textContent = formatCurrency(goodsTotal, true);

        document.getElementById('print-label-to-name').textContent = document.getElementById('form-label-to-name').value;
        document.getElementById('print-label-to-phone').textContent = document.getElementById('form-label-to-phone').value;
        document.getElementById('print-label-to-address').textContent = document.getElementById('form-label-to-address').value;
        
        document.getElementById('print-label-from-name').textContent = document.getElementById('form-label-from-name').value;
        document.getElementById('print-label-from-phone').textContent = document.getElementById('form-label-from-phone').value;

        const printItemsList = document.getElementById('print-label-items');
        printItemsList.innerHTML = '';
        itemsData.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} (x${item.qty})`;
            printItemsList.appendChild(li);
        });

        document.getElementById('print-label-notes').textContent = document.getElementById('form-label-notes').value || 'Tidak ada';

        // Trigger Print
        handlePrint('shipping-label-printable-area');
    };

    generateLabelBtn.addEventListener('click', populateAndPrint);

    // --- INITIAL & GLOBAL EVENT LISTENERS ---
    shippingCostInput.addEventListener('input', updateFormTotals);
    updateFormTotals(); // Initial calculation on page load
});
