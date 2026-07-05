import { buildDocumentBrainReference } from "@/app/document-brain/references";
import { detectDocumentFamily, type DocumentFamily, type StyleMode } from "@/app/document-brain/families";

export const runtime = "nodejs";

type DocumentBrainSection = {
  content: string;
  formatHint?: string;
  slot?: string;
  styleHint?: {
    border?: boolean;
    box?: boolean;
    boxType?: string;
    divider?: boolean;
    documentHeader?: boolean;
    sectionHeading?: boolean;
    signatureLine?: boolean;
    tableBorder?: boolean;
    underline?: boolean;
  };
  targetBlockId?: string;
  type?: string;
};

type DocumentBrainResponse = {
  confidence: number;
  documentFamily?: DocumentFamily;
  documentType: string;
  plan?: {
    documentGoal?: string;
    layoutStrategy?: string;
    sectionOrder?: string[];
    writingStyle?: string;
  };
  missingFields: string[];
  styleMode?: StyleMode;
  sections: DocumentBrainSection[];
  title: string;
};

const requiredShape: DocumentBrainResponse = {
  confidence: 0,
  documentFamily: "LETTER_DOCUMENT",
  documentType: "",
  missingFields: [],
  plan: {
    documentGoal: "",
    layoutStrategy: "",
    sectionOrder: [],
    writingStyle: "",
  },
  sections: [
    {
      content: "",
      formatHint: "",
      slot: "",
      styleHint: {
        border: false,
        box: false,
        boxType: "",
        divider: false,
        documentHeader: false,
        sectionHeading: false,
        signatureLine: false,
        tableBorder: false,
        underline: false,
      },
      targetBlockId: "",
    },
  ],
  styleMode: "malaysia_formal",
  title: "",
};

