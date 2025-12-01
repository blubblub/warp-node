export interface WarpCommonOptions {
  apiKey?: string;
  debug?: boolean;
}

export interface WarpAgentRunOptions extends WarpCommonOptions {
  prompt?: string;
  savedPrompt?: string;
  outputFormat?: 'json' | 'text';
  cwd?: string;
  share?: string[];
  profile?: string;
  mcpServers?: string[];
  environment?: string;
}

export interface WarpExecutionResult {
  stdout: string;
  stderr: string;
  exitCode?: number;
}

export interface WarpProfile {
  id: string;
  name: string;
}
