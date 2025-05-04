const { getMostInsulted, updateGuildData, getMostInsulting, resetPodium } = require('./dataManager');
const { generateDailyReport } = require('./reportUtils');

describe('getMostInsulting', () => {
  const guildId = 'test-guild-insulting';
  beforeEach(() => {
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

  it('retourne le top 2 des plus insultants', () => {
    const podium = getMostInsulting(guildId, 2);
    expect(podium.length).toBe(2);
    expect(podium[0]).toEqual({ insulter: 'Alice', count: 3 });
    expect(podium[1]).toEqual({ insulter: 'Bob', count: 2 });
  });

  it('retourne un tableau vide si aucune offense', () => {
    updateGuildData(guildId, { offenses: [] });
    const podium = getMostInsulting(guildId, 3);
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

  it('affiche le message positif si personne insultant', () => {
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
    expect(msg).toMatch(/Personne n'a encore été insultant/);
  });
});

describe('resetPodium', () => {
  const guildId = 'test-reset-podium';
  beforeEach(() => {
    updateGuildData(guildId, {
      offenses: [
        { offender: 'Alice', message: 'insulte1' },
        { offender: 'Bob', message: 'insulte2' }
      ],
      currentStreak: 5,
      recordStreak: 10
    });
  });
  it('vide le tableau offenses sans toucher au streak', () => {
    const before = updateGuildData(guildId, {});
    expect(before.offenses.length).toBe(2);
    expect(before.currentStreak).toBe(5);
    resetPodium(guildId);
    const after = updateGuildData(guildId, {});
    expect(after.offenses).toEqual([]);
    expect(after.currentStreak).toBe(5);
    expect(after.recordStreak).toBe(10);
  });
});

it('retourne le top 3 des plus insultants', () => {
  const guildId = 'test-guild';
  updateGuildData(guildId, { offenses: [
    { offender: 'UserA' },
    { offender: 'UserB' },
    { offender: 'UserA' },
    { offender: 'UserC' },
    { offender: 'UserA' },
    { offender: 'UserB' },
  ] });
  const podium = require('./dataManager').getMostInsulting(guildId, 3);
  expect(podium.length).toBe(3);
  expect(podium[0].insulter).toBe('UserA');
  expect(podium[0].count).toBe(3);
  expect(podium[1].insulter).toBe('UserB');
  expect(podium[1].count).toBe(2);
  expect(podium[2].insulter).toBe('UserC');
  expect(podium[2].count).toBe(1);
}); 