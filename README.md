# warp-node

A NodeJS TypeScript library that wraps the Warp CLI.

## Installation

```bash
npm install warp-node
```

## Usage

```typescript
import { warp } from 'warp-node';

// Run a single agent task and wait for the result
const result = await warp.agent.run({
  prompt: 'Create a hello world file',
  cwd: './project'
});

console.log(result.stdout);

// Spawn an agent process (for streaming or concurrent execution)
const process = warp.agent.spawn({
  prompt: 'Long running task',
  share: ['team:view']
});

process.stdout?.pipe(process.stdout);

// List available agent profiles
const profiles = await warp.profiles.list();
profiles.forEach(p => {
  console.log(`${p.name} (${p.id})`);
});

// Find a profile by name (case-insensitive)
const profile = await warp.profiles.findByName('Automatic');
if (profile) {
  console.log(`Found profile: ${profile.name} (${profile.id})`);
}

// Use a specific profile by name
const profileResult = await warp.agent.run({
  prompt: 'Create a hello world file',
  profile: profile?.id
});
```

## Features

- TypeScript support
- Supports API Key authentication
- Supports all `warp agent run` options (prompt, saved-prompt, profile, environment, mcp-servers, etc.)
- Profile management (list profiles, find by name)
- Helper to spawn multiple processes
