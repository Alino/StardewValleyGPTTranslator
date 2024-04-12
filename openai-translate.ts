import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { Settings } from "./settings";
import { loadFile } from "./jsonParser";
const openai = new OpenAI();

type JSONValue = string | number | boolean | { [key: string]: JSONValue } | JSONValue[];
type Chunk = Record<string, JSONValue>;

const KEYS_PER_CHUNK = 10;
const CONCURRENCY_LIMIT = 2;


export async function main(sourceFile, targetFile) {
  await runProcess(sourceFile, targetFile);
}

async function runProcess(sourceFile: string, targetFile: string) {
  const newJson: Record<string, JSONValue> = {};
  const sourceJson = loadFile(sourceFile) as Record<string, JSONValue>;
  const keys = Object.keys(sourceJson);
  console.log(`The loaded json has ${keys.length} keys...`);

  const chunks: Chunk[] = [];
  let chunk: Chunk = {};

  keys.forEach((key, index) => {
    if (key.startsWith("Config.")) {
      newJson[key] = sourceJson[key];
    } else {
      chunk[key] = sourceJson[key];
      if ((index + 1) % KEYS_PER_CHUNK === 0) {
        chunks.push(chunk);
        chunk = {};
      }
    }
  });

  if (Object.keys(chunk).length > 0) {
    chunks.push(chunk);
  }

  // Process chunks in batches of the defined concurrency limit
  for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
    const batch = chunks.slice(i, i + CONCURRENCY_LIMIT).map(chunk => translate(JSON.stringify(chunk)));
    console.log(`Translating chunk ${i + 1}/${chunks.length}...`);
    try {
      const results = await Promise.all(batch);
      console.log('Results:', results);
      results.forEach(result => {
        Object.assign(newJson, result.data);
      });
    } catch (err) {
      console.error("Error in translating chunks:", err);
    }
  }

  saveFile(newJson, targetFile);
  console.log('Translation process completed.');
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
    model: Settings.openAIModel,
  });
}
