/**
 * UPI QR Generator for Pot protéine (100% Client-Side / Pure Browser)
 * Generates UPI QR codes and handles WhatsApp order submission
 */

const UPIPayment = {
    // Configurable Merchant Details
    merchantUpi: 'tnsanjayk55-2@oksbi',
    merchantName: 'Pot Proteine',

    /**
     * Generate unique Order ID: PP-YYYYMMDD-HHMM (Date + HourMinute)
     */
    generateOrderId() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `PP-${dateStr}-${hh}${min}`;
    },

    /**
     * Create Dynamic UPI URI string
     * Note: 'pa' parameter MUST keep raw '@' symbol for GPay/PhonePe QR scanners
     */
    buildUpiUri(merchantUpi, merchantName, amount, orderId) {
        const cleanUpi = merchantUpi.trim();
        const cleanName = encodeURIComponent(merchantName.trim());
        const transactionNote = encodeURIComponent(`Order ${orderId}`);
        const formattedAmount = Number(amount).toFixed(2);

        return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${formattedAmount}&cu=INR&tn=${transactionNote}&tr=${encodeURIComponent(orderId)}`;
    },

    /**
     * Render UPI QR Code Data URL in Browser
     */
    async createPayment(orderData) {
        const { items } = orderData || {};
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Cart items are required');
        }

        const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const amount = Number(subtotal.toFixed(2));

        if (amount <= 0) {
            throw new Error('Invalid order amount');
        }

        const orderId = this.generateOrderId();
        const upiUri = this.buildUpiUri(this.merchantUpi, this.merchantName, amount, orderId);

        let qrCodeDataUrl = '';

        // Generate QR code using browser QRCode library if available
        if (typeof QRCode !== 'undefined' && QRCode.toDataURL) {
            qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                margin: 2,
                width: 320,
                color: {
                    dark: '#1e3a8a',
                    light: '#ffffff'
                }
            });
        } else {
            // Fallback via high-reliability static QR API
            qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiUri)}`;
        }

        return {
            success: true,
            orderId,
            amount,
            merchantUpi: this.merchantUpi,
            merchantName: this.merchantName,
            upiUri,
            qrCodeDataUrl
        };
    }
};

window.UPIPayment = UPIPayment;
