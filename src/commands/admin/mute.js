module.exports = {
  name: 'mute',
  description: 'Mute user in group (bot will delete their messages). Usage: !mute @user',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, args, chat, contact, db }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    let targets = msg.mentionedIds || [];
    if (msg.hasQuotedMsg) {
      const q = await msg.getQuotedMessage();
      const c = await q.getContact();
      targets.push(c.id._serialized);
    }
    if (!targets.length && args.length) {
      const num = args[0].replace(/[^0-9]/g, '');
      if (num) targets.push(num + '@c.us');
    }
    if (!targets.length) return msg.reply('No target specified.');
    const groupId = chat.id._serialized;
    const muted = db.get('muted') || {};
    muted[groupId] = muted[groupId] || [];
    for (const t of targets) if (!muted[groupId].includes(t)) muted[groupId].push(t);
    db.set('muted', muted);
    await msg.reply('User(s) muted.');
  }
};
