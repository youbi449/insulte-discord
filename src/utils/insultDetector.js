const { askGemini } = require("./gemini");
const { normalizeText } = require("./textNormalizer");
const { logError } = require("./logUtil");

/**
 * Génère le prompt pour la détection d'insulte contextuelle et la génération d'une punchline taquine
 * @param {string} message
 * @param {string} normalized
 * @returns {string}
 */
function buildInsultPrompt(message, normalized) {
  return `Analyse le message suivant et réponds uniquement par un JSON de la forme {\"detected\":true/false,\"insult\":\"mot\",\"punchline\":\"phrase\",\"reason\":\"motif\"} SI ET SEULEMENT SI le message contient une insulte ou un mot grossier EXPLICITE, clairement reconnue comme tel dans la langue française (ex : "pute", "connard", "nique ta mère", "merde", "salope", etc.), même stylisé ou dissimulé, mais PAS les mots neutres, acronymes, noms propres, ou termes ambigus qui ne sont pas des insultes ou grossièretés connues. Ignore tout ce qui n'est pas clairement une insulte ou une grossièreté. Ne détecte pas les grossièretés rapportées, citées ou racontées (par exemple entre guillemets, ou dans une histoire : \"on m'a dit \"ferme ta gueule\"\", \"il a écrit \"sale con\"\", etc.). Si aucune grossièreté n'est détectée, réponds {\"detected\":false}. Si une grossièreté est détectée, génère aussi une punchline TRASH, très moqueuse, qui se fout explicitement de la personne responsable, de façon cinglante, drôle, mais sans jamais tomber dans l'illégalité (pas de menaces, pas de propos haineux, pas de discrimination, pas de doxxing, etc.). La punchline doit être directe, piquante, et faire comprendre à l'auteur qu'il a vraiment abusé. Donne TOUJOURS le champ 'reason' qui explique en une phrase pourquoi ce message est considéré comme une insulte (ex : \"Le message contient une insulte explicite adressée à quelqu'un\").\nExemples :\n- Message : 'nique ta mère' => {\"detected\":true,\"insult\":\"nique ta mère\",\"punchline\":\"T'as vraiment le QI d'une huître avariée pour sortir ça !\",\"reason\":\"Le message contient une insulte très explicite.\"}\n- Message : 'putain c'est trop bien !' => {\"detected\":true,\"insult\":\"putain\",\"punchline\":\"On sent que t'as pas inventé l'eau chaude, champion !\",\"reason\":\"Le message utilise un terme vulgaire.\"}\n- Message : 'ferme ta gueule' => {\"detected\":true,\"insult\":\"gueule\",\"punchline\":\"Ferme-la pour de vrai, ça nous fera des vacances !\",\"reason\":\"Le message ordonne de se taire de façon insultante.\"}\n- Message : 'Y2ARMAGI' => {\"detected\":false}\n- Message : 'NoInsultChallenge' => {\"detected\":false}\n- Message : 'APP' => {\"detected\":false}\nMessage original : "${message}". Version normalisée : "${normalized}"`;
}

/**
 * Détecte si un message contient une insulte (via l'IA Gemini) et génère une punchline taquine
 * @param {string} message - Le message à analyser.
 * @returns {Promise<{detected: boolean, insult?: string, punchline?: string, error?: string}>} - Résultat de la détection et punchline.
 */
async function detectInsult(message, guildId) {
  if (!message || typeof message !== "string") {
    return { detected: false };
  }

  // Ajout de la version normalisée dans le prompt pour aider l'IA
  const normalized = normalizeText(message);
  const prompt = buildInsultPrompt(message, normalized);

  // LOGS DEBUG
  console.log("--- Détection d'insulte ---");
  console.log("Message original :", message);
  console.log("Version normalisée :", normalized);
  console.log("Prompt envoyé à l'IA :", prompt);

  try {
    const response = await askGemini(prompt, {
      temperature: 0.1,
      max_tokens: 100,
    });
    console.log("Réponse brute IA :", response);
    // Extraction du JSON de la réponse
    const match = response.match(/\{.*\}/s);
    if (match) {
      const result = JSON.parse(match[0]);
      console.log("Résultat final :", result);
      // On s'assure que le champ reason est toujours présent si detected true
      if (result.detected && !result.reason) {
        result.reason = "Motif non précisé par l'IA.";
      }
      return result;
    }
    console.log("Aucun JSON détecté dans la réponse IA.");
    return { detected: false };
  } catch (e) {
    // En cas d'erreur API, on ne bloque pas l'app
    logError("Erreur lors de la détection IA", e);
    console.log("Erreur lors de la détection IA :", e.message);
    return { detected: false, error: e.message };
  }
}

module.exports = {
  detectInsult,
  buildInsultPrompt,
};
