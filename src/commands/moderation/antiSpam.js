module.exports = {
  name: 'antispam',
  description: 'Configure anti-spam threshold. Usage: !antispam <threshold> <window_ms>',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, args, chat, db }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    const threshold = parseInt(args[0]) || 5;
    const windowMs = parseInt(args[1]) || 7000;
    const settings = db.get('settings') || {};
    const gid = chat.id._serialized;
    settings[gid] = settings[gid] || {};
    settings[gid].spamThreshold = threshold;
    settings[gid].spamWindow = windowMs;
    db.set('settings', settings);
    await msg.reply(`anti-spam set threshold=${threshold} window=${windowMs}ms`);
  }
};
