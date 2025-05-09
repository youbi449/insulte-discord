const { SlashCommandBuilder } = require('discord.js');
const { getGuildData, removeOffense } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('insultlog')
    .setDescription('Liste ou supprime les insultes détectées sur ce serveur.')
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Liste toutes les insultes détectées')
    )
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Supprime une insulte détectée par son index')
        .addIntegerOption(opt =>
          opt.setName('index')
            .setDescription('Index de l\'insulte à supprimer (voir /insultlog list)')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const guildData = getGuildData(guildId);
    if (!guildData) return interaction.reply({ content: 'Aucune donnée trouvée pour ce serveur.', ephemeral: true });

    // Vérification admin
    if (!interaction.memberPermissions.has('Administrator') && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ content: 'Seuls les administrateurs ou le propriétaire du serveur peuvent utiliser cette commande.', ephemeral: true });
    }

    if (sub === 'list') {
      const offenses = guildData.offenses || [];
      if (offenses.length === 0) {
        return interaction.reply({ content: 'Aucune insulte détectée pour ce serveur.', ephemeral: true });
      }
      // Affichage paginé si trop long
      let msg = offenses.map((o, i) =>
        `#${i} | ${o.date ? new Date(o.date).toLocaleString('fr-FR') : ''} | ${o.offender || 'inconnu'} : "${o.message || ''}"`
      ).join('\n');
      if (msg.length > 1900) msg = msg.slice(0, 1900) + '\n...';
      return interaction.reply({ content: `**Liste des insultes détectées :**\n${msg}`, ephemeral: true });
    }
    if (sub === 'delete') {
      const index = interaction.options.getInteger('index');
      const offenses = guildData.offenses || [];
      if (index < 0 || index >= offenses.length) {
        return interaction.reply({ content: `Index invalide. Utilisez /insultlog list pour voir les index.`, ephemeral: true });
      }
      removeOffense(guildId, index);
      return interaction.reply({ content: `Insulte #${index} supprimée avec succès.`, ephemeral: true });
    }
  },
}; 