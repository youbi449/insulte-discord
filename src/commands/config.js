const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dataManager = require('../utils/dataManager');
const { insultesParDefaut } = require('../config/insultes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure la liste des mots interdits (admin uniquement)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ajouter')
        .setDescription('Ajoute un mot à la liste des mots interdits')
        .addStringOption(option =>
          option
            .setName('mot')
            .setDescription('Le mot à ajouter')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('supprimer')
        .setDescription('Supprime un mot de la liste des mots interdits personnalisée')
        .addStringOption(option =>
          option
            .setName('mot')
            .setDescription('Le mot à supprimer')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('liste')
        .setDescription('Affiche la liste des mots interdits personnalisés')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Vérifier si l'utilisateur a les droits d'administrateur
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: "⛔ Vous n'avez pas les droits nécessaires pour utiliser cette commande.",
        ephemeral: true
      });
    }

    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'ajouter':
        await handleAddWord(interaction, guildId);
        break;
      case 'supprimer':
        await handleRemoveWord(interaction, guildId);
        break;
      case 'liste':
        await handleListWords(interaction, guildId);
        break;
    }
  },
};

async function handleAddWord(interaction, guildId) {
  const word = interaction.options.getString('mot').toLowerCase().trim();
  
  // Vérifie si le mot est vide
  if (!word || word.length < 2) {
    return interaction.reply({
      content: "⚠️ Le mot doit contenir au moins 2 caractères.",
      ephemeral: true
    });
  }
  
  // Vérifie si le mot existe déjà dans la liste par défaut
  if (insultesParDefaut.includes(word)) {
    return interaction.reply({
      content: `⚠️ Le mot "*${word}*" est déjà dans la liste par défaut.`,
      ephemeral: true
    });
  }
  
  // Vérifie si le mot existe déjà dans la liste personnalisée
  const guildData = dataManager.getGuildData(guildId);
  if (guildData.customInsults && guildData.customInsults.includes(word)) {
    return interaction.reply({
      content: `⚠️ Le mot "*${word}*" est déjà dans la liste personnalisée.`,
      ephemeral: true
    });
  }
  
  // Ajoute le mot à la liste personnalisée
  dataManager.addCustomInsult(guildId, word);
  
  await interaction.reply({
    content: `✅ Le mot "*${word}*" a été ajouté à la liste des mots interdits.`,
    ephemeral: true
  });
}

async function handleRemoveWord(interaction, guildId) {
  const word = interaction.options.getString('mot').toLowerCase().trim();
  
  // Vérifie si le mot est dans la liste par défaut
  if (insultesParDefaut.includes(word)) {
    return interaction.reply({
      content: `⚠️ Impossible de supprimer "*${word}*" car il fait partie de la liste par défaut.`,
      ephemeral: true
    });
  }
  
  // Vérifie si le mot existe dans la liste personnalisée
  const guildData = dataManager.getGuildData(guildId);
  if (!guildData.customInsults || !guildData.customInsults.includes(word)) {
    return interaction.reply({
      content: `⚠️ Le mot "*${word}*" ne se trouve pas dans la liste personnalisée.`,
      ephemeral: true
    });
  }
  
  // Supprime le mot de la liste personnalisée
  dataManager.removeCustomInsult(guildId, word);
  
  await interaction.reply({
    content: `✅ Le mot "*${word}*" a été supprimé de la liste des mots interdits.`,
    ephemeral: true
  });
}

async function handleListWords(interaction, guildId) {
  const guildData = dataManager.getGuildData(guildId);
  const customInsults = guildData.customInsults || [];
  
  if (customInsults.length === 0) {
    return interaction.reply({
      content: "📋 Aucun mot personnalisé n'a été ajouté. Vous utilisez uniquement la liste par défaut.",
      ephemeral: true
    });
  }
  
  // Trie la liste alphabétiquement
  const sortedList = [...customInsults].sort();
  const formattedList = sortedList.map(word => `• ${word}`).join('\n');
  
  await interaction.reply({
    content: `📋 **Liste des mots personnalisés (${customInsults.length}) :**\n\n${formattedList}`,
    ephemeral: true
  });
} 