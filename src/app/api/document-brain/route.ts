export const runtime = "nodejs";

type DocumentBrainSection = {
  type: string;
  content: string;
};

type DocumentBrainResponse = {
  confidence: number;
  documentType: string;
  layout: string;
  missingFields: string[];
  paperSize: "A4";
  sections: DocumentBrainSection[];
  title: string;
};

const requiredShape: DocumentBrainResponse = {
  confidence: 0,
  documentType: "",
  layout: "",
  missingFields: [],
  paperSize: "A4",
  sections: [],
  title: "",
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY tiada. Sila tambah environment variable OPENAI_API_KEY di Vercel." },
      { status: 500 },
    );
  }

  let body: { language?: string; prompt?: string };
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

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      body: JSON.stringify({
        messages: [
          {
            content:
              "You are lY Docs document brain. Return JSON only. Do not wrap in markdown. Create a professional Malaysian document plan and content.",
            role: "system",
          },
          {
            content: [
              `Language: ${language}`,
              "Return exactly this JSON shape:",
              JSON.stringify(requiredShape),
              "Rules:",
              "- paperSize must be A4.",
              "- confidence must be a number from 0 to 1.",
              "- sections must contain editable document sections with type and content.",
              "- missingFields must list missing important details only.",
              "- content must be ready to place into an A4 preview.",
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
    typeof record.layout === "string" &&
    record.paperSize === "A4" &&
    typeof record.title === "string" &&
    Array.isArray(record.sections) &&
    record.sections.every(
      (section) =>
        section &&
        typeof section === "object" &&
        typeof (section as Record<string, unknown>).type === "string" &&
        typeof (section as Record<string, unknown>).content === "string",
    ) &&
    Array.isArray(record.missingFields) &&
    record.missingFields.every((field) => typeof field === "string") &&
    typeof record.confidence === "number"
  );
}
