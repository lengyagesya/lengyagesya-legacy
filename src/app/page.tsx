"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const storageKey = "ly-docs-progress";

type InsightTone = "warning" | "good" | "info";

type AiInsight = {
  title: string;
  detail: string;
  suggestion: string;
  tone: InsightTone;
};

type AssistantAction = {
  label: string;
  text: string;
};

const actionLabels = [
  "Sambung ayat",
  "Baiki typo",
  "Variasi",
  "Profesional",
  "Auto lengkap",
  "Tulis semula",
];

const commonTypos: Record<string, string> = {
  aktibiti: "aktiviti",
  objektip: "objektif",
  pemerehatian: "pemerhatian",
  perlaksaan: "pelaksanaan",
  perlaksanaan: "pelaksanaan",
  pelatih2: "pelatih-pelatih",
  murid2: "murid-murid",
  kanak2: "kanak-kanak",
  dgn: "dengan",
  yg: "yang",
  utk: "untuk",
};

const professionalPhrases = [
  "Pelatih dapat melaksanakan aktiviti dengan bimbingan secara berperingkat.",
  "Pemerhatian menunjukkan pelatih memberi respons yang sesuai terhadap arahan yang diberikan.",
  "Aktiviti dijalankan mengikut tahap keupayaan pelatih serta disesuaikan dengan keperluan semasa.",
  "Refleksi menunjukkan aktiviti ini boleh diteruskan dengan penambahbaikan pada bahan dan tempoh pelaksanaan.",
  "Objektif aktiviti adalah jelas, boleh diperhatikan, dan sesuai dengan tahap perkembangan pelatih.",
];

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState("");
  const [assistantInsert, setAssistantInsert] =
    useState<((text: string) => void) | null>(null);

  useEffect(() => {
    window.localStorage.removeItem(storageKey);
  }, []);

  const analysis = useMemo(() => analyseDocument(documentText), [documentText]);
  const registerAssistantInsert = useCallback(
    (handler: ((text: string) => void) | null) => {
      setAssistantInsert(handler ? () => handler : null);
    },
    [],
  );

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
    setDocumentText("");
    setAssistantInsert(null);
    setFilePreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return file ? URL.createObjectURL(file) : "";
    });
    setFileType(file?.name.split(".").pop()?.toUpperCase() || "");
    setUploadedFile(file || null);
  }

  function handleAssistantAction(text: string) {
    if (assistantInsert) {
      assistantInsert(text);
      return;
    }

    navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  const hasDocument = Boolean(fileName);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(126,163,255,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,#050507_0%,#11141c_50%,#050507_100%)]" />
      <div className="pointer-events-none absolute inset-0 intro-grid opacity-25" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.055] px-4 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em] text-white">
              lY Docs
            </p>
            <p className="text-xs font-medium text-[#9aa7bd]">
              Editor dokumen pintar
            </p>
          </div>
          <label className="btn-secondary min-h-11 cursor-pointer px-4 py-2 text-[0.68rem]">
            Upload format
            <input
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={handleUpload}
              type="file"
            />
          </label>
        </header>

        {!hasDocument ? (
          <div className="grid flex-1 place-items-center py-16">
            <div className="w-full max-w-2xl animate-[fadeIn_900ms_ease-out_both] text-center">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.36em] text-[#c7d7ff]/75">
                Professional document generation
              </p>
              <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(199,215,255,0.22)] sm:text-8xl">
                lY Docs
              </h1>
              <div className="mx-auto mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_28px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <UploadBox onUpload={handleUpload} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
            <section className="min-w-0 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-3 shadow-[0_28px_120px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f9ab0]">
                    Dokumen penuh
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-white">
                    {fileName}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#c7d7ff]">
                  {fileType || "File"}
                </span>
              </div>
              <div className="rounded-[1.4rem] border border-[#d7d2c7] bg-[#f7f4ed] p-2 text-[#14161d] shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-4">
                <FilePreview
                  file={uploadedFile}
                  fileName={fileName}
                  filePreviewUrl={filePreviewUrl}
                  fileType={fileType}
                  onDocumentTextChange={setDocumentText}
                  onRegisterInsert={registerAssistantInsert}
                />
              </div>
            </section>

            <AiAssistantPanel
              actions={analysis.actions}
              documentText={documentText}
              insights={analysis.insights}
              onAction={handleAssistantAction}
              summary={analysis.summary}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function UploadBox({
  onUpload,
}: {
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="group flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#b9caff]/35 bg-black/25 px-6 py-10 transition duration-500 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/10">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-4xl text-[#d7e3ff] transition duration-300 group-hover:scale-105">
        +
      </span>
      <span className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
        Upload format dokumen anda
      </span>
      <span className="mt-3 max-w-md text-sm leading-6 text-[#aeb7c8]">
        Masukkan fail RPA atau format kerja. Selepas upload, dokumen muncul
        sebagai kertas sebenar di sebelah kiri dan AI membantu di sebelah kanan.
      </span>
      <input
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        className="sr-only"
        onChange={onUpload}
        type="file"
      />
    </label>
  );
}

function FilePreview({
  file,
  fileName,
  filePreviewUrl,
  fileType,
  onDocumentTextChange,
  onRegisterInsert,
}: {
  file: File | null;
  fileName: string;
  filePreviewUrl: string;
  fileType: string;
  onDocumentTextChange: (text: string) => void;
  onRegisterInsert: (handler: ((text: string) => void) | null) => void;
}) {
  const type = fileType.toLowerCase();
  const isImage = ["jpg", "jpeg", "png"].includes(type);
  const isPdf = type === "pdf";
  const isDocx = type === "docx";

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#d7d2c7] bg-white">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`Fail sebenar ${fileName}`}
          className="max-h-[calc(100vh-12rem)] w-full object-contain"
          src={filePreviewUrl}
        />
      ) : null}

      {isPdf ? (
        <object
          className="h-[calc(100vh-12rem)] min-h-[44rem] w-full"
          data={filePreviewUrl}
          title={`Fail sebenar ${fileName}`}
          type="application/pdf"
        />
      ) : null}

      {isDocx ? (
        <DocxPreview
          file={file}
          onDocumentTextChange={onDocumentTextChange}
          onRegisterInsert={onRegisterInsert}
        />
      ) : null}

      {!isImage && !isPdf && !isDocx ? (
        <div className="grid min-h-[44rem] place-items-center p-6 text-center">
          <div>
            <p className="text-sm font-bold text-[#14161d]">{fileName}</p>
            <p className="mt-2 text-sm leading-6 text-[#6a7080]">
              Fail ini sudah dipilih. Preview visual untuk format ini akan
              ditambah pada fasa seterusnya.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DocxPreview({
  file,
  onDocumentTextChange,
  onRegisterInsert,
}: {
  file: File | null;
  onDocumentTextChange: (text: string) => void;
  onRegisterInsert: (handler: ((text: string) => void) | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !file) return;

    let cancelled = false;
    container.innerHTML = "";
    setError("");

    const updateText = () => onDocumentTextChange(container.innerText || "");

    import("docx-preview")
      .then(({ renderAsync }) =>
        renderAsync(file, container, undefined, {
          breakPages: true,
          className: "ly-docx",
          experimental: true,
          ignoreFonts: false,
          ignoreHeight: false,
          ignoreWidth: false,
          inWrapper: true,
          renderFooters: true,
          renderHeaders: true,
          useBase64URL: true,
        }),
      )
      .then(() => {
        if (cancelled) return;

        container.contentEditable = "true";
        container.setAttribute("spellcheck", "true");
        updateText();
        onRegisterInsert((text: string) => {
          container.focus();
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) {
            const range = document.createRange();
            range.selectNodeContents(container);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
          document.execCommand("insertText", false, text);
          updateText();
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("DOCX ini tidak dapat dipaparkan.");
        }
      });

    container.addEventListener("input", updateText);
    container.addEventListener("keyup", updateText);
    container.addEventListener("mouseup", updateText);

    return () => {
      cancelled = true;
      container.removeEventListener("input", updateText);
      container.removeEventListener("keyup", updateText);
      container.removeEventListener("mouseup", updateText);
      container.contentEditable = "false";
      container.innerHTML = "";
      onRegisterInsert(null);
    };
  }, [file, onDocumentTextChange, onRegisterInsert]);

  if (!file) {
    return (
      <div className="p-5 text-sm leading-6 text-[#6a7080]">
        Fail DOCX belum tersedia.
      </div>
    );
  }

  if (error) {
    return <div className="p-5 text-sm leading-6 text-[#8f3131]">{error}</div>;
  }

  return (
    <div
      className="ly-docx-output max-h-[calc(100vh-12rem)] min-h-[44rem] overflow-auto bg-white text-black outline-none"
      ref={containerRef}
      suppressContentEditableWarning
    />
  );
}

function AiAssistantPanel({
  actions,
  documentText,
  insights,
  onAction,
  summary,
}: {
  actions: AssistantAction[];
  documentText: string;
  insights: AiInsight[];
  onAction: (text: string) => void;
  summary: string;
}) {
  const wordCount = documentText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <aside className="lg:sticky lg:top-5 lg:self-start">
      <div className="rounded-[1.75rem] border border-white/10 bg-[#0b0d13]/80 p-4 shadow-[0_28px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8f9ab0]">
              AI Assistant
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Semakan realtime
            </h2>
          </div>
          <span className="scan-dot mt-2 h-3 w-3 rounded-full bg-[#d7e3ff]" />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8aa0]">
            Konteks dokumen
          </p>
          <p className="mt-3 text-sm leading-6 text-[#d8deea]">{summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric label="Perkataan" value={wordCount.toString()} />
            <Metric label="Isu dikesan" value={insights.length.toString()} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {insights.map((insight) => (
            <InsightCard insight={insight} key={`${insight.title}-${insight.detail}`} />
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-[#b9caff]/15 bg-[#7da1ff]/[0.07] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9caff]">
            Cadangan automatik
          </p>
          <p className="mt-3 text-sm leading-6 text-[#edf2ff]">
            {actions[0]?.text || professionalPhrases[0]}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {actionLabels.map((label, index) => (
            <button
              className="mini-button text-left"
              key={label}
              onClick={() => onAction(actions[index]?.text || professionalPhrases[index % professionalPhrases.length])}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#7f8aa0]">
        {label}
      </p>
    </div>
  );
}

function InsightCard({ insight }: { insight: AiInsight }) {
  const toneClass =
    insight.tone === "warning"
      ? "border-amber-300/20 bg-amber-300/[0.07] text-amber-100"
      : insight.tone === "good"
        ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100"
        : "border-[#b9caff]/20 bg-[#7da1ff]/[0.07] text-[#e8efff]";

  return (
    <article className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-sm font-semibold">{insight.title}</p>
      <p className="mt-2 text-sm leading-6 opacity-[0.82]">{insight.detail}</p>
      <p className="mt-3 rounded-xl bg-black/18 p-3 text-sm leading-6 text-white/90">
        {insight.suggestion}
      </p>
    </article>
  );
}

function analyseDocument(text: string): {
  actions: AssistantAction[];
  insights: AiInsight[];
  summary: string;
} {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const lower = cleaned.toLowerCase();
  const insights: AiInsight[] = [];
  const detectedTheme = detectTheme(lower);
  const detectedAge = detectAge(lower);
  const detectedField = detectField(lower);

  if (!cleaned) {
    return {
      actions: professionalPhrases.map((phrase, index) => ({
        label: actionLabels[index] || "Cadangan",
        text: phrase,
      })),
      insights: [
        {
          title: "Dokumen belum dibaca",
          detail: "Upload atau klik pada dokumen untuk mula edit.",
          suggestion: "AI akan semak ejaan, objektif, ruangan kosong dan kesesuaian ayat selepas teks tersedia.",
          tone: "info",
        },
      ],
      summary: "Menunggu dokumen aktif.",
    };
  }

  const typoHits = Object.keys(commonTypos).filter((typo) =>
    new RegExp(`\\b${typo}\\b`, "i").test(cleaned),
  );
  if (typoHits.length > 0) {
    insights.push({
      title: "Typo dikesan",
      detail: `Perkataan seperti "${typoHits[0]}" mungkin perlu dibetulkan.`,
      suggestion: `Guna "${commonTypos[typoHits[0]]}" supaya dokumen kelihatan lebih kemas dan rasmi.`,
      tone: "warning",
    });
  }

  if (/(dan|serta|untuk|dengan|kepada|supaya)$/i.test(cleaned)) {
    insights.push({
      title: "Ayat tergantung",
      detail: "Ayat terakhir kelihatan belum lengkap.",
      suggestion: "Lengkapkan ayat dengan hasil yang boleh diperhatikan atau tindakan susulan yang jelas.",
      tone: "warning",
    });
  }

  if (/(objektif|matlamat)/i.test(cleaned) && !/(dapat|boleh|mampu|berupaya)/i.test(cleaned)) {
    insights.push({
      title: "Objektif terlalu umum",
      detail: "Objektif lebih kuat jika ada kata kerja yang boleh diukur.",
      suggestion: buildObjectiveSuggestion(detectedTheme, detectedAge),
      tone: "warning",
    });
  }

  if (/(okay|ok|best|budak|benda)/i.test(cleaned)) {
    insights.push({
      title: "Bahasa kurang profesional",
      detail: "Ada perkataan santai yang kurang sesuai untuk dokumen rasmi.",
      suggestion: "Gunakan istilah seperti pelatih, murid, aktiviti, pemerhatian, pelaksanaan dan penilaian.",
      tone: "warning",
    });
  }

  if (/_{3,}|\.{4,}|:\s*(\n|$)/.test(text)) {
    insights.push({
      title: "Ruangan kosong dikesan",
      detail: "Ada bahagian yang masih kosong atau belum lengkap.",
      suggestion: "Isi bahagian tersebut dengan maklumat ringkas, tepat dan berkaitan aktiviti.",
      tone: "info",
    });
  }

  const repeated = findRepeatedSentence(cleaned);
  if (repeated) {
    insights.push({
      title: "Pengulangan ayat",
      detail: "Ayat yang sama kelihatan berulang dalam dokumen.",
      suggestion: "Gabungkan isi yang sama atau tulis semula dengan fokus pemerhatian yang berbeza.",
      tone: "warning",
    });
  }

  if (detectedAge && detectedAge <= 6 && /(karangan|esei|perenggan panjang|analisis)/i.test(cleaned)) {
    insights.push({
      title: "Objektif mungkin terlalu tinggi",
      detail: "Aktiviti kelihatan tidak sepadan dengan umur yang rendah.",
      suggestion: "Gunakan objektif seperti mengecam, menyebut, memadankan, memilih atau meniru dengan bimbingan.",
      tone: "warning",
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "Dokumen kelihatan stabil",
      detail: "Tiada isu besar dikesan ketika ini.",
      suggestion: "Teruskan isi bahagian objektif, pemerhatian dan refleksi dengan ayat yang jelas dan boleh dinilai.",
      tone: "good",
    });
  }

  const baseSuggestion = buildContextSuggestion(detectedTheme, detectedAge, detectedField);
  const actions = [
    baseSuggestion,
    fixTypoSuggestion(cleaned),
    buildVariationSuggestion(detectedTheme),
    buildProfessionalSuggestion(detectedTheme),
    buildAutoCompleteSuggestion(detectedTheme, detectedAge),
    buildRewriteSuggestion(detectedTheme, detectedField),
  ].map((actionText, index) => ({
    label: actionLabels[index],
    text: actionText,
  }));

  return {
    actions,
    insights: insights.slice(0, 5),
    summary: buildSummary(detectedTheme, detectedAge, detectedField),
  };
}

function detectTheme(text: string) {
  if (/warna|merah|biru|kuning|hijau/.test(text)) return "warna asas";
  if (/nombor|mengira|bilangan|angka/.test(text)) return "nombor dan bilangan";
  if (/motor|sensori|koordinasi|pergerakan/.test(text)) return "motor dan sensori";
  if (/bahasa|komunikasi|sebut|perkataan/.test(text)) return "bahasa dan komunikasi";
  if (/sosial|emosi|kerjasama|giliran/.test(text)) return "sosial dan emosi";
  return "aktiviti pembelajaran";
}

function detectField(text: string) {
  if (/objektif|matlamat/.test(text)) return "objektif";
  if (/pemerhatian/.test(text)) return "pemerhatian";
  if (/refleksi|rumusan/.test(text)) return "refleksi";
  if (/bahan|alat/.test(text)) return "bahan";
  if (/langkah|pelaksanaan/.test(text)) return "langkah pelaksanaan";
  return "isi dokumen";
}

function detectAge(text: string) {
  const match = text.match(/(?:umur|usia|hayat|akal)\D{0,12}(\d{1,2})/i);
  return match ? Number(match[1]) : null;
}

function buildSummary(theme: string, age: number | null, field: string) {
  const ageText = age ? `, anggaran umur ${age} tahun` : "";
  return `AI sedang membaca konteks ${field}, tema ${theme}${ageText}. Cadangan dikemas kini setiap kali dokumen berubah.`;
}

function buildObjectiveSuggestion(theme: string, age: number | null) {
  const support = age && age <= 6 ? "dengan bimbingan" : "secara berperingkat";
  return `Pelatih dapat mengenal ${theme} ${support} melalui aktiviti yang dijalankan.`;
}

function buildContextSuggestion(theme: string, age: number | null, field: string) {
  if (field === "pemerhatian") {
    return `Pelatih menunjukkan minat terhadap aktiviti ${theme} dan memberi respons yang positif apabila diberi arahan.`;
  }
  if (field === "refleksi") {
    return `Aktiviti ${theme} berjalan dengan baik dan boleh ditambah baik melalui bimbingan individu serta pengukuhan berulang.`;
  }
  return buildObjectiveSuggestion(theme, age);
}

function fixTypoSuggestion(text: string) {
  const typo = Object.keys(commonTypos).find((item) =>
    new RegExp(`\\b${item}\\b`, "i").test(text),
  );
  if (!typo) return "Semak semula ejaan, tanda baca dan penggunaan huruf besar pada nama, tempat serta tajuk aktiviti.";
  return `Betulkan "${typo}" kepada "${commonTypos[typo]}" dan pastikan ayat dibaca semula sebelum disimpan.`;
}

function buildVariationSuggestion(theme: string) {
  return `Murid diberi peluang mencuba aktiviti ${theme} secara berperingkat mengikut tahap keupayaan masing-masing.`;
}

function buildProfessionalSuggestion(theme: string) {
  return `Pelaksanaan aktiviti ${theme} disusun secara terancang bagi menyokong perkembangan kemahiran dan penglibatan pelatih.`;
}

function buildAutoCompleteSuggestion(theme: string, age: number | null) {
  const support = age && age <= 6 ? "dengan bantuan guru atau petugas" : "melalui latihan berulang";
  return `Seterusnya, pelatih akan dibimbing untuk mengukuhkan kemahiran berkaitan ${theme} ${support}.`;
}

function buildRewriteSuggestion(theme: string, field: string) {
  return `Bahagian ${field} boleh ditulis semula dengan lebih jelas supaya aktiviti ${theme} mempunyai tujuan, kaedah dan hasil pemerhatian yang seimbang.`;
}

function findRepeatedSentence(text: string) {
  const sentences = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter((sentence) => sentence.length > 24);
  const seen = new Set<string>();
  return sentences.find((sentence) => {
    if (seen.has(sentence)) return true;
    seen.add(sentence);
    return false;
  });
}
