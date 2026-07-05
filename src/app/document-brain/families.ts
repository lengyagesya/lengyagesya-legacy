export type DocumentFamily =
  | "AGREEMENT_DOCUMENT"
  | "FINANCIAL_DOCUMENT"
  | "FORM_DOCUMENT"
  | "LETTER_DOCUMENT"
  | "MEETING_DOCUMENT"
  | "REPORT_DOCUMENT";

export type StyleMode = "malaysia_formal" | "premium" | "simple";

export type QualityIssue = {
  message: string;
  severity: "info" | "warning";
};

export type DocumentQualityReport = {
  completeness: number;
  format: number;
  language: number;
  layout: number;
  pdfReady: number;
  professional: number;
  issues: QualityIssue[];
};

type BlockLike = {
  content: string;
  fontSize: number;
  height: number;
  slot: string;
  width: number;
  x: number;
  y: number;
};

type PageLike = {
  blocks: BlockLike[];
};

export const familyLabels: Record<DocumentFamily, string> = {
  AGREEMENT_DOCUMENT: "Perjanjian",
  FINANCIAL_DOCUMENT: "Kewangan",
  FORM_DOCUMENT: "Borang",
  LETTER_DOCUMENT: "Surat",
  MEETING_DOCUMENT: "Mesyuarat",
  REPORT_DOCUMENT: "Laporan",
};

export const familySectionOrders: Record<DocumentFamily, string[]> = {
  AGREEMENT_DOCUMENT: [
    "title",
    "date",
    "parties",
    "background",
    "clause",
    "terms",
    "duration",
    "responsibility",
    "payment",
    "termination",
    "signature",
    "witness",
  ],
  FINANCIAL_DOCUMENT: [
    "title",
    "document_no",
    "date",
    "payee",
    "payer",
    "customer_info",
    "item_table",
    "table",
    "subtotal",
    "deduction",
    "total",
    "payment_info",
    "signature",
  ],
  FORM_DOCUMENT: ["title", "instruction", "section", "name", "date", "field_group", "checkbox", "table", "declaration", "signature"],
  LETTER_DOCUMENT: ["sender", "address", "reference", "date", "recipient", "title", "salutation", "body", "paragraph", "closing", "signature"],
  MEETING_DOCUMENT: [
    "title",
    "meeting_info",
    "date",
    "attendees",
    "agenda",
    "discussion",
    "decision",
    "action_items",
    "follow_up",
    "next_meeting",
    "prepared_by",
    "signature",
  ],
  REPORT_DOCUMENT: [
    "title",
    "prepared_by",
    "date",
    "case_info",
    "background",
    "objective",
    "details",
    "activity",
    "process",
    "issue",
    "observation",
    "findings",
    "action_taken",
    "current_status",
    "recommendation",
    "conclusion",
    "signature",
  ],
};

export function detectDocumentFamily(input: string): DocumentFamily {
  const value = input.toLowerCase();

  if (matchesAny(value, ["slip gaji", "payslip", "invoice", "resit", "receipt", "sebut harga", "quotation", "penyata", "tuntutan bayaran"])) {
    return "FINANCIAL_DOCUMENT";
  }

  if (matchesAny(value, ["minit", "mesyuarat", "agenda", "kehadiran", "tindakan susulan"])) {
    return "MEETING_DOCUMENT";
  }

  if (matchesAny(value, ["perjanjian", "agreement", "kontrak", "akuan terima", "penyerahan hak", "persetujuan"])) {
    return "AGREEMENT_DOCUMENT";
  }

  if (matchesAny(value, ["borang", "form", "checklist", "senarai semak", "rekod harian", "pendaftaran"])) {
    return "FORM_DOCUMENT";
  }

  if (matchesAny(value, ["laporan", "report", "kes", "aktiviti", "program", "lawatan", "pemerhatian", "insiden", "rpa", "rph", "rpi"])) {
    return "REPORT_DOCUMENT";
  }

  return "LETTER_DOCUMENT";
}

export function getFamilyOrder(family: DocumentFamily) {
  return familySectionOrders[family];
}

