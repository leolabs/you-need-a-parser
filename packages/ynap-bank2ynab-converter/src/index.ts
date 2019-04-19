#! /usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import commander from 'commander';

commander
  .description('Fetch and parse the current bank2ynab config file to JSON')
  .option(
    '-e, --exclude <items>',
    'Exclude banks by their name (comma-separated)',
    (v: string) => v.split(',').map(i => i.trim()),
  )
  .option(
    '-b, --branch <branch>',
    'Set the branch that the config should be fetched from',
    'master',
  )
  .option('-o, --output <file>', 'Set the output file path', 'bank2ynab.json')
  .parse(process.argv);

import { ParserConfig } from './parserconfig';

const CONFIG_URL = `https://raw.githubusercontent.com/bank2ynab/bank2ynab/${
  commander.branch
}/bank2ynab.conf`;

const CONFIG_LINK = `https://github.com/bank2ynab/bank2ynab/blob/${
  commander.branch
}/bank2ynab.conf`;

const SECTION = new RegExp(/^\s*\[([^\]]+)]/);
const KEY = new RegExp(/\s*(.*?)\s*[=:]\s*(.*)/);
const COMMENT = new RegExp(/^\s*[;#]/);

const blacklist = commander.exclude || [];

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

  console.log('Excluding', blacklist.length, 'items from blacklist.');

  const filteredConfig: ParserConfig[] = Object.keys(config)
    .map(c => ({ ...config[c], Name: c }))
    .filter(
      c =>
        c.Name !== 'DEFAULT' &&
        !blacklist.includes(c.Name) &&
        !c.Plugin &&
        c['Source Filename Pattern'] !== 'unknown!' &&
        c['Input Columns'],
    )
    .map(
      c =>
        ({
          name: c.Name.split(' ')
            .slice(1)
            .join(' '),
          country: c.Name.split(' ')[0].toLowerCase(),
          filenamePattern: `${c['Source Filename Pattern']}\\.${(
            c['Source Filename Extension'] || '.csv'
          ).substr(1)}`,
          filenameExctension: (c['Source Filename Extension'] || 'csv')
            .toLowerCase()
            .replace('.', ''),
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

  fs.writeFileSync(commander.output, JSON.stringify(filteredConfig, null, 2));
  console.log('Saved configs to', commander.output);
};

script();
