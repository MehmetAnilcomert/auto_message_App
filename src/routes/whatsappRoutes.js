// routes/whatsappRoutes.js
const express = require('express');
const router = express.Router();
const MessageSender = require('../messageSender');
const path = require('path');

// Görünümler
router.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'qr.html'));
});

router.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

// API Endpoints
router.get('/whatsapp-status', async (req, res) => {
  try {
    const status = await MessageSender.getWhatsAppStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Durum alınamadı',
      details: error.message,
      authStatus: 'failed'
    });
  }
});

router.post('/refresh-auth', async (req, res) => {
  try {
    const result = await MessageSender.refreshAuth();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Yenileme başarısız',
      details: error.message
    });
  }
});

router.get('/connection-test', async (req, res) => {
  try {
    const result = await MessageSender.checkConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Bağlantı testi başarısız',
      details: error.message
    });
  }
});

module.exports = router;
