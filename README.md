### Stardew Valley GPT Translator

Translate all your stardew valley mods with OpenAPI GPT model.

![Stardew Valley GPT Translator](logo.png)

You need to have OpenAPI's API key! Put it into ENV variable named OPENAI_API_KEY 

You can use .env

**Change settings.ts to match your needs.**

#### Two scripts:
```bun runSingleFile``` runs the translation on the file you choose in the runOnFolder.ts file

```bun runOnFolder``` scans the directory recursively for all i18n inside your mods folder, then runs the translation sequentially on all default.json files translating them and creating your target language files next to them.

