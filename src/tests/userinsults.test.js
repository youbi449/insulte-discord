const { execute } = require('../commands/userinsults');
const { getGuildData } = require('../utils/dataManager');

jest.mock('../../utils/dataManager');

describe('Commande /userinsults', () => {
  let interaction;
  beforeEach(() => {
    interaction = {
      options: {
        getUser: jest.fn(),
      },
      guild: { id: 'guild1' },
      reply: jest.fn(),
    };
  });

  it('affiche les insultes pour un utilisateur', async () => {
    const user = { id: 'user1', tag: 'User#0001' };
    interaction.options.getUser.mockReturnValue(user);
    getGuildData.mockReturnValue({
      offenses: [
        { offender: 'user1', date: '2024-06-01T12:00:00Z', message: 'insulte 1' },
        { offender: 'user2', date: '2024-06-02T12:00:00Z', message: 'autre' },
        { offender: 'user1', date: '2024-06-03T12:00:00Z', message: 'insulte 2' },
      ]
    });
    await execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('insulte 1'),
      ephemeral: true
    }));
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('insulte 2'),
      ephemeral: true
    }));
  });

  it('affiche un message si aucune insulte', async () => {
    const user = { id: 'user3', tag: 'User#0003' };
    interaction.options.getUser.mockReturnValue(user);
    getGuildData.mockReturnValue({ offenses: [] });
    await execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('Aucune insulte détectée'),
      ephemeral: true
    }));
  });

  it('affiche un message si pas de données', async () => {
    const user = { id: 'user4', tag: 'User#0004' };
    interaction.options.getUser.mockReturnValue(user);
    getGuildData.mockReturnValue(undefined);
    await execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('Aucune donnée trouvée'),
      ephemeral: true
    }));
  });
}); 