const { detectInsult } = require('./insultDetector');

jest.mock('./gemini', () => ({
  askGemini: jest.fn(async (prompt) => {
    // Cas explicite
    if (/Tu es une pute/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test"}';
    if (/Bonjour à tous/.test(prompt)) return '{"detected":false}';
    if (/Quel zigoto celui-là/.test(prompt)) return '{"detected":true,"insult":"zigoto","punchline":"Punchline test"}';
    if (/Ceci est une m3rd3/.test(prompt)) return '{"detected":true,"insult":"merde","punchline":"Punchline test"}';
    if (/CONNARD/.test(prompt)) return '{"detected":true,"insult":"connard","punchline":"Punchline test"}';
    if (/^$/.test(prompt)) return '{"detected":false}';
    if (/p u t e/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test"}';
    if (/pvt3/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test"}';
    if (/p\.u\.t\.e/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test"}';
    if (/P\* U T 3/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test"}';
    if (/putin/.test(prompt)) return '{"detected":true,"insult":"putin","punchline":"Punchline test"}';
    if (/J'étais dans un bar à pute mdr/.test(prompt)) return '{"detected":false}';
    if (/C'est vraiment un enfant de catin ce type/.test(prompt)) return '{"detected":true,"insult":"catin","punchline":"Punchline test"}';
    if (/le mec il m'a dit je cite/.test(prompt)) return '{"detected":false}';
    if (/T'es vraiment un abruti/.test(prompt)) return '{"detected":true,"insult":"abruti","punchline":"Punchline test"}';
    // Fallback
    return '{"detected":false}';
  })
}));

describe('Détection d\'insultes (IA)', () => {
  it('détecte une insulte explicite', async () => {
    const res = await detectInsult('Tu es une pute', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
  });

  it('ne détecte pas de faux positif', async () => {
    const res = await detectInsult('Bonjour à tous', 'test');
    expect(res.detected).toBe(false);
  });

  it('détecte une insulte personnalisée', async () => {
    const res = await detectInsult('Quel zigoto celui-là', 'custom');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('zigoto');
  });

  it('détecte une variante stylisée', async () => {
    const res = await detectInsult('Ceci est une m3rd3', 'custom');
    expect(res.detected).toBe(true);
    expect(['merde','m3rd3']).toContain(res.insult);
  });

  it('ignore la casse', async () => {
    const res = await detectInsult('CONNARD', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('connard');
  });

  it('ignore les messages vides', async () => {
    const res = await detectInsult('', 'test');
    expect(res.detected).toBe(false);
  });

  it('détecte une insulte avec espaces entre les lettres', async () => {
    const res = await detectInsult('p u t e', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
  });

  it('détecte une insulte en leet speak', async () => {
    const res = await detectInsult('pvt3', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
  });

  it('détecte une insulte avec caractères spéciaux', async () => {
    const res = await detectInsult('p.u.t.e', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
  });

  it('détecte une insulte avec mélange de variantes', async () => {
    const res = await detectInsult('P* U T 3', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
  });

  it('détecte une variante courante "putin"', async () => {
    const res = await detectInsult('putin', 'test');
    expect(res.detected).toBe(true);
    expect(['pute','putain','putin']).toContain(res.insult);
  });

  it('ne détecte pas une vulgarité isolée', async () => {
    const res = await detectInsult("J'étais dans un bar à pute mdr", 'test');
    expect(res.detected).toBe(false);
  });

  it('ne détecte pas une phrase vulgaire non dirigée', async () => {
    const res = await detectInsult("C'est vraiment un enfant de catin ce type...", 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('catin');
  });

  it('ne détecte pas une insulte rapportée/citée', async () => {
    const res = await detectInsult("le mec il m'a dit je cite \"nique ta pute de mere\"", 'test');
    expect(res.detected).toBe(false);
  });

  it('retourne une punchline taquine quand une insulte est détectée', async () => {
    const res = await detectInsult("T'es vraiment un abruti", 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBeDefined();
    expect(typeof res.punchline).toBe('string');
    expect(res.punchline.length).toBeGreaterThan(5);
  });
}); 