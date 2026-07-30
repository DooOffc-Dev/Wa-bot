// Update bot to accept both '!' and '.' prefixes for commands
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const CommandLoader = require('./lib/command-loader');
const Permissions = require('./lib/permissions');
const Utils = require('./lib/utils');
const db = require('./lib/db');

let client;
let commands = {};

async function start(io, app) {
  // initialize command loader
  commands = CommandLoader.loadAll(path.join(__dirname, 'commands'));
  console.log('Loaded commands:', Object.keys(commands).length);

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'wanggy-botz-doo' }),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
  });

  client.on('qr', async (qr) => {
    try {
      const dataUrl = await qrcode.toDataURL(qr);
      io.emit('qr', { dataUrl });
    } catch (e) { console.warn('QR gen error', e); }
  });

  client.on('ready', () => {
    console.log('WhatsApp client ready');
    io.emit('status', { connected: true });
  });

  client.on('auth_failure', (msg) => {
    console.error('Auth failure', msg);
    io.emit('status', { connected: false, error: 'auth_failure' });
  });

  client.on('disconnected', (reason) => {
    console.warn('Client disconnected', reason);
    io.emit('status', { connected: false });
  });

  // helper to check admin
  async function isAdminInChat(chat, id) {
    if (!chat.isGroup) return false;
    const admins = (await chat.getAdmins()).map(a => a.id._serialized);
    return admins.includes(id);
  }

  client.on('message_create', async (msg) => {
    if (msg.fromMe) return;
    try {
      const chat = await msg.getChat();
      const contact = await msg.getContact();
      const body = (msg.body || '').trim();

      const groupId = chat.id ? chat.id._serialized : null;
      const senderId = contact.id._serialized;

      // global banned list per group
      const bannedList = db.get('banned') || {};
      if (chat.isGroup && bannedList[groupId] && bannedList[groupId].includes(senderId)) {
        // try to remove if still in group
        try { await chat.removeParticipants([senderId]); } catch (e) {}
        return;
      }

      // muted users: if muted, delete message
      const muted = db.get('muted') || {};
      if (chat.isGroup && muted[groupId] && muted[groupId].includes(senderId)) {
        try { await msg.delete(true); } catch (e) {}
        return;
      }

      // support both ! and . prefixes
      if (body.startsWith('!') || body.startsWith('.')) {
        const parts = body.slice(1).split(/\s+/);
        const name = parts[0].toLowerCase();
        const args = parts.slice(1);
        const command = commands[name] || Object.values(commands).find(c => c.aliases && c.aliases.includes(name));
        if (command) {
          const isOwner = Permissions.isOwner(senderId);
          const isAdmin = await isAdminInChat(chat, senderId);
          if (command.ownerOnly && !isOwner) return msg.reply('Command owner only.');
          if (command.adminOnly && !isAdmin && !isOwner) return msg.reply('Command admin only.');
          try {
            await command.run({ msg, args, client, chat, contact, utils: Utils, db });
          } catch (e) {
            console.error('Command error', e);
            await msg.reply('Command failed: ' + e.message);
          }
        }
      }

      // moderation features (automatic handlers)
      if (chat.isGroup && commands['antilink']) {
        try { await commands['antilink'].run({ msg, client, chat, contact, utils: Utils, db }); } catch (e) {}
      }

      const INVITE_RE = /chat\.whatsapp\.com\/[A-Za-z0-9]+/i;
      if (chat.isGroup && INVITE_RE.test(body)) {
        const settings = db.get('settings') || {};
        const g = settings[groupId] || {};
        if (g.antiInvite !== false) {
          const isSenderAdmin = await isAdminInChat(chat, senderId);
          if (!isSenderAdmin) {
            try { await msg.delete(true); } catch (e) {}
            await chat.sendMessage(`@${contact.number} Group invite links are not allowed.`, { mentions: [contact] });
          }
        }
      }

      // anti-spam naive
      const SPAM_WINDOW_MS = 7000;
      const SPAM_THRESHOLD = 5;
      const now = Date.now();
      const recent = db.get('recent') || {};
      recent[senderId] = recent[senderId] || [];
      recent[senderId].push(now);
      recent[senderId] = recent[senderId].filter(t => now - t <= SPAM_WINDOW_MS);
      db.set('recent', recent);
      if (recent[senderId].length >= SPAM_THRESHOLD) {
        try { await msg.delete(true); } catch (e) {}
        await chat.sendMessage(`@${contact.number} Please stop spamming.`, { mentions: [contact] });
      }

    } catch (e) { console.error('message_create handler', e); }
  });

  // event: someone deletes message for everyone
  client.on('message_revoke_everyone', async (after, before) => {
    try {
      if (!before) return;
      const chatId = before.from || before._data?.id?._serialized;
      const chat = await client.getChatById(chatId);
      if (!chat) return;
      if (chat.isGroup) {
        const authorId = before.author || before.from;
        const authorNumber = authorId ? authorId.split('@')[0] : 'unknown';
        const original = before.body || '<media/unknown>';
        // check group setting if antiDelete enabled
        const settings = db.get('settings') || {};
        const g = settings[chatId] || {};
        if (g.antiDelete !== false) {
          await chat.sendMessage(`@${authorNumber} deleted a message:\n\n${original}`, { mentions: [{ id: authorId }] });
        }
      }
    } catch (e) { console.warn('Error on message_revoke_everyone:', e.message); }
  });

  return client.initialize();
}

module.exports = { start };
