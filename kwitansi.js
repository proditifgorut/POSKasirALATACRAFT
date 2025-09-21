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

    // --- KWITANSI PAGE LOGIC ---
    const dateInput = document.getElementById('form-kwitansi-date');
    const noInput = document.getElementById('form-kwitansi-no');
    const amountInput = document.getElementById('form-kwitansi-amount');
    const templateSelector = document.getElementById('kwitansi-template-selector');
    const kwitansiWrapper = document.getElementById('kwitansi-wrapper');
    
    // Set default values
    dateInput.value = new Date().toISOString().split('T')[0];
    noInput.value = `KW/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`;

    // Template switcher logic
    templateSelector.addEventListener('change', (e) => {
        kwitansiWrapper.className = ''; // Clear existing template classes
        kwitansiWrapper.classList.add(e.target.value);
    });

    // Generate button logic
    document.getElementById('generateKwitansiBtn').addEventListener('click', () => {
        const kwitansiNo = document.getElementById('form-kwitansi-no').value;
        const customer = document.getElementById('form-kwitansi-customer').value || '-';
        const amount = parseFloat(amountInput.value) || 0;
        const desc = document.getElementById('form-kwitansi-desc').value || 'Pembayaran';
        const location = document.getElementById('form-kwitansi-location').value || 'Jakarta';
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
        document.getElementById('print-kwitansi-location').textContent = location;
        document.getElementById('print-kwitansi-date').textContent = formattedDate;
        
        handlePrint('kwitansi-printable-area');
    });
});
