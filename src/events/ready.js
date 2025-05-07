const { Events } = require('discord.js');
const cron = require('node-cron');
const dataManager = require('../utils/dataManager');
const { generateDailyReport } = require('../utils/reportUtils');
const { findBestReportChannel } = require('../utils/fetchUtil');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    console.log(`🤖 Prêt à surveiller les insultes dans ${client.guilds.cache.size} serveur(s)`);
    
    // Définir la présence du bot
    client.user.setPresence({
      activities: [{
        name: '0 insulte',
        type: 2 // "Listening to"
      }],
      status: 'online'
    });

    // Tâche planifiée : chaque jour à minuit
    cron.schedule('0 0 * * *', async () => {
      for (const guild of client.guilds.cache.values()) {
        const guildId = guild.id;
        const guildData = dataManager.getGuildData(guildId);
        const report = generateDailyReport(guildData, guildId);
        let channel = null;
        if (process.env.CHANNEL_ID) {
          try {
            channel = await guild.channels.fetch(process.env.CHANNEL_ID);
          } catch (e) {
            channel = null;
          }
        }
        if (!channel) {
          channel = findBestReportChannel(guild);
        }
        if (channel) {
          await channel.send({ content: report });
        }
      }
    }, {
      timezone: 'Europe/Paris'
    });
  },
}; 