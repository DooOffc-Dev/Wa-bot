# Wanggy - Botz Doo

Bot WhatsApp modular dengan web pairing (socket.io) dan sistem command/plugin.

Fitur awal (skeleton):
- Web pairing: lihat /web-client untuk UI minimal menampilkan QR
- Command loader modular (src/commands)
- Contoh commands: ping, afk, tagall (admin only), anti-link

Cara menjalankan:
1. git clone https://github.com/DooOffc-Dev/Wa-bot
2. cd Wa-bot
3. npm install
4. Copy .env from secrets.example.env -> .env dan set JWT_SECRET (opsional)
5. npm start
6. Buka http://localhost:3000 (web client) untuk melihat QR dan status

Catatan:
- Jangan commit file session; session file ditambahkan otomatis oleh whatsapp-web.js dan .gitignore sudah mengabaikannya.
- Untuk fitur kick/hapus pesan, bot harus admin di grup.
