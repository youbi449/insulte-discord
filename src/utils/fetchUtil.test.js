const { findBestReportChannel } = require('./fetchUtil');

describe('findBestReportChannel', () => {
  function mockChannel(name, perms = true) {
    return {
      name,
      isTextBased: () => true,
      viewable: true,
      permissionsFor: () => ({ has: () => perms }),
    };
  }
  function mockGuild(channels) {
    return {
      channels: { cache: channels },
      members: { me: {} },
    };
  }

  it('prend le channel noinsultchallenge si présent', () => {
    const guild = mockGuild([
      mockChannel('général'),
      mockChannel('noinsultchallenge'),
      mockChannel('general'),
    ]);
    const channel = findBestReportChannel(guild);
    expect(channel.name).toBe('noinsultchallenge');
  });

  it('prend le channel général si pas de noinsultchallenge', () => {
    const guild = mockGuild([
      mockChannel('général'),
      mockChannel('general'),
    ]);
    const channel = findBestReportChannel(guild);
    expect(['général', 'general']).toContain(channel.name);
  });

  it('prend le premier channel texte dispo sinon', () => {
    const guild = mockGuild([
      mockChannel('autre'),
      mockChannel('random'),
    ]);
    const channel = findBestReportChannel(guild);
    expect(channel).not.toBeNull();
  });

  it('retourne null si aucun channel texte', () => {
    const guild = mockGuild([
      { name: 'voc', isTextBased: () => false },
    ]);
    const channel = findBestReportChannel(guild);
    expect(channel).toBeNull();
  });
}); 