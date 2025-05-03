// Fonction de normalisation avancée pour la détection d'insultes
function normalizeText(str) {
  if (!str || typeof str !== 'string') return '';
  // Leet speak mapping
  const leetMap = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
    '@': 'a',
    '$': 's',
    '€': 'e',
    '|': 'i',
    '2': 'z',
    '9': 'g',
    '6': 'g',
    'û': 'u',
    '*': '',
    'v': 'u',
  };
  // Minuscule
  let txt = str.toLowerCase();
  // Remplacement leet
  txt = txt.replace(/[0134578@$€|269û*v]/g, c => leetMap[c] || '');
  // Suppression caractères spéciaux (sauf lettres)
  txt = txt.normalize('NFD').replace(/[^a-z]/g, '');
  return txt;
}

module.exports = { normalizeText }; 