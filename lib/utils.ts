import * as fs from "node:fs";
import * as path from "node:path";
import dedent from "dedent";
import { runAppleScript } from "run-applescript";

// Helper function to log to both console and file
export function log(message: string) {
  console.log(message);
  fs.appendFileSync(path.join(__dirname, "..", "macromancer.log"), `${message}\n`, "utf8");
}

// Helper function to execute a single line of AppleScript
export async function appleScript(command: string): Promise<string> {
  const script = dedent`
    tell application "System Events"
      ${command}
    end tell
  `;
  return runAppleScript(script);
}

// Helper function to get current window information
export async function getCurrentWindow() {
  const script = dedent`
    tell application "System Events"
      set frontApp to first application process whose frontmost is true
      set frontAppName to name of frontApp

      try
        set windowTitle to name of first window of frontApp
      on error
        set windowTitle to "No window title available"
      end try

      return {frontAppName & "@@" & windowTitle}
    end tell
  `;

  const result = await runAppleScript(script);
  const [appName, windowTitle] = result.split("@@");
  return {
    application: appName,
    window: windowTitle
  };
}

// Helper function to clean the start of a string
export function cleanStart(input: string): string {
  return input.replace(/^[^a-zA-Z0-9]+/, "");
}

// Define the context type for spell handlers
export type SpellContext = {
  originalTranscription: string;
  remainder: string;
  window: {
    application: string;
    window: string;
  };
  matchedPhrase?: string;
};

// Define the Spell type
export type Spell = {
  name: string;
  matcher: (context: SpellContext) => boolean | string;
  handler: (context: SpellContext) => Promise<void>;
};

// Helper functions for matching
export const m = {
  startsWithAny:
    (phrases: string[]) =>
    (context: SpellContext): string | false => {
      const match = phrases.find((phrase) =>
        context.remainder.toLowerCase().startsWith(phrase.toLowerCase())
      );
      return match || false;
    },
  inApp:
    (appName: string) =>
    (context: SpellContext): boolean => {
      return context.window.application.toLowerCase() === appName.toLowerCase();
    },
  and:
    (...conditions: ((context: SpellContext) => boolean | string)[]) =>
    (context: SpellContext): string | boolean => {
      let matchedPhrase: string | undefined;
      const allPass = conditions.every((condition) => {
        const result = condition(context);
        if (typeof result === "string") {
          matchedPhrase = result;
        }
        return !!result;
      });
      return allPass ? matchedPhrase || true : false;
    },
  or:
    (...conditions: ((context: SpellContext) => boolean | string)[]) =>
    (context: SpellContext): boolean | string => {
      for (const condition of conditions) {
        const result = condition(context);
        if (result) return result;
      }
      return false;
    }
};
