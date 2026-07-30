module.exports = {
  name: 'warn',
  description: 'Warn a user. Usage: !warn @user [reason]',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, args, chat, db, contact }) {
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
      warnStore[gid][t] = (warnStore[gid][t] || 0) + 1;
      const count = warnStore[gid][t];
      if (count >= 3) {
        // kick
        try { await chat.removeParticipants([t]); } catch (e) {}
        warnStore[gid][t] = 0;
        await chat.sendMessage(`User warned ${count} times and removed.`);
      } else {
        await chat.sendMessage(`User warned. Count: ${count}`);
      }
    }
    db.set('warnings', warnStore);
  }
};
