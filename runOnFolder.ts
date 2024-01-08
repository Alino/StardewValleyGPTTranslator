import { main as translateFile } from './openai-translate';
import path from 'path';
import fs from 'fs';
import { Settings } from './settings';

function findI18nFolders(dir: string): string[] {
    let i18nFolders: string[] = [];
  
    // Function to recursively search for i18n folders
    function searchFolders(currentDir) {
      const files = fs.readdirSync(currentDir);
  
      files.forEach(file => {
        const fullPath = path.join(currentDir, file);
        const i18nPath = path.join(fullPath, Settings.lookInDirectoriesNamed);
        const defaultJsonPath = path.join(i18nPath, Settings.sourceLanguageFileName);
        const targetLanguageJsonPath = path.join(i18nPath, Settings.targetLanguageFileName);
  
        if (fs.statSync(fullPath).isDirectory()) {
          // Check for i18n folder in the current directory
          if (fs.existsSync(i18nPath) && fs.existsSync(defaultJsonPath) && !fs.existsSync(targetLanguageJsonPath)) {
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

const inputDir = path.resolve(Settings.folderLocationToSearchIn);
const i18nFolders = findI18nFolders(inputDir);

console.log(5555555, JSON.stringify(i18nFolders, null, 2));


async function main() {
    for (let i = 0; i < i18nFolders.length; i++) {
        const i18nPath = i18nFolders[i];
        if (i18nPath === undefined) {
          continue;
        }

        const defaultJsonPath = path.join(i18nPath, Settings.sourceLanguageFileName);
        const targetLanguageJsonPath = path.join(i18nPath, Settings.targetLanguageFileName);
        console.log(`processing ${defaultJsonPath} to ${targetLanguageJsonPath}`);
        await translateFile(defaultJsonPath, targetLanguageJsonPath);
    }
}

main();
