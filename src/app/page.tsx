"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const storageKey = "ly-docs-progress";

type FieldContext = {
  field: string;
  label: string;
  source: string;
};

type ChatMessage = {
  role: "bot" | "user";
  text: string;
};

type ChatDetails = {
  aktiviti: string;
  bidang: string;
  hasil: string;
  tahap: string;
  umur: string;
};

type ChatContext = {
  details: ChatDetails;
  field: string;
};

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeField, setActiveField] = useState<FieldContext | null>(null);

  useEffect(() => {
    window.localStorage.removeItem(storageKey);
  }, []);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
    setActiveField(null);
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
                  onActiveFieldChange={setActiveField}
                />
              </div>
            </section>

            <ChatAssistantPanel activeField={activeField} />
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
        sebagai kertas sebenar di sebelah kiri dan chat AI berada di sebelah kanan.
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
  onActiveFieldChange,
}: {
  file: File | null;
  fileName: string;
  filePreviewUrl: string;
  fileType: string;
  onActiveFieldChange: (field: FieldContext | null) => void;
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
          onActiveFieldChange={onActiveFieldChange}
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
  onActiveFieldChange,
}: {
  file: File | null;
  onActiveFieldChange: (field: FieldContext | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !file) return;

    let cancelled = false;
    container.innerHTML = "";
    setError("");

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
      })
      .catch(() => {
        if (!cancelled) {
          setError("DOCX ini tidak dapat dipaparkan.");
        }
      });

    const handleInteraction = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      onActiveFieldChange(readFieldContext(target));
    };

    container.addEventListener("click", handleInteraction);
    container.addEventListener("keyup", handleInteraction);
    container.addEventListener("focusin", handleInteraction);

    return () => {
      cancelled = true;
      container.removeEventListener("click", handleInteraction);
      container.removeEventListener("keyup", handleInteraction);
      container.removeEventListener("focusin", handleInteraction);
      container.contentEditable = "false";
      container.innerHTML = "";
    };
  }, [file, onActiveFieldChange]);

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

