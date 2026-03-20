import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const csvContent = readFileSync('./data/processed_characters.csv', 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  relax_quotes: true,
});

console.log(`Total characters: ${records.length}`);
console.log('---');

const names = records.map(r => r.name).filter(Boolean);
names.forEach((name, i) => {
  console.log(`${i + 1}. ${name}`);
});