type LayoutBlock = {
  content?: string;
  height?: number;
  id?: string;
  slot?: string;
  title?: string;
  width?: number;
  x?: number;
  y?: number;
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
  const internalReference = buildDocumentBrainReference(prompt);

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
              "11. If Auto Layout is selected, choose a professional layout based on documentType.",
              "12. If User Layout is selected, do not change the user's layout; fill available slots.",
              "12a. If Smart Compose is selected, generate a complete new document while using the user's slot order, position, labels, and rough structure as the main guide.",
              "13. Treat layout slots as anchors.",
              "14. Adapt writing style, structure, and styling based on documentType.",
              "15. Use document styling such as divider, table, border, box, underline, and signature line only when appropriate.",
              "15a. Use documentHeader for the main title/header block. Use sectionHeading for blocks that start with a section title.",
              "16. For formal letters, avoid excessive boxes and use signature line only where needed.",
              "17. For invoices, quotations, payslips, forms, schedules, and statements, use tables, boxes, totals, and clear lines.",
              "18. For reports and minutes, use section headings, dividers, and one-column structure by default.",
              "19. Return missingFields for important missing data, but still generate a usable draft.",
              "20. Do not output builder instructions such as 'Klik untuk edit' or 'Masukkan'.",
              "21. Write like a skilled Malaysian office/admin worker, teacher, clerk, HR assistant, or business operator would write.",
              "22. Do not write like a chatbot, marketing copy, essay, or AI-generated explanation.",
              "23. Avoid generic AI-sounding phrases such as 'dokumen ini bertujuan', 'secara keseluruhannya', 'adalah diharapkan agar', 'dengan ini dimaklumkan bahawa' unless they are natural for the document.",
              "24. Use specific wording from the user's facts. If facts are limited, keep the sentence plain and usable instead of adding filler.",
              "25. Prefer short professional paragraphs over long robotic paragraphs.",
              "26. Do not over-polish with excessive formal connectors. Use natural Malaysian formal writing.",
              "27. Do not repeat the same idea in multiple sections.",
              "28. Each section must add useful content, not generic explanation.",
              "29. Before writing sections, internally plan the document goal, section order, layout strategy and suitable target block for each section.",
              "30. Return that plan in the JSON 'plan' field. The plan must be short and useful for layout mapping.",
              "31. If a current A4 block is a strong match, include targetBlockId in the section using that block id.",
              "32. Use targetBlockId only when the content genuinely belongs in that block.",
              "33. Keep each section length suitable for the target block size. Small blocks need concise content; large body blocks can use fuller paragraphs.",
              "34. If content is too long for one likely block, split it into multiple logical sections with clear slots.",
              "35. Make the output look like a real printed document, not plain text. Use documentHeader for title, sectionHeading for sections, infoBox/summaryBox for key metadata, signatureLine for signatures, tableBorder for tables and totalBox for totals.",
              "36. Treat the output as a final office draft. It must be usable immediately after light editing, not merely a skeleton.",
              "37. Every section must contain context-aware content. Avoid empty administrative phrases that do not add facts, actions or decisions.",
              "38. If the user asks for a document with limited details, write a concise high-quality version using only safe general terms.",
              "39. If a section needs missing information, include one clean placeholder inside the sentence instead of making the whole section placeholder-heavy.",
              "40. Use varied sentence openings across sections so the document sounds human and professionally edited.",
              "41. Before returning JSON, do an internal editor pass for grammar, punctuation, capitalization, section order, duplication and document realism.",
              "42. For Malay documents, use natural Malaysian formal wording. Avoid direct English-style translations.",
              "",
              "Universal slots include: title, subtitle, date, reference, recipient, sender, salutation, body, paragraph, closing, signature, name, address, phone, email, table, list, amount, total, description, remarks, footer, header, logo, section, case_info, background, issue, observation, action_taken, current_status, recommendation, conclusion, meeting_info, attendees, agenda, discussion, decision, follow_up, employee_info, employer_info, customer_info, item_table, payment_info, custom.",
              "If a custom slot label is provided, infer its purpose from the label and contentHint.",
              "",
              "Document family system:",
              "- LETTER_DOCUMENT: surat rasmi, surat rayuan, surat permohonan, surat tidak hadir, surat akuan, surat sokongan.",
              "- REPORT_DOCUMENT: laporan aktiviti, laporan kes, laporan program, laporan kerja, laporan harian, laporan lawatan, RPA, RPH, RPI.",
              "- FINANCIAL_DOCUMENT: slip gaji, invoice, resit, sebut harga, penyata bayaran, tuntutan bayaran.",
              "- MEETING_DOCUMENT: minit mesyuarat, agenda mesyuarat, senarai kehadiran, tindakan susulan.",
              "- AGREEMENT_DOCUMENT: surat perjanjian ringkas, perjanjian sewa, perjanjian kerja, akuan terima, surat persetujuan.",
              "- FORM_DOCUMENT: borang ringkas, borang maklumat diri, checklist, rekod harian.",
              "Always return the correct documentFamily. Do not make every document look like a letter.",
              "",
              "Placeholder policy:",
              "- Placeholder only for important data the user did not provide.",
              "- If a general term can work, use it instead of a placeholder. Examples: Pihak Sekolah, Pihak Tuan/Puan, Pelanggan, Majikan.",
              "- Do not invent IC numbers, addresses, money amounts, exact dates, full names, or sensitive facts.",
              "- For forms, placeholders are acceptable when the form is meant to be filled.",
              "- Avoid placeholder-heavy writing. One or two key placeholders are acceptable; a full document filled with brackets is not acceptable.",
              "",
              "Human writing quality:",
              "- Make the output feel written by a competent person preparing a real document for work.",
              "- Use clean grammar, natural punctuation, correct capitalization, and a steady professional tone.",
              "- Avoid unnecessary words like 'amat', 'sangat', 'pelbagai', 'komprehensif', 'holistik', 'selaras dengan keperluan semasa' unless the user asked for that style.",
              "- Avoid vague filler such as 'perkara ini penting untuk memastikan kelancaran urusan' unless it adds real meaning.",
              "- For reports, write direct observations and actions. For letters, write clear request/reason. For resume, write credible human achievements. For invoice/slip, keep it factual.",
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
              "Styling rules:",
              "- Letters: usually no boxes; use signatureLine for signature sections.",
              "- Resume: use divider lines between sections.",
              "- Invoice, quotation, receipt: use tableBorder for item tables and totalBox for totals.",
              "- Payslip: use infoBox, tableBox and totalBox.",
              "- Reports and minutes: use divider lines and one-column section flow.",
              "- Forms: use formBox, underline and simple input lines.",
              "",
              "formatHint values: heading, subheading, paragraph, list, table, amount, total, signature, date, contact, footer, form, section, summary.",
              "styleHint may include documentHeader and sectionHeading to make the A4 preview look like a real document.",
              "For reports, minutes, RPA, RPH, RPI and case reports, most major sections should use sectionHeading or infoBox when appropriate.",
              "boxType values: infoBox, tableBox, totalBox, signatureBox, formBox, summaryBox, warningBox, plainBox.",
              "",
              internalReference,
            ].join("\n"),
            role: "system",
          },
          {
            content: [
              `Language: ${language}`,
              "Return exactly this JSON shape:",
              JSON.stringify(requiredShape),
              "- confidence must be a number from 0 to 1.",
              "- documentFamily must be one of LETTER_DOCUMENT, REPORT_DOCUMENT, FINANCIAL_DOCUMENT, MEETING_DOCUMENT, AGREEMENT_DOCUMENT, FORM_DOCUMENT.",
              "- styleMode must be simple, malaysia_formal, or premium.",
              "- plan must summarize documentGoal, sectionOrder, layoutStrategy and writingStyle.",
              "- sections must contain slot, content, formatHint, styleHint and targetBlockId when useful.",
              "- Use the provided current A4 layout slots when possible.",
              "- If a layout slot exists, return content for that exact slot.",
              body.layoutMode === "smart"
                ? "- Smart Compose is active. Create a complete document from the user's instruction, but follow the user's A4 item order, positions, labels, sizes and structure. Fill existing slots first. Add extra sections only when they are genuinely needed for a professional document."
                : "- Do not create a new visual layout. Fill the user's existing layout slots.",
              "- missingFields must list only important missing details.",
              "- content must be ready to print in an A4 preview.",
              "- content must sound human, specific, and professionally edited.",
              "- Avoid AI-like filler, repeated openings, repeated conclusions, and generic corporate language.",
              "- Each content section must be strong enough to stand alone in a printed document.",
              "- Prefer concrete office-style wording: what happened, what is requested, what action was taken, what is recommended.",
              "- Do not produce vague filler just to make the document longer.",
              "- If the user gives little information, generate a clean short draft instead of adding long assumptions.",
              `Layout mode: ${body.layoutMode === "auto" ? "Auto Layout Dokumen" : body.layoutMode === "smart" ? "Smart Compose" : "Guna Layout Saya"}`,
              body.layoutMode === "auto"
                ? "- Auto Layout Dokumen is active. Return professional document-specific slots and styleHint. Ignore unsuitable letter-style slots when the document is not a letter."
                : body.layoutMode === "smart"
                  ? "- Smart Compose is active. Produce a polished full document. Respect the user's visible item sequence and use slot names as anchors, but you may return extra useful sections after matching the existing slots."
                  : "- Guna Layout Saya is active. Respect the user's existing slot positions.",
              `Current A4 layout slots: ${JSON.stringify(layoutSlots)}`,
              `User request: ${prompt}`,
            ].join("\n"),
            role: "user",
          },
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.18,
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

    return Response.json(polishDocumentBrainResponse(parsed));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Ralat tidak dijangka semasa memanggil OpenAI API." },
      { status: 500 },
    );
  }
}

