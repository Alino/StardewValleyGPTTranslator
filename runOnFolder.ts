import { main as translateFile } from './openai-translate';
import path from 'path';
import fs from 'fs';

// var sourceFile = 'data/default.json';
// var targetFile = 'data/hu.json';

const inputDir = path.resolve('/Users/admin/Downloads/newMods');

// get all folders in inputDir
const folders = fs.readdirSync(inputDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// find all folders named i18n in all sub-directories (get their full path)
const i18nFolders = folders.map(folder => {
  const i18nPath = path.join(inputDir, folder, 'i18n');
  const defaultJsonPath = path.join(i18nPath, 'default.json');
  const huJsonPath = path.join(i18nPath, 'hu.json');
  if (fs.existsSync(i18nPath) && fs.existsSync(defaultJsonPath) && !fs.existsSync(huJsonPath)) {
    return i18nPath;
  }
}).filter(path => path !== undefined);

// console.log(folders);
console.log(JSON.stringify(i18nFolders, null, 2));


async function main() {
    for (let i = 0; i < i18nFolders.length; i++) {
        const i18nPath = i18nFolders[i];
        if (i18nPath === undefined) {
          continue;
        }

        const defaultJsonPath = path.join(i18nPath, 'default.json');
        const huJsonPath = path.join(i18nPath, 'hu.json');
        console.log(`processing ${defaultJsonPath} to ${huJsonPath}`);
        await translateFile(defaultJsonPath, huJsonPath);
    }
}

main();
