import dedent from "dedent";
import { runAppleScript } from "run-applescript";
import { m } from "../lib/utils";
import type { Spell, SpellContext } from "../lib/utils";

const defaultSpells: Spell[] = [
  {
    name: "Show ctx Dialog",
    matcher: m.startsWithAny(["alert", "debug"]),
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
    name: "Go to Top",
    matcher: m.startsWithAny(["go to top"]),
    handler: async (ctx: SpellContext) => {
      console.log(`Going to top in ${ctx.window.application}`);
      await runAppleScript(dedent`
        tell application "System Events"
          key code 126 using command down
        end tell
      `);
    }
  },
  {
    name: "Universal Undo",
    matcher: m.startsWithAny(["undo"]),
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
  },
  {
    name: "Open Raycast",
    matcher: m.startsWithAny(["raycast"]),
    handler: async (ctx: SpellContext) => {
      console.log(`Opening Raycast and pasting remainder: ${ctx.remainder}`);
      const cleanRemainder = ctx.remainder.replace(/[^a-zA-Z0-9]/g, "");
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke space using command down
          delay 0.1
          set the clipboard to "${cleanRemainder}"
          keystroke "v" using command down
          delay 0.1
          key code 36
        end tell
      `);
    }
  },
  {
    name: "Replace All",
    matcher: m.startsWithAny(["replace all", "replace everything with"]),
    handler: async (ctx: SpellContext) => {
      console.log(`Replacing all content with: ${ctx.remainder}`);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "a" using command down
          delay 0.1
          keystroke "v" using command down
        end tell
      `);
    }
  }
];

export default defaultSpells;
