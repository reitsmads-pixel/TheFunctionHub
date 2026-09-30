// Checks every policies/*.json against the live AMAPI discovery document: unknown fields,
// deprecated fields and invalid enum values fail the check. Run: node scripts/check-policies.mjs
import { readdir, readFile } from 'node:fs/promises';

const DISCOVERY = 'https://androidmanagement.googleapis.com/$discovery/rest?version=v1';
const doc = await (await fetch(DISCOVERY)).json();
const schemas = doc.schemas;
console.log(`AMAPI reference revision ${doc.revision}`);

const deprecated = (text = '') => /\bdeprecated\b|has no effect|not supported\. any value is ignored/i.test(text);
const problems = [];

function check(value, schema, path) {
  if (schema.$ref) return check(value, schemas[schema.$ref], path);
  if (schema.type === 'array') {
    if (!Array.isArray(value)) return problems.push(`${path}: expected an array`);
    return value.forEach((v, i) => check(v, schema.items, `${path}[${i}]`));
  }
  if (schema.type === 'object' && schema.properties) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return problems.push(`${path}: expected an object`);
    for (const [key, v] of Object.entries(value)) {
      const prop = schema.properties[key];
      if (!prop) problems.push(`${path}.${key}: unknown field`);
      else if (deprecated(prop.description)) problems.push(`${path}.${key}: deprecated — ${prop.description.slice(0, 140)}`);
      else check(v, prop, `${path}.${key}`);
    }
    return;
  }
  if (schema.type === 'object' && schema.additionalProperties) return; // free-form maps
  if (schema.enum) {
    const i = schema.enum.indexOf(value);
    if (i < 0) problems.push(`${path}: "${value}" is not one of ${schema.enum.join(', ')}`);
    else if (deprecated(schema.enumDescriptions?.[i])) problems.push(`${path}: value ${value} is deprecated`);
    return;
  }
  const types = { string: 'string', boolean: 'boolean', integer: 'number', number: 'number' };
  if (types[schema.type] && typeof value !== types[schema.type]) problems.push(`${path}: expected ${schema.type}`);
}

for (const file of (await readdir('policies')).filter((f) => f.endsWith('.json')).sort()) {
  const before = problems.length;
  check(JSON.parse(await readFile(`policies/${file}`, 'utf8')), schemas.Policy, file.replace('.json', ''));
  console.log(`${problems.length === before ? 'OK  ' : 'FAIL'} ${file}`);
}
if (problems.length) {
  console.error('\n' + problems.join('\n'));
  process.exit(1);
}
