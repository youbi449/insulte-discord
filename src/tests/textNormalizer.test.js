const { normalizeText } = require('../utils/textNormalizer');

describe('normalizeText', () => {
  it('normalise une insulte stylisée avec espaces et caractères spéciaux', () => {
    expect(normalizeText('P* U T 3')).toBe('pute');
    expect(normalizeText('p.u.t.e')).toBe('pute');
    expect(normalizeText('p u t e')).toBe('pute');
    expect(normalizeText('pvt3')).toBe('pute');
    expect(normalizeText('PUTE')).toBe('pute');
    expect(normalizeText('pûté')).toBe('pute');
    expect(normalizeText('p*ut3')).toBe('pute');
  });

  it('normalise une phrase sans insulte', () => {
    expect(normalizeText('Bonjour à tous !')).toBe('bonjouratous');
  });

  it('gère le leet speak', () => {
    expect(normalizeText('m3rd3')).toBe('merde');
    expect(normalizeText('c0nn4rd')).toBe('connard');
    expect(normalizeText('s4l0p3')).toBe('salope');
  });

  it('retourne une chaîne vide pour une entrée vide', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
}); 