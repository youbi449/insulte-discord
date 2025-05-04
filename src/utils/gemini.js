require('dotenv').config();
const { fetchFn } = require('./fetchUtil');
const fs = require('fs');
const path = require('path');
const { logError } = require('./logUtil');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FALLBACK_GEMINI_API_KEY = process.env.FALLBACK_GEMINI_API_KEY;
const FALLBACK_STATE_PATH = path.join(__dirname, '../data/gemini_fallback.json');
const FALLBACK_DURATION_MS = 24 * 3600 * 1000;

function getGeminiUrl(apiKey) {
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
}

function loadFallbackState() {
  try {
    if (fs.existsSync(FALLBACK_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(FALLBACK_STATE_PATH, 'utf8'));
    }
  } catch (e) {
    logError('Erreur lecture état fallback Gemini', e);
  }
  return { useFallback: false, fallbackSince: null };
}

function saveFallbackState(state) {
  try {
    fs.writeFileSync(FALLBACK_STATE_PATH, JSON.stringify(state));
  } catch (e) {
    logError('Erreur sauvegarde état fallback Gemini', e);
  }
}

async function askGemini(prompt) {
  let state = loadFallbackState();
  let useFallback = state.useFallback;
  let now = Date.now();

  // Si fallback actif, mais plus de 24h écoulées, on retente la clé principale
  if (useFallback && state.fallbackSince && now - state.fallbackSince > FALLBACK_DURATION_MS) {
    useFallback = false;
    state = { useFallback: false, fallbackSince: null };
    saveFallbackState(state);
  }

  // Choix de la clé
  let apiKey = useFallback && FALLBACK_GEMINI_API_KEY ? FALLBACK_GEMINI_API_KEY : GEMINI_API_KEY;
  let url = getGeminiUrl(apiKey);

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  let response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Si rate limit et on n'est pas déjà en fallback, on persiste l'état et on retente
  if (response.status === 429 && !useFallback) {
    state = { useFallback: true, fallbackSince: Date.now() };
    saveFallbackState(state);
    // On retente la requête
    response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  if (!response.ok) {
    throw new Error(`Erreur Gemini: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // On retourne la première réponse textuelle trouvée
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

module.exports = { askGemini }; 