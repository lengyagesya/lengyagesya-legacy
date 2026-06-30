"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type DragEvent, type PointerEvent as ReactPointerEvent, createContext, useContext, useEffect, useState } from "react";

type Language = "ms" | "en";
type PaperBlock = {
  content: string;
  height: number;
  id: string;
  title: string;
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
type DocumentTypeId =
  | "rpa"
  | "rph"
  | "rpi"
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
  | "incident-report"
  | "resume"
  | "biodata"
  | "memo"
  | "assignment"
  | "form"
  | "application-letter"
  | "proposal"
  | "working-paper"
  | "lesson-plan"
  | "therapy-session-plan"
  | "daily-activity-plan"
  | "weekly-activity-plan"
  | "program-plan"
  | "school-document"
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
    submitLater: "Hantar ke AI nanti",
    selectDocumentPlaceholder: "Pilih jenis dokumen",
    documentBrief: "Penerangan dokumen",
    documentBriefPlaceholder: "Contoh: Saya mahu buat RPA aktiviti mengenal warna untuk kanak-kanak 5 tahun.",
    itemTools: "Tools item",
    itemToolsBody: "Pilih atau drag item masuk ke dalam kertas.",
    itemTitle: "Nama item",
    itemContent: "Isi item",
    addToPaper: "Simpan ke kertas",
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
    submitLater: "Submit to AI later",
    selectDocumentPlaceholder: "Select document type",
    documentBrief: "Document brief",
    documentBriefPlaceholder: "Example: I want to create an activity plan about basic colours for 5-year-old children.",
    itemTools: "Item tools",
    itemToolsBody: "Choose or drag an item into the paper.",
    itemTitle: "Item name",
    itemContent: "Item content",
    addToPaper: "Save to paper",
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

const documentTypes: DocumentTypeId[] = [
  "rpa",
  "rph",
  "rpi",
  "formal-letter",
  "meeting-minutes",
  "report",
  "activity-report",
  "program-report",
  "daily-report",
  "weekly-report",
  "monthly-report",
  "attendance-report",
  "progress-report",
  "observation-report",
  "reflection-report",
  "intervention-report",
  "visit-report",
  "assessment-report",
  "performance-report",
  "case-report",
  "incident-report",
  "resume",
  "biodata",
  "memo",
  "assignment",
  "form",
  "application-letter",
  "proposal",
  "working-paper",
  "lesson-plan",
  "therapy-session-plan",
  "daily-activity-plan",
  "weekly-activity-plan",
  "program-plan",
  "school-document",
  "ppdk",
  "taska",
  "custom-template",
];

const documentTypeLabels: Record<Language, Record<DocumentTypeId, string>> = {
  ms: {
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
    "incident-report": "Laporan insiden",
    resume: "Resume",
    biodata: "Biodata",
    memo: "Memo",
    assignment: "Tugasan",
    form: "Borang",
    "application-letter": "Surat permohonan",
    proposal: "Proposal",
    "working-paper": "Kertas kerja",
    "lesson-plan": "Lesson plan",
    "therapy-session-plan": "Pelan sesi terapi",
    "daily-activity-plan": "Pelan aktiviti harian",
    "weekly-activity-plan": "Pelan aktiviti mingguan",
    "program-plan": "Rancangan program",
    "school-document": "Dokumen sekolah",
    ppdk: "PPDK",
    taska: "Taska",
    "custom-template": "Template custom",
  },
  en: {
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
    "incident-report": "Incident report",
    resume: "Resume",
    biodata: "Biodata",
    memo: "Memo",
    assignment: "Assignment",
    form: "Form",
    "application-letter": "Application letter",
    proposal: "Proposal",
    "working-paper": "Working paper",
    "lesson-plan": "Lesson plan",
    "therapy-session-plan": "Therapy session plan",
    "daily-activity-plan": "Daily activity plan",
    "weekly-activity-plan": "Weekly activity plan",
    "program-plan": "Program plan",
    "school-document": "School document",
    ppdk: "PPDK",
    taska: "Childcare document",
    "custom-template": "Custom template",
  },
};

const templates: Record<Language, Record<DocumentTypeId, string[]>> = {
  ms: {
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
    "incident-report": ["Tarikh Insiden", "Tempat", "Pihak Terlibat", "Butiran Insiden", "Tindakan"],
    resume: ["Nama & Tajuk", "Ringkasan Profil", "Pengalaman", "Pendidikan", "Kemahiran", "Rujukan"],
    biodata: ["Nama Penuh", "Maklumat Peribadi", "Pendidikan", "Pengalaman", "Kemahiran", "Rujukan"],
    memo: ["Kepada", "Daripada", "Tarikh", "Perkara", "Isi Memo", "Tindakan"],
    assignment: ["Tajuk", "Arahan", "Isi Utama", "Rujukan", "Kesimpulan"],
    form: ["Nama", "Maklumat Peribadi", "Butiran", "Pengesahan", "Tandatangan"],
    "application-letter": ["Tarikh", "Penerima", "Perkara", "Tujuan Permohonan", "Maklumat Sokongan", "Penutup", "Tandatangan"],
    proposal: ["Tajuk Proposal", "Latar Belakang", "Objektif", "Cadangan Pelaksanaan", "Kos", "Penutup"],
    "working-paper": ["Tajuk", "Tujuan", "Latar Belakang", "Objektif", "Pelaksanaan", "Anggaran Kos", "Penutup"],
    "lesson-plan": ["Subject", "Class", "Topic", "Learning Objective", "Activities", "Teaching Aids", "Reflection"],
    "therapy-session-plan": ["Nama Klien", "Fokus Terapi", "Objektif", "Aktiviti", "Alat Terapi", "Penilaian"],
    "daily-activity-plan": ["Tarikh", "Aktiviti", "Objektif", "Bahan", "Langkah", "Catatan"],
    "weekly-activity-plan": ["Minggu", "Tema", "Aktiviti Utama", "Objektif", "Keperluan", "Catatan"],
    "program-plan": ["Nama Program", "Tujuan", "Objektif", "Sasaran", "Tentatif", "Keperluan", "Penutup"],
    "school-document": ["Nama Sekolah", "Tajuk", "Butiran", "Isi Kandungan", "Pengesahan"],
    ppdk: ["Nama PPDK", "Maklumat Pelatih", "Aktiviti", "Objektif", "Pemerhatian", "Refleksi"],
    taska: ["Nama Taska", "Nama Kanak-kanak", "Aktiviti", "Perkembangan", "Catatan"],
    "custom-template": ["Tajuk Dokumen", "Bahagian 1", "Bahagian 2", "Catatan", "Penutup"],
  },
  en: {
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
    "incident-report": ["Incident Date", "Location", "People Involved", "Incident Details", "Action"],
    resume: ["Name & Title", "Profile Summary", "Experience", "Education", "Skills", "References"],
    biodata: ["Full Name", "Personal Information", "Education", "Experience", "Skills", "References"],
    memo: ["To", "From", "Date", "Subject", "Memo Content", "Action"],
    assignment: ["Title", "Instruction", "Main Content", "References", "Conclusion"],
    form: ["Name", "Personal Information", "Details", "Confirmation", "Signature"],
    "application-letter": ["Date", "Recipient", "Subject", "Application Purpose", "Supporting Information", "Closing", "Signature"],
    proposal: ["Proposal Title", "Background", "Objective", "Implementation Plan", "Cost", "Closing"],
    "working-paper": ["Title", "Purpose", "Background", "Objective", "Implementation", "Estimated Cost", "Closing"],
    "lesson-plan": ["Subject", "Class", "Topic", "Learning Objective", "Activities", "Teaching Aids", "Reflection"],
    "therapy-session-plan": ["Client Name", "Therapy Focus", "Objective", "Activity", "Therapy Tools", "Assessment"],
    "daily-activity-plan": ["Date", "Activity", "Objective", "Materials", "Steps", "Notes"],
    "weekly-activity-plan": ["Week", "Theme", "Main Activities", "Objective", "Requirements", "Notes"],
    "program-plan": ["Program Name", "Purpose", "Objective", "Target Group", "Tentative", "Requirements", "Closing"],
    "school-document": ["School Name", "Title", "Details", "Content", "Confirmation"],
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
  const [languageOpen, setLanguageOpen] = useState(false);

  function chooseLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setLanguageOpen(false);
  }

  return (
    <header className="surface mb-6 flex items-center justify-between rounded-[1.5rem] px-4 py-3">
      <Link className="text-lg font-semibold tracking-[-0.04em]" href="/">
        lY Docs
      </Link>
      <div />
      <div className="relative">
        <button
          aria-expanded={languageOpen}
          aria-label="Tukar bahasa"
          className="grid h-10 min-w-10 place-items-center rounded-full border border-white/12 bg-white/[0.055] px-3 text-xs font-bold tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:border-[#9db4ff]/70"
          onClick={() => setLanguageOpen((current) => !current)}
          type="button"
        >
          {language === "ms" ? "BM" : "EN"}
        </button>
        {languageOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="surface absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-2xl p-1"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <LanguageOption
              active={language === "ms"}
              label="Bahasa Malaysia"
              shortcut="BM"
              onClick={() => chooseLanguage("ms")}
            />
            <LanguageOption
              active={language === "en"}
              label="English"
              shortcut="EN"
              onClick={() => chooseLanguage("en")}
            />
          </motion.div>
        ) : null}
      </div>
    </header>
  );
}

