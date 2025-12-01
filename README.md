# warp-node

A NodeJS TypeScript library that wraps the Warp CLI.

## Installation

```bash
npm install warp-node
```

## Usage

```typescript
import { WarpClient } from 'warp-node';

const client = new WarpClient({
  apiKey: 'your-api-key', // Optional global API key
  debug: true
});

// Run a single agent task and wait for the result
const result = await client.runAgent({
  prompt: 'Create a hello world file',
  cwd: './project'
});

console.log(result.stdout);

// Spawn an agent process (for streaming or concurrent execution)
const process = client.spawnAgent({
  prompt: 'Long running task',
  share: ['team:view']
});

process.stdout?.pipe(process.stdout);
```

## Features

- TypeScript support
- Supports API Key authentication
- Supports all `warp agent run` options (prompt, saved-prompt, profile, environment, mcp-servers, etc.)
- Helper to spawn multiple processes
