# WA Guardian Bot (starter)

Persyaratan:
- Node.js 18+
- Grup: jadikan bot sebagai admin agar bisa menghapus/kick.

Instal:
1. git clone <repo> atau buat folder baru
2. npm install

Jalankan:
1. node index.js
2. Scan QR dari terminal (QR akan muncul)
3. Setelah siap, tambahkan bot ke grup dan jadikan admin

Fitur awal:
- Welcome message (saat join)
- Anti-link: hapus pesan berisi link, beri peringatan, kick setelah 3 peringatan (WARN_LIMIT)
- Anti-delete: mem-publish ulang pesan yang dihapus
- Respon sederhana "ping" -> "Pong!"

Catatan keamanan & kebijakan:
- Gunakan hanya di grup yang Anda kelola.
- WhatsApp dapat membatasi/ban akun yang dipakai untuk automasi tertentu; selalu ikuti kebijakan WhatsApp.
