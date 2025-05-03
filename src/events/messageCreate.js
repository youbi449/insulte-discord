const { Events } = require("discord.js");
const { detectInsult } = require("../utils/insultDetector");
const dataManager = require("../utils/dataManager");
const { logError } = require('../utils/logUtil');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    // Ignorer les messages des bots
    if (message.author.bot) return;

    // Ignorer les messages privés (DM)
    if (!message.guild) return;

    // Extraire le contenu du message
    const content = message.content;

    // Détection d'insultes
    const result = await detectInsult(content, message.guild.id);

    if (result.detected) {
      // Réinitialiser le compteur
      const updatedData = dataManager.resetStreak(
        message.guild.id,
        message.author.tag,
        content
      );

      // Log l'infraction
      console.log(
        `[INSULTE] Détectée dans le serveur ${message.guild.name} (${message.guild.id})`
      );
      console.log(`- Auteur: ${message.author.tag}`);
      console.log(`- Message: ${content}`);
      console.log(`- Insulte détectée: ${result.insult}`);

      // Mentionner l'utilisateur et ajouter la punchline
      try {
        await message.reply({
          content: `⚠️ Insulte détectée par <@${message.author.id}> ! Le compteur de jours sans insulte a été réinitialisé à 0.\n${result.punchline || 'On compte sur toi pour faire mieux la prochaine fois !'}`,
          ephemeral: false,
        });
      } catch (error) {
        logError("Erreur lors de l'envoi du message de réponse", error);
      }
    } else {
      // Vérifier et incrémenter le streak si un nouveau jour est passé
      dataManager.checkDailyIncrement(message.guild.id);
    }
  },
};
