module.exports = {
  name: 'promote',
  description: 'Promote a member to admin. Usage: !promote @user',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, chat }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    let targets = msg.mentionedIds || [];
    if (msg.hasQuotedMsg) {
      const q = await msg.getQuotedMessage();
      const c = await q.getContact();
      targets.push(c.id._serialized);
    }
    if (!targets.length) return msg.reply('No target specified.');
    try {
      await chat.promoteParticipants(targets);
      await msg.reply('Promoted.');
    } catch (e) {
      console.warn('Promote failed', e.message);
      await msg.reply('Failed to promote.');
    }
  }
};
