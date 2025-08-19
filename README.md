# WhatsApp Otomatik Mesaj Sistemi

<div align="center">

![WhatsApp Bot](https://img.shields.io/badge/WhatsApp-Bot-green?style=for-the-badge&logo=whatsapp)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-Framework-lightgrey?style=for-the-badge&logo=express)
![Web Version](https://img.shields.io/badge/Web-Interface-blue?style=for-the-badge&logo=google-chrome)

**Doğum günü kutlamalarını ve toplu mesajları otomatikleştiren akıllı WhatsApp çözümü**

[Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Kullanım](#-kullanım) • [Ekran Görüntüleri](#-ekran-görüntüleri)

</div>

## 🚀 Özellikler

- **🤖 Otomatik Mesajlaşma**: Doğum günü mesajlarını otomatik gönderin
- **📊 Toplu Mesaj**: Aynı anda birden çok kişiye mesaj gönderin
- **🎨 Modern Arayüz**: Kullanıcı dostu web arayüzü
- **🔒 Güvenli Bağlantı**: Yerel kimlik doğrulama ile güvenli oturum yönetimi
- **📱 QR Kod Desteği**: WhatsApp Web bağlantısı için kolay QR kod erişimi
- **⚡ Gerçek Zamanlı Durum**: Bağlantı durumunu anlık takip edin

## 📦 Kurulum

### Gereksinimler
- Node.js 16.0 veya üzeri
- npm veya yarn
- WhatsApp hesabı

### Adım Adım Kurulum

1. **Depoyu klonlayın**:
```bash
git clone https://github.com/sizin-kullanici-adiniz/whatsapp-auto-message.git
cd whatsapp-auto-message
Bağımlılıkları yükleyin:
```

```bash
npm install
Ortam değişkenlerini ayarlayın (isteğe bağlı):
```
```bash
cp .env.example .env
# .env dosyasını düzenleyin
Uygulamayı başlatın:
```
```bash
npm start
Tarayıcınızda açın:

text
http://localhost:3000
```

🎯 Kullanım
QR Kod ile Bağlanma
Ana sayfada yer alan "QR Kod Göster" butonuna tıklayın

WhatsApp uygulamanızı açın ve "Bağlı Cihazlar" bölümüne girin

QR kodu tarayarak bağlantıyı kurun

Bağlantı başarılı olduğunda yeşil onay işareti göreceksiniz

Mesaj Gönderme
Tekli Mesaj:

Yönetim panelinde kişi seçin

Özelleştirilmiş mesaj yazın

"Gönder" butonuna tıklayın

Toplu Mesaj:

CSV veya Excel dosyası yükleyin

Mesaj şablonu oluşturun

Zamanlama ayarlarını yapılandırın

"Toplu Gönder" i başlatın

Yönetim Paneli
Dashboard: Sistem durumu ve istatistikler

Kişi Yönetimi: Rehber ve grupları yönetme

Mesaj Geçmişi: Gönderilen mesajların kaydı

Ayarlar: Sistem yapılandırmaları

📸 Ekran Görüntüleri
Ana Sayfa ve QR Kod Ekranı
https://via.placeholder.com/800x400/3D3D3D/FFFFFF?text=Ana+Sayfa+ve+QR+Kod+Aray%C3%BCz%C3%BC
Modern ve kullanıcı dostu ana arayüz

Yönetim Paneli
https://via.placeholder.com/800x400/2D2D2D/FFFFFF?text=Mesaj+Y%C3%B6netim+Paneli
Kapsamlı mesaj yönetim ve izleme paneli

Başarılı Bağlantı
https://via.placeholder.com/400x200/1E5128/FFFFFF?text=Ba%C4%9Flant%C4%B1+Ba%C5%9Far%C4%B1l%C4%B1
WhatsApp bağlantısının başarıyla kurulduğunu gösteren ekran

🏗️ Proje Yapısı
```
whatsapp-auto-message/
├── src/
│   ├── controllers/     # İş mantığı kontrolcüleri
│   ├── models/         # Veri modelleri
│   ├── routes/         # Express route'ları
│   ├── services/       # WhatsApp servisleri
│   ├── public/         # Static dosyalar
│   └── views/          # EJS şablonları
├── config/             # Yapılandırma dosyaları
├── uploads/            # Yüklenen dosyalar
└── tests/              # Test dosyaları
```

🔧 Yapılandırma
Çevre Değişkenleri
```
env
PORT=3000
SESSION_SECRET=your_secret_key
WHATSAPP_SESSION_DIR=sessions
LOG_LEVEL=info
```

WhatsApp Ayarları
```
javascript
{
  authStrategy: LocalAuth,
  puppeteer: { 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
}
```

```bash
NODE_ENV=production
PORT=3000
Process manager kurulumu (PM2 önerilir):
```
```bash
npm install -g pm2
pm2 start ecosystem.config.js
Reverse proxy ayarları (Nginx):
```
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
🤝 Katkıda Bulunma
Katkılarınızı bekliyorum! Lütfen şu adımları izleyin:
```
Fork edin

Feature branch oluşturun (git checkout -b feature/AmazingFeature)

Commit edin (git commit -m 'Add some AmazingFeature')

Push edin (git push origin feature/AmazingFeature)

Pull Request açın
```
📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasına bakın.

⚠️ Sorumluluk Reddi: 
Bu proje, WhatsApp'ın resmi bir ürünü değildir ve WhatsApp'ın hizmet şartlarına uygun olarak kullanılmalıdır. Kullanıcılar kendi sorumluluklarında kullanmalıdır.

<div align="center">
⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

</div> 
