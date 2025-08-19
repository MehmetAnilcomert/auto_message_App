const express = require('express');
const router = express.Router();
const MessageSender = require('../messageSender');
const path = require('path');

// Routes
router.get('/qr', async (req, res) => {
  const status = await MessageSender.getWhatsAppStatus();
  const filePath = path.join(__dirname, '..', 'views', 'qr.html');
  res.sendFile(filePath);
});

router.get('/admin', async (req, res) => {
  const status = await MessageSender.getWhatsAppStatus();
  const filePath = path.join(__dirname, '..', 'views', 'admin.html');
  res.sendFile(filePath);
});

// API Endpoints
router.get('/whatsapp-status', async (req, res) => {
  const status = await MessageSender.getWhatsAppStatus();
  res.json(status);
});

router.post('/refresh-auth', async (req, res) => {
  const result = await MessageSender.refreshAuth();
  res.json(result);
});

router.get('/connection-test', async (req, res) => {
  const result = await MessageSender.checkConnection();
  res.json(result);
});

module.exports = router;
