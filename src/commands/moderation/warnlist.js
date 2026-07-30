module.exports = {
  name: 'warnlist',
  description: 'List warnings in group. Usage: !warnlist',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, chat, db }) {
    if (!chat.isGroup) return msg.reply('Group only.');
    const gid = chat.id._serialized;
    const warnStore = db.get('warnings') || {};
    const list = warnStore[gid] || {};
    let out = 'Warnings:\n';
    for (const [id, c] of Object.entries(list)) {
      out += `${id}: ${c}\n`;
    }
    await msg.reply(out);
  }
};
