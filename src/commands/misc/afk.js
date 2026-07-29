module.exports = {
  name: 'afk',
  description: 'Set AFK message. Usage: !afk [reason]',
  aliases: [],
  adminOnly: false,
  ownerOnly: false,
  async run({ msg, args, client, contact }) {
    const reason = args.join(' ') || 'AFK';
    // store simple file-based AFK (in database.json)
    const db = require('../../lib/db');
    const id = contact.id._serialized;
    const entry = { id, reason, at: Date.now() };
    const afks = db.get('afk') || {};
    afks[id] = entry;
    db.set('afk', afks);
    await msg.reply(`AFK set: ${reason}`);
  }
};
