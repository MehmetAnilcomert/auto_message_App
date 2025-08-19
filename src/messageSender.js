// messageSender.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrImage = require('qr-image');
const fs = require('fs');
const path = require('path');

class MessageSender {
  constructor() {
    this.whatsappClient = new Client({
      authStrategy: new LocalAuth({ clientId: 'birthday_bot' }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.whatsappReady = false;
    this.qrCode = null;
    this.authStatus = 'pending'; // pending, qr_generated, authenticating, ready, failed
    this.initializeWhatsApp();
  }

  async initializeWhatsApp() {
    this.whatsappClient.on('qr', (qr) => {
      this.qrCode = qr;
      this.authStatus = 'qr_generated';

      // Terminal için kısa ASCII QR (gerekirse small:false yap)
      try {
        qrcode.generate(qr, { small: true });
      } catch (e) {
        // ignore
      }

      // Dosyaya kaydet
      this.saveQRCodeImage(qr).catch((err) => {
        console.error('QR kaydetme hatası:', err);
      });
    });

    this.whatsappClient.on('ready', () => {
      this.whatsappReady = true;
      this.authStatus = 'ready';
      this.qrCode = null;
      console.log('✅ WhatsApp Client hazır!');
    });

    this.whatsappClient.on('authenticated', () => {
      this.authStatus = 'authenticating';
    });

    this.whatsappClient.on('disconnected', (reason) => {
      this.whatsappReady = false;
      this.authStatus = 'failed';
      console.log('❌ WhatsApp bağlantısı kesildi:', reason);
    });

    this.whatsappClient.on('auth_failure', (message) => {
      this.authStatus = 'failed';
      console.error('🚫 WhatsApp auth_failure:', message);
    });

    try {
      await this.whatsappClient.initialize();
    } catch (error) {
      this.authStatus = 'failed';
      console.error('WhatsApp başlatma hatası:', error);
    }
  }

  // QR kodunu dosyaya kaydet (write tamamlanmasını garanti eder)
  async saveQRCodeImage(qrString) {
    const publicDir = path.join(__dirname, 'public');
    const qrPath = path.join(publicDir, 'qr-code.png');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      try {
        const qrPng = qrImage.image(qrString, { type: 'png', size: 10 });
        const writeStream = fs.createWriteStream(qrPath);
        qrPng.pipe(writeStream);

        writeStream.on('finish', () => {
          // (İstersen burada kısa bir log bırak)
          // console.log('💾 QR kod kaydedildi:', qrPath);
          resolve(qrPath);
        });

        writeStream.on('error', (err) => reject(err));
        qrPng.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  async waitForWhatsApp(timeout = 30000) {
    const startTime = Date.now();
    while (!this.whatsappReady && Date.now() - startTime < timeout) {
      await new Promise((r) => setTimeout(r, 1000));
    }
    return this.whatsappReady;
  }

  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.toString().replace(/\D/g, '');
    if (formatted.startsWith('0')) formatted = '90' + formatted.substring(1);
    if (!formatted.startsWith('90')) formatted = '90' + formatted;
    return formatted;
  }

  async sendDirectWhatsAppMessage(person) {
    if (!this.whatsappReady) {
      const isReady = await this.waitForWhatsApp();
      if (!isReady) {
        return { success: false, error: 'WhatsApp not ready' };
      }
    }

    try {
      const phoneNumber = this.formatPhoneNumber(person.phone_number);
      const chatId = `${phoneNumber}@c.us`;
      await this.whatsappClient.sendMessage(chatId, person.custom_message);
      return { success: true, phoneNumber, message: person.custom_message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendBirthdayMessage(person) {
    if (!person.phone_number) {
      return { success: false, error: 'No phone number provided' };
    }
    return await this.sendDirectWhatsAppMessage(person);
  }

  async sendBulkBirthdayMessages(people, options = {}) {
    const results = [];
    const { delay = 2000 } = options;
    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      const result = await this.sendBirthdayMessage(person);
      results.push({ person, result, timestamp: new Date().toISOString() });
      if (i < people.length - 1 && delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return results;
  }

  async getWhatsAppStatus() {
    let clientState = null;
    try {
      clientState = this.whatsappClient ? await this.whatsappClient.getState() : null;
    } catch (err) {
      clientState = 'NOT_READY';
    }

    return {
      ready: this.whatsappReady,
      authStatus: this.authStatus,
      qrCode: this.qrCode,
      qrCodeImagePath: this.qrCode ? '/qr-code.png' : null,
      clientState
    };
  }

  async refreshAuth() {
    try {
      this.authStatus = 'pending';
      this.whatsappReady = false;
      this.qrCode = null;
      await this.whatsappClient.logout();
      setTimeout(() => this.whatsappClient.initialize(), 2000);
      return { success: true, message: 'Auth refresh started' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkConnection() {
    try {
      if (!this.whatsappReady) return { connected: false, message: 'WhatsApp not ready' };
      const info = await this.whatsappClient.getContactById('status@broadcast');
      return { connected: true, message: 'WhatsApp connection is healthy', info };
    } catch (error) {
      return { connected: false, message: 'Connection test failed', error: error.message };
    }
  }

  async destroy() {
    try {
      if (this.whatsappClient) {
        await this.whatsappClient.destroy();
      }
    } catch (error) {
      // ignore
    }
  }
}

module.exports = new MessageSender();
