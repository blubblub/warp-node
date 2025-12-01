import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WarpClient } from './warp-client.js';
import * as execaModule from 'execa';

// Mock execa
vi.mock('execa', async (importOriginal) => {
  const actual = await importOriginal<typeof execaModule>();
  return {
    ...actual,
    execa: vi.fn(),
  };
});

describe('WarpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build arguments correctly for agent.run', async () => {
    const client = new WarpClient();
    const mockExeca = execaModule.execa as any;
    mockExeca.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });

    await client.agent.run({
      prompt: 'hello world',
      debug: true,
      apiKey: 'test-key'
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'warp',
      ['agent', 'run', '--api-key', 'test-key', '--debug', '--prompt', 'hello world'],
      expect.objectContaining({ reject: false })
    );
  });

  it('should handle default options', async () => {
    const client = new WarpClient({
      apiKey: 'default-key',
      profile: 'default-profile'
    });
    const mockExeca = execaModule.execa as any;
    mockExeca.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });

    await client.agent.run({
      prompt: 'test'
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'warp',
      ['agent', 'run', '--api-key', 'default-key', '--prompt', 'test', '--profile', 'default-profile'],
      expect.any(Object)
    );
  });

  it('should override default options', async () => {
    const client = new WarpClient({
      apiKey: 'default-key'
    });
    const mockExeca = execaModule.execa as any;
    mockExeca.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });

    await client.agent.run({
      apiKey: 'new-key',
      prompt: 'test'
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'warp',
      ['agent', 'run', '--api-key', 'new-key', '--prompt', 'test'],
      expect.any(Object)
    );
  });
  
  it('should handle array arguments (mcpServers, share)', async () => {
    const client = new WarpClient();
    const mockExeca = execaModule.execa as any;
    mockExeca.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });

    await client.agent.run({
      prompt: 'test',
      share: ['team:view', 'user@example.com:edit'],
      mcpServers: ['server1', 'server2']
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'warp',
      [
        'agent', 'run',
        '--prompt', 'test',
        '--share', 'team:view',
        '--share', 'user@example.com:edit',
        '--mcp-server', 'server1',
        '--mcp-server', 'server2'
      ],
      expect.any(Object)
    );
  });
});