export function getRequiredSlots(family: DocumentFamily) {
  const required: Record<DocumentFamily, string[]> = {
    AGREEMENT_DOCUMENT: ["title", "parties", "terms", "signature"],
    FINANCIAL_DOCUMENT: ["title", "date", "payer", "payee", "item_table", "total"],
    FORM_DOCUMENT: ["title", "section", "signature"],
    LETTER_DOCUMENT: ["date", "recipient", "title", "body", "signature"],
    MEETING_DOCUMENT: ["title", "meeting_info", "attendees", "agenda", "decision", "follow_up"],
    REPORT_DOCUMENT: ["title", "background", "objective", "observation", "recommendation", "conclusion"],
  };
  return required[family];
}

export function isFinancialSlot(slot: string) {
  return matchesAny(slot, ["table", "item", "amount", "subtotal", "total", "payment", "payer", "payee", "customer"]);
}

export function isSignatureSlot(slot: string) {
  return matchesAny(slot, ["signature", "tandatangan", "witness", "saksi", "prepared_by"]);
}

export function evaluateDocumentQuality(pages: PageLike[], family: DocumentFamily): DocumentQualityReport {
  const blocks = pages.flatMap((page) => page.blocks);
  const slots = new Set(blocks.map((block) => normalizeSlotForFamily(block.slot)));
  const requiredSlots = getRequiredSlots(family);
  const filledBlocks = blocks.filter((block) => hasRealContent(block.content));
  const missingRequired = requiredSlots.filter((slot) => !slots.has(slot) && !filledBlocks.some((block) => normalizeSlotForFamily(block.slot).includes(slot)));
  const outOfBounds = blocks.filter((block) => block.x < 28 || block.y < 28 || block.x + block.width > 744 || block.y + block.height > 1052);
  const hugeFonts = blocks.filter((block) => block.fontSize > 24);
  const tinyFonts = blocks.filter((block) => block.fontSize < 8.5);
  const emptyImportantBlocks = blocks.filter((block) => !hasRealContent(block.content) && !["logo", "cop", "stamp"].includes(normalizeSlotForFamily(block.slot)));
  const genericBlocks = blocks.filter((block) => /dokumen ini bertujuan|secara keseluruhannya|adalah diharapkan agar|semoga dokumen/i.test(block.content));
  const issues: QualityIssue[] = [];

  missingRequired.forEach((slot) => issues.push({ message: `Maklumat penting belum lengkap: ${humanizeSlot(slot)}.`, severity: "warning" }));
  if (outOfBounds.length > 0) issues.push({ message: "Ada elemen terlalu hampir atau keluar daripada margin A4.", severity: "warning" });
  if (hugeFonts.length > 0) issues.push({ message: "Tajuk atau teks terlalu besar untuk dokumen print.", severity: "warning" });
  if (tinyFonts.length > 0) issues.push({ message: "Ada teks terlalu kecil untuk dibaca selepas export PDF.", severity: "warning" });
  if (emptyImportantBlocks.length > 0) issues.push({ message: "Ada ruang dokumen yang masih kosong.", severity: "info" });
  if (genericBlocks.length > 0) issues.push({ message: "Ada ayat yang masih terlalu generik dan patut diprofesionalkan.", severity: "info" });

  const completeness = clampScore(100 - missingRequired.length * 14 - emptyImportantBlocks.length * 4);
  const layout = clampScore(100 - outOfBounds.length * 18 - hugeFonts.length * 6 - tinyFonts.length * 8);
  const language = clampScore(100 - genericBlocks.length * 12);
  const format = clampScore((completeness + layout) / 2);
  const pdfReady = clampScore(layout - outOfBounds.length * 8);
  const professional = clampScore(Math.round((completeness + format + language + layout + pdfReady) / 5));

  return {
    completeness,
    format,
    language,
    layout,
    pdfReady,
    professional,
    issues: issues.slice(0, 6),
  };
}

export function normalizeSlotForFamily(slot: string) {
  return slot.toLowerCase().trim().replace(/\s+/g, "_").replace(/-+/g, "_");
}

function matchesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word));
}

function hasRealContent(content: string) {
  const clean = content.replace(/[_\-[\]\s.]/g, "");
  return clean.length > 2 && !/klikuntukedit|clicktoedit|masukkan/i.test(clean);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function humanizeSlot(slot: string) {
  return slot.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
