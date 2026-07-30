module.exports = {
  name: 'kick',
  description: 'Kick a user from the group. Usage: !kick @user or reply to message and !kick',
  aliases: [],
  adminOnly: true,
  ownerOnly: false,
  async run({ msg, args, chat, contact }) {
    if (!chat.isGroup) return msg.reply('This command only works in groups.');
    let targets = [];
    if (msg.hasQuotedMsg) {
      const q = await msg.getQuotedMessage();
      const c = await q.getContact();
      targets.push(c.id._serialized);
    }
    // mentions
    if (msg.mentionedIds && msg.mentionedIds.length) targets = targets.concat(msg.mentionedIds);
    // args as number? try parse
    if (targets.length === 0 && args.length) {
      // try to construct id from number
      const num = args[0].replace(/[^0-9]/g, '');
      if (num) targets.push(num + '@c.us');
    }
    if (!targets.length) return msg.reply('No target specified.');
    try {
      await chat.removeParticipants(targets);
      await chat.sendMessage('User(s) removed.');
    } catch (e) {
      console.warn('Kick failed', e.message);
      await msg.reply('Failed to remove user. Ensure bot is admin and has permission.');
    }
  }
};