function polishDocumentBrainResponse(response: DocumentBrainResponse): DocumentBrainResponse {
  const family = response.documentFamily || detectDocumentFamily(`${response.documentType} ${response.title}`);
  return {
    ...response,
    documentFamily: family,
    sections: response.sections.map((section) => ({
      ...section,
      content: polishDocumentText(section.content),
    })),
    styleMode: response.styleMode || "malaysia_formal",
    title: polishDocumentText(response.title),
  };
}

function polishDocumentText(value: string) {
  return value
    .replace(/\bsebagai (sebuah )?(model )?ai\b[:,]?\s*/gi, "")
    .replace(/\bberikut (adalah|ialah) (draf|dokumen|contoh)[^:\n]*:\s*/gi, "")
    .replace(/\bsemoga (dokumen|maklumat) ini (dapat )?membantu[^.\n]*\.?\s*/gi, "")
    .replace(/\bsecara keseluruhannya,\s*/gi, "")
    .replace(/\badalah diharapkan agar\s*/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isDocumentBrainResponse(value: unknown): value is DocumentBrainResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.documentType === "string" &&
    (typeof record.documentFamily === "undefined" || isDocumentFamily(record.documentFamily)) &&
    (typeof record.plan === "undefined" || isDocumentPlan(record.plan)) &&
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
        (typeof (section as Record<string, unknown>).styleHint === "undefined" ||
          typeof (section as Record<string, unknown>).styleHint === "object") &&
        (typeof (section as Record<string, unknown>).targetBlockId === "undefined" ||
          typeof (section as Record<string, unknown>).targetBlockId === "string") &&
        (typeof (section as Record<string, unknown>).type === "undefined" ||
          typeof (section as Record<string, unknown>).type === "string"),
    ) &&
    Array.isArray(record.missingFields) &&
    record.missingFields.every((field) => typeof field === "string") &&
    (typeof record.styleMode === "undefined" || isStyleMode(record.styleMode)) &&
    typeof record.confidence === "number"
  );
}

function isDocumentFamily(value: unknown): value is DocumentFamily {
  return (
    value === "AGREEMENT_DOCUMENT" ||
    value === "FINANCIAL_DOCUMENT" ||
    value === "FORM_DOCUMENT" ||
    value === "LETTER_DOCUMENT" ||
    value === "MEETING_DOCUMENT" ||
    value === "REPORT_DOCUMENT"
  );
}

function isStyleMode(value: unknown): value is StyleMode {
  return value === "malaysia_formal" || value === "premium" || value === "simple";
}

function isDocumentPlan(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    (typeof record.documentGoal === "undefined" || typeof record.documentGoal === "string") &&
    (typeof record.layoutStrategy === "undefined" || typeof record.layoutStrategy === "string") &&
    (typeof record.writingStyle === "undefined" || typeof record.writingStyle === "string") &&
    (typeof record.sectionOrder === "undefined" ||
      (Array.isArray(record.sectionOrder) && record.sectionOrder.every((section) => typeof section === "string")))
  );
}

function extractLayoutSlots(layout: unknown) {
  if (!Array.isArray(layout)) return [];

  return layout.flatMap((page) => {
    const pageRecord = page as LayoutPage;
    if (!Array.isArray(pageRecord.blocks)) return [];

    return pageRecord.blocks.map((block) => ({
      contentHint: block.content || "",
      height: typeof block.height === "number" ? block.height : undefined,
      id: block.id || "",
      slot: block.slot || block.title || "",
      title: block.title || block.slot || "",
      width: typeof block.width === "number" ? block.width : undefined,
      x: typeof block.x === "number" ? block.x : undefined,
      y: typeof block.y === "number" ? block.y : undefined,
    }));
  });
}
