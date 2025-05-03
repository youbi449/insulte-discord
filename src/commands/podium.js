const { SlashCommandBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const { generateDailyReport } = require('../utils/reportUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('podium')
    .setDescription('Affiche le podium des membres les plus insultés du serveur'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildData = dataManager.getGuildData(guildId);
    const message = generateDailyReport(guildData, guildId);
    await interaction.reply({ content: message });
  }
}; 