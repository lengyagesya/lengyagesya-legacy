"use client";

import { motion, Reorder } from "framer-motion";
import Link from "next/link";
import { ChangeEvent, createContext, useContext, useEffect, useState } from "react";

type Language = "ms" | "en";
type DocumentTypeId =
  | "rpa"
  | "formal-letter"
  | "meeting-minutes"
  | "report"
  | "resume"
  | "memo"
  | "assignment"
  | "form"
  | "proposal"
  | "working-paper"
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
    uploadLogo: "Upload logo",
    submitLater: "Hantar ke AI nanti",
    logo: "Logo",
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
    uploadLogo: "Upload logo",
    submitLater: "Submit to AI later",
    logo: "Logo",
  },
} satisfies Record<Language, Record<string, string>>;

function useLanguage() {
  const context = useContext(LanguageContext);
  return { ...context, t: copy[context.language] };
}

const documentTypes: DocumentTypeId[] = [
  "rpa",
  "formal-letter",
  "meeting-minutes",
  "report",
  "resume",
  "memo",
  "assignment",
  "form",
  "proposal",
  "working-paper",
  "school-document",
  "ppdk",
  "taska",
  "custom-template",
];

const documentTypeLabels: Record<Language, Record<DocumentTypeId, string>> = {
  ms: {
    rpa: "RPA",
    "formal-letter": "Surat rasmi",
    "meeting-minutes": "Minit mesyuarat",
    report: "Laporan",
    resume: "Resume",
    memo: "Memo",
    assignment: "Tugasan",
    form: "Borang",
    proposal: "Proposal",
    "working-paper": "Kertas kerja",
    "school-document": "Dokumen sekolah",
    ppdk: "PPDK",
    taska: "Taska",
    "custom-template": "Template custom",
  },
  en: {
    rpa: "RPA",
    "formal-letter": "Formal letter",
    "meeting-minutes": "Meeting minutes",
    report: "Report",
    resume: "Resume",
    memo: "Memo",
    assignment: "Assignment",
    form: "Form",
    proposal: "Proposal",
    "working-paper": "Working paper",
    "school-document": "School document",
    ppdk: "PPDK",
    taska: "Childcare document",
    "custom-template": "Custom template",
  },
};

