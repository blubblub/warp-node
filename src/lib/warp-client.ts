import { execa } from 'execa';
import type { WarpAgentRunOptions, WarpExecutionResult, WarpProfile } from './types.js';

class AgentResource {
  constructor(private readonly defaultOptions: WarpAgentRunOptions) {}

  /**
   * Run a warp agent task and wait for completion.
   */
  async run(options: WarpAgentRunOptions): Promise<WarpExecutionResult> {
    const args = this.buildAgentRunArgs(options);
    const merged = { ...this.defaultOptions, ...options };
    const result = await execa('warp', args, {
      cwd: options.cwd || merged.cwd,
      reject: false,
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };
  }

  /**
   * Spawn a warp agent process. Returns the child process for advanced usage (streaming).
   */
  spawn(options: WarpAgentRunOptions) {
    const args = this.buildAgentRunArgs(options);
    const merged = { ...this.defaultOptions, ...options };
    return execa('warp', args, {
      cwd: options.cwd || merged.cwd,
      all: true,
    });
  }

  private buildAgentRunArgs(options: WarpAgentRunOptions): string[] {
    const merged = { ...this.defaultOptions, ...options };
    const args: string[] = ['agent', 'run'];

    if (merged.apiKey) {
      args.push('--api-key', merged.apiKey);
    }

    if (merged.debug) {
      args.push('--debug');
    }

    if (merged.prompt) {
      args.push('--prompt', merged.prompt);
    }

    if (merged.savedPrompt) {
      args.push('--saved-prompt', merged.savedPrompt);
    }

    if (merged.outputFormat) {
      args.push('--output-format', merged.outputFormat);
    }

    if (merged.share && merged.share.length > 0) {
      for (const share of merged.share) {
        args.push('--share', share);
      }
    }

    if (merged.profile) {
      args.push('--profile', merged.profile);
    }

    if (merged.mcpServers && merged.mcpServers.length > 0) {
      for (const mcp of merged.mcpServers) {
        args.push('--mcp-server', mcp);
      }
    }

    if (merged.environment) {
      args.push('--environment', merged.environment);
    }

    if (merged.cwd) {
      args.push('--cwd', merged.cwd);
    }

    return args;
  }
}

class ProfilesResource {
  constructor(private readonly defaultOptions: WarpAgentRunOptions) {}

  /**
   * List all available agent profiles.
   */
  async list(): Promise<WarpProfile[]> {
    const args = ['agent', 'profile', 'list'];

    if (this.defaultOptions.apiKey) {
      args.push('--api-key', this.defaultOptions.apiKey);
    }

    if (this.defaultOptions.debug) {
      args.push('--debug');
    }

    const result = await execa('warp', args, {
      reject: false,
    });

    if (result.exitCode !== 0) {
      throw new Error(`Failed to list profiles: ${result.stderr}`);
    }

    return this.parseProfileList(result.stdout);
  }

  /**
   * Find a profile by name (case-insensitive search).
   */
  async findByName(name: string): Promise<WarpProfile | null> {
    const profiles = await this.list();
    return profiles.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Parse the profile list table output from warp CLI.
   */
  private parseProfileList(output: string): WarpProfile[] {
    const lines = output.split('\n');
    const profiles: WarpProfile[] = [];

    for (const line of lines) {
      // Skip header, separators, and empty lines
      if (!line.includes('│') || line.includes('ID') || line.includes('═') || line.includes('╌')) {
        continue;
      }

      // Parse table rows: │ ID ┆ Name │
      const parts = line.split('┆');
      if (parts.length === 2) {
        const id = parts[0].replace(/[│╭╰]/g, '').trim();
        const name = parts[1].replace(/[│╮╯]/g, '').trim();
        if (id && name) {
          profiles.push({ id, name });
        }
      }
    }

    return profiles;
  }
}

export class WarpClient {
  readonly agent: AgentResource;
  readonly profiles: ProfilesResource;

  constructor(public readonly defaultOptions: WarpAgentRunOptions = {}) {
    this.defaultOptions = defaultOptions;
    this.agent = new AgentResource(this.defaultOptions);
    this.profiles = new ProfilesResource(this.defaultOptions);
  }
}

export const warp = new WarpClient();

