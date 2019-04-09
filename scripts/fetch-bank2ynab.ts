import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

import { ParserConfig } from '../src/parsers/bank2ynab/bank2ynab';
import { parsers } from '../src/parsers';

const CONFIG_URL =
  'https://raw.githubusercontent.com/bank2ynab/bank2ynab/master/bank2ynab.conf';

const CONFIG_LINK =
  'https://github.com/bank2ynab/bank2ynab/blob/master/bank2ynab.conf';

const SECTION = new RegExp(/^\s*\[([^\]]+)]/);
const KEY = new RegExp(/\s*(.*?)\s*[=:]\s*(.*)/);
const COMMENT = new RegExp(/^\s*[;#]/);

const blacklist = ['DE N26', 'DE ING-DiBa'];

interface Sections {
  [k: string]: ConfigFields;
}

interface ConfigFields {
  Line: string;
  'Source Filename Pattern'?: string;
  'Source Filename Extension'?: string;
  'Header Rows'?: string;
  'Footer Rows'?: string;
  'Input Columns'?: string;
  'Date Format'?: string;
  'Inflow or Outflow Indicator'?: string;
  'Source CSV Delimiter'?: string;
  Plugin?: string;
  [k: string]: string;
}

export const parseConfig = (config: string) => {
  const lines = config.split('\n');

  const sections: Sections = {};

  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(COMMENT)) {
      continue;
    }

    const sectionMatch = line.match(SECTION);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      sections[currentSection] = { Line: String(i + 1) };
      continue;
    }

    const keyMatch = line.match(KEY);
    if (currentSection && keyMatch && keyMatch[1] && keyMatch[2]) {
      const key = keyMatch[1].trim();
      const value = keyMatch[2].trim();
      if (Object.keys(sections).includes(currentSection)) {
        sections[currentSection][key] = value;
      }
    }
  }

  return sections;
};

const script = async () => {
  const resp = await fetch(CONFIG_URL);

  if (!resp.ok) {
    throw new Error(`Fetch failed: ${resp.status}\n\n${resp.body}`);
  }

  const configData = await resp.textConverted();

  const config = parseConfig(configData);

  const existingParsers = parsers.map(p => `${p.country.toUpperCase()} ${p.name}`);

  const filteredConfig: ParserConfig[] = Object.keys(config)
    .map(c => ({ ...config[c], Name: c }))
    .filter(
      c =>
        c.Name !== 'DEFAULT' &&
        !blacklist.includes(c.Name) &&
        !c.Plugin &&
        c['Source Filename Pattern'] !== 'unknown!' &&
        c['Input Columns'] &&
        !existingParsers.includes(
          c.Name.split(' ')
            .slice(1)
            .join(' '),
        ),
    )
    .map(
      c =>
        ({
          name: c.Name.split(' ', 2)[1],
          country: c.Name.split(' ')[0].toLowerCase(),
          filenamePattern: `${c['Source Filename Pattern']}\\.${(
            c['Source Filename Extension'] || '.csv'
          ).substr(1)}`,
          inputColumns: c['Input Columns'].split(','),
          link: `${CONFIG_LINK}#L${c.Line}`,
          dateFormat: c['Date Format'],
          headerRows: Number(c['Header Rows'] || '1'),
          footerRows: Number(c['Footer Rows'] || '0'),
        } as ParserConfig),
    );

  console.log(
    'Parsed',
    filteredConfig.length,
    'bank configs. Filtered from',
    Object.keys(config).length,
    'configs.',
  );

  const jsonPath = path.normalize(
    path.join(__dirname, '../src/parsers/bank2ynab/banks.json'),
  );
  fs.writeFileSync(jsonPath, JSON.stringify(filteredConfig, null, 2));
  console.log('Saved configs to', jsonPath);
};

script();
