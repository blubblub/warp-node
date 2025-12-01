import { execa } from 'execa';
import type { WarpAgentRunOptions, WarpExecutionResult } from './types.js';

export class WarpClient {
  private defaultOptions: WarpAgentRunOptions;

  constructor(defaultOptions: WarpAgentRunOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  /**
   * Run a warp agent task and wait for completion.
   */
  async runAgent(options: WarpAgentRunOptions): Promise<WarpExecutionResult> {
    const args = this.buildAgentRunArgs(options);
    const result = await execa('warp', args, {
      cwd: options.cwd || this.defaultOptions.cwd,
      reject: false
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
  spawnAgent(options: WarpAgentRunOptions) {
    const args = this.buildAgentRunArgs(options);
    return execa('warp', args, {
      cwd: options.cwd || this.defaultOptions.cwd,
      all: true
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
      // Assuming share can be passed multiple times or as comma separated?
      // Help says: --share [<RECIPIENTS>]
      // Usually multiple values in clap/structopt are passed by repeating the flag or comma separated.
      // I'll assume repeating flag for safety unless I find otherwise, or just space separated?
      // CLI usage: `warp agent run --share team:view`
      // If multiple recipients, likely multiple --share or space separated?
      // For now I'll just pass one --share per item if it's an array, or just one if it's a single string.
      // Wait, options says "share?: string[]".
      // I will implement it as multiple --share flags.
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
    
    // Explicit cwd is handled in execa options, but CLI also has --cwd.
    // I should probably pass it if it's different from process.cwd() or let execa handle it.
    // But wait, the CLI has --cwd. This might be for the *agent's* context, not just where the CLI runs.
    // I will pass --cwd to the CLI if provided.
    if (merged.cwd) {
      args.push('--cwd', merged.cwd);
    }

    return args;
  }
}
