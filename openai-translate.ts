import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { Settings } from "./settings";
const openai = new OpenAI();

export async function main(sourceFile, targetFile) {
  await runProcess(sourceFile, targetFile);
}

async function runProcess(sourceFile: string, targetFile: string) {
  const newJson = {};

  let chunk = {};
  const sourceJson = loadFile(sourceFile);
  const keys = Object.keys(sourceJson);
  console.log(`the loaded json has ${keys.length} keys...`);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.startsWith("Config.")) {
      newJson[key] = sourceJson[key];
      continue;
    }
    const value = sourceJson[key];
    chunk[key] = value;
    if (i % 5 === 0 && i !== 0) { // Added condition to ensure first iteration doesn't trigger this
      try {
        let chunkOutput = await translate(JSON.stringify(chunk));
        Object.assign(newJson, chunkOutput.data);
        console.log(JSON.stringify(chunkOutput.data, null, 2));
      } catch (err) {
        console.error(err);
      }
      chunk = {};
    }
    console.log(`processed ${i+1} of ${keys.length}`);
  }

  // Process any remaining items in the chunk after the loop
  if (Object.keys(chunk).length > 0) {
    try {
      let chunkOutput = await translate(JSON.stringify(chunk));
      Object.assign(newJson, chunkOutput.data);
      console.log(JSON.stringify(chunkOutput.data, null, 2));
    } catch (err) {
      console.error(err);
    }
  }

  saveFile(newJson, targetFile);
}

function loadFile(fileName: string) {
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

  console.log(111111, fileContent.toString());
  try {
    parsedJson = JSON.parse(fileContent.toString());
  } catch (err) {
    console.error(err);
    console.error(`file ${fileName} is not valid json`);
    throw new Error(`file ${fileName} is not valid json. Error: ${err}`);
  }

  return parsedJson;
}

function removeCommentsFromJSON(json: string) {
  return json
  .replace(/\/\*[\s\S]*?\*\//gm, "") // multi-line comments
  .replace(/\/[^\r\n"]*$(?![^\[]*])/gm, "") // single-line comments
}

function saveFile(fileContent, fileName: string) {
  const filePath = path.resolve(__dirname, fileName);
  fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
  console.log(`saved file to ${filePath}`);
}

async function translate(chunk) {
  const MAX_RETRIES = 3;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const completion = await sendRequest(chunk);
      
      if (!completion.choices[0].message.content) {
        console.error(completion.choices[0]);
        throw new Error("No content");
      }

      return JSON.parse(completion.choices[0].message.content);
      
    } catch (err) {
      console.error("Error during translation attempt:", err);
      attempts++;
      
      if (attempts === MAX_RETRIES) {
        throw new Error("Maximum retry attempts reached");
      }

      console.log(`Retrying... (${attempts}/${MAX_RETRIES})`);
    }
  }
}

async function sendRequest(chunk) {
  return await openai.chat.completions.create({
    messages: [
      { role: "system", content: `Objective: You are a program designed to translate ${Settings.sourceLanguage} text into ${Settings.targetLanguage}. Your main task is to process JSON data, translating only the values and not the keys. Here's a step-by-step guide:

Input and Output Structure:
You will receive input in the form of JSON with a structure:
{ "data": { "key1": "value 1", "key2": "value 2" } }

Your output should also be in the form of JSON, mirroring the input structure but with translated values:
{ "data": { "key1": "hodnota 1", "key2": "hodnota 2" }}

Translation Rules:
Keys: Always keep the keys unchanged.
Values: Translate the ${Settings.sourceLanguage} values into ${Settings.targetLanguage}.
Special Strings: If a value contains config-specific strings (like placeholders, symbols, or special codes), do not translate these parts. For instance, "@!", "$4", "$b", "$0", "%farm", etc., should remain unchanged in the translation.
Natural Text: Do not respond with conversational or natural language. Always use the JSON format for inputs and outputs.
Gender word declensions: Use correct gender word declensions for ${Settings.targetLanguage} when a character name is obtainable from the dialog.

let's start! Here is the first input:
{ "data": ${chunk} }`
}],
    model: Settings.openAPIModel,
  });
}