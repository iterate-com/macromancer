import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { intro, isCancel, note, outro, text } from "@clack/prompts";
import { $ } from "bun";

async function main() {
  intro("Installing Macromancer Mode for Superwhisper");

  const defaultPath = join(homedir(), "Documents", "superwhisper");
  const superwhisperPath = await text({
    message: "What's your superwhisper app folder location?",
    placeholder: defaultPath,
    defaultValue: defaultPath
  });

  if (isCancel(superwhisperPath)) {
    outro("Installation cancelled");
    process.exit(0);
  }

  if (!superwhisperPath || !existsSync(superwhisperPath.toString())) {
    outro(
      "Error: Directory does not exist. Please check your Superwhisper settings for the correct path."
    );
    process.exit(1);
  }

  // Get the bun binary path
  const bunPath = (await $`which bun`.quiet()).text().trim();
  // Get current working directory
  const macromancerDir = process.cwd();

  // Read and modify the macromancer.json
  const macromancerConfig = JSON.parse(readFileSync("macromancer.json", "utf-8"));

  // Update the script with actual values
  macromancerConfig.script = macromancerConfig.script
    .replace("{{bunBinary}}", bunPath)
    .replace("{{macromancerDir}}", macromancerDir);

  // Create modes directory if it doesn't exist
  const modesPath = join(superwhisperPath.toString(), "modes");
  if (!existsSync(modesPath)) {
    outro("Error: modes directory not found in Superwhisper app folder");
    process.exit(1);
  }

  // Write the modified config
  const targetPath = join(modesPath, "macromancer.json");
  writeFileSync(targetPath, JSON.stringify(macromancerConfig, null, 2));

  outro(`Successfully installed Macromancer mode to ${targetPath}`);

  note("⚠️  You must now restart Superwhisper for changes to take effect!", "WARNING");

  console.log(
    "Then press Cmd+Shift+K to select macromancer mode.\nTry it by saying 'Alert test test'. If it works, you should see a popup."
  );
}

main().catch((err) => {
  console.error("Installation failed:", err);
  process.exit(1);
});
