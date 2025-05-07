const { generateDailyReport } = require('../utils/reportUtils');
const dataManager = require('../utils/dataManager');
const ready = require('./ready');

// Mock du channel Discord
function createMockChannel() {
  return {
    send: jest.fn(async (msg) => msg),
    isTextBased: () => true,
    name: 'noinsultchallenge',
    viewable: true,
    permissionsFor: () => ({ has: () => true }),
  };
}

// Mock du guild Discord
function createMockGuild(id = 'guild1') {
  const channel = createMockChannel();
  return {
    id,
    channels: {
      cache: [channel],
      find: (fn) => [channel].find(fn),
    },
    members: { me: {} },
  };
}

describe('ready event', () => {
  it('envoie un message de récapitulatif sur le bon channel', async () => {
    // Prépare un mock client Discord
    const mockGuild = createMockGuild();
    const mockClient = {
      user: { tag: 'bot#0001', setPresence: jest.fn() },
      guilds: { cache: [mockGuild], values: () => [mockGuild] },
    };
    // Mock dataManager et reportUtils
    jest.spyOn(dataManager, 'getGuildData').mockReturnValue({ currentStreak: 2, lastReset: new Date().toISOString(), offenses: [], customInsults: [], recordStreak: 2, lastOffender: null, lastMessage: null, lastCheck: new Date().toISOString() });
    jest.spyOn(require('../utils/fetchUtil'), 'findBestReportChannel').mockReturnValue(mockGuild.channels.cache[0]);
    // Mock cron pour exécuter immédiatement la tâche
    jest.spyOn(require('node-cron'), 'schedule').mockImplementation((_, fn) => { fn(); });
    // Exécute l'event
    ready.execute(mockClient);
    // Vérifie que le message a bien été envoyé
    expect(mockGuild.channels.cache[0].send).toHaveBeenCalled();
    const call = mockGuild.channels.cache[0].send.mock.calls[0][0];
    expect(call.content).toMatch(/jour/);
  });
}); 