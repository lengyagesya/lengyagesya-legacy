"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type DragEvent, type PointerEvent as ReactPointerEvent, createContext, useContext, useEffect, useRef, useState } from "react";

type Language = "ms" | "en";
type DocumentBlockStyle = {
  border?: boolean;
  box?: boolean;
  boxType?: string;
  divider?: boolean;
  signatureLine?: boolean;
  tableBorder?: boolean;
  underline?: boolean;
};
type PaperBlock = {
  align: "center" | "left" | "right";
  content: string;
  fontSize: number;
  fontWeight: "bold" | "normal";
  height: number;
  id: string;
  lineHeight: number;
  slot: string;
  style?: DocumentBlockStyle;
  title: string;
  underline: boolean;
  width: number;
  x: number;
  y: number;
};
type PaperPage = {
  blocks: PaperBlock[];
  id: string;
  title: string;
};
type PaperDrag = {
  id: string;
  originX: number;
  originY: number;
  pageId: string;
  startX: number;
  startY: number;
} | null;
type AlignmentGuide = {
  x?: number;
  y?: number;
};
type ActiveBlock = {
  blockId: string;
  pageId: string;
} | null;
type LayoutMode = "user" | "auto";
type DocumentBrainSection = {
  content: string;
  formatHint?: string;
  slot?: string;
  styleHint?: DocumentBlockStyle;
  type?: string;
};
type DocumentBrainResult = {
  confidence: number;
  documentType: string;
  missingFields: string[];
  layout?: string;
  paperSize?: "A4";
  sections: DocumentBrainSection[];
  title: string;
};
type DocumentTypeId =
  | "rpa"
  | "rph"
  | "rpi"
  | "agreement"
  | "appeal-letter"
  | "appointment-letter"
  | "formal-letter"
  | "meeting-minutes"
  | "report"
  | "activity-report"
  | "program-report"
  | "daily-report"
  | "weekly-report"
  | "monthly-report"
  | "attendance-report"
  | "progress-report"
  | "observation-report"
  | "reflection-report"
  | "intervention-report"
  | "visit-report"
  | "assessment-report"
  | "performance-report"
  | "case-report"
  | "certificate"
  | "checklist"
  | "complaint-letter"
  | "consent-letter"
  | "incident-report"
  | "invitation-letter"
  | "invoice"
  | "resume"
  | "biodata"
  | "memo"
  | "notice-letter"
  | "assignment"
  | "form"
  | "application-letter"
  | "proposal"
  | "purchase-order"
  | "quotation"
  | "receipt"
  | "working-paper"
  | "lesson-plan"
  | "therapy-session-plan"
  | "daily-activity-plan"
  | "weekly-activity-plan"
  | "program-plan"
  | "school-document"
  | "thank-you-letter"
  | "ppdk"
  | "taska"
  | "custom-template";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({
  language: "ms",
  setLanguage: () => undefined,
});

const copy = {
  ms: {
    navDocuments: "Dokumen",
    navBuilder: "Builder",
    navLogin: "Login",
    navStart: "Mula",
    landingHeadline: "Bina dokumen kemas tanpa mula dari kosong.",
    landingSubheadline: "Pilih jenis dokumen, susun item, isi maklumat, kemudian hantar ke AI untuk hasil akhir.",
    landingCta: "Mula Buat Dokumen",
    landingSecondary: "Lihat Contoh",
    featureTemplate: "Template siap susun",
    featureTemplateBody: "Pilih struktur awal yang kemas untuk surat, laporan, RPA, resume dan dokumen kerja.",
    featureDrag: "Drag & edit item",
    featureDragBody: "Susun semula blok, ubah teks terus pada kertas, dan bina dokumen ikut cara kerja sendiri.",
    featureToken: "Token AI hanya bila submit",
    featureTokenBody: "Edit manual dahulu. Token digunakan hanya apabila dokumen dihantar untuk bantuan AI.",
    featureExport: "Export PDF",
    featureExportBody: "Sediakan dokumen yang bersih untuk fasa export dan perkongsian profesional.",
    workDocument: "Dokumen Kerja",
    readyTemplate: "Template siap",
    editableBlocks: "Blok boleh edit",
    aiReady: "Sedia hantar ke AI",
    previewBody: "Ruang dokumen disusun kemas untuk diisi, disemak dan disiapkan.",
    authLoginKicker: "Masuk semula",
    authRegisterKicker: "Daftar akaun",
    authLoginTitle: "Login lY Docs",
    authRegisterTitle: "Register lY Docs",
    authNote: "UI sahaja untuk fasa ini. Butang akan membawa anda terus ke ruang dokumen.",
    fullName: "Nama penuh",
    email: "Alamat emel",
    password: "Kata laluan",
    register: "Register",
    login: "Login",
    loginSubmit: "Login",
    registerSubmit: "Daftar",
    noAccount: "Belum ada akaun? ",
    hasAccount: "Sudah ada akaun? ",
    createTitle: "Buat Dokumen",
    createBody: "Pilih jenis dokumen. Fasa 1 membuka canvas yang sudah disusun dengan blok boleh edit.",
    openBlocks: "Buka blok A4 boleh edit.",
    builderControls: "Kawalan builder",
    documentType: "Jenis dokumen",
    submitLater: "Hantar",
    sending: "Sedang jana...",
    downloadPdf: "Download PDF",
    editLayout: "Edit Layout",
    previewResult: "Preview Hasil",
    aiResult: "Hasil AI",
    missingFields: "Maklumat belum lengkap",
    selectDocumentPlaceholder: "Pilih jenis dokumen",
    documentBrief: "Penerangan dokumen",
    documentBriefPlaceholder: "Contoh: Saya mahu buat surat rasmi memohon kebenaran mengadakan program di sekolah.",
    layoutMode: "Mode layout",
    useMyLayout: "Guna Layout Saya",
    autoLayoutDocument: "Auto Layout Dokumen",
    itemTools: "Tools item",
    itemToolsBody: "Pilih atau drag item masuk ke dalam kertas.",
    itemTitle: "Nama item",
    itemContent: "Isi item",
    addToPaper: "Simpan ke kertas",
    formatTools: "Format item",
    boldText: "Tebal",
    underlineText: "Garisan",
    alignLeft: "Kiri",
    alignCenter: "Tengah",
    alignRight: "Kanan",
    fontSize: "Saiz teks",
    lineSpacing: "Jarak tulisan",
    quickItems: "Item pantas",
    itemShelf: "Item untuk kertas",
    itemShelfBody: "Klik Pilih atau slide/drag item ke atas kertas.",
    logoTools: "Logo dan cop",
    logoToolsBody: "Letak logo atau cop sebagai item berasingan pada kertas.",
    addPage: "Tambah Page",
    pageLabel: "Page",
    activePage: "Aktif",
    selectPage: "Pilih",
    deletePage: "Delete Page",
    chooseItem: "Pilih",
    dropHint: "Drop item di sini atau pilih item di sebelah kanan.",
    emptyTitle: "Item Baru",
    emptyContent: "Klik untuk edit kandungan item ini.",
  },
  en: {
    navDocuments: "Documents",
    navBuilder: "Builder",
    navLogin: "Login",
    navStart: "Start",
    landingHeadline: "Build clean documents without starting from scratch.",
    landingSubheadline: "Choose a document type, arrange items, fill in details, then submit to AI for the final result.",
    landingCta: "Start Document",
    landingSecondary: "View Example",
    featureTemplate: "Ready templates",
    featureTemplateBody: "Choose a clean starting structure for letters, reports, RPA, resumes and work documents.",
    featureDrag: "Drag & edit items",
    featureDragBody: "Reorder blocks, edit directly on paper, and build documents around your workflow.",
    featureToken: "AI tokens only on submit",
    featureTokenBody: "Edit manually first. Tokens are used only when the document is submitted for AI help.",
    featureExport: "Export PDF",
    featureExportBody: "Prepare clean documents for professional export and sharing.",
    workDocument: "Work Document",
    readyTemplate: "Ready template",
    editableBlocks: "Editable blocks",
    aiReady: "Ready for AI",
    previewBody: "The document space is neatly arranged for filling, reviewing and finishing.",
    authLoginKicker: "Welcome back",
    authRegisterKicker: "Create account",
    authLoginTitle: "Login to lY Docs",
    authRegisterTitle: "Register for lY Docs",
    authNote: "UI only for this phase. The button takes you straight to the document workspace.",
    fullName: "Full name",
    email: "Email address",
    password: "Password",
    register: "Register",
    login: "Login",
    loginSubmit: "Login",
    registerSubmit: "Register",
    noAccount: "No account yet? ",
    hasAccount: "Already registered? ",
    createTitle: "Create Document",
    createBody: "Select a document type. Phase 1 opens a pre-arranged canvas with editable blocks.",
    openBlocks: "Open editable A4 blocks.",
    builderControls: "Builder controls",
    documentType: "Document type",
    submitLater: "Send",
    sending: "Generating...",
    downloadPdf: "Download PDF",
    editLayout: "Edit Layout",
    previewResult: "Preview Result",
    aiResult: "AI result",
    missingFields: "Missing information",
    selectDocumentPlaceholder: "Select document type",
    documentBrief: "Document brief",
    documentBriefPlaceholder: "Example: I want to create a formal letter requesting permission to run a school programme.",
    layoutMode: "Layout mode",
    useMyLayout: "Use My Layout",
    autoLayoutDocument: "Auto Document Layout",
    itemTools: "Item tools",
    itemToolsBody: "Choose or drag an item into the paper.",
    itemTitle: "Item name",
    itemContent: "Item content",
    addToPaper: "Save to paper",
    formatTools: "Item format",
    boldText: "Bold",
    underlineText: "Line",
    alignLeft: "Left",
    alignCenter: "Center",
    alignRight: "Right",
    fontSize: "Text size",
    lineSpacing: "Line spacing",
    quickItems: "Quick items",
    itemShelf: "Paper items",
    itemShelfBody: "Click Choose or slide/drag an item onto the paper.",
    logoTools: "Logo and stamp",
    logoToolsBody: "Place logo or stamp as a separate item on the paper.",
    addPage: "Add Page",
    pageLabel: "Page",
    activePage: "Active",
    selectPage: "Select",
    deletePage: "Delete Page",
    chooseItem: "Choose",
    dropHint: "Drop an item here or choose one from the right panel.",
    emptyTitle: "New Item",
    emptyContent: "Click to edit this item content.",
  },
} satisfies Record<Language, Record<string, string>>;

function useLanguage() {
  const context = useContext(LanguageContext);
  return { ...context, t: copy[context.language] };
}

function getSortedDocumentTypes(language: Language) {
  return [...documentTypes].sort((firstType, secondType) =>
    documentTypeLabels[language][firstType].localeCompare(documentTypeLabels[language][secondType], language),
  );
}

const documentTypes: DocumentTypeId[] = [
  "agreement",
  "appeal-letter",
  "appointment-letter",
  "assessment-report",
  "attendance-report",
  "biodata",
  "case-report",
  "certificate",
  "checklist",
  "complaint-letter",
  "consent-letter",
  "custom-template",
  "daily-activity-plan",
  "daily-report",
  "form",
  "formal-letter",
  "incident-report",
  "intervention-report",
  "invitation-letter",
  "invoice",
  "lesson-plan",
  "meeting-minutes",
  "memo",
  "monthly-report",
  "notice-letter",
  "observation-report",
  "performance-report",
  "ppdk",
  "program-plan",
  "program-report",
  "progress-report",
  "proposal",
  "purchase-order",
  "quotation",
  "receipt",
  "reflection-report",
  "report",
  "resume",
  "rpa",
  "rph",
  "rpi",
  "school-document",
  "taska",
  "thank-you-letter",
  "therapy-session-plan",
  "visit-report",
  "weekly-activity-plan",
  "weekly-report",
  "working-paper",
  "activity-report",
  "assignment",
  "application-letter",
];

