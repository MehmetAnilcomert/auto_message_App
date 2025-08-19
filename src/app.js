// src/app.js
const express = require('express');
const path = require('path');

const whatsappRoutes = require('./routes/whatsappRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(express.json());

// Statik dosyalar (public) — rotalardan önce
app.use(express.static(path.join(__dirname, 'public')));

// Rotalar
app.use('/', whatsappRoutes);
app.use('/', messageRoutes);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Uygulama kapatılıyor...');
  try {
    const MessageSender = require('./messageSender');
    if (MessageSender && typeof MessageSender.destroy === 'function') {
      await MessageSender.destroy();
    }
  } catch (e) {
    // ignore
  }
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
