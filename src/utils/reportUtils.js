const dataManager = require('./dataManager');

function generateDailyReport(guildData, guildId) {
  let message;
  const streak = guildData.currentStreak;

  if (streak === 0) {
    message = `😔 Actuellement **0 jour** sans insulte.`;
    if (guildData.lastOffender) {
      const lastResetDate = new Date(guildData.lastReset);
      const formattedDate = `${lastResetDate.toLocaleDateString()} à ${lastResetDate.toLocaleTimeString()}`;
      message += `\n\nDernier reset le **${formattedDate}**`;
      message += `\nPersécuteur : **${guildData.lastOffender}**`;
      if (guildData.lastMessage) {
        message += `\nMessage incriminé : *\"${guildData.lastMessage}\"*`;
      }
    }
  } else {
    const emoji = streak >= 7 ? '🥇' : streak >= 3 ? '🎉' : '👍';
    if (streak === 1) {
      message = `${emoji} **1 jour** sans insulte ! Continuez comme ça !`;
    } else {
      message = `${emoji} **${streak} jours** consécutifs sans insulte ! Bravo à tous !`;
    }
  }

  // Ajout du podium
  const podium = dataManager.getMostInsulted(guildId, 3);
  if (podium.length) {
    message += '\n\n🏆 **Podium des membres les plus insultés :**\n';
    const emojis = ['🥇', '🥈', '🥉'];
    podium.forEach((entry, i) => {
      message += `\n${emojis[i] || '🔸'} **${entry.offender}** — ${entry.count} insulte${entry.count > 1 ? 's' : ''}`;
    });
    message += '\nCourage à tous, tenez bon !';
  } else {
    message += '\n\n🥳 Personne n\'a encore été insulté sur ce serveur !';
  }

  return message;
}

module.exports = { generateDailyReport }; 