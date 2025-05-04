const fetchFn = require('cross-fetch');

/**
 * Trouve le meilleur channel texte pour poster un bilan.
 * Priorité : 'noinsultchallenge' > 'général' > premier channel texte disponible
 * @param {Guild} guild - L'objet Guild Discord.js
 * @returns {TextChannel|null}
 */
function findBestReportChannel(guild) {
  if (!guild || !guild.channels || !guild.channels.cache) return null;
  // 1. Channel dédié
  let channel = guild.channels.cache.find(c => c.name === 'noinsultchallenge' && c.isTextBased());
  if (channel) return channel;
  // 2. Channel général
  channel = guild.channels.cache.find(c => (c.name === 'général' || c.name === 'general') && c.isTextBased());
  if (channel) return channel;
  // 3. Premier channel texte disponible
  channel = guild.channels.cache.find(c => c.isTextBased() && c.viewable && c.permissionsFor(guild.members.me).has('SendMessages'));
  return channel || null;
}

module.exports = {
  fetchFn,
  findBestReportChannel,
}; 