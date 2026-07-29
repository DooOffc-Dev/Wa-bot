const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const CommandLoader = require('./lib/command-loader');
const Permissions = require('./lib/permissions');
const Utils = require('./lib/utils');

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

  client.on('message_create', async (msg) => {
    if (msg.fromMe) return;
    try {
      const chat = await msg.getChat();
      const contact = await msg.getContact();
      const body = (msg.body || '').trim();

      // very simple prefix command: !cmd args...
      if (body.startsWith('!')) {
        const parts = body.slice(1).split(/\s+/);
        const name = parts[0].toLowerCase();
        const args = parts.slice(1);
        const command = commands[name] || Object.values(commands).find(c => c.aliases && c.aliases.includes(name));
        if (command) {
          // permission checks
          const isOwner = Permissions.isOwner(contact.id._serialized);
          const isAdmin = (chat.isGroup && (await chat.getAdmins()).some(a => a.id._serialized === contact.id._serialized));
          if (command.ownerOnly && !isOwner) return msg.reply('Command owner only.');
          if (command.adminOnly && !isAdmin && !isOwner) return msg.reply('Command admin only.');
          await command.run({ msg, args, client, chat, contact, utils: Utils });
        }
      }

      // moderation: anti-link example
      const antiLinkCmd = commands['antilink'];
      if (chat.isGroup && antiLinkCmd) {
        await antiLinkCmd.run({ msg, client, chat, contact, utils: Utils });
      }

    } catch (e) { console.error('message_create handler', e); }
  });

  client.initialize();
}

module.exports = { start };
