module.exports = {
  name: 'tagall',
  description: 'Mention all group members (admin only)',
  aliases: ['all'],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, chat }) {
    if (!chat.isGroup) return msg.reply('This command works in groups only.');
    const parts = await chat.getParticipants();
    const mentions = parts.map(p => ({ id: p.id._serialized }));
    const text = `Attention: `;
    await chat.sendMessage(text, { mentions });
  }
};
