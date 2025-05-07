// Script pour déployer les commandes slash sur Discord
require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { logError } = require("./utils/logUtil");

// Récupération des variables d'environnement
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // Optionnel pour tester sur un serveur spécifique

// Vérification des variables requises
if (!token || !clientId) {
  logError(
    "Variables d'environnement manquantes. Assurez-vous d'avoir un fichier .env avec DISCORD_TOKEN et CLIENT_ID."
  );
  process.exit(1);
}

const commands = [];
// Récupération des fichiers de commandes
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

// Chargement des commandes
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(
      `⚠️ La commande ${filePath} ne contient pas les propriétés "data" ou "execute" requises.`
    );
  }
}

// Création d'une instance REST pour l'API Discord
const rest = new REST({ version: "10" }).setToken(token);

// Fonction pour déployer les commandes
async function deployCommands() {
  try {
    console.log(`🔄 Déploiement de ${commands.length} commandes slash...`);

    let data;

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout après 10 secondes lors de l\'appel à rest.put')), 10000));
    try {
      if (guildId) {
        data = await Promise.race([
          rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
          ),
          timeout
        ]);
        console.log(`✅ Commandes déployées sur le serveur ${guildId}`);
      } else {
        data = await Promise.race([
          rest.put(Routes.applicationCommands(clientId), {
            body: commands,
          }),
          timeout
        ]);
        console.log(
          "✅ Commandes déployées globalement (peut prendre jusqu'à 1h pour apparaître)"
        );
      }
    } catch (err) {
      logError("[DEBUG] Erreur lors de l'appel à rest.put", err);
      throw err;
    }

    console.log(`✅ ${data.length} commande(s) enregistrées avec succès!`);

    // Liste des commandes déployées
    console.log("\n📋 Liste des commandes déployées:");
    for (const cmd of commands) {
      console.log(`- /${cmd.name} : ${cmd.description}`);
    }
  } catch (error) {
    logError("Erreur lors du déploiement des commandes", error);
  }
}

deployCommands();
