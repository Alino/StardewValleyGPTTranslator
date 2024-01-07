import { main as translateFile } from './openai-translate';
import path from 'path';
import fs from 'fs';


function findI18nFolders(dir: string): string[] {
    let i18nFolders: string[] = [];
  
    // Function to recursively search for i18n folders
    function searchFolders(currentDir) {
      const files = fs.readdirSync(currentDir);
  
      files.forEach(file => {
        const fullPath = path.join(currentDir, file);
        const i18nPath = path.join(fullPath, 'i18n');
        const defaultJsonPath = path.join(i18nPath, 'default.json');
        const huJsonPath = path.join(i18nPath, 'hu.json');
  
        if (fs.statSync(fullPath).isDirectory()) {
          // Check for i18n folder in the current directory
          if (fs.existsSync(i18nPath) && fs.existsSync(defaultJsonPath) && !fs.existsSync(huJsonPath)) {
            i18nFolders.push(i18nPath);
          }
          // Continue searching in the subdirectory
          searchFolders(fullPath);
        }
      });
    }
  
    searchFolders(dir);
  
    return i18nFolders;
}

const inputDir = path.resolve('/Users/admin/Downloads/newMods');
const i18nFolders = findI18nFolders(inputDir);

console.log(5555555, JSON.stringify(i18nFolders, null, 2));


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
