import { matchFile } from '.';
import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';

describe('Main Module', () => {
  it('should match only one parser for each test file', async () => {
    const files = await glob('**/test-data/*', { absolute: true, cwd: __dirname });
    for (const fileName of files) {
      const file = new File([fs.readFileSync(fileName)], path.basename(fileName));
      const matches = await matchFile(file);
      expect(matches.length).toBe(1);
    }
  });
});
