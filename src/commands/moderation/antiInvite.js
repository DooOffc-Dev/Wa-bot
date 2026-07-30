module.exports = {
  name: 'antiinvite',
  description: 'Toggle anti-invite for group. Usage: !antiinvite on/off',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, args, chat, db }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    const state = (args[0] || '').toLowerCase();
    const settings = db.get('settings') || {};
    const gid = chat.id._serialized;
    settings[gid] = settings[gid] || {};
    settings[gid].antiInvite = state === 'on';
    db.set('settings', settings);
    await msg.reply('anti-invite set to ' + settings[gid].antiInvite);
  }
};
