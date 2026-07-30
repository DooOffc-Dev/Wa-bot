module.exports = {
  name: 'setwelcome',
  description: 'Set welcome message for the group. Usage: !setwelcome Welcome ...',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, args, chat, db }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    const text = args.join(' ');
    if (!text) return msg.reply('Usage: !setwelcome <text>');
    const settings = db.get('settings') || {};
    const gid = chat.id._serialized;
    settings[gid] = settings[gid] || {};
    settings[gid].welcome = text;
    db.set('settings', settings);
    await msg.reply('Welcome message updated.');
  }
};