const documentTypeLabels: Record<Language, Record<DocumentTypeId, string>> = {
  ms: {
    agreement: "Perjanjian",
    "appeal-letter": "Surat rayuan",
    "appointment-letter": "Surat lantikan",
    rpa: "RPA",
    rph: "RPH",
    rpi: "RPI",
    "formal-letter": "Surat rasmi",
    "meeting-minutes": "Minit mesyuarat",
    report: "Laporan",
    "activity-report": "Laporan aktiviti",
    "program-report": "Laporan program",
    "daily-report": "Laporan harian",
    "weekly-report": "Laporan mingguan",
    "monthly-report": "Laporan bulanan",
    "attendance-report": "Laporan kehadiran",
    "progress-report": "Laporan kemajuan",
    "observation-report": "Laporan pemerhatian",
    "reflection-report": "Laporan refleksi",
    "intervention-report": "Laporan intervensi",
    "visit-report": "Laporan lawatan",
    "assessment-report": "Laporan penilaian",
    "performance-report": "Laporan prestasi",
    "case-report": "Laporan kes",
    certificate: "Sijil",
    checklist: "Senarai semak",
    "complaint-letter": "Surat aduan",
    "consent-letter": "Surat kebenaran",
    "incident-report": "Laporan insiden",
    "invitation-letter": "Surat jemputan",
    invoice: "Invois",
    resume: "Resume",
    biodata: "Biodata",
    memo: "Memo",
    "notice-letter": "Surat makluman",
    assignment: "Tugasan",
    form: "Borang",
    "application-letter": "Surat permohonan",
    proposal: "Proposal",
    "purchase-order": "Pesanan belian",
    quotation: "Sebut harga",
    receipt: "Resit",
    "working-paper": "Kertas kerja",
    "lesson-plan": "Lesson plan",
    "therapy-session-plan": "Pelan sesi terapi",
    "daily-activity-plan": "Pelan aktiviti harian",
    "weekly-activity-plan": "Pelan aktiviti mingguan",
    "program-plan": "Rancangan program",
    "school-document": "Dokumen sekolah",
    "thank-you-letter": "Surat penghargaan",
    ppdk: "PPDK",
    taska: "Taska",
    "custom-template": "Template custom",
  },
  en: {
    agreement: "Agreement",
    "appeal-letter": "Appeal letter",
    "appointment-letter": "Appointment letter",
    rpa: "RPA",
    rph: "RPH",
    rpi: "RPI",
    "formal-letter": "Formal letter",
    "meeting-minutes": "Meeting minutes",
    report: "Report",
    "activity-report": "Activity report",
    "program-report": "Program report",
    "daily-report": "Daily report",
    "weekly-report": "Weekly report",
    "monthly-report": "Monthly report",
    "attendance-report": "Attendance report",
    "progress-report": "Progress report",
    "observation-report": "Observation report",
    "reflection-report": "Reflection report",
    "intervention-report": "Intervention report",
    "visit-report": "Visit report",
    "assessment-report": "Assessment report",
    "performance-report": "Performance report",
    "case-report": "Case report",
    certificate: "Certificate",
    checklist: "Checklist",
    "complaint-letter": "Complaint letter",
    "consent-letter": "Consent letter",
    "incident-report": "Incident report",
    "invitation-letter": "Invitation letter",
    invoice: "Invoice",
    resume: "Resume",
    biodata: "Biodata",
    memo: "Memo",
    "notice-letter": "Notice letter",
    assignment: "Assignment",
    form: "Form",
    "application-letter": "Application letter",
    proposal: "Proposal",
    "purchase-order": "Purchase order",
    quotation: "Quotation",
    receipt: "Receipt",
    "working-paper": "Working paper",
    "lesson-plan": "Lesson plan",
    "therapy-session-plan": "Therapy session plan",
    "daily-activity-plan": "Daily activity plan",
    "weekly-activity-plan": "Weekly activity plan",
    "program-plan": "Program plan",
    "school-document": "School document",
    "thank-you-letter": "Thank-you letter",
    ppdk: "PPDK",
    taska: "Childcare document",
    "custom-template": "Custom template",
  },
};

const templates: Record<Language, Record<DocumentTypeId, string[]>> = {
  ms: {
    agreement: ["Tajuk Perjanjian", "Pihak Terlibat", "Tujuan", "Terma Perjanjian", "Tempoh", "Tandatangan"],
    "appeal-letter": ["Tarikh", "Penerima", "Perkara", "Latar Belakang Rayuan", "Alasan Rayuan", "Penutup", "Tandatangan"],
    "appointment-letter": ["Tarikh", "Penerima", "Perkara", "Butiran Lantikan", "Tanggungjawab", "Tempoh Lantikan", "Tandatangan"],
    rpa: ["Tajuk Aktiviti", "Objektif", "Bahan / Alat", "Langkah Pelaksanaan", "Pemerhatian", "Refleksi"],
    rph: ["Nama Sekolah", "Mata Pelajaran", "Tahun / Kelas", "Standard Kandungan", "Standard Pembelajaran", "Objektif Pembelajaran", "Aktiviti PdP", "Refleksi"],
    rpi: ["Maklumat Murid / Klien", "Kategori / Keperluan", "Matlamat Jangka Panjang", "Objektif Jangka Pendek", "Strategi / Intervensi", "Penilaian", "Catatan"],
    "formal-letter": ["Rujukan", "Tarikh", "Penerima", "Perkara", "Isi Surat", "Penutup", "Tandatangan"],
    "meeting-minutes": ["Butiran Mesyuarat", "Kehadiran", "Agenda", "Perbincangan", "Keputusan", "Tindakan Susulan"],
    report: ["Tajuk Laporan", "Objektif", "Ringkasan Aktiviti", "Dapatan", "Rumusan", "Cadangan"],
    "activity-report": ["Nama Aktiviti", "Tarikh", "Tempat", "Peserta", "Objektif", "Ringkasan Aktiviti", "Pemerhatian", "Rumusan"],
    "program-report": ["Nama Program", "Penganjur", "Tarikh", "Tempat", "Objektif", "Perjalanan Program", "Pencapaian", "Cadangan"],
    "daily-report": ["Tarikh", "Ringkasan Harian", "Aktiviti", "Isu", "Tindakan", "Catatan"],
    "weekly-report": ["Minggu", "Ringkasan Mingguan", "Pencapaian", "Cabaran", "Tindakan Susulan"],
    "monthly-report": ["Bulan", "Ringkasan Bulanan", "Statistik", "Pencapaian", "Cadangan"],
    "attendance-report": ["Tempoh", "Jumlah Kehadiran", "Tidak Hadir", "Sebab", "Tindakan"],
    "progress-report": ["Nama", "Tempoh", "Kemajuan", "Kekuatan", "Perlu Bimbingan", "Cadangan"],
    "observation-report": ["Subjek Pemerhatian", "Tarikh", "Aspek Pemerhatian", "Dapatan", "Catatan"],
    "reflection-report": ["Perkara", "Apa Berlaku", "Kekuatan", "Penambahbaikan", "Tindakan Seterusnya"],
    "intervention-report": ["Nama Klien", "Isu", "Intervensi", "Tempoh", "Perkembangan", "Cadangan"],
    "visit-report": ["Tempat Lawatan", "Tarikh", "Tujuan", "Dapatan Lawatan", "Tindakan Susulan"],
    "assessment-report": ["Nama", "Aspek Penilaian", "Skor / Tahap", "Ulasan", "Cadangan"],
    "performance-report": ["Nama", "Tempoh", "Prestasi", "Pencapaian", "Sasaran Baharu"],
    "case-report": ["Maklumat Kes", "Latar Belakang", "Isu", "Tindakan", "Status"],
    certificate: ["Nama Sijil", "Nama Penerima", "Pencapaian / Penghargaan", "Tarikh", "Penganjur", "Tandatangan"],
    checklist: ["Tajuk Senarai Semak", "Kategori", "Item Semakan", "Status", "Catatan", "Disemak Oleh"],
    "complaint-letter": ["Tarikh", "Penerima", "Perkara", "Butiran Aduan", "Kesan / Bukti", "Tindakan Dimohon", "Tandatangan"],
    "consent-letter": ["Tarikh", "Penerima", "Perkara", "Butiran Kebenaran", "Tempoh / Tarikh", "Akuan", "Tandatangan"],
    "incident-report": ["Tarikh Insiden", "Tempat", "Pihak Terlibat", "Butiran Insiden", "Tindakan"],
    "invitation-letter": ["Tarikh", "Penerima", "Perkara", "Butiran Jemputan", "Tarikh / Masa / Tempat", "Penutup", "Tandatangan"],
    invoice: ["Nombor Invois", "Maklumat Pelanggan", "Item / Perkhidmatan", "Kuantiti", "Jumlah", "Terma Bayaran"],
    resume: ["Nama & Tajuk", "Ringkasan Profil", "Pengalaman", "Pendidikan", "Kemahiran", "Rujukan"],
    biodata: ["Nama Penuh", "Maklumat Peribadi", "Pendidikan", "Pengalaman", "Kemahiran", "Rujukan"],
    memo: ["Kepada", "Daripada", "Tarikh", "Perkara", "Isi Memo", "Tindakan"],
    "notice-letter": ["Tarikh", "Penerima", "Perkara", "Makluman Utama", "Butiran", "Tindakan / Catatan", "Tandatangan"],
    assignment: ["Tajuk", "Arahan", "Isi Utama", "Rujukan", "Kesimpulan"],
    form: ["Nama", "Maklumat Peribadi", "Butiran", "Pengesahan", "Tandatangan"],
    "application-letter": ["Tarikh", "Penerima", "Perkara", "Tujuan Permohonan", "Maklumat Sokongan", "Penutup", "Tandatangan"],
    proposal: ["Tajuk Proposal", "Latar Belakang", "Objektif", "Cadangan Pelaksanaan", "Kos", "Penutup"],
    "purchase-order": ["Nombor Pesanan", "Pembekal", "Item", "Kuantiti", "Harga", "Jumlah", "Pengesahan"],
    quotation: ["Nombor Sebut Harga", "Maklumat Pelanggan", "Skop / Item", "Harga", "Tempoh Sah", "Terma"],
    receipt: ["Nombor Resit", "Diterima Daripada", "Tujuan Bayaran", "Jumlah", "Kaedah Bayaran", "Tandatangan"],
    "working-paper": ["Tajuk", "Tujuan", "Latar Belakang", "Objektif", "Pelaksanaan", "Anggaran Kos", "Penutup"],
    "lesson-plan": ["Subject", "Class", "Topic", "Learning Objective", "Activities", "Teaching Aids", "Reflection"],
    "therapy-session-plan": ["Nama Klien", "Fokus Terapi", "Objektif", "Aktiviti", "Alat Terapi", "Penilaian"],
    "daily-activity-plan": ["Tarikh", "Aktiviti", "Objektif", "Bahan", "Langkah", "Catatan"],
    "weekly-activity-plan": ["Minggu", "Tema", "Aktiviti Utama", "Objektif", "Keperluan", "Catatan"],
    "program-plan": ["Nama Program", "Tujuan", "Objektif", "Sasaran", "Tentatif", "Keperluan", "Penutup"],
    "school-document": ["Nama Sekolah", "Tajuk", "Butiran", "Isi Kandungan", "Pengesahan"],
    "thank-you-letter": ["Tarikh", "Penerima", "Perkara", "Ucapan Penghargaan", "Sumbangan / Kerjasama", "Penutup", "Tandatangan"],
    ppdk: ["Nama PPDK", "Maklumat Pelatih", "Aktiviti", "Objektif", "Pemerhatian", "Refleksi"],
    taska: ["Nama Taska", "Nama Kanak-kanak", "Aktiviti", "Perkembangan", "Catatan"],
    "custom-template": ["Tajuk Dokumen", "Bahagian 1", "Bahagian 2", "Catatan", "Penutup"],
  },
  en: {
    agreement: ["Agreement Title", "Parties Involved", "Purpose", "Agreement Terms", "Duration", "Signature"],
    "appeal-letter": ["Date", "Recipient", "Subject", "Appeal Background", "Appeal Reason", "Closing", "Signature"],
    "appointment-letter": ["Date", "Recipient", "Subject", "Appointment Details", "Responsibilities", "Appointment Period", "Signature"],
    rpa: ["Activity Title", "Objective", "Materials / Tools", "Implementation Steps", "Observation", "Reflection"],
    rph: ["School Name", "Subject", "Year / Class", "Content Standard", "Learning Standard", "Learning Objective", "Teaching Activities", "Reflection"],
    rpi: ["Student / Client Information", "Category / Needs", "Long-term Goal", "Short-term Objective", "Strategy / Intervention", "Assessment", "Notes"],
    "formal-letter": ["Reference", "Date", "Recipient", "Subject", "Letter Content", "Closing", "Signature"],
    "meeting-minutes": ["Meeting Details", "Attendance", "Agenda", "Discussion", "Decision", "Follow-up Action"],
    report: ["Report Title", "Objective", "Activity Summary", "Findings", "Summary", "Recommendation"],
    "activity-report": ["Activity Name", "Date", "Venue", "Participants", "Objective", "Activity Summary", "Observation", "Conclusion"],
    "program-report": ["Program Name", "Organizer", "Date", "Venue", "Objective", "Program Flow", "Achievement", "Recommendation"],
    "daily-report": ["Date", "Daily Summary", "Activities", "Issues", "Action", "Notes"],
    "weekly-report": ["Week", "Weekly Summary", "Achievement", "Challenges", "Follow-up Action"],
    "monthly-report": ["Month", "Monthly Summary", "Statistics", "Achievement", "Recommendation"],
    "attendance-report": ["Period", "Total Attendance", "Absence", "Reason", "Action"],
    "progress-report": ["Name", "Period", "Progress", "Strengths", "Needs Support", "Recommendation"],
    "observation-report": ["Observation Subject", "Date", "Observation Aspect", "Findings", "Notes"],
    "reflection-report": ["Topic", "What Happened", "Strengths", "Improvement", "Next Action"],
    "intervention-report": ["Client Name", "Issue", "Intervention", "Period", "Progress", "Recommendation"],
    "visit-report": ["Visit Location", "Date", "Purpose", "Visit Findings", "Follow-up Action"],
    "assessment-report": ["Name", "Assessment Aspect", "Score / Level", "Comment", "Recommendation"],
    "performance-report": ["Name", "Period", "Performance", "Achievement", "New Target"],
    "case-report": ["Case Information", "Background", "Issue", "Action", "Status"],
    certificate: ["Certificate Title", "Recipient Name", "Achievement / Appreciation", "Date", "Organizer", "Signature"],
    checklist: ["Checklist Title", "Category", "Checklist Items", "Status", "Notes", "Checked By"],
    "complaint-letter": ["Date", "Recipient", "Subject", "Complaint Details", "Impact / Evidence", "Requested Action", "Signature"],
    "consent-letter": ["Date", "Recipient", "Subject", "Consent Details", "Period / Date", "Declaration", "Signature"],
    "incident-report": ["Incident Date", "Location", "People Involved", "Incident Details", "Action"],
    "invitation-letter": ["Date", "Recipient", "Subject", "Invitation Details", "Date / Time / Venue", "Closing", "Signature"],
    invoice: ["Invoice Number", "Customer Information", "Item / Service", "Quantity", "Amount", "Payment Terms"],
    resume: ["Name & Title", "Profile Summary", "Experience", "Education", "Skills", "References"],
    biodata: ["Full Name", "Personal Information", "Education", "Experience", "Skills", "References"],
    memo: ["To", "From", "Date", "Subject", "Memo Content", "Action"],
    "notice-letter": ["Date", "Recipient", "Subject", "Main Notice", "Details", "Action / Notes", "Signature"],
    assignment: ["Title", "Instruction", "Main Content", "References", "Conclusion"],
    form: ["Name", "Personal Information", "Details", "Confirmation", "Signature"],
    "application-letter": ["Date", "Recipient", "Subject", "Application Purpose", "Supporting Information", "Closing", "Signature"],
    proposal: ["Proposal Title", "Background", "Objective", "Implementation Plan", "Cost", "Closing"],
    "purchase-order": ["Order Number", "Supplier", "Items", "Quantity", "Price", "Total", "Approval"],
    quotation: ["Quotation Number", "Customer Information", "Scope / Items", "Price", "Validity Period", "Terms"],
    receipt: ["Receipt Number", "Received From", "Payment Purpose", "Amount", "Payment Method", "Signature"],
    "working-paper": ["Title", "Purpose", "Background", "Objective", "Implementation", "Estimated Cost", "Closing"],
    "lesson-plan": ["Subject", "Class", "Topic", "Learning Objective", "Activities", "Teaching Aids", "Reflection"],
    "therapy-session-plan": ["Client Name", "Therapy Focus", "Objective", "Activity", "Therapy Tools", "Assessment"],
    "daily-activity-plan": ["Date", "Activity", "Objective", "Materials", "Steps", "Notes"],
    "weekly-activity-plan": ["Week", "Theme", "Main Activities", "Objective", "Requirements", "Notes"],
    "program-plan": ["Program Name", "Purpose", "Objective", "Target Group", "Tentative", "Requirements", "Closing"],
    "school-document": ["School Name", "Title", "Details", "Content", "Confirmation"],
    "thank-you-letter": ["Date", "Recipient", "Subject", "Appreciation Message", "Contribution / Cooperation", "Closing", "Signature"],
    ppdk: ["PPDK Name", "Trainee Information", "Activity", "Objective", "Observation", "Reflection"],
    taska: ["Childcare Centre Name", "Child Name", "Activity", "Development", "Notes"],
    "custom-template": ["Document Title", "Section 1", "Section 2", "Notes", "Closing"],
  },
};

