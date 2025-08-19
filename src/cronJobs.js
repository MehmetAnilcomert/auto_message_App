const cron = require('node-cron');
const MessageSender = require('./messageSender');
const { getBirthdayPeopleFromDB } = require('./services/birthdayService');

// Her gün saat 09:00
cron.schedule('0 9 * * *', async () => {
  console.log('🕘 Günlük doğum günü kontrolü başlatılıyor...');

  const status = await MessageSender.getWhatsAppStatus();
  if (!status.ready) {
    console.log('⚠️ WhatsApp hazır değil, mesaj gönderilemedi');
    return;
  }

  const birthdayPeople = await getBirthdayPeopleFromDB();

  if (birthdayPeople.length > 0) {
    console.log(`🎂 ${birthdayPeople.length} kişinin doğum günü bugün!`);
    const results = await MessageSender.sendBulkBirthdayMessages(birthdayPeople, { delay: 5000 });
    console.log('🎉 Doğum günü mesajları gönderildi!', results);
  } else {
    console.log('📅 Bugün doğum günü olan kimse yok.');
  }
});
