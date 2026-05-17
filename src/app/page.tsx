"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const storageKey = "ly-docs-progress";

type ChatMessage = {
  role: "bot" | "user";
  text: string;
};

type AssistantProposal = {
  target: string;
  text: string;
};

type DocumentAnalysis = {
  issues: string[];
  purpose: string;
  tone: string;
  type: string;
};

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState("");
  const [insertIntoDocument, setInsertIntoDocument] =
    useState<((text: string) => void) | null>(null);
  const [undoDocumentEdit, setUndoDocumentEdit] =
    useState<(() => void) | null>(null);

  useEffect(() => {
    window.localStorage.removeItem(storageKey);
  }, []);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
    setDocumentText("");
    setInsertIntoDocument(null);
    setUndoDocumentEdit(null);
    setFilePreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return file ? URL.createObjectURL(file) : "";
    });
    setFileType(file?.name.split(".").pop()?.toUpperCase() || "");
    setUploadedFile(file || null);
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
              AI Universal Document Assistant
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
                  onRegisterInsert={(handler) =>
                    setInsertIntoDocument(handler ? () => handler : null)
                  }
                  onRegisterUndo={(handler) =>
                    setUndoDocumentEdit(handler ? () => handler : null)
                  }
                />
              </div>
            </section>

            <ChatAssistantPanel
              documentText={documentText}
              onInsert={insertIntoDocument}
              onUndo={undoDocumentEdit}
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
        Masukkan PDF, Word, imej atau template custom. Dokumen penuh kekal di
        kiri dan lY AI Assistant membantu di kanan.
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
  onRegisterUndo,
}: {
  file: File | null;
  fileName: string;
  filePreviewUrl: string;
  fileType: string;
  onDocumentTextChange: (text: string) => void;
  onRegisterInsert: (handler: ((text: string) => void) | null) => void;
  onRegisterUndo: (handler: (() => void) | null) => void;
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
          onRegisterUndo={onRegisterUndo}
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
  onRegisterUndo,
}: {
  file: File | null;
  onDocumentTextChange: (text: string) => void;
  onRegisterInsert: (handler: ((text: string) => void) | null) => void;
  onRegisterUndo: (handler: (() => void) | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !file) return;

    let cancelled = false;
    let previousHtml = "";
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
          previousHtml = container.innerHTML;
          container.classList.add("ly-ai-writing");
          container.focus();
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) {
            const range = document.createRange();
            range.selectNodeContents(container);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }

          const words = text.split(" ");
          words.forEach((word, index) => {
            window.setTimeout(() => {
              document.execCommand(
                "insertText",
                false,
                `${word}${index === words.length - 1 ? "" : " "}`,
              );
              updateText();
              if (index === words.length - 1) {
                container.classList.remove("ly-ai-writing");
              }
            }, index * 18);
          });
        });
        onRegisterUndo(() => {
          if (!previousHtml) return;
          container.innerHTML = previousHtml;
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
      onDocumentTextChange("");
      onRegisterInsert(null);
      onRegisterUndo(null);
    };
  }, [file, onDocumentTextChange, onRegisterInsert, onRegisterUndo]);

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