const baseItemLibrary: Record<Language, string[]> = {
  ms: [
    "Tajuk",
    "Subtajuk",
    "Perenggan",
    "Maklumat",
    "Objektif",
    "Senarai bullet",
    "Jadual ringkas",
    "Tarikh",
    "Nama",
    "Alamat",
    "Ringkasan",
    "Catatan",
    "Rumusan",
    "Cadangan",
    "Tandatangan",
  ],
  en: [
    "Title",
    "Subtitle",
    "Paragraph",
    "Information",
    "Objective",
    "Bullet list",
    "Simple table",
    "Date",
    "Name",
    "Address",
    "Summary",
    "Notes",
    "Conclusion",
    "Recommendation",
    "Signature",
  ],
};

const assetItemLibrary: Record<Language, string[]> = {
  ms: [
    "Logo",
    "Cop",
  ],
  en: [
    "Logo",
    "Stamp",
  ],
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ms");

  useEffect(() => {
    const saved = window.localStorage.getItem("ly-docs-language");
    if (saved === "ms" || saved === "en") {
      window.setTimeout(() => setLanguageState(saved), 0);
    }
  }, []);

  function setLanguage(language: Language) {
    setLanguageState(language);
    window.localStorage.setItem("ly-docs-language", language);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <main className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:84px_84px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <Nav />
          {children}
        </div>
      </main>
    </LanguageContext.Provider>
  );
}

function Nav() {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="surface mb-6 flex items-center justify-between rounded-[1.5rem] px-4 py-3">
      <Link className="text-lg font-semibold tracking-[-0.04em]" href="/">
        lY Docs
      </Link>
      <div />
      <div className="flex h-10 items-center overflow-hidden rounded-full border border-white/12 bg-white/[0.055] p-1">
        <button
          aria-pressed={language === "ms"}
          className={`h-8 rounded-full px-3 text-xs font-bold tracking-[0.16em] transition ${
            language === "ms" ? "bg-white text-black" : "text-white/50 hover:text-white"
          }`}
          onClick={() => setLanguage("ms")}
          type="button"
        >
          BM
        </button>
        <button
          aria-pressed={language === "en"}
          className={`h-8 rounded-full px-3 text-xs font-bold tracking-[0.16em] transition ${
            language === "en" ? "bg-white text-black" : "text-white/50 hover:text-white"
          }`}
          onClick={() => setLanguage("en")}
          type="button"
        >
          EN
        </button>
      </div>
    </header>
  );
}

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Landing() {
  return (
    <AppShell>
      <LandingContent />
    </AppShell>
  );
}

