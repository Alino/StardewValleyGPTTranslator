/*  
    JSONs in stardew valley mods can have comments, which is not valid JSON.
    This file is a helper to load JSON files and remove comments from them before parsing them.
*/

import fs from "fs";
import path from "path";
import hjson from "hjson";

export function loadFile(fileName: string) {
    console.log(`loading file ${fileName}`);
    let fileContent;
  
    try {
      fileContent = fs.readFileSync(path.resolve(__dirname, fileName)).toString();
    } catch {
      console.error(`file ${fileName} not found`);
      throw new Error(`file ${fileName} not found`);
    }
  
    console.log(`loaded file ${fileName}`);
  
  
    console.log(`removing comments from ${fileName}`);
    fileContent = removeCommentsFromJSON(fileContent);
  
    // Replace non-standard whitespace characters with a standard space
    fileContent = fileContent.replace(/[\s]+/g, ' ');
  
    // remove trailing comma at the end of the json
    fileContent = fileContent.replace(/,(?!\s*?[{["'\w])/g, '');
    
  
    let parsedJson;
  
    // console.log(111111, fileContent.toString());
    try {
      console.log(`parsing json from ${fileName}`);
      parsedJson = JSON.parse(fileContent.toString());
    } catch (err) {
      console.error(err);
      console.error(`file ${fileName} is not valid json`);
      parsedJson = hjsonFallbackParse(fileContent);
    }
  
    return parsedJson;
  }
  
  function hjsonFallbackParse(fileContent: string) {
    console.log(`falling back to hjson parsing`);
    try {
      return hjson.parse(fileContent);
    } catch (err) {
      console.error(err);
      throw new Error(`file is not valid hjson. Error: ${err}`);
    }
  }

  function removeCommentsFromJSON(json: string) {
    return json
    .replace(/\/\*[\s\S]*?\*\//gm, "") // multi-line comments
    .replace(/^(?:(?!"[^"]*\/\/)[^"\r\n])*\/\/[^\r\n]*$/gm, "") // single-line comments
    .replace(/\/[^\r\n"]*$(?![^\[]*])/gm, "") // single-line comments
  }