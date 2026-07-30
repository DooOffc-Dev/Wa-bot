module.exports = {
  name: 'sample_feature',
  description: 'Sample plugin in pelugins folder',
  aliases: ['sample'],
  adminOnly: false,
  ownerOnly: false,
  async run({ msg }) {
    await msg.reply('Sample feature active from pelugins folder.');
  }
};
