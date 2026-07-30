module.exports = {
  name: 'sp',
  description: 'Owner-only: create a plugin file in src/pelugins. Usage: .sp filename.js | <code>',
  aliases: [],
  adminOnly: false,
  ownerOnly: true,
  async run({ msg, args, chat }) {
    // parse the raw message to get content after command
    const raw = (msg.body || '').trim();
    // supports both .sp and !sp prefixes, and syntax: .sp filename.js | code...
    const parts = raw.split(/\s+/);
    if (parts.length < 2) return msg.reply('Usage: .sp filename.js | <code>');
    // find the pipe |
    const idxPipe = raw.indexOf('|');
    if (idxPipe === -1) return msg.reply('Missing | separator. Usage: .sp filename.js | <code>');
    // extract filename between command and |
    const beforePipe = raw.slice(0, idxPipe).trim();
    const tokens = beforePipe.split(/\s+/);
    if (tokens.length < 2) return msg.reply('Filename not found.');
    const filename = tokens[1].replace(/[^a-zA-Z0-9_\-\.]/g, '');
    if (!filename.endsWith('.js')) return msg.reply('Filename must end with .js');
    const code = raw.slice(idxPipe + 1).trim();
    if (!code) return msg.reply('No code provided.');

    const fs = require('fs');
    const path = require('path');
    const pluginsDir = path.join(__dirname, '..', 'pelugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
    const fullPath = path.join(pluginsDir, filename);
    try {
      fs.writeFileSync(fullPath, code, { encoding: 'utf8' });
      await msg.reply(`Plugin saved to src/pelugins/${filename}. Restart bot to load it, or use reload command if available.`);
    } catch (e) {
      await msg.reply('Failed to write plugin: ' + e.message);
    }
  }
};
