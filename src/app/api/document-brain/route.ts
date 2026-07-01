export const runtime = "nodejs";

type DocumentBrainSection = {
  content: string;
  formatHint?: string;
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
  sections: [{ content: "", formatHint: "", slot: "" }],
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

  let body: { language?: string; layout?: unknown; layoutMode?: string; prompt?: string };
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
              "You are a universal AI document engine for Malaysian users.",
              "",
              "Your job is to generate complete, professional, print-ready documents based on:",
              "- document type",
              "- user instruction",
              "- provided user data",
              "- available layout slots",
              "- uploaded template/image if available",
              "",
              "Rules:",
              "1. Output valid JSON only.",
              "2. Do not chat casually.",
              "3. Do not explain your answer.",
              "4. Generate a complete document, not an empty template.",
              "5. Use Malay by default unless the user asks another language.",
              "6. Preserve user-provided names, dates, places, numbers, and facts exactly.",
              "7. Do not invent sensitive personal details, IDs, addresses, amounts, or legal facts.",
              "8. Use minimal placeholders only when important information is missing.",
              "9. Do not overuse placeholders.",
              "10. Match every content section to the most suitable layout slot.",
              "11. Do not change the user's layout.",
              "12. Treat layout slots as anchors; fill them with suitable content.",
              "13. Adapt writing style and structure based on documentType.",
              "14. Do not force every document into a letter format.",
              "15. For letters, use formal Malaysian document style.",
              "16. For resumes, use concise professional sections.",
              "17. For invoices, quotations, payslips, schedules, and minutes, use structured lists or tables where suitable.",
              "18. Return missingFields for important missing data, but still generate a usable draft.",
              "19. Do not output builder instructions such as 'Klik untuk edit' or 'Masukkan'.",
              "",
              "Universal slots include: title, subtitle, date, reference, recipient, sender, salutation, body, paragraph, closing, signature, name, address, phone, email, table, list, amount, total, description, remarks, footer, header, logo, section, custom.",
              "If a custom slot label is provided, infer its purpose from the label and contentHint.",
              "",
              "Placeholder policy:",
              "- Placeholder only for important data the user did not provide.",
              "- If a general term can work, use it instead of a placeholder. Examples: Pihak Sekolah, Pihak Tuan/Puan, Pelanggan, Majikan.",
              "- Do not invent IC numbers, addresses, money amounts, exact dates, full names, or sensitive facts.",
              "- For forms, placeholders are acceptable when the form is meant to be filled.",
              "",
              "Document-specific behavior:",
              "- Surat rasmi / surat permohonan / surat rayuan: uppercase title, suitable recipient, salutation, clear reason/request, polite closing and signature.",
              "- Surat tidak rasmi: friendly but neat tone, no overly formal government style.",
              "- Resume: concise profile, education, skills, experience if relevant; use list format when suitable.",
              "- Slip gaji: employee, employer, pay period, earnings, deductions, gross/net pay. Do not invent amounts.",
              "- Invoice / quotation: document number if provided or placeholder, date, customer, item list, quantity, price, total. Calculate totals from provided amounts.",
              "- Laporan: title, date, purpose/objective, details, findings, conclusion/recommendation.",
              "- Laporan kes / case report: use LAPORAN KES and sections: case_info, background, issue, observation, action_taken, current_status, recommendation, conclusion.",
              "- For laporan kes, do not force recipient, salutation or closing unless user provided a layout slot for them.",
              "- If the document is laporan kes / case report, return documentType 'laporan_kes', title 'LAPORAN KES', and sections using slots exactly: title, case_info, background, issue, observation, action_taken, current_status, recommendation, conclusion.",
              "- For Auto Layout reports, report-specific slots are preferred even when the current layout slots look like a letter template.",
              "- Minit mesyuarat: title, date, time, venue, attendance, agenda, decisions, actions.",
              "- Borang: label + blank/fillable areas; use placeholders only where data is meant to be filled.",
              "- Jadual: arrange by day/date/time/category when suitable.",
              "- Kontrak ringkas: parties, purpose, terms, payment if provided, signatures; do not invent legal facts.",
              "",
              "formatHint values: heading, paragraph, list, table, amount, signature, date, contact, footer.",
            ].join("\n"),
            role: "system",
          },
          {
            content: [
              `Language: ${language}`,
              "Return exactly this JSON shape:",
              JSON.stringify(requiredShape),
              "- confidence must be a number from 0 to 1.",
              "- sections must contain slot, content and formatHint when useful.",
              "- Use the provided current A4 layout slots when possible.",
              "- If a layout slot exists, return content for that exact slot.",
              "- Do not create a new visual layout. Fill the user's existing layout slots.",
              "- missingFields must list only important missing details.",
              "- content must be ready to print in an A4 preview.",
              `Layout mode: ${body.layoutMode === "auto" ? "Auto Layout Dokumen" : "Guna Layout Saya"}`,
              body.layoutMode === "auto"
                ? "- Auto Layout Dokumen is active. For reports/laporan/laporan kes, ignore unsuitable letter-style slots and return one-column report sections from top to bottom."
                : "- Guna Layout Saya is active. Respect the user's existing slot positions.",
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
        (typeof (section as Record<string, unknown>).formatHint === "undefined" ||
          typeof (section as Record<string, unknown>).formatHint === "string") &&
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
