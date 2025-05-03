// Bot Discord "Zéro Insulte"
// Fichier principal

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { logError } = require('./utils/logUtil');

// Création du client Discord avec les intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Chargement des commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set la commande dans la collection
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`⚠️ La commande à ${filePath} manque la propriété "data" ou "execute" requise.`);
  }
}

// Chargement des événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Gestionnaire des commandes slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logError(`Aucune commande correspondant à ${interaction.commandName} n'a été trouvée.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logError(`Erreur lors de l'exécution de la commande ${interaction.commandName}`, error);
    
    const replyOptions = {
      content: '❌ Une erreur s\'est produite lors de l\'exécution de cette commande!',
      ephemeral: true
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  }
});

// Gestion des erreurs non interceptées
process.on('unhandledRejection', error => {
  logError('Erreur non interceptée', error);
});

// Connexion à Discord avec le token
client.login(process.env.DISCORD_TOKEN)
  .catch(error => {
    logError('Erreur de connexion à Discord', error);
    process.exit(1);
  }); 