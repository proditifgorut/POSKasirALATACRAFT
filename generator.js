document.addEventListener('DOMContentLoaded', () => {

    // --- SHARED UTILITY FUNCTIONS ---
    function formatCurrency(amount, includeRp = false) {
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
        return includeRp ? formatted : formatted.replace('Rp', '').trim();
    }

    function terbilang(n) {
        if (n === null || n === undefined) return "";
        n = Math.abs(Math.floor(n));
        const bilangan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
        let temp = "";
        if (n < 12) {
            temp = " " + bilangan[n];
        } else if (n < 20) {
            temp = terbilang(n - 10) + " belas";
        } else if (n < 100) {
            temp = terbilang(Math.floor(n / 10)) + " puluh" + terbilang(n % 10);
        } else if (n < 200) {
            temp = " seratus" + terbilang(n - 100);
        } else if (n < 1000) {
            temp = terbilang(Math.floor(n / 100)) + " ratus" + terbilang(n % 100);
        } else if (n < 2000) {
            temp = " seribu" + terbilang(n - 1000);
        } else if (n < 1000000) {
            temp = terbilang(Math.floor(n / 1000)) + " ribu" + terbilang(n % 1000);
        } else if (n < 1000000000) {
            temp = terbilang(Math.floor(n / 1000000)) + " juta" + terbilang(n % 1000000);
        } else if (n < 1000000000000) {
            temp = terbilang(Math.floor(n / 1000000000)) + " milyar" + terbilang(n % 1000000000);
        } else if (n < 1000000000000000) {
            temp = terbilang(Math.floor(n / 1000000000000)) + " trilyun" + terbilang(n % 1000000000000);
        }
        return temp;
    }

    function toWords(num) {
        if (num === 0) return "Nol rupiah";
        const result = terbilang(num).trim().replace(/\s\s+/g, ' ');
        return (result.charAt(0).toUpperCase() + result.slice(1)) + " rupiah";
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

    // --- KWITANSI PAGE LOGIC ---
    if (document.getElementById('kwitansi-form')) {
        const dateInput = document.getElementById('form-kwitansi-date');
        const noInput = document.getElementById('form-kwitansi-no');
        const amountInput = document.getElementById('form-kwitansi-amount');
        const terbilangDisplay = document.getElementById('form-kwitansi-terbilang');
        
        // Set default values
        dateInput.value = new Date().toISOString().split('T')[0];
        noInput.value = `KW/${new Date().getFullYear()}/${Date.now() % 10000}`;

        amountInput.addEventListener('input', () => {
            const amount = parseFloat(amountInput.value) || 0;
            terbilangDisplay.textContent = toWords(amount);
        });
        // Initial call
        terbilangDisplay.textContent = toWords(0);


        document.getElementById('generateKwitansiBtn').addEventListener('click', () => {
            const kwitansiNo = document.getElementById('form-kwitansi-no').value;
            const customer = document.getElementById('form-kwitansi-customer').value || '-';
            const amount = parseFloat(amountInput.value) || 0;
            const desc = document.getElementById('form-kwitansi-desc').value || 'Pembayaran';
            const date = new Date(dateInput.value);
            const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const amountInWords = toWords(amount);
            const formattedAmount = formatCurrency(amount);

            // Populate stub
            document.getElementById('print-kwitansi-no-stub').textContent = kwitansiNo;
            document.getElementById('print-kwitansi-total-stub').textContent = formattedAmount;

            // Populate main area
            document.getElementById('print-kwitansi-no-main').textContent = kwitansiNo;
            document.getElementById('print-kwitansi-customer').textContent = customer;
            document.getElementById('print-kwitansi-terbilang').textContent = amountInWords;
            document.getElementById('print-kwitansi-desc').textContent = desc;
            document.getElementById('print-kwitansi-total').textContent = formattedAmount;
            document.getElementById('print-kwitansi-date').textContent = formattedDate;
            
            handlePrint('kwitansi-printable-area');
        });
    }

    // --- NOTA PAGE LOGIC ---
    if (document.getElementById('nota-form')) {
        const itemsBody = document.getElementById('nota-items-body');
        const grandTotalEl = document.getElementById('grandTotal');
        const dateInput = document.getElementById('form-nota-date');
        const noInput = document.getElementById('form-nota-no');

        // Set default values
        dateInput.value = new Date().toISOString().split('T')[0];
        noInput.value = `NT/${new Date().getFullYear()}/${Date.now() % 10000}`;

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
                <td class="p-1"><input type="number" class="input-field item-qty" value="1" min="1"></td>
                <td class="p-1"><input type="number" class="input-field item-price" placeholder="0"></td>
                <td class="p-1 text-right item-total font-medium">${formatCurrency(0, true)}</td>
                <td class="p-1 text-center"><button class="text-red-500 hover:text-red-700 remove-row-btn p-2">✖</button></td>
            `;
            itemsBody.appendChild(row);

            // Add event listeners for the new row
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
                    printRow.className = 'border-b';
                    printRow.innerHTML = `
                        <td class="p-3">${itemIndex++}</td>
                        <td class="p-3">${name}</td>
                        <td class="p-3 text-center">${qty}</td>
                        <td class="p-3 text-right">${formatCurrency(price, true)}</td>
                        <td class="p-3 text-right">${formatCurrency(total, true)}</td>
                    `;
                    printItemsBody.appendChild(printRow);
                }
            });

            document.getElementById('print-nota-subtotal').textContent = formatCurrency(subtotal, true);
            document.getElementById('print-nota-total').textContent = formatCurrency(subtotal, true);

            // 2. Trigger robust print dialog
            handlePrint('nota-printable-area');
        });

        // Add initial row on page load
        addRow();
    }
});
