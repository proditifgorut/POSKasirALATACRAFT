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
        
        // Set default values
        dateInput.value = new Date().toISOString().split('T')[0];
        noInput.value = `KW/${new Date().getFullYear()}/${Date.now() % 10000}`;

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
});