const templates: Record<Language, Record<DocumentTypeId, string[]>> = {
  ms: {
    rpa: ["Tajuk Aktiviti", "Objektif", "Bahan / Alat", "Langkah Pelaksanaan", "Pemerhatian", "Refleksi"],
    "formal-letter": ["Rujukan", "Tarikh", "Penerima", "Perkara", "Isi Surat", "Penutup", "Tandatangan"],
    "meeting-minutes": ["Butiran Mesyuarat", "Kehadiran", "Agenda", "Perbincangan", "Keputusan", "Tindakan Susulan"],
    report: ["Tajuk Laporan", "Objektif", "Ringkasan Aktiviti", "Dapatan", "Rumusan", "Cadangan"],
    resume: ["Nama & Tajuk", "Ringkasan Profil", "Pengalaman", "Pendidikan", "Kemahiran", "Rujukan"],
    memo: ["Kepada", "Daripada", "Tarikh", "Perkara", "Isi Memo", "Tindakan"],
    assignment: ["Tajuk", "Arahan", "Isi Utama", "Rujukan", "Kesimpulan"],
    form: ["Nama", "Maklumat Peribadi", "Butiran", "Pengesahan", "Tandatangan"],
    proposal: ["Tajuk Proposal", "Latar Belakang", "Objektif", "Cadangan Pelaksanaan", "Kos", "Penutup"],
    "working-paper": ["Tajuk", "Tujuan", "Latar Belakang", "Objektif", "Pelaksanaan", "Anggaran Kos", "Penutup"],
    "school-document": ["Nama Sekolah", "Tajuk", "Butiran", "Isi Kandungan", "Pengesahan"],
    ppdk: ["Nama PPDK", "Maklumat Pelatih", "Aktiviti", "Objektif", "Pemerhatian", "Refleksi"],
    taska: ["Nama Taska", "Nama Kanak-kanak", "Aktiviti", "Perkembangan", "Catatan"],
    "custom-template": ["Tajuk Dokumen", "Bahagian 1", "Bahagian 2", "Catatan", "Penutup"],
  },
  en: {
    rpa: ["Activity Title", "Objective", "Materials / Tools", "Implementation Steps", "Observation", "Reflection"],
    "formal-letter": ["Reference", "Date", "Recipient", "Subject", "Letter Content", "Closing", "Signature"],
    "meeting-minutes": ["Meeting Details", "Attendance", "Agenda", "Discussion", "Decision", "Follow-up Action"],
    report: ["Report Title", "Objective", "Activity Summary", "Findings", "Summary", "Recommendation"],
    resume: ["Name & Title", "Profile Summary", "Experience", "Education", "Skills", "References"],
    memo: ["To", "From", "Date", "Subject", "Memo Content", "Action"],
    assignment: ["Title", "Instruction", "Main Content", "References", "Conclusion"],
    form: ["Name", "Personal Information", "Details", "Confirmation", "Signature"],
    proposal: ["Proposal Title", "Background", "Objective", "Implementation Plan", "Cost", "Closing"],
    "working-paper": ["Title", "Purpose", "Background", "Objective", "Implementation", "Estimated Cost", "Closing"],
    "school-document": ["School Name", "Title", "Details", "Content", "Confirmation"],
    ppdk: ["PPDK Name", "Trainee Information", "Activity", "Objective", "Observation", "Reflection"],
    taska: ["Childcare Centre Name", "Child Name", "Activity", "Development", "Notes"],
    "custom-template": ["Document Title", "Section 1", "Section 2", "Notes", "Closing"],
  },
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
              <Link className="button-primary w-full" href="/create">
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

export function DocumentBuilder({ initialType = "formal-letter" }: { initialType?: string }) {
  return (
    <AppShell>
      <DocumentBuilderContent initialType={initialType} />
    </AppShell>
  );
}

function DocumentBuilderContent({ initialType = "formal-letter" }: { initialType?: string }) {
  const { language, t } = useLanguage();
  const initialDocumentType = normalizeDocumentType(initialType);
  const [docType, setDocType] = useState<DocumentTypeId>(initialDocumentType);
  const [blocks, setBlocks] = useState(() => buildBlocks(initialDocumentType, language));
  const [logo, setLogo] = useState("");

  useEffect(() => {
    window.setTimeout(() => setBlocks(buildBlocks(docType, language)), 0);
  }, [docType, language]);

  function changeType(value: string) {
    const nextType = normalizeDocumentType(value);
    setDocType(nextType);
    setBlocks(buildBlocks(nextType, language));
  }

  function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogo(URL.createObjectURL(file));
  }

  return (
    <section className="grid gap-5 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
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
              {documentTypes.map((type) => (
                <option key={type} value={type}>{documentTypeLabels[language][type]}</option>
              ))}
            </select>
            <label className="mt-4 block text-sm text-[#aeb6c6]">{t.uploadLogo}</label>
            <input accept="image/*" className="input mt-2" onChange={uploadLogo} type="file" />
            <button className="button-secondary mt-4 w-full" type="button">
              {t.submitLater}
            </button>
          </aside>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="surface rounded-[2rem] p-4">
            <div className="a4-page mx-auto rounded-xl p-8 sm:p-12">
              <div className="mb-8 flex items-start justify-between gap-6 border-b border-black/10 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-black/45">lY Docs</p>
                  <h1
                    className="editable-block mt-2 text-3xl font-semibold tracking-[-0.04em]"
                    contentEditable
                    suppressContentEditableWarning
                  >
                    {documentTypeLabels[language][docType]}
                  </h1>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-2xl border border-black/10 bg-black/5 text-xs text-black/40">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Uploaded logo" className="h-full w-full rounded-2xl object-contain" src={logo} />
                  ) : (
                    t.logo
                  )}
                </div>
              </div>
              <Reorder.Group axis="y" className="space-y-4" onReorder={setBlocks} values={blocks}>
                {blocks.map((block) => (
                  <Reorder.Item
                    className="cursor-grab rounded-xl border border-black/10 bg-white p-4 shadow-sm active:cursor-grabbing"
                    key={block.id}
                    value={block}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                      {block.title}
                    </p>
                    <div
                      className="editable-block mt-3 min-h-12 text-sm leading-7 text-black/75"
                      contentEditable
                      suppressContentEditableWarning
                    >
                      {block.content}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        </Reveal>
    </section>
  );
}

function normalizeDocumentType(type: string): DocumentTypeId {
  if (documentTypes.includes(type as DocumentTypeId)) {
    return type as DocumentTypeId;
  }

  const legacyMatch = documentTypes.find((documentType) =>
    Object.values(documentTypeLabels).some((labels) => labels[documentType] === type),
  );

  return legacyMatch ?? "formal-letter";
}

function buildBlocks(type: DocumentTypeId, language: Language) {
  const selected = templates[language][type] || templates[language]["custom-template"];
  return selected.map((title, index) => ({
    content: defaultContent(title, language),
    id: `${type}-${title}-${index}`,
    title,
  }));
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
