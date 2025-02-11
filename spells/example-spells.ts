import dedent from "dedent";
import { runAppleScript } from "run-applescript";
import { log, m } from "../lib/utils";
import type { Spell, SpellContext } from "../lib/utils";

const defaultSpells: Spell[] = [
  {
    name: "Show ctx Dialog",
    matcher: m.or(m.startsWithAny(["alert", "debug"])),
    handler: async (ctx: SpellContext) => {
      const dialogText = dedent`
        Transcription: ${ctx.originalTranscription}
        ${ctx.matchedPhrase ? `Matched Phrase: ${ctx.matchedPhrase}` : ""}
        Remainder: ${ctx.remainder}

        ctx Information:
        ------------------
        Active App: ${ctx.window.application}
        Window Title: ${ctx.window.window}
      `;
      await runAppleScript(dedent`
        tell application "System Events"
          display dialog "${dialogText}" with title "Spell ctx"
        end tell
      `);
    }
  },
  {
    name: "Cursor File Opener",
    matcher: m.and(m.inApp("Cursor"), m.startsWithAny(["open file", "open"])),
    handler: async (ctx: SpellContext) => {
      log(`Opening file in Cursor: ${ctx.remainder}`);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "p" using command down
          keystroke "v" using command down
        end tell
      `);
    }
  },
  {
    name: "Universal Undo",
    matcher: m.startsWithAny(["undo", "revert"]),
    handler: async (ctx: SpellContext) => {
      console.log(`Undoing in ${ctx.window.application}`);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "z" using command down
        end tell
      `);
    }
  },
  {
    name: "Copy All",
    matcher: m.startsWithAny(["select all and copy", "copy all"]),
    handler: async (ctx: SpellContext) => {
      console.log(`Copying all content in ${ctx.window.application}`);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "a" using command down
          keystroke "c" using command down
        end tell
      `);
    }
  }
];

export default defaultSpells;
