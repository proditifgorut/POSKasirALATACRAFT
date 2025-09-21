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

    // --- RENTAL RECEIPT PAGE LOGIC ---
    const printReceiptBtn = document.getElementById('printReceiptBtn');
    const noInput = document.getElementById('form-rental-no');
    const dateInput = document.getElementById('form-rental-date');
    const amountInput = document.getElementById('form-rental-amount');
    const imageInput = document.getElementById('form-rental-image');
    const printImage = document.getElementById('print-rental-car-image');
    const defaultImageUrl = printImage.src;

    // Set default values
    const today = new Date();
    noInput.value = `OT/${today.getFullYear()}/${String(Date.now()).slice(-6)}`;
    dateInput.value = today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Function to populate data into the preview
    const populatePreview = () => {
        const amount = parseFloat(amountInput.value) || 0;
        const amountInWords = toWords(amount);
        const formattedNumericAmount = formatCurrency(amount, true);

        // Populate main area
        document.getElementById('print-rental-no').textContent = noInput.value;
        document.getElementById('print-rental-customer').textContent = document.getElementById('form-rental-customer').value || '-';
        
        const amountEl = document.getElementById('print-rental-amount');
        amountEl.innerHTML = `<span>${amountInWords}</span><span class="font-bold ml-2">(${formattedNumericAmount})</span>`;

        document.getElementById('print-rental-for').textContent = document.getElementById('form-rental-for').value || '-';
        document.getElementById('print-rental-date').textContent = dateInput.value || '-';
        document.getElementById('print-rental-plate').textContent = document.getElementById('form-rental-plate').value || '-';
        
        // Handle image upload
        const imageFile = imageInput.files[0];
        if (imageFile) {
            printImage.src = URL.createObjectURL(imageFile);
        } else {
            printImage.src = defaultImageUrl; // Reset to default if no file is chosen
        }
    };

    // Update preview whenever a form field changes
    document.getElementById('rental-form').addEventListener('input', populatePreview);

    // Print Receipt button logic
    printReceiptBtn.addEventListener('click', () => {
        populatePreview(); // Ensure preview is up-to-date before printing
        handlePrint('rental-printable-area');
    });

    // Populate the preview on initial page load
    populatePreview();
});
