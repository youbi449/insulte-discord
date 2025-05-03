const { SlashCommandBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const { generateDailyReport } = require('../utils/reportUtils');

// Nouvelle fonction utilitaire pour générer un message de podium générique
function generatePodiumMessage(entries, titre, emoji = '🏆', label = 'insultes') {
  if (!entries || entries.length === 0) {
    return `🥳 Personne n'a encore été listé dans ce classement !`;
  }
  let message = `${emoji} **${titre}** :\n`;
  entries.forEach((entry, i) => {
    message += `\n${i + 1}. **${entry.nom}** — ${entry.count} ${label}`;
  });
  return message;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('podium')
    .setDescription('Affiche le podium des membres les plus insultants du serveur'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildData = dataManager.getGuildData(guildId);
    const message = generateDailyReport(guildData, guildId);
    await interaction.reply({ content: message });
  },
  generatePodiumMessage // export pour réutilisation
}; 