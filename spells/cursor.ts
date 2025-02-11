import dedent from "dedent";
import { runAppleScript } from "run-applescript";
import { m } from "../lib/utils";
import type { Spell, SpellContext } from "../lib/utils";

const cursorSpell = (spell: Omit<Spell, "name"> & { name: string }): Spell => ({
  ...spell,
  name: `[Cursor] ${spell.name}`,
  matcher: m.and(m.inApp("Cursor"), spell.matcher)
});

const cursorSpells: Spell[] = [
  cursorSpell({
    name: "File Opener",
    matcher: m.startsWithAny(["open file", "open"]),
    handler: async (ctx: SpellContext) => {
      const cleanRemainder = ctx.remainder.replace(/[^a-zA-Z0-9]/g, "");
      console.log(`Opening file in Cursor: ${cleanRemainder}`);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "p" using command down
          set the clipboard to "${cleanRemainder}"
          keystroke "v" using command down
          delay 0.1
          key code 36
        end tell
      `);
    }
  }),
  cursorSpell({
    name: "Agent",
    matcher: m.startsWithAny(["cursor agent"]),
    handler: async (ctx: SpellContext) => {
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "i" using command down
          delay 0.1
          keystroke "v" using command down
          delay 0.1
          key code 36
        end tell
      `);
    }
  }),
  cursorSpell({
    name: "Go to Symbol",
    matcher: m.startsWithAny(["go to symbol"]),
    handler: async (ctx: SpellContext) => {
      console.log(`Going to symbol: ${ctx.remainder}`);
      const cleanRemainder = ctx.remainder.replace(/[^a-zA-Z0-9]/g, "");
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "o" using {command down, shift down}
          delay 0.1
          set the clipboard to "${cleanRemainder}"
          keystroke "v" using command down
          delay 0.1
          key code 36
        end tell
      `);
    }
  }),
  cursorSpell({
    name: "Replace",
    matcher: m.startsWithAny(["replace with"]),
    handler: async (ctx: SpellContext) => {
      console.log(`Replacing content with: ${ctx.remainder}`);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "a" using command down
          set the clipboard to "${ctx.remainder}"
          keystroke "v" using command down
        end tell
      `);
    }
  }),
  cursorSpell({
    name: "Accept Suggestion",
    matcher: m.startsWithAny(["accept suggestion"]),
    handler: async (ctx: SpellContext) => {
      console.log("Accepting suggestion with Command+Return");
      await runAppleScript(dedent`
        tell application "System Events"
          key code 36 using command down
        end tell
      `);
    }
  }),
  cursorSpell({
    name: "Stop Agent",
    matcher: m.startsWithAny(["stop agent"]),
    handler: async (ctx: SpellContext) => {
      console.log("Stopping agent with Command+Backspace");
      await runAppleScript(dedent`
        tell application "System Events"
          key code 51 using command down
        end tell
      `);
    }
  }),
  cursorSpell({
    name: "New Agent",
    matcher: m.startsWithAny(["new cursor agent", "new agent"]),
    handler: async (ctx: SpellContext) => {
      console.log("Opening new Cursor agent and pasting remainder:", ctx.remainder);
      await runAppleScript(dedent`
        tell application "System Events"
          keystroke "i" using command down
          delay 0.1
          keystroke "n" using command down
          delay 0.1
          set the clipboard to "${ctx.remainder}"
          keystroke "v" using command down
          delay 0.1
          key code 36
        end tell
      `);
    }
  })
];

export default cursorSpells;
