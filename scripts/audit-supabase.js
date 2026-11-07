import fs from 'fs';
import path from 'path';

const dir = 'supabase/migrations';
const files = fs.readdirSync(dir).sort();

const tables = new Map();

for (const f of files) {
  const sql = fs.readFileSync(path.join(dir, f), 'utf8');

  // Match CREATE TABLE
  const createRegex = /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?([a-zA-Z0-9_]+)/gi;
  let match;
  while ((match = createRegex.exec(sql)) !== null) {
    const table = match[1];
    if (!tables.has(table)) {
      tables.set(table, { createdIn: f, rls: false, policies: [] });
    }
  }

  // Match ALTER TABLE ... ENABLE ROW LEVEL SECURITY
  const rlsRegex = /ALTER TABLE (?:ONLY )?(?:public\.)?([a-zA-Z0-9_]+) ENABLE ROW LEVEL SECURITY/gi;
  while ((match = rlsRegex.exec(sql)) !== null) {
    const table = match[1];
    if (tables.has(table)) {
      tables.get(table).rls = true;
    }
  }

  // Match CREATE POLICY
  const polRegex = /CREATE POLICY "?([^"\n]+)"?\s+ON (?:public\.)?([a-zA-Z0-9_]+)\s+FOR ([A-Z]+)(?:\s+TO ([a-zA-Z0-9_,\s]+))?/gi;
  while ((match = polRegex.exec(sql)) !== null) {
    const polName = match[1].trim();
    const table = match[2];
    const op = match[3];
    const role = (match[4] || 'public').trim();
    if (tables.has(table)) {
      tables.get(table).policies.push({ name: polName, op, role, file: f });
    }
  }
}

console.log('=== Supabase Security & RLS Audit ===');
console.log(`Total Tables Found: ${tables.size}\n`);

for (const [table, info] of tables.entries()) {
  console.log(`Table: [${table}] | RLS Enabled: ${info.rls ? '✅ YES' : '❌ NO'}`);
  if (info.policies.length === 0) {
    console.log('  ⚠️ No specific policies recorded in migrations');
  } else {
    console.log(`  Policies (${info.policies.length}):`);
    info.policies.forEach((p) => {
      console.log(`    - [${p.op} to ${p.role}]: "${p.name}"`);
    });
  }
  console.log('');
}