function LandingContent() {
  const { t } = useLanguage();
  const features = [
    [t.featureTemplate, t.featureTemplateBody],
    [t.featureDrag, t.featureDragBody],
    [t.featureToken, t.featureTokenBody],
    [t.featureExport, t.featureExportBody],
  ];

  return (
    <section className="grid min-h-[calc(100vh-7rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.34em] text-[#9db4ff]">
            lY Docs
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            {t.landingHeadline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b8bfcc]">
            {t.landingSubheadline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary" href="/create">{t.landingCta}</Link>
            <Link className="button-secondary" href="/builder">{t.landingSecondary}</Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {features.map(([title, body], index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="surface rounded-[1.35rem] p-4"
                initial={{ opacity: 0, y: 14 }}
                key={title}
                transition={{ delay: 0.12 + index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-semibold tracking-[-0.02em]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#aeb6c6]">{body}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="surface rounded-[2rem] p-4">
            <div className="a4-page mx-auto rounded-xl p-10">
              <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-black/45">lY Docs</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{t.workDocument}</h2>
                </div>
                <div className="h-14 w-14 rounded-2xl border border-black/10 bg-black/5" />
              </div>
              {[t.readyTemplate, t.editableBlocks, t.aiReady].map((item) => (
                <div className="mb-4 rounded-xl border border-black/10 p-4" key={item}>
                  <p className="text-sm font-semibold">{item}</p>
                  <p className="mt-2 text-xs leading-5 text-black/55">
                    {t.previewBody}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
    </section>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  return (
    <AppShell>
      <AuthContent mode={mode} />
    </AppShell>
  );
}

function AuthContent({ mode }: { mode: "login" | "register" }) {
  const { t } = useLanguage();
  const isLogin = mode === "login";
  return (
    <section className="grid min-h-[calc(100vh-7rem)] place-items-center py-10">
        <Reveal>
          <div className="surface w-full max-w-md rounded-[2rem] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9db4ff]">
              {isLogin ? t.authLoginKicker : t.authRegisterKicker}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
              {isLogin ? t.authLoginTitle : t.authRegisterTitle}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#aeb6c6]">
              {t.authNote}
            </p>
            <div className="mt-6 space-y-3">
              {!isLogin ? <input className="input" placeholder={t.fullName} /> : null}
              <input className="input" placeholder={t.email} />
              <input className="input" placeholder={t.password} type="password" />
              <Link className="button-primary w-full" href="/builder">
                {isLogin ? t.loginSubmit : t.registerSubmit}
              </Link>
            </div>
            <p className="mt-5 text-sm text-[#aeb6c6]">
              {isLogin ? t.noAccount : t.hasAccount}
              <Link className="text-white underline" href={isLogin ? "/register" : "/login"}>
                {isLogin ? t.register : t.login}
              </Link>
            </p>
          </div>
        </Reveal>
    </section>
  );
}

export function CreateDocument() {
  return (
    <AppShell>
      <CreateDocumentContent />
    </AppShell>
  );
}

function CreateDocumentContent() {
  const { language, t } = useLanguage();
  const sortedDocumentTypes = getSortedDocumentTypes(language);

  return (
    <section className="py-8">
        <Reveal>
          <h1 className="text-5xl font-semibold tracking-[-0.06em]">{t.createTitle}</h1>
          <p className="mt-4 max-w-2xl text-[#b8bfcc]">
            {t.createBody}
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sortedDocumentTypes.map((type, index) => (
            <Reveal delay={index * 0.025} key={type}>
              <Link
                className="surface block rounded-[1.35rem] p-4 transition hover:-translate-y-1 hover:border-[#9db4ff]/50"
                href={`/builder?type=${encodeURIComponent(type)}`}
              >
                <p className="font-semibold">{documentTypeLabels[language][type]}</p>
                <p className="mt-2 text-xs leading-5 text-[#aeb6c6]">
                  {t.openBlocks}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
    </section>
  );
}

export function DocumentBuilder({ initialType = "" }: { initialType?: string }) {
  return (
    <AppShell>
      <DocumentBuilderContent initialType={initialType} />
    </AppShell>
  );
}

function DocumentBuilderContent({ initialType = "" }: { initialType?: string }) {
  const { language, t } = useLanguage();
  const initialDocumentType = normalizeDocumentType(initialType);
  const sortedDocumentTypes = getSortedDocumentTypes(language);
  const [docType, setDocType] = useState<DocumentTypeId | "">(initialDocumentType);
  const [pages, setPages] = useState<PaperPage[]>(() => [
    createPaperPage(1, initialDocumentType ? buildBlocks(initialDocumentType, language) : [], initialDocumentType, language),
  ]);
  const [activePageId, setActivePageId] = useState("page-1");
  const [documentBrief, setDocumentBrief] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [activeDrag, setActiveDrag] = useState<PaperDrag>(null);
  const [activeBlock, setActiveBlock] = useState<ActiveBlock>(null);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState<DocumentBrainResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState<"builder" | "preview">("builder");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("auto");
  const [alignmentGuide, setAlignmentGuide] = useState<AlignmentGuide>({});
  const blockIdCounter = useRef(0);

  function createBlockId(prefix: string) {
    blockIdCounter.current += 1;
    return `${prefix}-${blockIdCounter.current}`;
  }

  function deleteBlock(pageId: string, blockId: string) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              blocks: page.blocks.filter((block) => block.id !== blockId),
            }
          : page,
      ),
    );
    setActiveBlock(null);
  }

  function updateBlockContent(pageId: string, blockId: string, content: string) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              blocks: page.blocks.map((block) => (block.id === blockId ? { ...block, content } : block)),
            }
          : page,
      ),
    );
  }

  function updateBlockFormat(pageId: string, blockId: string, patch: Partial<Pick<PaperBlock, "align" | "fontSize" | "fontWeight" | "lineHeight" | "underline">>) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              blocks: page.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
            }
          : page,
      ),
    );
  }

  useEffect(() => {
    window.setTimeout(() => {
      setPages([createPaperPage(1, docType ? buildBlocks(docType, language) : [], docType, language)]);
      setActivePageId("page-1");
    }, 0);
  }, [docType, language]);

  useEffect(() => {
    if (!activeDrag) return;
    const drag = activeDrag;

    function handlePointerMove(event: PointerEvent) {
      const page = pages.find((currentPage) => currentPage.id === drag.pageId);
      const activeBlock = page?.blocks.find((block) => block.id === drag.id);
      const nextX = Math.max(0, drag.originX + event.clientX - drag.startX);
      const nextY = Math.max(0, drag.originY + event.clientY - drag.startY);
      if (activeBlock) {
        setAlignmentGuide(getAlignmentGuide(activeBlock, nextX, nextY, page?.blocks ?? []));
      }

      setPages((currentPages) =>
        currentPages.map((currentPage) =>
          currentPage.id === drag.pageId
            ? {
                ...currentPage,
                blocks: currentPage.blocks.map((block) =>
                  block.id === drag.id
                    ? {
                        ...block,
                        x: nextX,
                        y: nextY,
                      }
                    : block,
                ),
              }
            : currentPage,
        ),
      );
    }

    function handlePointerUp() {
      setActiveDrag(null);
      window.setTimeout(() => setAlignmentGuide({}), 180);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeDrag, pages]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!activeBlock || (event.key !== "Backspace" && event.key !== "Delete")) return;

      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.closest("input, textarea, select, [contenteditable='true']") ||
        target?.isContentEditable;
      if (isTyping) return;

      event.preventDefault();
      deleteBlock(activeBlock.pageId, activeBlock.blockId);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeBlock]);

  function changeType(value: string) {
    const nextType = normalizeDocumentType(value);
    setDocType(nextType);
    setPages([createPaperPage(1, nextType ? buildBlocks(nextType, language) : [], nextType, language)]);
    setActivePageId("page-1");
    setAiResult(null);
    setAiError("");
    setViewMode("builder");
  }

  async function sendToAi() {
    setAiError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/document-brain", {
        body: JSON.stringify({
          language,
          layoutMode,
          layout: pages.map((page) => ({
            blocks: page.blocks.map((block) => ({
              content: block.content,
              id: block.id,
              slot: block.slot,
              title: block.title,
            })),
            id: page.id,
            title: page.title,
          })),
          prompt: documentBrief,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "AI request failed.");
      }

      if (!isDocumentBrainResult(data)) {
        throw new Error(language === "ms" ? "AI tidak memulangkan JSON yang sah." : "AI returned invalid JSON.");
      }

      setAiResult(data);
      const nextPages = layoutMode === "auto" ? createAutoLayoutPages(data, language) : applyAiResultToPages(pages, data, language);
      setPages(nextPages);
      setActivePageId("page-1");
      setActiveBlock(null);
      setViewMode("preview");
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Ralat AI tidak dijangka.");
    } finally {
      setIsSending(false);
    }
  }

  function downloadPdf() {
    const filename = sanitizeFileName(aiResult?.title || documentTypeLabelForPdf(docType, language));
    const printablePages = pages.map((page, index) => ({
        blocks: page.blocks.map((block) => ({
          align: block.align,
          content: isInstructionPlaceholder(block.content) ? "" : block.content,
          fontSize: block.fontSize,
          fontWeight: block.fontWeight,
        height: block.height,
          lineHeight: block.lineHeight,
          style: block.style,
          title: viewMode === "preview" || aiResult ? "" : block.title,
          underline: block.underline,
          width: block.width,
          x: block.x,
        y: block.y,
      })),
      title: aiResult && index === 0 ? aiResult.title : page.title,
    }));
    const pdfBlob = createPdfBlob(printablePages);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function addItemToPaper(title = customTitle, content = customContent, position?: { x: number; y: number }, pageId = activePageId) {
    const cleanTitle = title.trim() || t.emptyTitle;
    const cleanContent = content.trim() || t.emptyContent;
    const blockFormat = getDefaultBlockFormat(cleanTitle);
    const blockId = createBlockId("custom");
    setPages((currentPages) =>
      currentPages.map((page) => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          blocks: [
            ...page.blocks,
            {
              ...blockFormat,
              content: cleanContent,
              height: isAssetItem(cleanTitle, language) ? 92 : 132,
              id: `${blockId}-${page.blocks.length}`,
              slot: inferSlot(cleanTitle),
              title: cleanTitle,
              width: isAssetItem(cleanTitle, language) ? 150 : 260,
              x: position?.x ?? 48 + (page.blocks.length % 2) * 290,
              y: position?.y ?? 150 + Math.floor(page.blocks.length / 2) * 160,
            },
          ],
        };
      }),
    );
    setCustomTitle("");
    setCustomContent("");
  }

  function addPage() {
    setPages((currentPages) => {
      const pageNumber = currentPages.length + 1;
      const nextPage = createPaperPage(pageNumber, [], docType, language);
      setActivePageId(nextPage.id);
      return [...currentPages, nextPage];
    });
  }

  function deletePage(pageId: string) {
    setPages((currentPages) => {
      if (currentPages.length <= 1) return currentPages;
      const nextPages = currentPages.filter((page) => page.id !== pageId);
      if (activePageId === pageId) {
        setActivePageId(nextPages.at(-1)?.id ?? "page-1");
      }
      return nextPages;
    });
  }

  function startPaperItemDrag(event: ReactPointerEvent<HTMLDivElement>, block: PaperBlock, pageId: string) {
    setActiveBlock({ blockId: block.id, pageId });
    setActivePageId(pageId);

    const target = event.target as HTMLElement;
    if (viewMode === "preview") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isResizeCorner = event.clientX > bounds.right - 28 && event.clientY > bounds.bottom - 28;
    if (target.closest("[contenteditable='true']") || isResizeCorner) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setActiveDrag({
      id: block.id,
      originX: block.x,
      originY: block.y,
      pageId,
      startX: event.clientX,
      startY: event.clientY,
    });
  }

  function dragItem(event: DragEvent<HTMLButtonElement>, title: string) {
    event.dataTransfer.setData("text/plain", title);
    event.dataTransfer.effectAllowed = "copy";
  }

  function dropItem(event: DragEvent<HTMLDivElement>, pageId: string) {
    event.preventDefault();
    const title = event.dataTransfer.getData("text/plain");
    if (!title) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    addItemToPaper(title, defaultContent(title, language), {
      x: Math.max(20, event.clientX - bounds.left - 130),
      y: Math.max(20, event.clientY - bounds.top - 50),
    }, pageId);
    setActivePageId(pageId);
  }

  const documentItems = docType ? templates[language][docType] : [];
  const baseItems = [...baseItemLibrary[language], ...assetItemLibrary[language]];
  const selectedBlock = activeBlock
    ? pages.find((page) => page.id === activeBlock.pageId)?.blocks.find((block) => block.id === activeBlock.blockId)
    : null;
  const showPreview = () => setViewMode("preview");
  const renderItemButton = (item: string) => (
    <button
      className="group cursor-grab rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-[#dce3f1] transition hover:border-[#9db4ff]/50 hover:bg-white/[0.08] active:cursor-grabbing"
      draggable
      key={item}
      onDragStart={(event) => dragItem(event, item)}
      onClick={() => addItemToPaper(item, defaultContent(item, language))}
      type="button"
    >
      <span className="block font-medium">{item}</span>
      <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#9db4ff] opacity-70 group-hover:opacity-100">
        {t.chooseItem}
      </span>
    </button>
  );

  return (
    <section className="grid gap-5 py-6 xl:grid-cols-[260px_minmax(0,1fr)_280px]">
        <Reveal>
          <aside className="surface sticky top-5 self-start rounded-[1.5rem] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]">
              {t.builderControls}
            </p>
            <label className="mt-5 block text-sm text-[#aeb6c6]">{t.documentType}</label>
            <select
              className="input mt-2"
              onChange={(event) => changeType(event.target.value)}
              value={docType}
            >
              <option value="">{t.selectDocumentPlaceholder}</option>
              {sortedDocumentTypes.map((type) => (
                <option key={type} value={type}>{documentTypeLabels[language][type]}</option>
              ))}
            </select>
            <label className="mt-4 block text-sm text-[#aeb6c6]">{t.documentBrief}</label>
            <textarea
              className="input mt-2 min-h-28 resize-none"
              onChange={(event) => setDocumentBrief(event.target.value)}
              placeholder={t.documentBriefPlaceholder}
              value={documentBrief}
            />
            <p className="mt-4 text-sm text-[#aeb6c6]">{t.layoutMode}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([
                ["user", t.useMyLayout],
                ["auto", t.autoLayoutDocument],
              ] as const).map(([mode, label]) => (
                <button
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    layoutMode === mode
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/[0.04] text-[#dce3f1] hover:border-[#9db4ff]/45"
                  }`}
                  key={mode}
                  onClick={() => setLayoutMode(mode)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="button-secondary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-55"
              disabled={isSending}
              onClick={sendToAi}
              type="button"
            >
              {isSending ? t.sending : t.submitLater}
            </button>
            {aiError ? (
              <p className="mt-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-xs leading-5 text-red-100">
                {aiError}
              </p>
            ) : null}
            {aiResult ? (
              <div className="mt-3 rounded-2xl border border-[#9db4ff]/20 bg-[#9db4ff]/10 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]">{t.aiResult}</p>
                <p className="mt-2 text-sm font-semibold text-white">{aiResult.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#aeb6c6]">
                  {aiResult.documentType} · {Math.round(aiResult.confidence * 100)}%
                </p>
                {aiResult.missingFields.length > 0 ? (
                  <p className="mt-2 text-xs leading-5 text-[#d8def0]">
                    {t.missingFields}: {aiResult.missingFields.join(", ")}
                  </p>
                ) : null}
                <button className="button-primary mt-3 w-full" onClick={downloadPdf} type="button">
                  {t.downloadPdf}
                </button>
              </div>
            ) : null}
          </aside>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="surface rounded-[2rem] p-4">
            <div className="mb-4 flex justify-center">
              <div className="flex rounded-full border border-white/10 bg-white/[0.045] p-1">
                <button
                  className={`rounded-full px-4 py-2 text-xs font-bold tracking-[0.14em] transition ${
                    viewMode === "builder" ? "bg-white text-black" : "text-white/55 hover:text-white"
                  }`}
                  onClick={() => setViewMode("builder")}
                  type="button"
                >
                  {t.editLayout}
                </button>
                <button
                  className={`rounded-full px-4 py-2 text-xs font-bold tracking-[0.14em] transition ${
                    viewMode === "preview" ? "bg-white text-black" : "text-white/55 hover:text-white"
                  }`}
                  onClick={showPreview}
                  type="button"
                >
                  {t.previewResult}
                </button>
              </div>
            </div>
            <div
              className="flex flex-col gap-8"
            >
              {pages.map((page, pageIndex) => (
                <div key={page.id}>
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]">
                      {t.pageLabel} {pageIndex + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      {pageIndex > 0 ? (
                        <button
                          className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-100 transition hover:border-red-300/60"
                          onClick={() => deletePage(page.id)}
                          type="button"
                        >
                          {t.deletePage}
                        </button>
                      ) : null}
                      <button
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          activePageId === page.id
                            ? "border-[#9db4ff]/70 bg-[#9db4ff]/15 text-white"
                            : "border-white/10 bg-white/[0.04] text-[#aeb6c6] hover:border-[#9db4ff]/50"
                        }`}
                        onClick={() => setActivePageId(page.id)}
                        type="button"
                      >
                        {activePageId === page.id ? t.activePage : t.selectPage}
                      </button>
                    </div>
                  </div>
                  <div
              className={`a4-page relative mx-auto overflow-hidden rounded-xl p-8 transition sm:p-12 ${
                viewMode === "preview" ? "cursor-text" : ""
              }`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropItem(event, page.id)}
            >
              {viewMode === "preview" ? (
                <div className="absolute inset-0 z-20">
                  {page.blocks.map((block) => (
                    <div
                      className={`absolute overflow-visible ${getPreviewBlockFrameClass(block)}`}
                      key={block.id}
                      style={{
                        height: block.height,
                        left: block.x,
                        top: block.y,
                        width: block.width,
                      }}
                    >
                      <div
                        className="preview-editable h-full w-full cursor-text whitespace-pre-wrap text-black/85 outline-none"
                        contentEditable
                        onInput={(event) => updateBlockContent(page.id, block.id, readPreviewBlockText(event.currentTarget))}
                        spellCheck
                        style={{
                          fontSize: block.content.length > 420 ? Math.max(10, block.fontSize - 2) : block.fontSize,
                          fontWeight: block.fontWeight,
                          lineHeight: block.lineHeight,
                          textAlign: block.align,
                          textDecoration: block.underline || block.style?.underline ? "underline" : "none",
                        }}
                        suppressContentEditableWarning
                      >
                        {block.content}
                      </div>
                      {block.style?.divider ? <div className="pointer-events-none mt-2 h-px w-full bg-black/25" /> : null}
                      {block.style?.signatureLine ? <div className="pointer-events-none mt-3 h-px w-48 bg-black/70" /> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <>
              {typeof alignmentGuide.x === "number" ? (
                <div
                  className="pointer-events-none absolute bottom-0 top-0 z-30 w-px bg-[#4f7dff]/80 shadow-[0_0_16px_rgba(79,125,255,0.75)]"
                  style={{ left: alignmentGuide.x }}
                />
              ) : null}
              {typeof alignmentGuide.y === "number" ? (
                <div
                  className="pointer-events-none absolute left-0 right-0 z-30 h-px bg-[#4f7dff]/80 shadow-[0_0_16px_rgba(79,125,255,0.75)]"
                  style={{ top: alignmentGuide.y }}
                />
              ) : null}
              <div className="absolute inset-0 z-10">
                {page.blocks.map((block) => (
                  <motion.div
                    className={`group absolute cursor-grab resize overflow-hidden rounded-xl border bg-white/95 p-4 shadow-sm transition active:cursor-grabbing ${
                      activeBlock?.blockId === block.id && activeBlock.pageId === page.id
                        ? "border-[#4f7dff]/70 ring-2 ring-[#4f7dff]/25"
                        : "border-black/10"
                    }`}
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    key={block.id}
                    onPointerDown={(event) => startPaperItemDrag(event, block, page.id)}
                    style={{
                      height: block.height,
                      left: block.x,
                      top: block.y,
                      width: block.width,
                      zIndex: 20,
                    }}
                    transition={{ duration: 0.18 }}
                  >
                    <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                      {block.title}
                    </p>
                    <div
                      className="editable-block mt-3 min-h-12 cursor-text whitespace-pre-wrap text-black/80"
                      contentEditable
                      onInput={(event) => updateBlockContent(page.id, block.id, event.currentTarget.textContent ?? "")}
                      style={{
                        fontSize: block.fontSize,
                        fontWeight: block.fontWeight,
                        lineHeight: block.lineHeight,
                        textAlign: block.align,
                        textDecoration: block.underline ? "underline" : "none",
                      }}
                      suppressContentEditableWarning
                    >
                      {block.content}
                    </div>
                    <span className="pointer-events-none absolute bottom-1 right-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/25 opacity-0 transition group-hover:opacity-100">
                      resize
                    </span>
                  </motion.div>
                ))}
              </div>
              {page.blocks.length === 0 ? (
                <div className="pointer-events-none absolute inset-x-12 top-44 z-0 grid min-h-64 place-items-center rounded-2xl border border-dashed border-black/15 bg-black/[0.025] p-6 text-center">
                  <p className="max-w-xs text-sm leading-6 text-black/45">{t.dropHint}</p>
                </div>
              ) : null}
                </>
              )}
            </div>
                </div>
              ))}
              <button className="button-secondary mx-auto w-full max-w-xs" onClick={addPage} type="button">
                {t.addPage}
              </button>
              </div>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <aside className="surface sticky top-5 self-start rounded-[1.5rem] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]">
              {t.itemTools}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#aeb6c6]">{t.itemToolsBody}</p>
            <div className="mt-5 border-t border-white/10 pt-5">
              {documentItems.length > 0 ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]">
                    {t.quickItems}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#8f98aa]">{t.itemShelfBody}</p>
                  <div className="mt-3 flex max-h-48 flex-col gap-2 overflow-auto pr-1">
                    {documentItems.map(renderItemButton)}
                  </div>
                </div>
              ) : null}
              <p className={`${documentItems.length > 0 ? "mt-6" : ""} text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]`}>
                {t.itemShelf}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#8f98aa]">{t.itemShelfBody}</p>
              <div className="mt-3 flex max-h-72 flex-col gap-2 overflow-auto pr-1">
                {baseItems.map(renderItemButton)}
              </div>
              {selectedBlock && activeBlock ? (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]">{t.formatTools}</p>
                  <p className="mt-2 truncate text-sm font-semibold text-white">{selectedBlock.title}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        selectedBlock.fontWeight === "bold" ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] text-[#dce3f1]"
                      }`}
                      onClick={() =>
                        updateBlockFormat(activeBlock.pageId, activeBlock.blockId, {
                          fontWeight: selectedBlock.fontWeight === "bold" ? "normal" : "bold",
                        })
                      }
                      type="button"
                    >
                      {t.boldText}
                    </button>
                    <button
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        selectedBlock.underline ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] text-[#dce3f1]"
                      }`}
                      onClick={() => updateBlockFormat(activeBlock.pageId, activeBlock.blockId, { underline: !selectedBlock.underline })}
                      type="button"
                    >
                      {t.underlineText}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${
                          selectedBlock.align === align ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] text-[#dce3f1]"
                        }`}
                        key={align}
                        onClick={() => updateBlockFormat(activeBlock.pageId, activeBlock.blockId, { align })}
                        type="button"
                      >
                        {align === "left" ? t.alignLeft : align === "center" ? t.alignCenter : t.alignRight}
                      </button>
                    ))}
                  </div>
                  <label className="mt-4 block text-sm text-[#aeb6c6]">{t.fontSize}</label>
                  <input
                    className="mt-2 w-full accent-[#9db4ff]"
                    max={22}
                    min={10}
                    onChange={(event) => updateBlockFormat(activeBlock.pageId, activeBlock.blockId, { fontSize: Number(event.target.value) })}
                    type="range"
                    value={selectedBlock.fontSize}
                  />
                  <label className="mt-4 block text-sm text-[#aeb6c6]">{t.lineSpacing}</label>
                  <input
                    className="mt-2 w-full accent-[#9db4ff]"
                    max={2.2}
                    min={1}
                    onChange={(event) => updateBlockFormat(activeBlock.pageId, activeBlock.blockId, { lineHeight: Number(event.target.value) })}
                    step={0.05}
                    type="range"
                    value={selectedBlock.lineHeight}
                  />
                </div>
              ) : null}
              <div className="mt-6 border-t border-white/10 pt-5">
                <label className="block text-sm text-[#aeb6c6]">{t.itemTitle}</label>
                <input
                  className="input mt-2"
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder={t.emptyTitle}
                  value={customTitle}
                />
                <label className="mt-4 block text-sm text-[#aeb6c6]">{t.itemContent}</label>
                <textarea
                  className="input mt-2 min-h-28 resize-none"
                  onChange={(event) => setCustomContent(event.target.value)}
                  placeholder={t.emptyContent}
                  value={customContent}
                />
                <button className="button-primary mt-4 w-full" onClick={() => addItemToPaper()} type="button">
                  {t.addToPaper}
                </button>
              </div>
            </div>
          </aside>
        </Reveal>
    </section>
  );
}

function normalizeDocumentType(type: string): DocumentTypeId | "" {
  if (!type) {
    return "";
  }

  if (documentTypes.includes(type as DocumentTypeId)) {
    return type as DocumentTypeId;
  }

  const legacyMatch = documentTypes.find((documentType) =>
    Object.values(documentTypeLabels).some((labels) => labels[documentType] === type),
  );

  return legacyMatch ?? "";
}

function isDocumentBrainResult(value: unknown): value is DocumentBrainResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.documentType === "string" &&
    (typeof record.layout === "undefined" || typeof record.layout === "string") &&
    (typeof record.paperSize === "undefined" || record.paperSize === "A4") &&
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
        (typeof (section as Record<string, unknown>).type === "undefined" ||
          typeof (section as Record<string, unknown>).type === "string"),
    ) &&
    Array.isArray(record.missingFields) &&
    record.missingFields.every((field) => typeof field === "string") &&
    typeof record.confidence === "number"
  );
}

function applyAiResultToPages(pages: PaperPage[], result: DocumentBrainResult, language: Language) {
  const sections = result.sections.map((section) => ({
    ...section,
    slot: normalizeSlot(section.slot || section.type || "content"),
  }));

  const hasBlocks = pages.some((page) => page.blocks.length > 0);
  if (!hasBlocks) {
    return [createAiPaperPage(result, language)];
  }

  return pages.map((page) => ({
    ...page,
    blocks: page.blocks.map((block) => {
      const blockSlot = normalizeSlot(block.slot || block.title);
      const matchedSection =
        sections.find((section) => section.slot === blockSlot) ||
        sections.find((section) => normalizeSlot(section.type || section.slot || "") === blockSlot) ||
        sections.find((section) => blockSlot.includes(section.slot) || section.slot.includes(blockSlot));

      return matchedSection
        ? {
            ...block,
            content: matchedSection.content,
            fontWeight: getFontWeightForSection(matchedSection, block.fontWeight),
            slot: blockSlot,
            style: normalizeStyleHint(matchedSection.styleHint),
            underline: block.underline || Boolean(matchedSection.styleHint?.underline || matchedSection.styleHint?.signatureLine),
          }
        : {
            ...block,
            content: isInstructionPlaceholder(block.content) ? "" : block.content,
            slot: blockSlot,
          };
    }),
  }));
}

function createAutoLayoutPages(result: DocumentBrainResult, language: Language): PaperPage[] {
  const normalizedSections = result.sections.map((section) => ({
    ...section,
    slot: normalizeSlot(section.slot || section.type || "section"),
    styleHint: normalizeStyleHint(section.styleHint),
  }));
  const kind = detectAutoLayoutKind(result);
  const orderedSections = orderAutoLayoutSections(kind, ensureDocumentSections(result, normalizedSections));
  const blocks: PaperBlock[] = [];
  let y = 52;
  let pageNumber = 1;
  const pages: PaperPage[] = [];
  const titleContent = orderedSections.find((section) => section.slot === "title")?.content || result.title || defaultAutoLayoutTitle(kind, language);

  function pushPage() {
    pages.push({
      blocks: [...blocks],
      id: `page-${pageNumber}`,
      title: `${titleContent || result.title || defaultAutoLayoutTitle(kind, language)} ${pageNumber}`,
    });
    blocks.length = 0;
    pageNumber += 1;
    y = 52;
  }

  blocks.push(
    createAutoBlock({
      align: kind === "resume" ? "left" : "center",
      content: titleContent.toUpperCase(),
      fontSize: kind === "resume" ? 20 : 17,
      fontWeight: "bold",
      height: kind === "resume" ? 62 : 54,
      id: `auto-title-${pageNumber}`,
      lineHeight: 1.25,
      slot: "title",
      style: kind === "letter" ? {} : { divider: true },
      title: language === "ms" ? "Tajuk" : "Title",
      width: 604,
      x: 58,
      y,
    }),
  );
  y += 72;

  orderedSections
    .filter((section) => section.slot !== "title" && section.content.trim())
    .forEach((section, index) => {
      const sectionStyle = getAutoSectionStyle(kind, section);
      const heading = autoSectionHeading(section.slot, section.type, language);
      const headingHeight = sectionStyle.showHeading ? 24 : 0;
      const contentHeight = estimateAutoBlockHeight(section.content, sectionStyle.width, sectionStyle.fontSize);
      const neededHeight = headingHeight + contentHeight + sectionStyle.gap;
      if (y + neededHeight > 950 && blocks.length > 1) {
        pushPage();
      }

      if (sectionStyle.showHeading) {
        blocks.push(
          createAutoBlock({
            content: heading,
            fontSize: 12,
            fontWeight: "bold",
            height: 24,
            id: `auto-heading-${pageNumber}-${index}`,
            lineHeight: 1.25,
            slot: `${section.slot}-heading`,
            style: sectionStyle.headingStyle,
            title: heading,
            width: sectionStyle.width,
            x: sectionStyle.x,
            y,
          }),
        );
        y += 28;
      }

      blocks.push(
        createAutoBlock({
          content: section.content,
          fontSize: sectionStyle.fontSize,
          fontWeight: getFontWeightForSection(section, sectionStyle.fontWeight),
          height: contentHeight,
          id: `auto-section-${pageNumber}-${index}`,
          lineHeight: sectionStyle.lineHeight,
          slot: section.slot,
          style: { ...sectionStyle.contentStyle, ...normalizeStyleHint(section.styleHint) },
          title: heading,
          width: sectionStyle.width,
          x: sectionStyle.x,
          y,
        }),
      );
      y += contentHeight + sectionStyle.gap;
    });

  if (blocks.length > 0) {
    pushPage();
  }

  return pages;
}

type AutoLayoutKind = "form" | "generic" | "invoice" | "letter" | "minutes" | "payroll" | "report" | "resume";

function createAutoBlock(block: Omit<PaperBlock, "align" | "underline"> & { align?: PaperBlock["align"]; underline?: boolean }): PaperBlock {
  return {
    ...block,
    align: block.align ?? "left",
    underline: block.underline ?? Boolean(block.style?.underline || block.style?.signatureLine),
  };
}

function detectAutoLayoutKind(result: DocumentBrainResult): AutoLayoutKind {
  const value = `${result.documentType} ${result.title}`.toLowerCase();
  if (value.includes("resume") || value.includes("cv")) return "resume";
  if (value.includes("slip") || value.includes("gaji") || value.includes("payslip") || value.includes("payroll")) return "payroll";
  if (value.includes("invoice") || value.includes("quotation") || value.includes("resit") || value.includes("receipt") || value.includes("sebut harga")) return "invoice";
  if (value.includes("minit") || value.includes("mesyuarat") || value.includes("meeting")) return "minutes";
  if (value.includes("borang") || value.includes("form") || value.includes("pendaftaran")) return "form";
  if (isReportDocument(result)) return "report";
  if (value.includes("surat") || value.includes("letter") || value.includes("permohonan") || value.includes("rayuan")) return "letter";
  return "generic";
}

function defaultAutoLayoutTitle(kind: AutoLayoutKind, language: Language) {
  const titles: Record<AutoLayoutKind, string> = {
    form: language === "ms" ? "BORANG" : "FORM",
    generic: language === "ms" ? "DOKUMEN" : "DOCUMENT",
    invoice: "INVOICE",
    letter: language === "ms" ? "SURAT RASMI" : "FORMAL LETTER",
    minutes: language === "ms" ? "MINIT MESYUARAT" : "MEETING MINUTES",
    payroll: language === "ms" ? "SLIP GAJI" : "PAYSLIP",
    report: language === "ms" ? "LAPORAN" : "REPORT",
    resume: "RESUME",
  };
  return titles[kind];
}

function ensureDocumentSections(result: DocumentBrainResult, sections: Array<DocumentBrainSection & { slot: string }>) {
  const kind = detectAutoLayoutKind(result);
  if (kind === "report") {
    return ensureReportSections(result, sections);
  }

  const defaults: Record<AutoLayoutKind, Array<DocumentBrainSection & { slot: string }>> = {
    form: [
      { content: "Nama: ________________________________\nTarikh: _______________________________\nNo. Telefon: ___________________________", formatHint: "form", slot: "section", styleHint: { box: true, boxType: "formBox", underline: true } },
      { content: "Pengakuan: Saya mengesahkan bahawa maklumat yang diberikan adalah benar.", formatHint: "paragraph", slot: "declaration", styleHint: { divider: true } },
      { content: "Tandatangan: _________________________", formatHint: "signature", slot: "signature", styleHint: { signatureLine: true } },
    ],
    generic: [],
    invoice: [
      { content: "Pelanggan: [PELANGGAN]\nTarikh: [TARIKH]", formatHint: "section", slot: "customer_info", styleHint: { box: true, boxType: "infoBox" } },
      { content: "Item | Kuantiti | Harga | Jumlah\nPerkhidmatan / Produk | 1 | RM0.00 | RM0.00", formatHint: "table", slot: "item_table", styleHint: { box: true, boxType: "tableBox", tableBorder: true } },
      { content: "Jumlah: RM0.00", formatHint: "total", slot: "total", styleHint: { box: true, boxType: "totalBox", border: true } },
      { content: "Nota: Bayaran boleh dibuat mengikut kaedah yang dipersetujui.", formatHint: "footer", slot: "payment_info" },
    ],
    letter: [
      { content: "Tuan/Puan,", formatHint: "paragraph", slot: "salutation" },
      { content: "Merujuk kepada perkara di atas, saya ingin mengemukakan permohonan ini untuk perhatian pihak tuan/puan.", formatHint: "paragraph", slot: "body" },
      { content: "Sekian, terima kasih.\n\nYang benar,\n\n____________________\n[NAMA]", formatHint: "signature", slot: "signature", styleHint: { signatureLine: true } },
    ],
    minutes: [
      { content: "Tarikh: [TARIKH]\nMasa: [MASA]\nTempat: [TEMPAT]\nPengerusi: [PENGERUSI]\nSetiausaha: [SETIAUSAHA]", formatHint: "section", slot: "meeting_info", styleHint: { box: true, boxType: "infoBox" } },
      { content: "Senarai kehadiran perlu direkodkan mengikut maklumat mesyuarat.", formatHint: "list", slot: "attendees", styleHint: { divider: true } },
      { content: "Agenda mesyuarat disusun mengikut keutamaan perbincangan.", formatHint: "list", slot: "agenda", styleHint: { divider: true } },
      { content: "Perbincangan utama direkodkan secara ringkas dan jelas.", formatHint: "paragraph", slot: "discussion", styleHint: { divider: true } },
      { content: "Keputusan mesyuarat perlu dinyatakan bersama tindakan susulan.", formatHint: "paragraph", slot: "decision", styleHint: { divider: true } },
      { content: "Mesyuarat ditangguhkan dengan ucapan terima kasih.", formatHint: "paragraph", slot: "closing" },
    ],
    payroll: [
      { content: "Pekerja: [NAMA PEKERJA]\nJawatan: [JAWATAN]\nTempoh Gaji: [TEMPOH]", formatHint: "section", slot: "employee_info", styleHint: { box: true, boxType: "infoBox" } },
      { content: "Majikan: [NAMA MAJIKAN]", formatHint: "section", slot: "employer_info", styleHint: { box: true, boxType: "infoBox" } },
      { content: "Butiran | Amaun\nGaji Pokok | RM0.00\nPotongan | RM0.00", formatHint: "table", slot: "table", styleHint: { box: true, boxType: "tableBox", tableBorder: true } },
      { content: "Gaji Bersih: RM0.00", formatHint: "total", slot: "total", styleHint: { box: true, boxType: "totalBox", border: true } },
    ],
    report: [],
    resume: [
      { content: "Profil ringkas calon perlu ditulis dengan kemas dan profesional.", formatHint: "summary", slot: "summary", styleHint: { divider: true } },
      { content: "Pendidikan\n- SPM / kelayakan berkaitan", formatHint: "list", slot: "education", styleHint: { divider: true } },
      { content: "Kemahiran\n- Komunikasi baik\n- Boleh bekerja dalam pasukan\n- Cepat belajar", formatHint: "list", slot: "skills", styleHint: { divider: true } },
      { content: "Pengalaman\n- Sedia belajar dan menerima latihan kerja", formatHint: "list", slot: "experience", styleHint: { divider: true } },
    ],
  };

  const existingSlots = new Set(sections.map((section) => section.slot));
  return [...sections, ...defaults[kind].filter((section) => !existingSlots.has(section.slot))];
}

function orderAutoLayoutSections(kind: AutoLayoutKind, sections: Array<DocumentBrainSection & { slot: string }>) {
  const orders: Record<AutoLayoutKind, string[]> = {
    form: ["title", "section", "name", "date", "description", "declaration", "signature", "footer"],
    generic: ["title", "subtitle", "date", "section", "body", "paragraph", "summary", "remarks", "signature", "footer"],
    invoice: ["title", "date", "reference", "customer_info", "recipient", "item_table", "table", "amount", "total", "payment_info", "remarks", "signature", "footer"],
    letter: ["sender", "address", "date", "recipient", "title", "salutation", "body", "paragraph", "closing", "signature"],
    minutes: ["title", "meeting_info", "date", "attendees", "agenda", "discussion", "decision", "follow_up", "closing", "signature"],
    payroll: ["title", "employee_info", "employer_info", "date", "table", "amount", "total", "remarks", "signature"],
    report: ["title", "case_info", "background", "issue", "objective", "observation", "action_taken", "current_status", "recommendation", "conclusion", "body", "summary", "remarks", "signature"],
    resume: ["title", "name", "contact", "phone", "email", "summary", "education", "skills", "experience", "section", "references"],
  };
  const order = orders[kind];

  return [...sections].sort((first, second) => {
    const firstIndex = order.indexOf(first.slot);
    const secondIndex = order.indexOf(second.slot);
    return (firstIndex === -1 ? 999 : firstIndex) - (secondIndex === -1 ? 999 : secondIndex);
  });
}

function getAutoSectionStyle(kind: AutoLayoutKind, section: DocumentBrainSection & { slot: string }) {
  const styleHint = normalizeStyleHint(section.styleHint);
  const formatHint = section.formatHint || "";
  const slot = section.slot;
  const boxed = Boolean(styleHint.box || styleHint.border || styleHint.tableBorder || ["invoice", "payroll", "form"].includes(kind));
  const tableLike = styleHint.tableBorder || formatHint === "table" || slot.includes("table");
  const totalLike = styleHint.boxType === "totalBox" || formatHint === "total" || slot === "total";
  const signatureLike = styleHint.signatureLine || formatHint === "signature" || slot === "signature";
  const showHeading = kind !== "letter" && !["date", "subtitle", "footer"].includes(slot);

  return {
    contentStyle: {
      border: boxed || totalLike,
      box: boxed || totalLike,
      boxType: totalLike ? "totalBox" : styleHint.boxType,
      divider: styleHint.divider || ["report", "minutes", "resume"].includes(kind),
      signatureLine: signatureLike,
      tableBorder: tableLike,
      underline: styleHint.underline,
    },
    fontSize: totalLike ? 13 : 11.5,
    fontWeight: totalLike ? "bold" as const : "normal" as const,
    gap: kind === "letter" ? 20 : 18,
    headingStyle: ["report", "minutes", "resume"].includes(kind) ? { divider: true } : {},
    lineHeight: tableLike ? 1.65 : 1.45,
    showHeading,
    width: 604,
    x: 58,
  };
}

function autoSectionHeading(slot: string, type: string | undefined, language: Language) {
  return reportSectionHeading(slot, type, language);
}

function estimateAutoBlockHeight(content: string, width: number, fontSize: number) {
  const maxChars = Math.max(28, Math.floor(width / Math.max(6, fontSize * 0.52)));
  const lineCount = content.split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(line.length / maxChars)), 0);
  return Math.min(250, Math.max(42, lineCount * fontSize * 1.65 + 14));
}

function isReportDocument(result: DocumentBrainResult) {
  const value = `${result.documentType} ${result.title}`.toLowerCase();
  return value.includes("laporan") || value.includes("report") || value.includes("case") || value.includes("kes");
}

function isCaseReportDocument(result: DocumentBrainResult) {
  const documentType = result.documentType.toLowerCase().trim();
  const value = `${result.documentType} ${result.title}`.toLowerCase();
  return documentType === "kes" || value.includes("laporan_kes") || value.includes("laporan kes") || value.includes("case report");
}

function ensureReportSections(result: DocumentBrainResult, sections: Array<DocumentBrainSection & { slot: string }>) {
  if (!isCaseReportDocument(result)) {
    return sections;
  }

  const existingSlots = new Set(sections.map((section) => section.slot));
  const requiredCaseSections: Array<DocumentBrainSection & { slot: string }> = [
    {
      content: "LAPORAN KES",
      formatHint: "heading",
      slot: "title",
    },
    {
      content: "Tajuk Kes: [TAJUK KES]\nTarikh: [TARIKH]\nDisediakan oleh: [NAMA]",
      formatHint: "section",
      slot: "case_info",
    },
    {
      content: "Latar belakang kes ini perlu dilengkapkan berdasarkan maklumat sebenar kes.",
      formatHint: "paragraph",
      slot: "background",
    },
    {
      content: "Isu utama yang dikenal pasti perlu dihuraikan dengan jelas berdasarkan keadaan sebenar.",
      formatHint: "paragraph",
      slot: "issue",
    },
    {
      content: "Pemerhatian perlu direkodkan secara ringkas berdasarkan maklumat yang diperoleh.",
      formatHint: "paragraph",
      slot: "observation",
    },
    {
      content: "Tindakan yang telah diambil perlu dinyatakan secara tersusun.",
      formatHint: "paragraph",
      slot: "action_taken",
    },
    {
      content: "Status terkini kes perlu dikemas kini berdasarkan perkembangan semasa.",
      formatHint: "paragraph",
      slot: "current_status",
    },
    {
      content: "Cadangan atau syor penambahbaikan perlu dinyatakan mengikut keperluan kes.",
      formatHint: "paragraph",
      slot: "recommendation",
    },
    {
      content: "Kesimpulannya, kes ini memerlukan perhatian dan tindakan susulan yang sesuai.",
      formatHint: "paragraph",
      slot: "conclusion",
    },
  ];

  return [...sections, ...requiredCaseSections.filter((section) => !existingSlots.has(section.slot))];
}

function reportSectionHeading(slot: string, type: string | undefined, language: Language) {
  const headings: Record<string, string> = {
    "action-taken": "Tindakan Diambil",
    action_taken: "Tindakan Diambil",
    background: "Latar Belakang",
    body: language === "ms" ? "Butiran Laporan" : "Report Details",
    "case-info": "Maklumat Kes",
    case_info: "Maklumat Kes",
    customer_info: language === "ms" ? "Maklumat Pelanggan" : "Customer Information",
    conclusion: "Kesimpulan",
    "current-status": "Status Terkini",
    current_status: "Status Terkini",
    decision: language === "ms" ? "Keputusan Mesyuarat" : "Meeting Decisions",
    declaration: language === "ms" ? "Pengakuan" : "Declaration",
    discussion: language === "ms" ? "Perbincangan" : "Discussion",
    education: language === "ms" ? "Pendidikan" : "Education",
    employee_info: language === "ms" ? "Maklumat Pekerja" : "Employee Information",
    employer_info: language === "ms" ? "Maklumat Majikan" : "Employer Information",
    experience: language === "ms" ? "Pengalaman" : "Experience",
    follow_up: language === "ms" ? "Tindakan Susulan" : "Follow Up",
    issue: "Isu / Masalah",
    item_table: language === "ms" ? "Jadual Item" : "Item Table",
    meeting_info: language === "ms" ? "Maklumat Mesyuarat" : "Meeting Information",
    objective: language === "ms" ? "Objektif / Tujuan" : "Objective / Purpose",
    observation: "Pemerhatian",
    payment_info: language === "ms" ? "Maklumat Bayaran" : "Payment Information",
    recommendation: "Cadangan / Syor",
    references: language === "ms" ? "Rujukan" : "References",
    remarks: language === "ms" ? "Catatan" : "Remarks",
    summary: language === "ms" ? "Ringkasan" : "Summary",
    table: language === "ms" ? "Jadual" : "Table",
  };

  return headings[slot] || type || slot.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isInstructionPlaceholder(content: string) {
  const lower = content.toLowerCase();
  return lower.includes("klik untuk edit") || lower.includes("click to edit") || lower.includes("tuliskan") || lower.includes("write the");
}

function readPreviewBlockText(element: HTMLElement) {
  return element.innerText.replace(/\u00a0/g, " ");
}

function createPaperPage(pageNumber: number, blocks: PaperBlock[], type: DocumentTypeId | "", language: Language): PaperPage {
  const label = type ? documentTypeLabels[language][type] : language === "ms" ? "Dokumen kosong" : "Blank document";
  return {
    blocks,
    id: `page-${pageNumber}`,
    title: `${label} ${pageNumber}`,
  };
}

function createAiPaperPage(result: DocumentBrainResult, language: Language): PaperPage {
  const sections = result.sections.length > 0 ? result.sections : [{ content: result.title, type: result.documentType }];
  const titleBlock: PaperBlock = {
    ...getDefaultBlockFormat(language === "ms" ? "Tajuk" : "Title"),
    content: result.title,
    height: 90,
    id: "ai-title",
    slot: "title",
    title: language === "ms" ? "Tajuk" : "Title",
    width: 560,
    x: 48,
    y: 48,
  };

  const sectionBlocks = sections.map((section, index) => {
    const isWide = index % 3 === 0;
    const sectionTitle = section.type || section.slot || "Content";
    return {
      ...getDefaultBlockFormat(sectionTitle),
      content: section.content,
      height: isWide ? 150 : 132,
      id: `ai-section-${index}`,
      slot: normalizeSlot(section.slot || section.type || "content"),
      style: normalizeStyleHint(section.styleHint),
      title: sectionTitle,
      width: isWide ? 560 : 260,
      x: isWide ? 48 : 48 + ((index - 1) % 2) * 292,
      y: 166 + Math.floor(index / 2) * 165,
    };
  });

  return {
    blocks: [titleBlock, ...sectionBlocks],
    id: "page-1",
    title: result.title,
  };
}

function inferSlot(title: string) {
  return normalizeSlot(title);
}

function getDefaultBlockFormat(title: string): Pick<PaperBlock, "align" | "fontSize" | "fontWeight" | "lineHeight" | "underline"> {
  const slot = inferSlot(title);
  const isTitle = slot === "title";
  const isRightAligned = slot === "date" || slot === "reference";

  return {
    align: isTitle ? "center" : isRightAligned ? "right" : "left",
    fontSize: isTitle ? 16 : 13,
    fontWeight: isTitle || slot === "reference" ? "bold" : "normal",
    lineHeight: 1.55,
    underline: slot === "signature",
  };
}

function normalizeStyleHint(styleHint: unknown): DocumentBlockStyle {
  if (!styleHint || typeof styleHint !== "object") {
    return {};
  }

  const record = styleHint as Record<string, unknown>;
  return {
    border: typeof record.border === "boolean" ? record.border : undefined,
    box: typeof record.box === "boolean" ? record.box : undefined,
    boxType: typeof record.boxType === "string" ? record.boxType : undefined,
    divider: typeof record.divider === "boolean" ? record.divider : undefined,
    signatureLine: typeof record.signatureLine === "boolean" ? record.signatureLine : undefined,
    tableBorder: typeof record.tableBorder === "boolean" ? record.tableBorder : undefined,
    underline: typeof record.underline === "boolean" ? record.underline : undefined,
  };
}

function getFontWeightForSection(section: DocumentBrainSection, fallback: PaperBlock["fontWeight"]) {
  const formatHint = section.formatHint?.toLowerCase();
  if (formatHint === "heading" || formatHint === "subheading" || formatHint === "amount" || formatHint === "total") {
    return "bold";
  }
  return fallback;
}

function getPreviewBlockFrameClass(block: PaperBlock) {
  const style = block.style;
  if (!style) return "bg-transparent p-0";

  if (style.boxType === "totalBox") {
    return "rounded-sm border border-black/50 bg-black/[0.03] p-3";
  }

  if (style.tableBorder) {
    return "rounded-sm border border-black/45 bg-white p-3";
  }

  if (style.box || style.border) {
    return "rounded-sm border border-black/25 bg-black/[0.015] p-3";
  }

  return "bg-transparent p-0";
}

function normalizeSlot(value: string) {
  const lower = value.toLowerCase();

  if (lower.includes("tajuk") || lower.includes("title") || lower.includes("perkara") || lower.includes("subject")) return "title";
  if (lower.includes("tarikh") || lower.includes("date")) return "date";
  if (lower.includes("penerima") || lower.includes("kepada") || lower.includes("recipient") || lower.includes("to")) return "recipient";
  if (lower.includes("salam") || lower.includes("salutation") || lower.includes("greeting")) return "salutation";
  if (lower.includes("daripada") || lower.includes("pengirim") || lower.includes("from")) return "sender";
  if (lower.includes("alamat") || lower.includes("address")) return "address";
  if (lower.includes("telefon") || lower.includes("phone") || lower.includes("tel")) return "phone";
  if (lower.includes("emel") || lower.includes("email") || lower.includes("e-mel")) return "email";
  if (lower.includes("rujukan") || lower.includes("reference")) return "reference";
  if (lower.includes("subtajuk") || lower.includes("subtitle")) return "subtitle";
  if (lower.includes("kepala") || lower.includes("header")) return "header";
  if (lower.includes("kaki") || lower.includes("footer")) return "footer";
  if (lower.includes("logo")) return "logo";
  if (lower.includes("maklumat mesyuarat") || lower.includes("meeting info") || lower.includes("meeting_info")) return "meeting_info";
  if (lower.includes("kehadiran") || lower.includes("attendees") || lower.includes("attendance")) return "attendees";
  if (lower.includes("agenda")) return "agenda";
  if (lower.includes("perbincangan") || lower.includes("discussion")) return "discussion";
  if (lower.includes("keputusan") || lower.includes("decision")) return "decision";
  if (lower.includes("susulan") || lower.includes("follow up") || lower.includes("follow_up")) return "follow_up";
  if (lower.includes("maklumat pekerja") || lower.includes("employee info") || lower.includes("employee_info")) return "employee_info";
  if (lower.includes("maklumat majikan") || lower.includes("employer info") || lower.includes("employer_info")) return "employer_info";
  if (lower.includes("maklumat pelanggan") || lower.includes("customer info") || lower.includes("customer_info")) return "customer_info";
  if (lower.includes("jadual item") || lower.includes("item table") || lower.includes("item_table")) return "item_table";
  if (lower.includes("bayaran") || lower.includes("payment info") || lower.includes("payment_info")) return "payment_info";
  if (lower.includes("pendidikan") || lower.includes("education")) return "education";
  if (lower.includes("pengalaman") || lower.includes("experience")) return "experience";
  if (lower.includes("rujukan") || lower.includes("references")) return "references";
  if (lower.includes("pengakuan") || lower.includes("declaration")) return "declaration";
  if (lower.includes("maklumat kes") || lower.includes("case info") || lower.includes("case_info")) return "case_info";
  if (lower.includes("latar belakang") || lower.includes("background")) return "background";
  if (lower.includes("isu") || lower.includes("masalah") || lower.includes("issue")) return "issue";
  if (lower.includes("tindakan") || lower.includes("action taken") || lower.includes("action_taken")) return "action_taken";
  if (lower.includes("status terkini") || lower.includes("current status") || lower.includes("current_status")) return "current_status";
  if (lower.includes("cadangan") || lower.includes("syor") || lower.includes("recommendation")) return "recommendation";
  if (lower.includes("kesimpulan") || lower.includes("conclusion")) return "conclusion";
  if (lower.includes("isi") || lower.includes("body") || lower.includes("content") || lower.includes("perenggan")) return "body";
  if (lower.includes("paragraph") || lower.includes("para")) return "paragraph";
  if (lower.includes("penutup") || lower.includes("closing")) return "closing";
  if (lower.includes("tandatangan") || lower.includes("signature")) return "signature";
  if (lower.includes("jadual") || lower.includes("table") || lower.includes("item") || lower.includes("senarai barang")) return "table";
  if (lower.includes("senarai") || lower.includes("list") || lower.includes("agenda") || lower.includes("kemahiran") || lower.includes("skills")) return "list";
  if (lower.includes("jumlah") || lower.includes("total") || lower.includes("bersih")) return "total";
  if (lower.includes("amaun") || lower.includes("amount") || lower.includes("harga") || lower.includes("gaji") || lower.includes("bayaran")) return "amount";
  if (lower.includes("butiran") || lower.includes("description") || lower.includes("deskripsi")) return "description";
  if (lower.includes("catatan") || lower.includes("note") || lower.includes("remarks")) return "remarks";
  if (lower.includes("seksyen") || lower.includes("section") || lower.includes("pendidikan") || lower.includes("pengalaman")) return "section";
  if (lower.includes("objektif") || lower.includes("objective")) return "objective";
  if (lower.includes("bahan") || lower.includes("alat") || lower.includes("material")) return "materials";
  if (lower.includes("langkah") || lower.includes("step")) return "steps";
  if (lower.includes("pemerhatian") || lower.includes("observation")) return "observation";
  if (lower.includes("refleksi") || lower.includes("reflection")) return "reflection";
  if (lower.includes("ringkasan") || lower.includes("summary")) return "summary";
  if (lower.includes("nama") || lower.includes("name")) return "name";

  return lower
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "content";
}

function documentTypeLabelForPdf(type: DocumentTypeId | "", language: Language) {
  return type ? documentTypeLabels[language][type] : language === "ms" ? "Dokumen" : "Document";
}

function sanitizeFileName(value: string) {
  return (value || "lY Docs").replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").trim() || "lY Docs";
}

function createPdfBlob(
  pages: Array<{
    blocks: Array<{
      align: "center" | "left" | "right";
      content: string;
      fontSize: number;
      fontWeight: "bold" | "normal";
      height: number;
      lineHeight: number;
      style?: DocumentBlockStyle;
      title: string;
      underline: boolean;
      width: number;
      x: number;
      y: number;
    }>;
    title: string;
  }>,
) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const canvasWidth = 720;
  const canvasHeight = (canvasWidth * 297) / 210;
  const scaleX = pageWidth / canvasWidth;
  const scaleY = pageHeight / canvasHeight;
  const objects: string[] = [];
  const pageRefs: number[] = [];

  function addObject(content: string) {
    objects.push(content);
    return objects.length;
  }

  const regularFontObject = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontObject = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  pages.forEach((page) => {
    const lines: string[] = [];

    page.blocks.forEach((block) => {
      const blockX = block.x * scaleX;
      const blockTop = pageHeight - block.y * scaleY;
      const blockWidth = block.width * scaleX;
      const blockHeight = block.height * scaleY;
      const textInset = block.style?.box || block.style?.border || block.style?.tableBorder ? 7 : 0;
      const fontSize = Math.max(8, block.fontSize * scaleY);
      const lineStep = fontSize * block.lineHeight;
      const maxLines = Math.max(1, Math.floor(blockHeight / lineStep));
      const maxChars = Math.max(16, Math.floor((block.width - textInset * 2) / Math.max(6.5, block.fontSize * 0.54)));
      const contentLines = wrapPdfText(block.content || "", maxChars).slice(0, maxLines);
      const fontName = block.fontWeight === "bold" ? "F2" : "F1";
      let cursorY = blockTop - fontSize;

      if (block.style?.box || block.style?.border || block.style?.tableBorder) {
        const lineWidth = block.style.tableBorder ? 0.9 : 0.55;
        lines.push(
          "q",
          `${formatPdfNumber(lineWidth)} w`,
          `${formatPdfNumber(blockX)} ${formatPdfNumber(blockTop - blockHeight)} ${formatPdfNumber(blockWidth)} ${formatPdfNumber(blockHeight)} re`,
          "S",
          "Q",
        );
        cursorY -= 7;
      }

      if (block.title) {
        lines.push(
          "BT",
          "/F2 7 Tf",
          `1 0 0 1 ${formatPdfNumber(blockX)} ${formatPdfNumber(cursorY)} Tm`,
          `(${escapePdfText(block.title.toUpperCase())}) Tj`,
          "ET",
        );
        cursorY -= 12;
      }

      contentLines.forEach((line) => {
        const estimatedWidth = Math.min(blockWidth, line.length * fontSize * 0.49);
        const textX =
          block.align === "center"
            ? blockX + (blockWidth - estimatedWidth) / 2
            : block.align === "right"
              ? blockX + blockWidth - estimatedWidth - textInset
              : blockX + textInset;

        lines.push(
          "BT",
          `/${fontName} ${formatPdfNumber(fontSize)} Tf`,
          `1 0 0 1 ${formatPdfNumber(textX)} ${formatPdfNumber(cursorY)} Tm`,
          `(${escapePdfText(line)}) Tj`,
          "ET",
        );
        cursorY -= lineStep;
      });

      if (block.underline) {
        const underlineY = Math.max(blockTop - blockHeight + 8, blockTop - Math.max(fontSize * 1.35, 18));
        lines.push(
          "q",
          "0.8 w",
          `${formatPdfNumber(blockX)} ${formatPdfNumber(underlineY)} m`,
          `${formatPdfNumber(blockX + blockWidth)} ${formatPdfNumber(underlineY)} l`,
          "S",
          "Q",
        );
      }

      if (block.style?.divider) {
        const dividerY = blockTop - blockHeight + 4;
        lines.push(
          "q",
          "0.35 w",
          `${formatPdfNumber(blockX)} ${formatPdfNumber(dividerY)} m`,
          `${formatPdfNumber(blockX + blockWidth)} ${formatPdfNumber(dividerY)} l`,
          "S",
          "Q",
        );
      }

      if (block.style?.signatureLine) {
        const signatureY = Math.max(blockTop - blockHeight + 12, blockTop - Math.max(fontSize * 2.6, 32));
        lines.push(
          "q",
          "0.65 w",
          `${formatPdfNumber(blockX)} ${formatPdfNumber(signatureY)} m`,
          `${formatPdfNumber(blockX + Math.min(blockWidth, 165))} ${formatPdfNumber(signatureY)} l`,
          "S",
          "Q",
        );
      }
    });

    const stream = lines.join("\n");
    const contentObject = addObject(`<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`);
    const pageObject = addObject(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${regularFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> /Contents ${contentObject} 0 R >>`,
    );
    pageRefs.push(pageObject);
  });

  const pagesObject = addObject(`<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`);
  const catalogObject = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);
  const patchedObjects = objects.map((object) => object.replace("/Parent 0 0 R", `/Parent ${pagesObject} 0 R`));
  const header = "%PDF-1.4\n";
  let body = "";
  const offsets = [0];

  patchedObjects.forEach((object, index) => {
    offsets.push(header.length + body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = header.length + body.length;
  const xref = [
    "xref",
    `0 ${patchedObjects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${patchedObjects.length + 1} /Root ${catalogObject} 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");

  return new Blob([header, body, xref], { type: "application/pdf" });
}

function wrapPdfText(text: string, maxLength: number) {
  const paragraphs = text.split(/\n+/);
  return paragraphs.flatMap((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";

    words.forEach((word) => {
      const nextLine = line ? `${line} ${word}` : word;
      if (nextLine.length > maxLength) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = nextLine;
      }
    });

    if (line) lines.push(line);
    return lines.length > 0 ? lines : [""];
  });
}

function formatPdfNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2).replace(/\.?0+$/, "") : "0";
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function isAssetItem(title: string, language: Language) {
  return assetItemLibrary[language].some((item) => item.toLowerCase() === title.toLowerCase());
}

function getAlignmentGuide(activeBlock: PaperBlock, nextX: number, nextY: number, blocks: PaperBlock[]): AlignmentGuide {
  const threshold = 7;
  const activeCenterX = nextX + activeBlock.width / 2;
  const activeCenterY = nextY + activeBlock.height / 2;
  const verticalTargets = [360, 48, 672];
  const horizontalTargets = [509, 48, 970];

  blocks.forEach((block) => {
    if (block.id === activeBlock.id) return;
    verticalTargets.push(block.x, block.x + block.width / 2, block.x + block.width);
    horizontalTargets.push(block.y, block.y + block.height / 2, block.y + block.height);
  });

  const xGuide = verticalTargets.find(
    (target) =>
      Math.abs(target - nextX) <= threshold ||
      Math.abs(target - activeCenterX) <= threshold ||
      Math.abs(target - (nextX + activeBlock.width)) <= threshold,
  );
  const yGuide = horizontalTargets.find(
    (target) =>
      Math.abs(target - nextY) <= threshold ||
      Math.abs(target - activeCenterY) <= threshold ||
      Math.abs(target - (nextY + activeBlock.height)) <= threshold,
  );

  return {
    x: xGuide,
    y: yGuide,
  };
}

function buildBlocks(type: DocumentTypeId, language: Language) {
  const selected = templates[language][type] || templates[language]["custom-template"];
  return selected.map((title, index) => {
    const layout = getTemplateLayout(type, index);
    return {
      ...getDefaultBlockFormat(title),
      content: defaultContent(title, language),
      height: layout.height,
      id: `${type}-${title}-${index}`,
      slot: inferSlot(title),
      title,
      width: layout.width,
      x: layout.x,
      y: layout.y,
    };
  });
}

function getTemplateLayout(type: DocumentTypeId, index: number) {
  const formalLetter = [
    { height: 70, width: 270, x: 48, y: 58 },
    { height: 70, width: 190, x: 430, y: 58 },
    { height: 118, width: 540, x: 48, y: 150 },
    { height: 74, width: 560, x: 48, y: 292 },
    { height: 245, width: 560, x: 48, y: 390 },
    { height: 105, width: 560, x: 48, y: 670 },
    { height: 118, width: 270, x: 48, y: 815 },
  ];

  const planningDocument = [
    { height: 82, width: 560, x: 48, y: 48 },
    { height: 96, width: 260, x: 48, y: 154 },
    { height: 96, width: 260, x: 344, y: 154 },
    { height: 124, width: 560, x: 48, y: 276 },
    { height: 124, width: 260, x: 48, y: 424 },
    { height: 124, width: 260, x: 344, y: 424 },
    { height: 185, width: 560, x: 48, y: 572 },
    { height: 150, width: 560, x: 48, y: 782 },
  ];

  const reportDocument = [
    { height: 84, width: 560, x: 48, y: 48 },
    { height: 100, width: 260, x: 48, y: 156 },
    { height: 100, width: 260, x: 344, y: 156 },
    { height: 145, width: 560, x: 48, y: 282 },
    { height: 145, width: 260, x: 48, y: 452 },
    { height: 145, width: 260, x: 344, y: 452 },
    { height: 165, width: 560, x: 48, y: 622 },
    { height: 120, width: 560, x: 48, y: 812 },
  ];

  const resumeDocument = [
    { height: 96, width: 560, x: 48, y: 48 },
    { height: 150, width: 560, x: 48, y: 170 },
    { height: 170, width: 270, x: 48, y: 344 },
    { height: 170, width: 270, x: 338, y: 344 },
    { height: 170, width: 270, x: 48, y: 538 },
    { height: 170, width: 270, x: 338, y: 538 },
  ];

  const selectedLayout =
    type === "formal-letter" || type.endsWith("-letter")
      ? formalLetter
      : ["rpa", "rph", "rpi", "lesson-plan", "therapy-session-plan", "daily-activity-plan", "weekly-activity-plan", "program-plan"].includes(type)
        ? planningDocument
        : type === "resume" || type === "biodata"
          ? resumeDocument
          : type.includes("report") || type === "meeting-minutes" || type === "proposal" || type === "working-paper"
            ? reportDocument
            : null;

  if (selectedLayout?.[index]) {
    return selectedLayout[index];
  }

  return {
    height: index === 0 ? 104 : 132,
    width: index === 0 ? 560 : 260,
    x: index === 0 ? 48 : 48 + ((index - 1) % 2) * 292,
    y: index === 0 ? 150 : 280 + Math.floor((index - 1) / 2) * 160,
  };
}

function defaultContent(title: string, language: Language) {
  if (language === "en") {
    const lower = title.toLowerCase();
    if (lower.includes("objective")) return "Write the document or activity objective here.";
    if (lower.includes("closing")) return "Add a concise and professional closing.";
    if (lower.includes("signature")) return "Name, position and signature.";
    if (lower.includes("summary")) return "Main document summary.";
    return "Click to edit this block.";
  }

  const lower = title.toLowerCase();
  if (lower.includes("objektif")) return "Tuliskan objektif dokumen atau aktiviti di sini.";
  if (lower.includes("penutup")) return "Masukkan penutup yang ringkas dan profesional.";
  if (lower.includes("tandatangan")) return "Nama, jawatan dan tandatangan.";
  if (lower.includes("ringkasan")) return "Ringkasan utama dokumen.";
  return "Klik untuk edit kandungan blok ini.";
}
