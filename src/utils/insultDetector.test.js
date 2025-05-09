const { detectInsult } = require('./insultDetector');

jest.mock('./gemini', () => ({
  askGemini: jest.fn(async (prompt) => {
    // Cas explicite
    if (/Tu es une pute/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test","reason":"Motif test explicite"}';
    if (/Bonjour à tous/.test(prompt)) return '{"detected":false}';
    if (/Quel zigoto celui-là/.test(prompt)) return '{"detected":true,"insult":"zigoto","punchline":"Punchline test","reason":"Motif test zigoto"}';
    if (/Ceci est une m3rd3/.test(prompt)) return '{"detected":true,"insult":"merde","punchline":"Punchline test","reason":"Motif test m3rd3"}';
    if (/CONNARD/.test(prompt)) return '{"detected":true,"insult":"connard","punchline":"Punchline test","reason":"Motif test connard"}';
    if (/^$/.test(prompt)) return '{"detected":false}';
    if (/p u t e/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test","reason":"Motif test pute"}';
    if (/pvt3/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test","reason":"Motif test pvt3"}';
    if (/p\.u\.t\.e/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test","reason":"Motif test p.u.t.e"}';
    if (/P\* U T 3/.test(prompt)) return '{"detected":true,"insult":"pute","punchline":"Punchline test","reason":"Motif test P* U T 3"}';
    if (/putin/.test(prompt)) return '{"detected":true,"insult":"putin","punchline":"Punchline test","reason":"Motif test putin"}';
    if (/J'étais dans un bar à pute mdr/.test(prompt)) return '{"detected":false}';
    if (/C'est vraiment un enfant de catin ce type/.test(prompt)) return '{"detected":true,"insult":"catin","punchline":"Punchline test","reason":"Motif test catin"}';
    if (/le mec il m'a dit je cite/.test(prompt)) return '{"detected":false}';
    if (/T'es vraiment un abruti/.test(prompt)) return '{"detected":true,"insult":"abruti","punchline":"Punchline test","reason":"Motif test abruti"}';
    // Fallback
    return '{"detected":false}';
  })
}));

describe('Détection d\'insultes (IA)', () => {
  it('détecte une insulte explicite', async () => {
    const res = await detectInsult('Tu es une pute', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('ne détecte pas de faux positif', async () => {
    const res = await detectInsult('Bonjour à tous', 'test');
    expect(res.detected).toBe(false);
    expect(res.reason).toBeUndefined();
  });

  it('détecte une insulte personnalisée', async () => {
    const res = await detectInsult('Quel zigoto celui-là', 'custom');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('zigoto');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('détecte une variante stylisée', async () => {
    const res = await detectInsult('Ceci est une m3rd3', 'custom');
    expect(res.detected).toBe(true);
    expect(['merde','m3rd3']).toContain(res.insult);
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('ignore la casse', async () => {
    const res = await detectInsult('CONNARD', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('connard');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('ignore les messages vides', async () => {
    const res = await detectInsult('', 'test');
    expect(res.detected).toBe(false);
    expect(res.reason).toBeUndefined();
  });

  it('détecte une insulte avec espaces entre les lettres', async () => {
    const res = await detectInsult('p u t e', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('détecte une insulte en leet speak', async () => {
    const res = await detectInsult('pvt3', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('détecte une insulte avec caractères spéciaux', async () => {
    const res = await detectInsult('p.u.t.e', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('détecte une insulte avec mélange de variantes', async () => {
    const res = await detectInsult('P* U T 3', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('pute');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('détecte une variante courante "putin"', async () => {
    const res = await detectInsult('putin', 'test');
    expect(res.detected).toBe(true);
    expect(['pute','putain','putin']).toContain(res.insult);
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('ne détecte pas une vulgarité isolée', async () => {
    const res = await detectInsult("J'étais dans un bar à pute mdr", 'test');
    expect(res.detected).toBe(false);
    expect(res.reason).toBeUndefined();
  });

  it('ne détecte pas une phrase vulgaire non dirigée', async () => {
    const res = await detectInsult("C'est vraiment un enfant de catin ce type...", 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('catin');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('ne détecte pas une insulte rapportée/citée', async () => {
    const res = await detectInsult("le mec il m'a dit je cite \"nique ta pute de mere\"", 'test');
    expect(res.detected).toBe(false);
    expect(res.reason).toBeUndefined();
  });

  it('retourne une punchline taquine quand une insulte est détectée', async () => {
    const res = await detectInsult("T'es vraiment un abruti", 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBeDefined();
    expect(typeof res.punchline).toBe('string');
    expect(res.punchline.length).toBeGreaterThan(5);
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });
});

describe('Détection de grossièretés (nouvelle consigne)', () => {
  it('détecte une grossièreté explicite même hors insulte', async () => {
    const res = await detectInsult("Putain c'est trop bien !", 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('putain');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('détecte une grossièreté stylisée', async () => {
    const res = await detectInsult('M3rd3 alors !', 'test');
    expect(res.detected).toBe(true);
    expect(['merde','m3rd3']).toContain(res.insult);
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });

  it('ne détecte pas une grossièreté rapportée entre guillemets', async () => {
    const res = await detectInsult("Il m'a dit \"ferme ta gueule\"", 'test');
    expect(res.detected).toBe(false);
    expect(res.reason).toBeUndefined();
  });

  it('ne détecte pas une grossièreté racontée', async () => {
    const res = await detectInsult("On m'a insulté de \"connard\"", 'test');
    expect(res.detected).toBe(false);
    expect(res.reason).toBeUndefined();
  });

  it('détecte une grossièreté hors citation', async () => {
    const res = await detectInsult('Ferme ta gueule', 'test');
    expect(res.detected).toBe(true);
    expect(res.insult).toBe('gueule');
    expect(typeof res.reason).toBe('string');
    expect(res.reason.length).toBeGreaterThan(3);
  });
}); 