const { askGemini } = require('./gemini');
const { normalizeText } = require('./textNormalizer');
const { logError } = require('./logUtil');

/**
 * Génère le prompt pour la détection d'insulte contextuelle et la génération d'une punchline taquine
 * @param {string} message
 * @param {string} normalized
 * @returns {string}
 */
function buildInsultPrompt(message, normalized) {
  return `Analyse le message suivant et réponds uniquement par un JSON de la forme {\"detected\":true/false,\"insult\":\"mot\",\"punchline\":\"phrase\"} si une insulte (même dissimulée ou stylisée) est présente ET dirigée contre une personne (attaque, moquerie, dénigrement, etc.), sinon {\"detected\":false}. Ne détecte pas les vulgarités isolées, les mots grossiers qui ne sont pas des attaques, NI les insultes rapportées, citées ou racontées (ex : \"il m'a dit nique ta mère\", \"on m'a insulté de...\", \"il a écrit \"sale con\"\"). Détecte uniquement si l'utilisateur insulte directement quelqu'un dans son message. Si une insulte est détectée, génère aussi une punchline taquine, bienveillante et jamais méchante, qui s'adresse à l'auteur du message et fait référence à son message, sur le ton de la taquinerie bon enfant (pas de violence, pas de méchanceté, pas de vulgarité, pas d'humiliation, jamais de mention de famille, de physique ou de sujets sensibles).\nExemples :\n- Message : 'il m'a dit \"nique ta mère\"' => {\"detected\":false}\n- Message : 'nique ta mère' => {\"detected\":true,\"insult\":\"nique ta mère\",\"punchline\":\"On sent que t'avais besoin d'un câlin aujourd'hui !\"}\n- Message : 'j'étais dans un bar à pute' => {\"detected\":false}\n- Message : 't'es un connard' => {\"detected\":true,\"insult\":\"connard\",\"punchline\":\"Heureusement que t'es plus sympa en vrai, hein ?\"}\nMessage original : "${message}". Version normalisée : "${normalized}"`;
}

/**
 * Détecte si un message contient une insulte (via l'IA Gemini) et génère une punchline taquine
 * @param {string} message - Le message à analyser.
 * @returns {Promise<{detected: boolean, insult?: string, punchline?: string, error?: string}>} - Résultat de la détection et punchline.
 */
async function detectInsult(message, guildId) {
  if (!message || typeof message !== 'string') {
    return { detected: false };
  }

  // Ajout de la version normalisée dans le prompt pour aider l'IA
  const normalized = normalizeText(message);
  const prompt = buildInsultPrompt(message, normalized);

  // LOGS DEBUG
  console.log('--- Détection d\'insulte ---');
  console.log('Message original :', message);
  console.log('Version normalisée :', normalized);
  console.log('Prompt envoyé à l\'IA :', prompt);

  try {
    const response = await askGemini(prompt, { temperature: 0.1, max_tokens: 100 });
    console.log('Réponse brute IA :', response);
    // Extraction du JSON de la réponse
    const match = response.match(/\{.*\}/s);
    if (match) {
      const result = JSON.parse(match[0]);
      console.log('Résultat final :', result);
      return result;
    }
    console.log('Aucun JSON détecté dans la réponse IA.');
    return { detected: false };
  } catch (e) {
    // En cas d'erreur API, on ne bloque pas l'app
    logError('Erreur lors de la détection IA', e);
    console.log('Erreur lors de la détection IA :', e.message);
    return { detected: false, error: e.message };
  }
}

module.exports = {
  detectInsult,
  buildInsultPrompt,
};
