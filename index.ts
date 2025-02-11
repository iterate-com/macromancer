import * as fs from "node:fs";
import * as path from "node:path";
import dedent from "dedent";
import { runAppleScript } from "run-applescript";
import { type Spell, type SpellContext, cleanStart, getCurrentWindow, log } from "./lib/utils";

// Function to load all spells from the spells directory
async function loadSpells(): Promise<Spell[]> {
  const spellsDir = path.join(__dirname, "spells");
  const spellFiles = fs
    .readdirSync(spellsDir)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  const loadedSpells: Spell[] = [];

  for (const file of spellFiles) {
    try {
      const spellModule = await import(path.join(spellsDir, file));
      // Each spell file should export either a single spell or an array of spells
      const spells = Array.isArray(spellModule.default)
        ? spellModule.default
        : [spellModule.default];

      loadedSpells.push(
        ...spells.filter((spell: unknown): spell is Spell => {
          const s = spell as Record<string, unknown>;
          return (
            !!spell &&
            typeof s.name === "string" &&
            typeof s.matcher === "function" &&
            typeof s.handler === "function"
          );
        })
      );
    } catch (error) {
      log(`Error loading spell file ${file}: ${error}`);
    }
  }

  return loadedSpells;
}

// Get the transcription from command line
const transcription = process.argv[2];

if (!transcription) {
  console.error("Please provide a transcription");
  process.exit(1);
}

// Add timestamp to log
log(`\n[${new Date().toISOString()}] Transcription received: "${transcription}"`);

// Find and execute matching handlers
(async () => {
  // Load all spells
  const spells = await loadSpells();
  log(`Loaded ${spells.length} spells`);
  // Create context
  const context: SpellContext = {
    originalTranscription: transcription,
    remainder: cleanStart(transcription),
    window: await getCurrentWindow()
  };

  log(`Current window: ${context.window.application} - ${context.window.window}`);
  log(`Cleaned remainder: "${context.remainder}"`);

  // Find all matching handlers
  const matchingSpells = spells
    .map((spell) => {
      const matchResult = spell.matcher(context);
      return matchResult
        ? { spell, matchedPhrase: typeof matchResult === "string" ? matchResult : undefined }
        : null;
    })
    .filter((result): result is NonNullable<typeof result> => result !== null);

  if (matchingSpells.length === 0) {
    log("\nNo matching spells found. Copying transcription to clipboard and pasting...");
    try {
      await runAppleScript(`set the clipboard to "${transcription}"`);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "v" using command down
        end tell
      `);
      log("Copied to clipboard and pasted successfully!");
    } catch (error) {
      log(`Error copying/pasting: ${error}`);
    }
    return;
  }

  if (matchingSpells.length > 1) {
    log("\nWarning: Multiple matching spells found:");
    for (const { spell } of matchingSpells) {
      log(`  - ${spell.name}`);
    }
  }

  // Execute all matching handlers
  for (const { spell, matchedPhrase } of matchingSpells) {
    try {
      log(`\nExecuting spell: ${spell.name}`);
      // Create a new context with updated remainder that removes the matched phrase
      const updatedContext = {
        ...context,
        matchedPhrase,
        remainder: cleanStart(
          matchedPhrase ? context.remainder.slice(matchedPhrase.length).trim() : context.remainder
        )
      };

      // Copy the remainder to clipboard before executing the handler
      await runAppleScript(`set the clipboard to "${updatedContext.remainder}"`);
      log(`Copied remainder to clipboard: ${updatedContext.remainder}`);

      await spell.handler(updatedContext);
      log("Spell execution complete!");
    } catch (error) {
      const errorMessage = `Error executing spell ${spell.name}: ${error}`;
      console.error(errorMessage);
      fs.appendFileSync(path.join(__dirname, "macromancer.log"), `\n${errorMessage}\n`, "utf8");
    }
  }
})();

// Clear the clipboard
await runAppleScript('set the clipboard to ""');
