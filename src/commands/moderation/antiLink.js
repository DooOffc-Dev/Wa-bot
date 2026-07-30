module.exports = {
  name: 'antilink',
  description: 'Delete messages containing links (group only)',
  aliases: [],
  adminOnly: false,
  ownerOnly: false,
  async run({ msg, chat, contact, db }) {
    if (!chat.isGroup) return;
    const LINK_RE = /(https?:\/\/|www\.)[^\s]+/i;
    if (msg.body && LINK_RE.test(msg.body)) {
      const admins = (await chat.getAdmins()).map(a => a.id._serialized);
      const senderId = contact.id._serialized;
      if (admins.includes(senderId)) return;
      try { await msg.delete(true); } catch (e) {}
      await chat.sendMessage(`@${contact.number} Posting links is not allowed.`, { mentions: [contact] });
    }
  }
};
