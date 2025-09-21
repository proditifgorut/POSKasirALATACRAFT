// --- SHARED UTILITY FUNCTIONS ---

/**
 * Formats a number as Indonesian Rupiah currency.
 * @param {number} amount The number to format.
 * @param {boolean} [includeRp=false] Whether to include the 'Rp' prefix.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(amount, includeRp = false) {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
    return includeRp ? formatted : formatted.replace('Rp', '').trim();
}

/**
 * Converts a number into Indonesian words (recursive part).
 * @param {number} n The number to convert.
 * @returns {string} The number in words.
 */
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

/**
 * Converts a number to Indonesian words with "rupiah" suffix.
 * @param {number} num The number to convert.
 * @returns {string} The full amount in words.
 */
function toWords(num) {
    if (num === 0) return "Nol rupiah";
    const result = terbilang(num).trim().replace(/\s\s+/g, ' ');
    return (result.charAt(0).toUpperCase() + result.slice(1)) + " rupiah";
}
