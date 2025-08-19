const express = require('express');
const cronJobs = require('./cronJobs');
const whatsappRoutes = require('./routes/whatsappRoutes');
const messageRoutes = require('./routes/messageRoutes');
const MessageSender = require('./messageSender');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/', whatsappRoutes);
app.use('/', messageRoutes);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Uygulama kapatılıyor...');
  await MessageSender.destroy();
  process.exit(0);
});

// Server başlat
app.listen(3000, () => {
  console.log('🚀 Server port 3000\'de çalışıyor');
});
