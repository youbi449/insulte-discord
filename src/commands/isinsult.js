const { SlashCommandBuilder } = require('discord.js');
const { askGemini } = require('../utils/gemini');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('isinsult')
    .setDescription('Demande à l\'IA si une phrase ou un mot est une insulte, avec explication')
    .addStringOption(opt =>
      opt.setName('texte')
        .setDescription('Phrase ou mot à analyser')
        .setRequired(true)
    ),
  async execute(interaction) {
    const texte = interaction.options.getString('texte');
    await interaction.deferReply({ ephemeral: true });
    try {
      const prompt = `Réponds d'abord par "Oui" ou "Non", puis explique en une ou deux phrases pourquoi. Est-ce que la phrase ou le mot suivant est une insulte ?\n\n"${texte}"`;
      const reponse = await askGemini(prompt);npm
      return interaction.editReply({ content: `L'IA répond :\n${reponse ? reponse.trim() : 'Aucune réponse'}` });
    } catch (e) {
      return interaction.editReply({ content: `Erreur lors de l'appel à l'IA : ${e.message}` });
    }
  },
}; 