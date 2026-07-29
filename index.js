// index.js
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const WARN_FILE = path.join(__dirname, 'warnings.json');
const WARN_LIMIT = 3; // jumlah peringatan sebelum kick

// helper penyimpanan sederhana
function loadWarnings() {
  try {
    return JSON.parse(fs.readFileSync(WARN_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}
function saveWarnings(data) {
  fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 2));
}
function addWarning(groupId, userId) {
  const data = loadWarnings();
  data[groupId] = data[groupId] || {};
  data[groupId][userId] = (data[groupId][userId] || 0) + 1;
  saveWarnings(data);
  return data[groupId][userId];
}
function clearWarnings(groupId, userId) {
  const data = loadWarnings();
  if (data[groupId] && data[groupId][userId]) {
    delete data[groupId][userId];
    saveWarnings(data);
  }
}

// regex sederhana untuk mendeteksi link
const LINK_RE = /(https?:\/\/|www\.)[^\s]+/i;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "wa-guardian" }),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('QR code ready. Scan dengan WhatsApp Mobile.');
});

client.on('ready', () => {
  console.log('Client ready!');
});

client.on('message_create', async (msg) => {
  // hanya tangani pesan baru dari orang lain (jangan memproses ulang pesan yang dikirim oleh bot sendiri)
  if (msg.fromMe) return;

  try {
    const chat = await msg.getChat();

    // 1) Welcome: tanggapi ketika seseorang bergabung dengan grup
    // whatsapp-web.js memancarkan event group_update atau group_join? Simpler: gunakan group participants update below.

    // 2) Anti-link (hanya di grup)
    if (chat.isGroup && msg.body) {
      const body = msg.body || '';
      if (LINK_RE.test(body)) {
        const contact = await msg.getContact();
        // cek apakah pengirim admin
        const participants = chat.participants || [];
        const senderId = contact.id._serialized; // ex: 62812xxxx-123@g.us
        const isSenderAdmin = participants.find(p => p.id._serialized === senderId && (p.isAdmin || p.isSuperAdmin));
        if (!isSenderAdmin) {
          // coba hapus pesan (butuh bot admin)
          try {
            await msg.delete(true);
          } catch (e) {
            console.warn('Gagal menghapus pesan — pastikan bot adalah admin di grup:', e.message);
          }

          // berikan peringatan
          const warnCount = addWarning(chat.id._serialized, senderId);
          await chat.sendMessage(`@${contact.number} Ditemukan link di grup. Ini peringatan ke-${warnCount}.`, { mentions: [contact] });

          if (warnCount >= WARN_LIMIT) {
            // kick user (butuh bot admin)
            try {
              await chat.removeParticipants([senderId]);
              await chat.sendMessage(`@${contact.number} telah dikeluarkan karena melanggar aturan (link berulang).`, { mentions: [contact] });
              clearWarnings(chat.id._serialized, senderId);
            } catch (e) {
              console.warn('Gagal mengeluarkan peserta — pastikan bot admin dan memiliki izin kick:', e.message);
              await chat.sendMessage(`Bot tidak bisa mengeluarkan @${contact.number} — pastikan bot admin dan memiliki permission.`, { mentions: [contact] });
            }
          }
        }
      }
    }

    // 3) Auto-responses: contoh sederhana "ping"
    if (msg.body && msg.body.toLowerCase() === 'ping') {
      msg.reply('Pong!');
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
});

// event: someone joins group
client.on('group_join', async (notification) => {
  // notification: { id, who } in some versions. Fallback: fetch chat and participants.
  try {
    const chat = await notification.getChat();
    const contact = await notification.getContact();
    await chat.sendMessage(`Selamat datang @${contact.number}! Mohon baca rules grup.`, { mentions: [contact] });
  } catch (e) {
    console.warn('group_join handler error:', e.message);
  }
});

// event: message deleted (revoke)
client.on('message_revoke_everyone', async (after, before) => {
  // after = message after deletion (null or minimal), before = message before deletion (contains content)
  try {
    const whoDeleted = before ? before.author || before.from : null;
    if (!before) return;
    const chatId = before.from || before._data?.id?._serialized;
    const chat = await client.getChatById(chatId);
    if (chat.isGroup) {
      const authorId = before.author || before.from;
      const authorNumber = authorId ? authorId.split('@')[0] : 'unknown';
      const original = before.body || '<media/unknown>';
      await chat.sendMessage(`@${authorNumber} menghapus pesan:\n\n${original}`, { mentions: [{ id: authorId }] });
    }
  } catch (e) {
    console.warn('Error on message_revoke_everyone:', e.message);
  }
});

// start
client.initialize();