function ChatAssistantPanel({
  documentText,
  onInsert,
  onUndo,
}: {
  documentText: string;
  onInsert: ((text: string) => void) | null;
  onUndo: (() => void) | null;
}) {
  const [chatInput, setChatInput] = useState("");
  const [proposal, setProposal] = useState<AssistantProposal | null>(null);
  const analysis = analyseDocument(documentText);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Saya lY AI Assistant. Saya membaca dokumen aktif dan boleh bantu lengkapkan, tulis semula, ringkaskan atau profesionalkan isi dokumen.",
    },
  ]);

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;

    const response = buildAssistantReply(text, analysis, documentText);
    setProposal(response.proposal);
    setMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "bot", text: response.message },
    ]);
    setChatInput("");
  }

  function handleChatKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChat();
    }
  }

  function insertProposal() {
    if (!proposal || !onInsert) return;
    onInsert(`\n${proposal.text}\n`);
    setMessages((current) => [
      ...current,
      {
        role: "bot",
        text: "Saya sedang isikan cadangan ke dalam dokumen. Gunakan Undo jika mahu patah balik.",
      },
    ]);
  }

  function varyProposal() {
    if (!proposal) return;
    const varied = createDocumentDraft(
      analysis,
      `${proposal.target} variasi`,
      documentText,
    );
    setProposal({ target: proposal.target, text: varied });
    setMessages((current) => [
      ...current,
      {
        role: "bot",
        text: `Variasi baru:\n\n${varied}\n\nMahu saya isikan ke dalam dokumen anda?`,
      },
    ]);
  }

  return (
    <aside className="lg:sticky lg:top-5 lg:self-start">
      <div className="flex max-h-[calc(100vh-2.5rem)] min-h-[44rem] flex-col rounded-[1.75rem] border border-white/10 bg-[#0b0d13]/80 p-4 shadow-[0_28px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8f9ab0]">
              lY AI Assistant
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Pembantu dokumen
            </h2>
          </div>
          <span className="scan-dot mt-2 h-3 w-3 rounded-full bg-[#d7e3ff]" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <MiniStat label="Jenis" value={analysis.type} />
          <MiniStat label="Gaya" value={analysis.tone} />
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f9ab0]">
            Analisis realtime
          </p>
          <p className="mt-2 text-sm leading-6 text-[#d8deea]">
            {analysis.purpose}
          </p>
          <div className="mt-3 space-y-2">
            {analysis.issues.slice(0, 4).map((issue) => (
              <p
                className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs leading-5 text-[#c8d1e2]"
                key={issue}
              >
                {issue}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-auto pr-1">
            {messages.map((message, index) => (
              <div
                className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-8 bg-[#d7e3ff] text-[#050507]"
                    : "mr-8 border border-white/10 bg-white/[0.06] text-[#e5ebf7]"
                }`}
                key={`${message.role}-${index}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          {proposal ? (
            <div className="mt-3 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/[0.07] p-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9caff]">
                Tindakan cadangan
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="mini-button"
                  disabled={!onInsert}
                  onClick={insertProposal}
                  type="button"
                >
                  Isikan
                </button>
                <button className="mini-button" onClick={varyProposal} type="button">
                  Variasi
                </button>
                <button
                  className="mini-button"
                  onClick={() => setChatInput(proposal.text)}
                  type="button"
                >
                  Edit dahulu
                </button>
                <button
                  className="mini-button-danger"
                  onClick={() => setProposal(null)}
                  type="button"
                >
                  Batal
                </button>
              </div>
              {onUndo ? (
                <button
                  className="btn-quiet mt-3 min-h-11 w-full px-4 py-2"
                  onClick={onUndo}
                  type="button"
                >
                  Undo isian terakhir
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            <textarea
              className="input-field min-h-28 resize-none"
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Contoh: lengkapkan surat, profesionalkan ayat ini, ringkaskan laporan..."
              value={chatInput}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="btn-primary min-h-11 px-4 py-2"
                onClick={sendChat}
                type="button"
              >
                Hantar
              </button>
              <button
                className="btn-quiet min-h-11 px-4 py-2"
                onClick={() => {
                  setChatInput("");
                  setProposal(null);
                  setMessages([
                    {
                      role: "bot",
                      text: "Chat dikosongkan. Saya masih membaca dokumen aktif dan sedia membantu.",
                    },
                  ]);
                }}
                type="button"
              >
                Kosongkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#7f8aa0]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function analyseDocument(text: string): DocumentAnalysis {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const lower = cleaned.toLowerCase();
  const type = detectDocumentType(lower);
  const issues: string[] = [];

  if (!cleaned) {
    return {
      issues: ["Dokumen belum mempunyai teks yang boleh dianalisis."],
      purpose:
        "Upload atau buka DOCX untuk analisis realtime. PDF/imej boleh dipreview, tetapi teks belum dibaca dalam fasa frontend ini.",
      tone: "Belum pasti",
      type: "Belum pasti",
    };
  }

  if (/\b(dgn|yg|utk|dlm)\b/i.test(cleaned)) {
    issues.push("Ada singkatan tidak formal seperti dgn/yg/utk/dlm.");
  }
  if (/(dan|serta|untuk|dengan|kepada|supaya)$/i.test(cleaned)) {
    issues.push("Ayat terakhir kelihatan tergantung.");
  }
  if (/_{3,}|\.{4,}|:\s*(\n|$)/.test(text)) {
    issues.push("Ada ruang kosong atau placeholder yang belum lengkap.");
  }
  if (hasRepeatedSentence(cleaned)) {
    issues.push("Ada ayat berulang yang boleh diringkaskan.");
  }
  if (/(ok|okay|best|benda|budak)/i.test(cleaned)) {
    issues.push("Ada perkataan santai yang kurang sesuai untuk dokumen rasmi.");
  }
  if (cleaned.length < 120) {
    issues.push("Isi dokumen masih pendek dan mungkin belum lengkap.");
  }

  if (issues.length === 0) {
    issues.push("Tiada isu besar dikesan. Dokumen kelihatan stabil.");
  }

  return {
    issues,
    purpose: buildPurpose(type, lower),
    tone: detectTone(lower),
    type,
  };
}

function detectDocumentType(text: string) {
  if (/rpa|rancangan pengajaran aktiviti|refleksi|bahan\s*\/\s*alat/.test(text)) return "RPA";
  if (/tuan|puan|perkara|yang benar|surat/.test(text)) return "Surat rasmi";
  if (/minit mesyuarat|agenda|kehadiran|mesyuarat/.test(text)) return "Minit mesyuarat";
  if (/laporan|pemerhatian|rumusan/.test(text)) return "Laporan";
  if (/resume|pengalaman kerja|kemahiran|pendidikan/.test(text)) return "Resume";
  if (/memo|daripada|kepada|tarikh/.test(text)) return "Memo";
  if (/proposal|cadangan projek|objektif projek/.test(text)) return "Proposal";
  if (/kertas kerja|latar belakang|anggaran kos/.test(text)) return "Kertas kerja";
  if (/borang|nama|no\. kad pengenalan|tandatangan/.test(text)) return "Borang";
  return "Dokumen umum";
}

function detectTone(text: string) {
  if (/tuan|puan|dengan hormat|perkara/.test(text)) return "Rasmi";
  if (/saya|kami|mohon|cadangan/.test(text)) return "Profesional";
  if (/objektif|pemerhatian|refleksi/.test(text)) return "Pendidikan";
  return "Neutral";
}

function buildPurpose(type: string, text: string) {
  if (type === "Surat rasmi") return "Dokumen ini kelihatan bertujuan menyampaikan permohonan, makluman atau urusan rasmi.";
  if (type === "RPA") return "Dokumen ini kelihatan bertujuan merancang aktiviti pembelajaran atau intervensi.";
  if (type === "Resume") return "Dokumen ini kelihatan bertujuan memperkenalkan kelayakan dan pengalaman seseorang.";
  if (type === "Minit mesyuarat") return "Dokumen ini kelihatan bertujuan merekod keputusan, agenda dan tindakan mesyuarat.";
  if (type === "Laporan") return "Dokumen ini kelihatan bertujuan melaporkan aktiviti, pemerhatian atau hasil program.";
  if (/sekolah|ppdk|taska|tadika/.test(text)) return "Dokumen ini berkaitan konteks pendidikan atau organisasi kanak-kanak.";
  return "Saya sedang membaca struktur, gaya dan isi dokumen untuk membantu menyiapkannya.";
}

function buildAssistantReply(
  prompt: string,
  analysis: DocumentAnalysis,
  documentText: string,
) {
  const lower = prompt.toLowerCase();
  const isDocumentRequest =
    /lengkap|sambung|variasi|auto|profesional|ringkas|semula|cadang|jana|isi|surat|laporan|resume|memo|proposal|rpa|dokumen/.test(lower);

  if (!isDocumentRequest) {
    return {
      message:
        "Saya jawab ringkas: boleh. Sekarang saya kembali fokus pada dokumen anda. Untuk bantuan dokumen, minta seperti 'lengkapkan surat' atau 'profesionalkan ayat ini'.",
      proposal: null,
    };
  }

  const target = detectActionTarget(lower, analysis.type);
  const draft = createDocumentDraft(analysis, target, documentText);

  return {
    message: `Saya cadangkan:\n\n${draft}\n\nMahu saya isikan ke dalam dokumen anda?`,
    proposal: { target, text: draft },
  };
}

function detectActionTarget(prompt: string, fallback: string) {
  if (/ringkas/.test(prompt)) return "ringkasan";
  if (/profesional/.test(prompt)) return "profesionalkan";
  if (/semula/.test(prompt)) return "tulis semula";
  if (/variasi/.test(prompt)) return "variasi";
  if (/surat/.test(prompt)) return "surat rasmi";
  if (/laporan/.test(prompt)) return "laporan";
  if (/resume/.test(prompt)) return "resume";
  if (/memo/.test(prompt)) return "memo";
  if (/proposal/.test(prompt)) return "proposal";
  if (/rpa/.test(prompt)) return "RPA";
  return fallback;
}

function createDocumentDraft(
  analysis: DocumentAnalysis,
  target: string,
  documentText: string,
) {
  const subject = inferSubject(documentText);

  if (target === "ringkasan") {
    return `Ringkasan: Dokumen ini berkaitan ${subject} dan disusun untuk menyampaikan maklumat secara jelas, teratur dan profesional.`;
  }

  if (target === "profesionalkan") {
    return "Perkara ini dilaksanakan secara terancang bagi memastikan maklumat yang disampaikan adalah jelas, tersusun dan selaras dengan tujuan dokumen.";
  }

  if (target === "surat rasmi" || analysis.type === "Surat rasmi") {
    return "Dengan segala hormatnya perkara di atas adalah dirujuk.\n\nSehubungan dengan itu, pihak kami ingin memohon pertimbangan dan tindakan lanjut daripada pihak tuan/puan berhubung perkara tersebut. Kerjasama dan perhatian pihak tuan/puan amat dihargai.\n\nSekian, terima kasih.";
  }

  if (target === "RPA" || analysis.type === "RPA") {
    return `Objektif aktiviti adalah untuk membimbing pelatih mengikuti aktiviti ${subject} secara berperingkat mengikut tahap keupayaan masing-masing. Pelaksanaan aktiviti dijalankan dengan bantuan bahan yang sesuai, pemerhatian berterusan dan pengukuhan positif daripada guru atau petugas.`;
  }

  if (target === "laporan" || analysis.type === "Laporan") {
    return "Secara keseluruhannya, aktiviti telah dilaksanakan mengikut perancangan. Peserta menunjukkan penglibatan yang baik dan memberi respons positif sepanjang program berlangsung. Beberapa penambahbaikan boleh dibuat dari aspek pengurusan masa, penyediaan bahan dan pemantauan susulan.";
  }

  if (target === "resume" || analysis.type === "Resume") {
    return "Ringkasan profil: Seorang calon yang komited, mudah menyesuaikan diri dan mempunyai kemahiran kerja yang baik. Berpengalaman menjalankan tugasan secara teratur serta mampu bekerjasama dalam persekitaran profesional.";
  }

  if (target === "memo" || analysis.type === "Memo") {
    return "Memo ini dikeluarkan bagi memaklumkan perkara berkaitan kepada semua pihak yang terlibat. Kerjasama semua pihak amat diperlukan bagi memastikan tindakan dapat dilaksanakan dengan lancar dan mengikut ketetapan yang telah ditetapkan.";
  }

  if (target === "proposal" || analysis.type === "Proposal") {
    return `Cadangan ini dikemukakan bagi melaksanakan ${subject} secara lebih tersusun dan berkesan. Pelaksanaan dicadangkan melibatkan perancangan objektif, kaedah kerja, keperluan sumber, jadual tindakan dan penilaian hasil bagi memastikan impak yang jelas.`;
  }

  return `Cadangan isi: Dokumen ini boleh dilengkapkan dengan maklumat berkaitan ${subject}, tujuan utama, butiran pelaksanaan, hasil yang dijangka dan tindakan susulan yang sesuai.`;
}

function inferSubject(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const titleMatch = cleaned.match(/(?:tajuk|perkara|aktiviti)\s*[:-]?\s*([^\.\n]{6,80})/i);
  return titleMatch?.[1]?.trim() || "perkara yang dinyatakan";
}

function hasRepeatedSentence(text: string) {
  const sentences = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter((sentence) => sentence.length > 24);
  const seen = new Set<string>();
  return sentences.some((sentence) => {
    if (seen.has(sentence)) return true;
    seen.add(sentence);
    return false;
  });
}
