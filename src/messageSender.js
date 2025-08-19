const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const qrImage = require("qr-image");
const fs = require("fs");
const path = require("path");

class MessageSender {
  constructor() {
    // WhatsApp Web client ayarları
    this.whatsappClient = new Client({
      authStrategy: new LocalAuth({
        clientId: "birthday_bot",
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
        ],
      },
    });

    this.whatsappReady = false;
    this.qrCode = null;
    this.authStatus = "pending"; // pending, qr_generated, authenticating, ready, failed
    this.initializeWhatsApp();
  }

  async initializeWhatsApp() {
    // QR kod gösterimi
    this.whatsappClient.on("qr", (qr) => {
      this.qrCode = qr;
      this.authStatus = "qr_generated";

      console.log("📱 WhatsApp QR kodu oluşturuldu");
      qrcode.generate(qr, { small: true });

      // QR kodu dosyaya kaydet (web'de göstermek için)
      this.saveQRCodeImage(qr);
    });

    // WhatsApp hazır olduğunda
    this.whatsappClient.on("ready", () => {
      console.log("✅ WhatsApp Client hazır!");
      this.whatsappReady = true;
      this.authStatus = "ready";
      this.qrCode = null;
    });

    // Kimlik doğrulama
    this.whatsappClient.on("authenticated", () => {
      console.log("🔐 WhatsApp kimlik doğrulandı");
      this.authStatus = "authenticating";
    });

    // Bağlantı kesildiğinde
    this.whatsappClient.on("disconnected", (reason) => {
      console.log("❌ WhatsApp bağlantısı kesildi:", reason);
      this.whatsappReady = false;
      this.authStatus = "failed";
    });

    // Hata durumları
    this.whatsappClient.on("auth_failure", (message) => {
      console.error("🚫 WhatsApp kimlik doğrulama hatası:", message);
      this.authStatus = "failed";
    });

    try {
      await this.whatsappClient.initialize();
    } catch (error) {
      console.error("WhatsApp başlatma hatası:", error);
      this.authStatus = "failed";
    }
  }

  // QR kodunu resim olarak kaydet
  saveQRCodeImage(qrString) {
    try {
      const qrSvg = qrImage.image(qrString, { type: "png", size: 10 });
      const qrPath = path.join(__dirname, "public", "qr-code.png");

      // public klasörünü oluştur
      const publicDir = path.join(__dirname, "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      qrSvg.pipe(fs.createWriteStream(qrPath));
      console.log(`💾 QR kod resmi kaydedildi: ${qrPath}`);
    } catch (error) {
      console.error("QR kod resmi kaydedilemedi:", error);
    }
  }

  // WhatsApp hazır olmasını bekle
  async waitForWhatsApp(timeout = 30000) {
    const startTime = Date.now();

    while (!this.whatsappReady && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return this.whatsappReady;
  }

  // Telefon numarasını formatla
  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.toString().replace(/\D/g, "");

    if (formatted.startsWith("0")) {
      formatted = "90" + formatted.substring(1);
    }

    if (!formatted.startsWith("90")) {
      formatted = "90" + formatted;
    }

    return formatted;
  }

  // WhatsApp otomatik mesaj gönderme
  async sendDirectWhatsAppMessage(person) {
    if (!this.whatsappReady) {
      console.log("⏳ WhatsApp hazır değil, bekleniyor...");
      const isReady = await this.waitForWhatsApp();
      if (!isReady) {
        console.error("❌ WhatsApp 30 saniye içinde hazır olmadı");
        return { success: false, error: "WhatsApp not ready" };
      }
    }

    try {
      const phoneNumber = this.formatPhoneNumber(person.phone_number);
      const chatId = `${phoneNumber}@c.us`;

      console.log(`📱 WhatsApp mesajı gönderiliyor: ${phoneNumber}`);

      await this.whatsappClient.sendMessage(chatId, person.custom_message);

      console.log(
        `✅ WhatsApp mesajı başarıyla gönderildi: ${person.first_name} ${person.last_name}`
      );
      return { success: true, phoneNumber, message: person.custom_message };
    } catch (error) {
      console.error("❌ WhatsApp mesaj gönderme hatası:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Ana mesaj gönderme metodu
  async sendBirthdayMessage(person) {
    if (!person.phone_number) {
      console.error("❌ Bu kişi için telefon numarası mevcut değil.");
      return { success: false, error: "No phone number provided" };
    }

    return await this.sendDirectWhatsAppMessage(person);
  }

  // Toplu mesaj gönderme
  async sendBulkBirthdayMessages(people, options = {}) {
    const results = [];
    const { delay = 2000 } = options;

    for (let i = 0; i < people.length; i++) {
      const person = people[i];

      console.log(
        `\n📤 ${i + 1}/${people.length} - ${person.first_name} ${
          person.last_name
        }`
      );

      const result = await this.sendBirthdayMessage(person);
      results.push({
        person: person,
        result: result,
        timestamp: new Date().toISOString(),
      });

      // Son mesaj değilse bekle
      if (i < people.length - 1 && delay > 0) {
        console.log(`⏰ ${delay}ms bekleniyor...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const successCount = results.filter((r) => r.result.success).length;
    console.log(
      `\n📊 Toplam: ${people.length}, Başarılı: ${successCount}, Başarısız: ${
        people.length - successCount
      }`
    );

    return results;
  }

  // WhatsApp durumu ve QR kodu bilgisi
  async getWhatsAppStatus() {
    let clientState = null;
    try {
      clientState = this.whatsappClient
        ? await this.whatsappClient.getState()
        : null;
    } catch (err) {
      clientState = "NOT_READY";
    }

    return {
      ready: this.whatsappReady,
      authStatus: this.authStatus,
      qrCode: this.qrCode,
      qrCodeImagePath: this.qrCode ? "/qr-code.png" : null,
      clientState,
    };
  }

  // QR kodunu yenile (yeniden auth için)
  async refreshAuth() {
    try {
      this.authStatus = "pending";
      this.whatsappReady = false;
      this.qrCode = null;

      // Mevcut oturumu temizle
      await this.whatsappClient.logout();

      // Yeniden başlat
      setTimeout(() => {
        this.whatsappClient.initialize();
      }, 2000);

      return { success: true, message: "Auth refresh started" };
    } catch (error) {
      console.error("Auth yenileme hatası:", error);
      return { success: false, error: error.message };
    }
  }

  // Bağlantı durumunu kontrol et
  async checkConnection() {
    try {
      if (!this.whatsappReady) {
        return { connected: false, message: "WhatsApp not ready" };
      }

      // Test mesajı göndermeyi dene (kendi numarana)
      const info = await this.whatsappClient.getContactById("status@broadcast");
      return {
        connected: true,
        message: "WhatsApp connection is healthy",
        info: info,
      };
    } catch (error) {
      return {
        connected: false,
        message: "Connection test failed",
        error: error.message,
      };
    }
  }

  // Temizlik ve kapatma
  async destroy() {
    try {
      if (this.whatsappClient) {
        await this.whatsappClient.destroy();
        console.log("🧹 WhatsApp client kapatıldı");
      }
    } catch (error) {
      console.error("Client kapatma hatası:", error);
    }
  }
}

module.exports = new MessageSender();
