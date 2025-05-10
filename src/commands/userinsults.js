const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinsults')
    .setDescription('Affiche les insultes détectées pour un utilisateur du serveur')
    .addUserOption(opt =>
      opt.setName('utilisateur')
        .setDescription('Utilisateur à inspecter')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const guildId = interaction.guild.id;
    const guildData = getGuildData(guildId);
    if (!guildData || !Array.isArray(guildData.offenses)) {
      return interaction.reply({ content: 'Aucune donnée trouvée pour ce serveur.', ephemeral: true });
    }
    const offenses = guildData.offenses.filter(o => o.offender === user.id);
    if (offenses.length === 0) {
      return interaction.reply({ content: `Aucune insulte détectée pour ${user.tag}.`, ephemeral: true });
    }
    // Limiter la taille du message Discord
    let msg = offenses.map((o, i) =>
      `#${i+1} | ${o.date ? new Date(o.date).toLocaleString('fr-FR') : ''} : "${o.message || ''}"`
    ).join('\n');
    if (msg.length > 1900) msg = msg.slice(0, 1900) + '\n...';
    return interaction.reply({ content: `**Insultes détectées pour ${user.tag} :**\n${msg}`, ephemeral: true });
  },
}; 