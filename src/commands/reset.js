const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dataManager = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Réinitialise le compteur de jours sans insulte (admin uniquement)')
    .addUserOption(option => 
      option
        .setName('utilisateur')
        .setDescription('Utilisateur qui a proféré l\'insulte')
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName('motif')
        .setDescription('Le motif ou l\'insulte prononcée par le responsable')
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName('message')
        .setDescription('Le message contenant l\'insulte')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const user = interaction.options.getUser('utilisateur');
    const message = interaction.options.getString('message');
    const motif = interaction.options.getString('motif');
    
    // Vérifier si l'utilisateur a les droits d'administrateur
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: "⛔ Vous n'avez pas les droits nécessaires pour utiliser cette commande.",
        ephemeral: true
      });
    }
    
    // Récupérer le streak actuel avant la réinitialisation
    const previousData = dataManager.getGuildData(guildId);
    const previousStreak = previousData.currentStreak;
    
    // Réinitialiser le compteur
    dataManager.resetStreak(
      guildId, 
      user.tag, 
      message || 'Non spécifié'
    );
    
    // Générer la punchline trash via l'IA
    let punchline = '';
    try {
      const { punchline: pl } = await require('../utils/insultDetector').detectInsult(motif, guildId);
      if (pl) punchline = `\n\n${pl}`;
    } catch (e) {
      punchline = '\n\n(Punchline IA indisponible)';
    }
    
    let resetMessage = `⚠️ Le compteur a été réinitialisé par **${interaction.user.tag}**.\n`;
    resetMessage += `Responsable : **${user.tag}**`;
    
    if (message) {
      resetMessage += `\nMessage incriminé : *"${message}"*`;
    }
    
    resetMessage += `\nMotif : *"${motif}"*`;
    
    // Mentionner si un record a été perdu
    if (previousStreak > previousData.recordStreak) {
      resetMessage += `\n\n🏆 **NOUVEAU RECORD !** Vous aviez atteint **${previousStreak} jours** sans insulte !`;
    } else if (previousStreak > 0) {
      resetMessage += `\n\nVous aviez atteint **${previousStreak} jour(s)** sans insulte.`;
    }
    
    resetMessage += punchline;
    
    await interaction.reply({ content: resetMessage });
  },
}; 