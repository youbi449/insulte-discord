jest.mock('cross-fetch');
const fetch = require('cross-fetch');
const fs = require('fs');
const path = require('path');
const { askGemini } = require('./gemini');

const fallbackStatePath = path.join(__dirname, '../data/gemini_fallback.json');

function cleanFallbackFile() {
  if (fs.existsSync(fallbackStatePath)) fs.unlinkSync(fallbackStatePath);
}

// Helpers DRY
function mockGeminiResponse(text) {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        { content: { parts: [{ text }] } },
      ],
    }),
  });
}

function mockGeminiRateLimitThenFallback(fallbackText = 'Réponse fallback') {
  let callCount = 0;
  fetch.mockImplementation(async () => {
    callCount++;
    if (callCount === 1) {
      return { ok: false, status: 429, statusText: 'Too Many Requests', json: async () => ({}) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ candidates: [ { content: { parts: [{ text: fallbackText }] } } ] })
    };
  });
}

function mockGeminiMainThenError(mainText = 'Réponse principale') {
  let callCount = 0;
  fetch.mockImplementation(async () => {
    callCount++;
    if (callCount === 1) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [ { content: { parts: [{ text: mainText }] } } ] })
      };
    }
    return { ok: false, status: 500, statusText: 'Erreur', json: async () => ({}) };
  });
}

// DRY: regrouper beforeEach/afterEach
beforeEach(() => {
  fetch.mockReset();
  cleanFallbackFile();
});
afterEach(() => {
  cleanFallbackFile();
});

describe('askGemini', () => {
  it('retourne la réponse textuelle de Gemini', async () => {
    mockGeminiResponse('Réponse simulée Gemini');
    const result = await askGemini('Test prompt');
    expect(result).toBe('Réponse simulée Gemini');
  });
});

describe('Gestion du fallback Gemini', () => {
  it('bascule sur la clé fallback en cas de rate limit', async () => {
    mockGeminiRateLimitThenFallback('Réponse fallback');
    const result = await askGemini('Test prompt');
    expect(result).toBe('Réponse fallback');
  });

  it('revient à la clé principale après 24h', async () => {
    mockGeminiRateLimitThenFallback('Réponse fallback');
    // Premier appel : bascule sur fallback
    await askGemini('Test prompt');
    // Simule 25h plus tard
    if (!fs.existsSync(fallbackStatePath)) throw new Error('Le fichier fallback doit exister');
    const state = JSON.parse(fs.readFileSync(fallbackStatePath, 'utf8'));
    state.fallbackSince = Date.now() - 25 * 3600 * 1000;
    fs.writeFileSync(fallbackStatePath, JSON.stringify(state));
    // Appel suivant : doit revenir à la clé principale
    mockGeminiMainThenError('Réponse principale');
    const result = await askGemini('Test prompt 2');
    expect(result).toBe('Réponse principale');
  });

  it('persiste l\'état du fallback', async () => {
    fetch.mockImplementation(async () => ({ ok: false, status: 429, statusText: 'Too Many Requests', json: async () => ({}) }));
    try { await askGemini('Test prompt'); } catch {}
    expect(fs.existsSync(fallbackStatePath)).toBe(true);
    const state = JSON.parse(fs.readFileSync(fallbackStatePath, 'utf8'));
    expect(state.useFallback).toBe(true);
  });

  it('crée le fichier fallback lors d\'un 429 (non-régression)', async () => {
    fetch.mockImplementation(async () => ({ ok: false, status: 429, statusText: 'Too Many Requests', json: async () => ({}) }));
    try { await askGemini('Test prompt'); } catch {}
    expect(fs.existsSync(fallbackStatePath)).toBe(true);
  });
}); 