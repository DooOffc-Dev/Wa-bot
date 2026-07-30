module.exports = {
  name: 'setrules',
  description: 'Set group rules. Usage: !setrules <text>',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, args, chat, db }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    const text = args.join(' ');
    if (!text) return msg.reply('Usage: !setrules <text>');
    const settings = db.get('settings') || {};
    const gid = chat.id._serialized;
    settings[gid] = settings[gid] || {};
    settings[gid].rules = text;
    db.set('settings', settings);
    await msg.reply('Rules updated.');
  }
};
