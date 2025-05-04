const fs = require('fs');
const path = require('path');
const { logError } = require('./logUtil');

// Chemin vers le dossier de données
const DATA_FOLDER = path.join(__dirname, '..', 'data');
const DEFAULT_DATA_FILE = path.join(DATA_FOLDER, 'guilds.json');

// Structure de données par défaut pour un nouveau serveur
const getDefaultGuildData = () => ({
  currentStreak: 0,
  recordStreak: 0,
  lastReset: new Date().toISOString(),
  lastOffender: null,
  lastMessage: null,
  lastCheck: new Date().toISOString(),
  customInsults: [],
  offenses: []
});

// S'assurer que le dossier de données existe
const ensureDataFolder = () => {
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
  }
};

// Charger les données des serveurs
const loadData = () => {
  ensureDataFolder();
  
  if (!fs.existsSync(DEFAULT_DATA_FILE)) {
    // Créer un fichier vide si n'existe pas
    fs.writeFileSync(DEFAULT_DATA_FILE, JSON.stringify({}, null, 2));
    return {};
  }

  try {
    const data = fs.readFileSync(DEFAULT_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logError('Erreur lors du chargement des données', error);
    return {};
  }
};

// Sauvegarder les données
const saveData = (data) => {
  ensureDataFolder();
  
  try {
    console.log('Sauvegarde des données dans guilds.json', JSON.stringify(data, null, 2));
    fs.writeFileSync(DEFAULT_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    logError('Erreur lors de la sauvegarde des données', error);
  }
};

// Obtenir les données d'un serveur spécifique
const getGuildData = (guildId) => {
  const data = loadData();
  
  if (!data[guildId]) {
    data[guildId] = getDefaultGuildData();
    saveData(data);
  }
  
  return data[guildId];
};

// Mettre à jour les données d'un serveur
const updateGuildData = (guildId, updatedData) => {
  const data = loadData();
  
  data[guildId] = {
    ...getGuildData(guildId),
    ...updatedData
  };
  
  saveData(data);
  return data[guildId];
};

// Réinitialiser le compteur pour un serveur
const resetStreak = (guildId, offender, message) => {
  const guildData = getGuildData(guildId);
  
  // Si le streak actuel est supérieur au record, on met à jour le record
  const newRecord = guildData.currentStreak > guildData.recordStreak 
    ? guildData.currentStreak 
    : guildData.recordStreak;
  
  // Ajout de l'infraction à l'historique
  const newOffense = {
    date: new Date().toISOString(),
    offender,
    message: message ? message.substring(0, 100) : null
  };
  const offenses = Array.isArray(guildData.offenses) ? [...guildData.offenses, newOffense] : [newOffense];
  
  const updatedData = {
    currentStreak: 0,
    recordStreak: newRecord,
    lastReset: new Date().toISOString(),
    lastOffender: offender,
    lastMessage: message ? message.substring(0, 100) : null,
    offenses
  };
  
  return updateGuildData(guildId, updatedData);
};

// Ajouter une journée au streak
const incrementStreak = (guildId) => {
  const guildData = getGuildData(guildId);
  
  const updatedData = {
    currentStreak: guildData.currentStreak + 1,
    lastCheck: new Date().toISOString()
  };
  
  return updateGuildData(guildId, updatedData);
};

// Vérifier si le compteur doit être incrémenté (nouveau jour)
const checkDailyIncrement = (guildId) => {
  const guildData = getGuildData(guildId);
  const lastCheck = new Date(guildData.lastCheck);
  const now = new Date();
  
  // Si on est un jour différent de la dernière vérification
  if (lastCheck.toDateString() !== now.toDateString()) {
    return incrementStreak(guildId);
  }
  
  return guildData;
};

// Gérer la liste d'insultes personnalisée
const addCustomInsult = (guildId, insult) => {
  const guildData = getGuildData(guildId);
  
  // Vérifier si l'insulte existe déjà
  if (!guildData.customInsults.includes(insult)) {
    const updatedData = {
      customInsults: [...guildData.customInsults, insult]
    };
    
    return updateGuildData(guildId, updatedData);
  }
  
  return guildData;
};

const removeCustomInsult = (guildId, insult) => {
  const guildData = getGuildData(guildId);
  
  const updatedData = {
    customInsults: guildData.customInsults.filter(i => i !== insult)
  };
  
  return updateGuildData(guildId, updatedData);
};

// Retourne le podium des utilisateurs les plus insultants pour un serveur
/**
 * Renvoie un tableau trié des utilisateurs les plus insultants (du plus au moins insultant)
 * @param {string} guildId - L'ID du serveur
 * @param {number} [limit=3] - Nombre d'utilisateurs à retourner (par défaut 3)
 * @returns {Array<{insulter: string, count: number}>}
 */
function getMostInsulting(guildId, limit = 3) {
  const guildData = getGuildData(guildId);
  if (!guildData || !Array.isArray(guildData.offenses)) return [];
  const countByInsulter = {};
  for (const offense of guildData.offenses) {
    if (!offense.offender) continue;
    countByInsulter[offense.offender] = (countByInsulter[offense.offender] || 0) + 1;
  }
  // Transformer en tableau et trier
  const sorted = Object.entries(countByInsulter)
    .map(([insulter, count]) => ({ insulter, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return sorted;
}

/**
 * Réinitialise uniquement le podium (offenses) pour un serveur
 * @param {string} guildId
 * @returns {object} Les données mises à jour
 */
function resetPodium(guildId) {
  return updateGuildData(guildId, { offenses: [] });
}

module.exports = {
  getGuildData,
  updateGuildData,
  resetStreak,
  incrementStreak,
  checkDailyIncrement,
  addCustomInsult,
  removeCustomInsult,
  getMostInsulting,
  resetPodium,
}; 