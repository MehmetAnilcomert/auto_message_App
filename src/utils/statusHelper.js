function getStatusText(status) {
  const statusTexts = {
    'pending': '⏳ Başlatılıyor...',
    'qr_generated': '📱 QR kodu oluşturuldu',
    'authenticating': '🔐 Kimlik doğrulanıyor...',
    'ready': '✅ Hazır!',
    'failed': '❌ Bağlantı başarısız'
  };
  return statusTexts[status] || status;
}

module.exports = { getStatusText };
