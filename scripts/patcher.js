import fs from 'fs';
import path from 'path';

export function patchFile(filePath, target, replacement) {
  const fullPath = path.resolve(filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const isCrlf = content.includes('\r\n');
  
  // Normalize target to match content line endings
  const normalizedTarget = isCrlf ? target.replace(/\r?\n/g, '\r\n') : target.replace(/\r\n/g, '\n');
  const normalizedReplacement = isCrlf ? replacement.replace(/\r?\n/g, '\r\n') : replacement.replace(/\r\n/g, '\n');

  if (!content.includes(normalizedTarget)) {
    throw new Error(`Target not found in ${filePath}`);
  }

  const newContent = content.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync(fullPath, newContent, 'utf8');
  console.log(`Successfully patched ${filePath}`);
}
