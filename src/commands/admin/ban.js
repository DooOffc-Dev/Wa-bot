module.exports = {
  name: 'ban',
  description: 'Ban a user (remove and add to banned list). Usage: !ban @user',
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
    const banned = db.get('banned') || {};
    banned[groupId] = banned[groupId] || [];
    for (const t of targets) {
      try {
        await chat.removeParticipants([t]);
      } catch (e) {}
      if (!banned[groupId].includes(t)) banned[groupId].push(t);
    }
    db.set('banned', banned);
    await msg.reply('User(s) banned.');
  }
};
