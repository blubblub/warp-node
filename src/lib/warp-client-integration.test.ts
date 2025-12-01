import { describe, it, expect } from 'vitest';
import { WarpClient } from './warp-client.js';
import * as fs from 'fs';
import * as path from 'path';

describe('WarpClient Integration', () => {
  it('should execute a real prompt against speechblubs.com', async () => {
    const client = new WarpClient();
    const prompt = 'Go to speechblubs.com and write a summary to test.txt';
    const outputPath = path.resolve(process.cwd(), 'test.txt');

    // Cleanup before test
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    try {
      console.log('Running real warp agent...');
      const result = await client.agent.run({ prompt });
      console.log('Agent finished.');
      console.log('Stdout:', result.stdout);
      console.log('Stderr:', result.stderr);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBeTruthy();
      
      // Verify the file was created as requested in the prompt
      expect(fs.existsSync(outputPath)).toBe(true);
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);

    } finally {
      // Cleanup after test
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
  }, 300000); // 5 minutes timeout to be safe
});
