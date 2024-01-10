# Stardew Valley GPT Translator

Welcome to the Stardew Valley GPT Translator! This tool allows you to translate all your Stardew Valley mods using the OpenAI GPT model.

![Stardew Valley GPT Translator](logo.png)

## Prerequisites

1. You need to have an OpenAI API key. Once you have it, store it in an environment variable named `OPENAI_API_KEY`. You can use a `.env` file to do this.

2. You need to have `bun` installed on your system to run this tool. You can download it from [bun.sh](https://bun.sh/). If you prefer, you can also use Node.js.

## Configuration

Before you start, you need to customize the settings in the `settings.ts` file to match your needs. Here's what each setting does:

- `targetLanguage`: The language you want to translate your mods to. For example, 'Czech'.
- `targetLanguageFileName`: The filename for the translated language. For example, 'hu.json'.
- `folderLocationToSearchIn`: The location of your Stardew Valley mods folder.
- `sourceLanguage`: The original language of your mods. This is usually 'English'.
- `lookInDirectoriesNamed`: The name of the directories to look in for files to translate. This is usually 'i18n'.
- `sourceLanguageFileName`: The filename of the original language file. This is usually 'default.json'.
- `openAIModel`: The OpenAI model to use for translation. This is usually 'gpt-3.5-turbo'.

## Usage

Once you've set up your environment and customized your settings, you can start translating your mods. There are two scripts you can use:

1. `bun runSingleFile`: This script translates a single file that you specify in the `runOnFolder.ts` file.

2. `bun runOnFolder`: This script scans your mods folder recursively for all 'i18n' directories. It then translates all 'default.json' files it finds, creating translated files in your target language next to them.

Happy modding!