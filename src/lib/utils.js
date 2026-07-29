module.exports = {
  mentionAll(chat, client, text) {
    // naive tagall: mention all participants (ensure admin use only)
    return chat.getParticipants().then(parts => {
      const mentions = parts.map(p => ({ id: p.id._serialized }));
      return chat.sendMessage(text || 'Attention', { mentions });
    });
  }
};
