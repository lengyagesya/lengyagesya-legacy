"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const storageKey = "ly-docs-progress";

const commonTypos: Record<string, string> = {
  aktibiti: "aktiviti",
  objektip: "objektif",
  pemerehatian: "pemerhatian",
  perlaksaan: "pelaksanaan",
  perlaksanaan: "pelaksanaan",
  dgn: "dengan",
  yg: "yang",
  utk: "untuk",
  dlm: "dalam",
};

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    window.localStorage.removeItem(storageKey);
  }, []);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
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
                />
              </div>
            </section>

            <ChatAssistantPanel />
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
}: {
  file: File | null;
  fileName: string;
  filePreviewUrl: string;
  fileType: string;
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

      {isDocx ? <DocxPreview file={file} /> : null}

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

function DocxPreview({ file }: { file: File | null }) {
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

    return () => {
      cancelled = true;
      container.contentEditable = "false";
      container.innerHTML = "";
    };
  }, [file]);

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

function ChatAssistantPanel() {
  const [input, setInput] = useState("");
  const liveCheck = useMemo(() => checkTypedText(input), [input]);
  const liveSuggestion = useMemo(() => buildLiveSuggestion(input), [input]);
  const assistantLine = useMemo(() => buildAutoAssistantLine(input), [input]);

  return (
    <aside className="lg:sticky lg:top-5 lg:self-start">
      <div className="flex max-h-[calc(100vh-2.5rem)] min-h-[44rem] flex-col rounded-[1.75rem] border border-white/10 bg-[#0b0d13]/80 p-4 shadow-[0_28px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8f9ab0]">
              Chat
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Semak ayat
            </h2>
          </div>
          <span className="scan-dot mt-2 h-3 w-3 rounded-full bg-[#d7e3ff]" />
        </div>

        <div className="mt-5 flex-1 space-y-3 overflow-auto pr-1">
          <div className="mr-8 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-[#e5ebf7]">
            {assistantLine}
          </div>
          <div className="mr-8 rounded-2xl border border-[#b9caff]/15 bg-[#7da1ff]/[0.07] px-4 py-3 text-sm leading-6 text-[#edf2ff]">
            {liveSuggestion}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8f9ab0]">
            Semakan semasa
          </p>
          <p className="text-sm leading-6 text-[#d8deea]">{liveCheck}</p>
        </div>

        <div className="mt-3 rounded-2xl border border-[#b9caff]/15 bg-[#7da1ff]/[0.07] p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b9caff]">
            Saranan
          </p>
          <p className="text-sm leading-6 text-[#edf2ff]">{liveSuggestion}</p>
        </div>

        <div className="mt-4">
          <textarea
            className="input-field min-h-32 resize-none"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Taip ayat yang mahu disemak..."
            value={input}
          />
          <div className="mt-3">
            <button
              className="btn-quiet min-h-11 w-full px-4 py-2"
              onClick={() => setInput("")}
              type="button"
            >
              Kosongkan
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function checkTypedText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Belum ada teks untuk disemak.";
  }

  const typo = Object.keys(commonTypos).find((item) =>
    new RegExp(`\\b${item}\\b`, "i").test(trimmed),
  );
  if (typo) {
    return `Ejaan "${typo}" mungkin perlu dibetulkan kepada "${commonTypos[typo]}".`;
  }

  if (/(dan|serta|untuk|dengan|kepada|supaya)$/i.test(trimmed)) {
    return "Ayat ini nampak tergantung. Tambah sambungan yang menerangkan hasil, tindakan atau tujuan.";
  }

  if (trimmed.split(/\s+/).length < 6) {
    return "Ayat masih terlalu pendek. Tambah siapa, aktiviti, tujuan dan hasil yang ingin dicapai.";
  }

  if (/(ok|okay|best|benda|budak)/i.test(trimmed)) {
    return "Ada perkataan santai. Untuk dokumen rasmi, gunakan bahasa yang lebih kemas dan profesional.";
  }

  if (!/[.!?]$/.test(trimmed)) {
    return "Ayat boleh ditutup dengan tanda noktah supaya kelihatan lengkap.";
  }

  return "Ayat ini sudah lebih kemas. Semak semula nama khas, tarikh dan istilah organisasi sebelum digunakan.";
}

function buildLiveSuggestion(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Tulis ayat di ruang chat dan saranan akan muncul secara automatik.";
  }

  const fixed = fixCommonTypos(trimmed);
  if (fixed !== trimmed) {
    return `Saranan ejaan: ${fixed}`;
  }

  if (/(objektif|matlamat)/i.test(trimmed)) {
    return "Pelatih dapat mengikuti aktiviti yang dirancang dengan bimbingan serta menunjukkan respons yang sesuai.";
  }

  if (/(pemerhatian|respons|tingkah laku)/i.test(trimmed)) {
    return "Pelatih menunjukkan minat semasa aktiviti dijalankan dan memberi respons positif terhadap arahan yang diberikan.";
  }

  if (/(refleksi|rumusan|cadangan)/i.test(trimmed)) {
    return "Aktiviti berjalan dengan baik dan boleh ditambah baik melalui bimbingan berterusan serta penggunaan bahan yang lebih sesuai.";
  }

  if (/(dan|serta|untuk|dengan|kepada|supaya)$/i.test(trimmed)) {
    return `${trimmed} mencapai objektif yang telah ditetapkan.`;
  }

  if (!/[.!?]$/.test(trimmed)) {
    return `${trimmed}.`;
  }

  return "Ayat sudah kelihatan kemas. Saya akan terus semak jika anda ubah teks.";
}

function buildAutoAssistantLine(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Saya akan bercakap secara automatik selepas anda mula menaip.";
  }

  const check = checkTypedText(trimmed);
  if (check.startsWith("Ayat ini sudah")) {
    return "Ayat ini sudah boleh digunakan. Saya akan terus semak jika anda ubah teks.";
  }

  return check;
}

function fixCommonTypos(text: string) {
  return Object.entries(commonTypos).reduce((current, [wrong, right]) => {
    return current.replace(new RegExp(`\\b${wrong}\\b`, "gi"), right);
  }, text);
}
