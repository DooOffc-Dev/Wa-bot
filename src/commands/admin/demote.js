module.exports = {
  name: 'demote',
  description: 'Demote an admin to member. Usage: !demote @user',
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
      await chat.demoteParticipants(targets);
      await msg.reply('Demoted.');
    } catch (e) {
      console.warn('Demote failed', e.message);
      await msg.reply('Failed to demote.');
    }
  }
};
