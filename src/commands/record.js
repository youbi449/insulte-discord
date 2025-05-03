const { SlashCommandBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('record')
    .setDescription('Affiche le record de jours consécutifs sans insulte'),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildData = dataManager.getGuildData(guildId);
    
    const record = guildData.recordStreak;
    let message;
    
    if (record === 0) {
      message = "📊 Aucun record établi pour l'instant. Essayez de tenir au moins une journée !";
    } else if (record === 1) {
      message = "📊 Le record est de **1 jour** sans insulte. On peut faire mieux !";
    } else {
      message = `📊 Le record est de **${record} jours** consécutifs sans insulte !`;
    }
    
    // Ajouter l'information sur le streak actuel pour comparaison
    if (guildData.currentStreak > 0) {
      if (guildData.currentStreak === record) {
        message += "\n\n🔥 Vous êtes actuellement à égalité avec le record ! Ne lâchez rien !";
      } else if (guildData.currentStreak >= record * 0.75) {
        const joursRestants = record - guildData.currentStreak;
        message += `\n\n⏳ Vous êtes à **${guildData.currentStreak}/${record}** jours. Plus que ${joursRestants} jour(s) pour battre le record !`;
      }
    }
    
    await interaction.reply({ content: message });
  },
}; 