const { SlashCommandBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const { generatePodiumMessage } = require('./podium');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription('Affiche le classement des 10 membres qui insultent le plus (insultants)'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const topInsultants = dataManager.getMostInsulting(guildId, 10);
    // Adapter les entrées pour la fonction utilitaire (nom au lieu de insulter)
    const entries = topInsultants.map(entry => ({ nom: entry.insulter, count: entry.count }));
    const message = generatePodiumMessage(entries, 'Top 10 des plus gros insultants', '🚨', 'insultes envoyées');
    await interaction.reply({ content: message });
  }
}; 