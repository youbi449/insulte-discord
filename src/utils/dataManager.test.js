const { getMostInsulted, updateGuildData } = require('./dataManager');
const { generateDailyReport } = require('./reportUtils');

describe('getMostInsulted', () => {
  const guildId = 'test-guild';
  beforeEach(() => {
    // On injecte des offenses fictives
    updateGuildData(guildId, {
      offenses: [
        { offender: 'Alice', message: 'insulte1' },
        { offender: 'Bob', message: 'insulte2' },
        { offender: 'Alice', message: 'insulte3' },
        { offender: 'Charlie', message: 'insulte4' },
        { offender: 'Bob', message: 'insulte5' },
        { offender: 'Alice', message: 'insulte6' },
      ]
    });
  });

  it('retourne le top 3 des plus insultés', () => {
    const podium = getMostInsulted(guildId, 3);
    expect(podium.length).toBe(3);
    expect(podium[0]).toEqual({ offender: 'Alice', count: 3 });
    expect(podium[1]).toEqual({ offender: 'Bob', count: 2 });
    expect(podium[2]).toEqual({ offender: 'Charlie', count: 1 });
  });

  it('retourne moins de 3 si moins d\'utilisateurs', () => {
    updateGuildData(guildId, {
      offenses: [
        { offender: 'Alice', message: 'insulte1' }
      ]
    });
    const podium = getMostInsulted(guildId, 3);
    expect(podium.length).toBe(1);
    expect(podium[0]).toEqual({ offender: 'Alice', count: 1 });
  });

  it('retourne un tableau vide si aucune offense', () => {
    updateGuildData(guildId, { offenses: [] });
    const podium = getMostInsulted(guildId, 3);
    expect(podium).toEqual([]);
  });
});

describe('generateDailyReport', () => {
  const guildId = 'test-guild';
  it('affiche 0 jour sans insulte avec dernier reset', () => {
    const data = {
      currentStreak: 0,
      lastOffender: 'Bob',
      lastReset: new Date('2024-01-01T00:00:00Z').toISOString(),
      lastMessage: 'insulte',
      offenses: [{ offender: 'Bob', message: 'insulte' }],
      customInsults: [],
      recordStreak: 2,
      lastCheck: new Date().toISOString()
    };
    const msg = generateDailyReport(data, guildId);
    expect(msg).toMatch(/0 jour/);
    expect(msg).toMatch(/Dernier reset/);
    expect(msg).toMatch(/Bob/);
    expect(msg).toMatch(/insulte/);
  });

  it('affiche le streak et le podium', () => {
    updateGuildData(guildId, {
      offenses: [
        { offender: 'Alice', message: 'insulte1' },
        { offender: 'Bob', message: 'insulte2' },
        { offender: 'Alice', message: 'insulte3' }
      ]
    });
    const data = {
      currentStreak: 3,
      lastOffender: null,
      lastReset: new Date().toISOString(),
      lastMessage: null,
      offenses: [
        { offender: 'Alice', message: 'insulte1' },
        { offender: 'Bob', message: 'insulte2' },
        { offender: 'Alice', message: 'insulte3' }
      ],
      customInsults: [],
      recordStreak: 3,
      lastCheck: new Date().toISOString()
    };
    const msg = generateDailyReport(data, guildId);
    expect(msg).toMatch(/3 jours/);
    expect(msg).toMatch(/Alice/);
    expect(msg).toMatch(/Bob/);
    expect(msg).toMatch(/podium/i);
  });

  it('affiche le message positif si personne insulté', () => {
    updateGuildData(guildId, { offenses: [] });
    const data = {
      currentStreak: 2,
      lastOffender: null,
      lastReset: new Date().toISOString(),
      lastMessage: null,
      offenses: [],
      customInsults: [],
      recordStreak: 2,
      lastCheck: new Date().toISOString()
    };
    const msg = generateDailyReport(data, guildId);
    expect(msg).toMatch(/Personne n'a encore été insulté/);
  });
}); 