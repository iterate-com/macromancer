# 🧙‍♂️💬 Macromancer

> Control your computer with your voice!

This script intercepts superwhisper transcriptions and lets you write typescript
functions to handle them. The functions are passed the transcriptions and the
active application context, so you can do lots of neat things like:

| Command              | Action                                                              | Conditions    |
| -------------------- | ------------------------------------------------------------------- | ------------- |
| `open file index.ts` | [Cmd]+[P]<br>Paste `index.ts`<br>[Enter]                            | VSCode/Cursor |
| `raycast something`  | [Cmd]+[Space]<br>Paste `something`<br>[Enter]                       |               |
| `email: hell no`     | Pipe through LLMThank you.<br />Paste LLM response<br />[Cmd] + [V] |               |

My side-quest for the year is to spend a whole day coding while walking 20k
steps on my treadmill desk without using my keyboard.
[Here's a very cringe video of what that looked like prior to this script](https://x.com/jonas/status/1844743001068704151/)

So I made this script at a hackathon tonight. I hope you like it!

## Installation

Prerequisites:

- You must use a Mac
- Clone this repo
- [Bun](https://bun.sh/)
- [Superwhisper](https://superwhisper.com/)

```bash
bun install.ts
```

The install script adds a new mode "called" macromancer to superwhisper.

You should then be able to select the "macromancer" mode in superwhisper using
[Alt]+[Shift]+[K].

You can try that all is working by saying "alert test test" in macromancer mode.
You should see an alert popup with some debugging info.

If this doesn't work, it may be that you first have to enter the konami code on
the superwhisper About page to unlock the super secret script mode...

## Adding spells

You can add new spells to the spells/ directory. You can write whatever
typescript you want so it's quite powerful.
