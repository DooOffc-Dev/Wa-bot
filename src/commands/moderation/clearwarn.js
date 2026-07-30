module.exports = {
  name: 'clearwarn',
  description: 'Clear warnings for a user. Usage: !clearwarn @user',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, chat, db }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    let targetIds = msg.mentionedIds || [];
    if (msg.hasQuotedMsg) {
      const q = await msg.getQuotedMessage();
      const c = await q.getContact();
      targetIds.push(c.id._serialized);
    }
    if (!targetIds.length) return msg.reply('No target specified.');
    const gid = chat.id._serialized;
    const warnStore = db.get('warnings') || {};
    warnStore[gid] = warnStore[gid] || {};
    for (const t of targetIds) {
      delete warnStore[gid][t];
    }
    db.set('warnings', warnStore);
    await msg.reply('Cleared warnings.');
  }
};