function ChatAssistantPanel({ activeField }: { activeField: FieldContext | null }) {
  const [chatInput, setChatInput] = useState("");
  const [chatContext, setChatContext] = useState<ChatContext>({
    details: createEmptyDetails(),
    field: activeField?.field || "kolum",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Saya sedia bantu tulis ayat. Beritahu apa yang mahu dibuat, contohnya: buatkan ayat objektif untuk aktiviti mengenal warna.",
    },
  ]);

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;

    const nextContext = buildNextChatContext(text, chatContext, activeField);
    const reply = buildBotReply(nextContext);
    setChatContext(nextContext);
    setMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "bot", text: reply },
    ]);
    setChatInput("");
  }

  function handleChatKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChat();
    }
  }

  return (
    <aside className="lg:sticky lg:top-5 lg:self-start">
      <div className="flex max-h-[calc(100vh-2.5rem)] min-h-[44rem] flex-col rounded-[1.75rem] border border-white/10 bg-[#0b0d13]/80 p-4 shadow-[0_28px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8f9ab0]">
              Chat
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Chatbot
            </h2>
          </div>
          <span className="scan-dot mt-2 h-3 w-3 rounded-full bg-[#d7e3ff]" />
        </div>

        <div className="mt-5 flex flex-1 flex-col overflow-hidden">
          <div className="mb-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs leading-5 text-[#aeb7c8]">
            Konteks: {activeField ? `kolum ${activeField.label || activeField.field}` : "tiada kolum dipilih"}
          </div>

          <div className="flex-1 space-y-3 overflow-auto pr-1">
            {messages.map((message, index) => (
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
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

          <div className="mt-4">
            <textarea
              className="input-field min-h-28 resize-none"
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Tulis permintaan anda..."
              value={chatInput}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="btn-primary min-h-11 px-4 py-2"
                onClick={sendChat}
                type="button"
              >
                Minta bantuan
              </button>
              <button
                className="btn-quiet min-h-11 px-4 py-2"
                onClick={() => {
                  setChatInput("");
                  setChatContext({
                    details: createEmptyDetails(),
                    field: activeField?.field || "kolum",
                  });
                  setMessages([
                    {
                      role: "bot",
                      text: "Chat dikosongkan. Beritahu semula ayat atau dokumen yang mahu dibantu.",
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

function readFieldContext(target: Element): FieldContext {
  const row = target.closest("tr");
  const cell = target.closest("td, th");
  const block = target.closest("p, div, section, span");
  const cells = row ? Array.from(row.querySelectorAll("td, th")) : [];
  const cellIndex = cell ? cells.indexOf(cell as HTMLTableCellElement) : -1;
  const cellText = cleanText(cell?.textContent || "");
  const previousCellText =
    cellIndex > 0 ? cleanText(cells[cellIndex - 1]?.textContent || "") : "";
  const firstCellText = cleanText(cells[0]?.textContent || "");
  const rowText = cleanText(row?.textContent || "");
  const blockText = cleanText(block?.textContent || "");
  const label = pickFieldLabel([
    previousCellText,
    firstCellText,
    cellText,
    rowText,
    blockText,
  ]);
  const source = [label, cellText, rowText, blockText].filter(Boolean).join(" ");

  return {
    field: detectField(label || source),
    label,
    source,
  };
}

function detectField(source: string) {
  const text = source.toLowerCase();

  if (/umur\s*hayat/.test(text)) return "umur hayat";
  if (/umur\s*akal/.test(text)) return "umur akal";
  if (/umur|usia/.test(text)) return "umur";
  if (/nama\s*organisasi|organisasi|sekolah|ppdk|tadika|taska/.test(text)) return "nama organisasi";
  if (/nama.*(guru|petugas|pendidik)|guru|petugas|pendidik/.test(text)) return "nama petugas";
  if (/nama.*(murid|pelatih|kanak|klien)|murid|pelatih|kanak|klien/.test(text)) return "nama pelatih";
  if (/tarikh|date/.test(text)) return "tarikh";
  if (/masa|waktu/.test(text)) return "masa";
  if (/tempat|lokasi/.test(text)) return "tempat";
  if (/tajuk|nama\s*aktiviti|aktiviti\s*\/\s*program/.test(text)) return "tajuk aktiviti";
  if (/bidang|fokus|pembelajaran/.test(text)) return "bidang";
  if (/objektif|matlamat/.test(text)) return "objektif";
  if (/bahan|alat/.test(text)) return "bahan";
  if (/langkah|pelaksanaan|prosedur/.test(text)) return "langkah";
  if (/pemerhatian|respons/.test(text)) return "pemerhatian";
  if (/refleksi|rumusan|cadangan/.test(text)) return "refleksi";

  return "kolum";
}

function buildNextChatContext(
  text: string,
  current: ChatContext,
  activeField: FieldContext | null,
) {
  const normalized = text.toLowerCase();
  const requestedField = detectRequestedField(
    normalized,
    activeField?.field || current.field || "kolum",
  );
  const details = mergeDetails(current.details, extractKnownDetails(text));

  return {
    details,
    field: requestedField,
  };
}

function buildBotReply(context: ChatContext) {
  const field = context.field;
  const details = context.details;
  const missing = requiredDetails[field]?.filter((item) => !details[item]) || [];

  if (missing.length > 0) {
    return `Baik, saya boleh bantu tulis untuk ${field}. Saya perlukan detail ini dulu: ${formatMissingDetails(missing)}. Jawab ringkas sahaja, contoh: aktiviti mengenal warna, umur 5 tahun, tahap sederhana, bidang kognitif.`;
  }

  return buildDraftSentence(field, details);
}

function createEmptyDetails(): ChatDetails {
  return {
    aktiviti: "",
    bidang: "",
    hasil: "",
    tahap: "",
    umur: "",
  };
}

function mergeDetails(current: ChatDetails, incoming: ChatDetails): ChatDetails {
  return {
    aktiviti: incoming.aktiviti || current.aktiviti,
    bidang: incoming.bidang || current.bidang,
    hasil: incoming.hasil || current.hasil,
    tahap: incoming.tahap || current.tahap,
    umur: incoming.umur || current.umur,
  };
}

function formatMissingDetails(
  missing: Array<keyof ReturnType<typeof extractKnownDetails>>,
) {
  return missing
    .map((item) => detailLabels[item])
    .filter(Boolean)
    .join(", ");
}

function detectRequestedField(text: string, fallback: string) {
  if (/objektif|matlamat/.test(text)) return "objektif";
  if (/pemerhatian|respon|respons|tingkah/.test(text)) return "pemerhatian";
  if (/refleksi|rumusan|cadangan/.test(text)) return "refleksi";
  if (/langkah|cara|prosedur|pelaksanaan/.test(text)) return "langkah";
  if (/bahan|alat/.test(text)) return "bahan";
  if (/bidang|fokus/.test(text)) return "bidang";
  if (/tajuk|aktiviti/.test(text)) return "tajuk aktiviti";
  return fallback;
}

function extractKnownDetails(text: string) {
  const lower = text.toLowerCase();
  return {
    aktiviti: matchDetail(text, /(aktiviti|tajuk)\s+([^,.;]+)/i),
    bidang: matchDetail(text, /(bidang|fokus)\s+([^,.;]+)/i),
    hasil: matchDetail(text, /(hasil|target|tujuan)\s+([^,.;]+)/i),
    tahap: matchDetail(text, /(tahap)\s+([^,.;]+)/i),
    umur: lower.match(/\b\d{1,2}\s*tahun\b/i)?.[0] || "",
  };
}

function matchDetail(text: string, pattern: RegExp) {
  return text.match(pattern)?.[2]?.trim() || "";
}

const requiredDetails: Record<
  string,
  Array<keyof ReturnType<typeof extractKnownDetails>>
> = {
  objektif: ["aktiviti", "umur", "tahap", "bidang"],
  pemerhatian: ["aktiviti", "tahap", "hasil"],
  refleksi: ["aktiviti", "hasil"],
  langkah: ["aktiviti", "tahap"],
  bahan: ["aktiviti", "umur"],
  bidang: ["aktiviti"],
  "tajuk aktiviti": ["aktiviti"],
  kolum: ["aktiviti", "tahap"],
};

const detailLabels: Record<keyof ChatDetails, string> = {
  aktiviti: "nama aktiviti",
  bidang: "bidang atau fokus",
  hasil: "hasil yang mahu dicapai",
  tahap: "tahap pelatih",
  umur: "umur pelatih",
};

function buildDraftSentence(
  field: string,
  details: ReturnType<typeof extractKnownDetails>,
) {
  const aktiviti = details.aktiviti || "aktiviti yang dirancang";
  const umur = details.umur || "mengikut umur pelatih";
  const tahap = details.tahap || "mengikut tahap keupayaan";
  const bidang = details.bidang || "bidang yang berkaitan";
  const hasil = details.hasil || "menunjukkan respons yang positif";

  if (field === "objektif") {
    return `Cadangan objektif: Pelatih berumur ${umur} dapat mengikuti ${aktiviti} dalam ${bidang} dengan bimbingan mengikut ${tahap}.`;
  }

  if (field === "pemerhatian") {
    return `Cadangan pemerhatian: Semasa ${aktiviti}, pelatih ${hasil} dan memerlukan bimbingan mengikut ${tahap}.`;
  }

  if (field === "refleksi") {
    return `Cadangan refleksi: ${aktiviti} berjalan dengan baik kerana pelatih ${hasil}. Aktiviti ini boleh diteruskan dengan latihan berulang dan bahan yang sesuai.`;
  }

  if (field === "langkah") {
    return `Cadangan langkah: Guru memperkenalkan ${aktiviti}, menunjukkan contoh, membimbing pelatih mengikut ${tahap}, kemudian membuat pemerhatian dan pengukuhan positif.`;
  }

  if (field === "bahan") {
    return `Cadangan bahan: Kad imbasan, gambar berwarna, objek maujud, lembaran kerja dan bahan bantu mengajar yang sesuai untuk pelatih berumur ${umur}.`;
  }

  return `Cadangan ayat: ${aktiviti} dilaksanakan secara berstruktur mengikut ${tahap} supaya pelatih ${hasil}.`;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").replace(/[:：]+$/g, "").trim();
}

function pickFieldLabel(candidates: string[]) {
  const cleaned = candidates.map(cleanText).filter(Boolean);
  const shortCandidate = cleaned.find((candidate) => {
    const wordCount = candidate.split(/\s+/).length;
    return wordCount > 0 && wordCount <= 5 && detectField(candidate) !== "kolum";
  });

  if (shortCandidate) return shortCandidate;

  const detectedCandidate = cleaned.find((candidate) => detectField(candidate) !== "kolum");
  return detectedCandidate || cleaned[0] || "";
}
