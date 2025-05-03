jest.mock('cross-fetch');
const fetch = require('cross-fetch');
const fs = require('fs');
const path = require('path');
const { askGemini } = require('./gemini');

const fallbackStatePath = path.join(__dirname, '../data/gemini_fallback.json');

function cleanFallbackFile() {
  if (fs.existsSync(fallbackStatePath)) fs.unlinkSync(fallbackStatePath);
}

describe('askGemini', () => {
  beforeEach(() => {
    fetch.mockReset();
    cleanFallbackFile();
  });

  afterEach(() => {
    cleanFallbackFile();
  });

  it('retourne la réponse textuelle de Gemini', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          { content: { parts: [{ text: 'Réponse simulée Gemini' }] } },
        ],
      }),
    });
    const result = await askGemini('Test prompt');
    expect(result).toBe('Réponse simulée Gemini');
  });
});

describe('Gestion du fallback Gemini', () => {
  beforeEach(() => {
    fetch.mockReset();
    cleanFallbackFile();
  });

  afterEach(() => {
    cleanFallbackFile();
  });

  it('bascule sur la clé fallback en cas de rate limit', async () => {
    let callCount = 0;
    fetch.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { ok: false, status: 429, statusText: 'Too Many Requests', json: async () => ({}) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [ { content: { parts: [{ text: 'Réponse fallback' }] } } ] })
      };
    });
    const result = await askGemini('Test prompt');
    expect(result).toBe('Réponse fallback');
  });

  it('revient à la clé principale après 24h', async () => {
    let callCount = 0;
    fetch.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { ok: false, status: 429, statusText: 'Too Many Requests', json: async () => ({}) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [ { content: { parts: [{ text: 'Réponse fallback' }] } } ] })
      };
    });
    // Premier appel : bascule sur fallback
    await askGemini('Test prompt');
    // Simule 25h plus tard
    if (!fs.existsSync(fallbackStatePath)) throw new Error('Le fichier fallback doit exister');
    const state = JSON.parse(fs.readFileSync(fallbackStatePath, 'utf8'));
    state.fallbackSince = Date.now() - 25 * 3600 * 1000;
    fs.writeFileSync(fallbackStatePath, JSON.stringify(state));
    // Appel suivant : doit revenir à la clé principale (donc retenter la clé principale)
    callCount = 0;
    fetch.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ candidates: [ { content: { parts: [{ text: 'Réponse principale' }] } } ] })
        };
      }
      return { ok: false, status: 500, statusText: 'Erreur', json: async () => ({}) };
    });
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
}); 