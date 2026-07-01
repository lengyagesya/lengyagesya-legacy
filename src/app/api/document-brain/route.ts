export const runtime = "nodejs";

type DocumentBrainSection = {
  content: string;
  slot?: string;
  type?: string;
};

type DocumentBrainResponse = {
  confidence: number;
  documentType: string;
  missingFields: string[];
  sections: DocumentBrainSection[];
  title: string;
};

const requiredShape: DocumentBrainResponse = {
  confidence: 0,
  documentType: "",
  missingFields: [],
  sections: [{ content: "", slot: "" }],
  title: "",
};

type LayoutBlock = {
  content?: string;
  id?: string;
  slot?: string;
  title?: string;
};

type LayoutPage = {
  blocks?: LayoutBlock[];
  id?: string;
  title?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY tiada. Sila tambah environment variable OPENAI_API_KEY di Vercel." },
      { status: 500 },
    );
  }

  let body: { language?: string; layout?: unknown; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body mesti dalam format JSON." }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return Response.json({ error: "Sila masukkan arahan dokumen dahulu." }, { status: 400 });
  }

  const language = body.language === "en" ? "English" : "Bahasa Melayu";
  const layoutSlots = extractLayoutSlots(body.layout);

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      body: JSON.stringify({
        messages: [
          {
            content: [
              "You are an AI document engine for Malaysian users.",
              "",
              "Your job is to generate complete, professional, print-ready documents based on:",
              "- document type",
              "- user instruction",
              "- provided user data",
              "- current A4 layout slots",
              "",
              "Rules:",
              "1. Output valid JSON only.",
              "2. Do not chat casually.",
              "3. Do not explain your answer.",
              "4. Generate a complete document, not an empty template.",
              "5. Use Bahasa Melayu by default unless user asks another language.",
              "6. Preserve user-provided names, dates, places, numbers, and facts exactly.",
              "7. Do not invent sensitive personal details.",
              "8. Use minimal placeholders only when important information is missing.",
              "9. Do not overuse placeholders.",
              "10. Match every content section to the correct layout slot.",
              "11. Do not change the user's layout. Layout slots are anchors; fill them with suitable content.",
              "12. For formal Malay letters, use professional Malaysian document style.",
              "13. For surat rasmi, title must be uppercase and body must have at least 2 paragraphs.",
              "14. Return missingFields for important missing data, but still generate a usable print-ready draft.",
              "15. Do not output builder instructions such as 'Klik untuk edit' or 'Masukkan'.",
              "",
              "Placeholder policy:",
              "- Use [TARIKH] only if no date is provided.",
              "- Use [NAMA ANAK] only if a child's name is important and missing.",
              "- Use [NAMA IBU/BAPA/PENJAGA] only if guardian name is important and missing.",
              "- If school is missing, use 'Pihak Sekolah / Guru Kelas'.",
              "- If recipient is missing, choose a suitable general recipient for the document type.",
              "- Leave reference empty unless a reference is explicitly provided or clearly required.",
              "",
              "For surat rasmi:",
              "- title slot: uppercase title.",
              "- recipient slot: suitable recipient.",
              "- salutation slot: 'Tuan/Puan,'.",
              "- body slot: at least 2 professional paragraphs.",
              "- closing/signature slot: include 'Sekian, terima kasih.', 'Yang benar,' and a signature line.",
            ].join("\n"),
            role: "system",
          },
          {
            content: [
              `Language: ${language}`,
              "Return exactly this JSON shape:",
              JSON.stringify(requiredShape),
              "- confidence must be a number from 0 to 1.",
              "- sections must contain slot and content.",
              "- Use the provided current A4 layout slots when possible.",
              "- If a layout slot exists, return content for that exact slot.",
              "- Do not create a new visual layout. Fill the user's existing layout slots.",
              "- missingFields must list only important missing details.",
              "- content must be ready to print in an A4 preview.",
              `Current A4 layout slots: ${JSON.stringify(layoutSlots)}`,
              `User request: ${prompt}`,
            ].join("\n"),
            role: "user",
          },
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.25,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return Response.json(
        { error: `OpenAI API error: ${openAiResponse.status}. ${errorText.slice(0, 400)}` },
        { status: 502 },
      );
    }

    const openAiJson = await openAiResponse.json();
    const content = openAiJson?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return Response.json({ error: "AI tidak memulangkan kandungan JSON yang sah." }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return Response.json({ error: "AI response bukan JSON yang sah. Sila cuba semula." }, { status: 502 });
    }

    if (!isDocumentBrainResponse(parsed)) {
      return Response.json({ error: "AI JSON tidak mengikut struktur yang diperlukan." }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Ralat tidak dijangka semasa memanggil OpenAI API." },
      { status: 500 },
    );
  }
}

function isDocumentBrainResponse(value: unknown): value is DocumentBrainResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.documentType === "string" &&
    typeof record.title === "string" &&
    Array.isArray(record.sections) &&
    record.sections.every(
      (section) =>
        section &&
        typeof section === "object" &&
        typeof (section as Record<string, unknown>).content === "string" &&
        (typeof (section as Record<string, unknown>).slot === "undefined" ||
          typeof (section as Record<string, unknown>).slot === "string") &&
        (typeof (section as Record<string, unknown>).type === "undefined" ||
          typeof (section as Record<string, unknown>).type === "string"),
    ) &&
    Array.isArray(record.missingFields) &&
    record.missingFields.every((field) => typeof field === "string") &&
    typeof record.confidence === "number"
  );
}

function extractLayoutSlots(layout: unknown) {
  if (!Array.isArray(layout)) return [];

  return layout.flatMap((page) => {
    const pageRecord = page as LayoutPage;
    if (!Array.isArray(pageRecord.blocks)) return [];

    return pageRecord.blocks.map((block) => ({
      contentHint: block.content || "",
      id: block.id || "",
      slot: block.slot || block.title || "",
      title: block.title || block.slot || "",
    }));
  });
}
