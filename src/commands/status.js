const { SlashCommandBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const { generateDailyReport } = require('../utils/reportUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Affiche le nombre de jours consécutifs sans insulte'),
  
  async execute(interaction) {
    // S'assurer de vérifier si un jour est passé pour incrémenter le compteur
    const guildId = interaction.guild.id;
    const guildData = dataManager.checkDailyIncrement(guildId);
    const message = generateDailyReport(guildData, guildId);
    
    await interaction.reply({ content: message });
  },
}; 