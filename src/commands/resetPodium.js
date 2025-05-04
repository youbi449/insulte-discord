const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dataManager = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetpodium')
    .setDescription('Réinitialise uniquement le podium des membres les plus insultants (admin uniquement)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    // Vérifier si l'utilisateur a les droits d'administrateur
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "⛔ Vous n'avez pas les droits nécessaires pour utiliser cette commande.",
        ephemeral: true
      });
    }
    // Réinitialiser le podium
    dataManager.resetPodium(guildId);
    await interaction.reply({
      content: '🏆 Le podium des insultes a été réinitialisé avec succès !',
      ephemeral: false
    });
  },
}; 