function LanguageOption({
  active,
  label,
  shortcut,
  onClick,
}: {
  active: boolean;
  label: string;
  shortcut: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
        active
          ? "bg-white text-black"
          : "text-[#b8bfcc] hover:bg-white/[0.07] hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <span className="text-xs font-bold tracking-[0.16em]">{shortcut}</span>
    </button>
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

  return (
    <section className="py-8">
        <Reveal>
          <h1 className="text-5xl font-semibold tracking-[-0.06em]">{t.createTitle}</h1>
          <p className="mt-4 max-w-2xl text-[#b8bfcc]">
            {t.createBody}
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documentTypes.map((type, index) => (
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
  const [alignmentGuide, setAlignmentGuide] = useState<AlignmentGuide>({});

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
  }

  function addItemToPaper(title = customTitle, content = customContent, position?: { x: number; y: number }, pageId = activePageId) {
    const cleanTitle = title.trim() || t.emptyTitle;
    const cleanContent = content.trim() || t.emptyContent;
    setPages((currentPages) =>
      currentPages.map((page) => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          blocks: [
            ...page.blocks,
            {
              content: cleanContent,
              height: isAssetItem(cleanTitle, language) ? 92 : 132,
              id: `custom-${Date.now()}-${page.blocks.length}`,
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
              {documentTypes.map((type) => (
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
            <button className="button-secondary mt-4 w-full" type="button">
              {t.submitLater}
            </button>
          </aside>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="surface rounded-[2rem] p-4">
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
              className="a4-page relative mx-auto overflow-hidden rounded-xl p-8 transition sm:p-12"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropItem(event, page.id)}
            >
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
                      className="editable-block mt-3 min-h-12 cursor-text text-sm leading-7 text-black/75"
                      contentEditable
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

function createPaperPage(pageNumber: number, blocks: PaperBlock[], type: DocumentTypeId | "", language: Language): PaperPage {
  const label = type ? documentTypeLabels[language][type] : language === "ms" ? "Dokumen kosong" : "Blank document";
  return {
    blocks,
    id: `page-${pageNumber}`,
    title: `${label} ${pageNumber}`,
  };
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
      content: defaultContent(title, language),
      height: layout.height,
      id: `${type}-${title}-${index}`,
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
    type === "formal-letter" || type === "application-letter"
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
