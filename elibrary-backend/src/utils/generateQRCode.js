// src/utils/generateQRCode.js
const QRCode = require('qrcode');

/**
 * Generate QR Code Base64 Data URL untuk identifikasi buku
 * @param {string|number} bookId 
 * @returns {Promise<string>} Base64 Image String
 */
const generateBookQR = async (bookId) => {
  try {
    // Payload unik yang akan dibaca oleh kamera scanner HP mahasiswa (Person C)
    const qrPayload = JSON.stringify({
      type: 'ELIB_BOOK',
      id: bookId
    });

    // Generate menjadi data URL gambar base64
    const qrCodeBase64 = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#1E1B2E',  // Menyesuaikan warna textPrimary kamu
        light: '#FFFFFF'
      }
    });

    return qrCodeBase64;
  } catch (err) {
    throw new Error('Gagal generate QR Code payload buku.');
  }
};

module.exports = { generateBookQR };