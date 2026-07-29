module.exports = {
  name: 'ping',
  description: 'Test bot responsiveness',
  aliases: [],
  adminOnly: false,
  ownerOnly: false,
  async run({ msg }) {
    await msg.reply('Pong!');
  }
};
