import { getRelevantExamples } from "./examples";
import { bannedAiToneGuide, malaysianDocumentStyleGuide } from "./style-guide";
import { getRelevantTemplates } from "./templates";

export function buildDocumentBrainReference(prompt: string) {
  const templates = getRelevantTemplates(prompt);
  const examples = getRelevantExamples(prompt);

  return [
    "Internal lY Docs reference library:",
    "",
    "Language and tone guide:",
    malaysianDocumentStyleGuide,
    "",
    "Avoid these AI-like patterns:",
    bannedAiToneGuide,
    "",
    "Relevant document structures:",
    ...templates.map((template, index) =>
      [
        `${index + 1}. ${template.title}`,
        `Slots: ${template.slots.join(", ")}`,
        `Format notes: ${template.formatNotes.join(" ")}`,
      ].join("\n"),
    ),
    examples.length > 0 ? "" : "",
    examples.length > 0 ? "Reference examples to imitate in quality and structure, not copy word-for-word:" : "",
    ...examples.map((example, index) => `Example ${index + 1}:\n${example}`),
  ]
    .filter(Boolean)
    .join("\n");
}
