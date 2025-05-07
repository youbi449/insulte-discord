require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const CHANNEL_ID = process.env.CHANNEL_ID;
const MESSAGE = 'Ceci est un test d\'envoi automatique !';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) {
    console.error('Channel introuvable !');
    process.exit(1);
  }
  await channel.send(MESSAGE);
  console.log('Message envoyé !');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN); 