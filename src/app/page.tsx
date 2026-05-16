"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const storageKey = "ly-docs-progress";

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiDraft, setAiDraft] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");

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
    setAiDraft("");
    setAiSuggestion("");
  }

  function generateAiSuggestion() {
    setAiSuggestion(buildShadowSuggestion(aiDraft, fileName));
  }

  async function copyAiSuggestion() {
    if (!aiSuggestion) return;
    await navigator.clipboard.writeText(aiSuggestion);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050507] px-4 py-8 text-center text-white sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(125,161,255,0.22),transparent_30%),radial-gradient(circle_at_18%_18%,rgba(230,237,255,0.08),transparent_25%),linear-gradient(135deg,#050507_0%,#10131a_48%,#050507_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:86px_86px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7da1ff]/20 blur-3xl sm:h-[34rem] sm:w-[34rem]" />

      <section className={`relative z-10 w-full animate-[fadeIn_900ms_ease-out_both] transition-all duration-700 ${fileName ? "max-w-4xl" : "max-w-xl"}`}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#c7d7ff]/75 sm:tracking-[0.42em]">
          Professional document generation
        </p>
        <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(199,215,255,0.2)] sm:text-8xl">
          lY Docs
        </h1>

        <div className="mx-auto mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_28px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:mt-12 sm:rounded-[2rem] sm:p-6">
          <label className={`group flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-[#b9caff]/35 bg-black/25 px-4 transition duration-500 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/10 sm:rounded-[1.5rem] sm:px-6 ${fileName ? "min-h-36 py-6" : "min-h-56 py-8"}`}>
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-3xl text-[#d7e3ff] transition duration-300 group-hover:scale-105">
              +
            </span>
            <span className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">
              Upload format dokumen anda
            </span>
            <span className="mt-3 max-w-sm text-sm leading-6 text-[#aeb7c8]">
              Masukkan file PDF, DOC, DOCX, PNG atau JPG. Kita mula semula dari
              langkah upload ini dahulu.
            </span>
            <input
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={handleUpload}
              type="file"
            />
          </label>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8aa0]">
              File dipilih
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-white">
              {fileName || "Belum ada file"}
            </p>
            {fileType ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b9caff]">
                {fileType}
              </p>
            ) : null}
          </div>

          {fileName ? (
            <div className="mt-4 text-left">
              <div className="rounded-2xl border border-white/10 bg-[#f7f4ed] p-4 text-[#14161d] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a7080]">
                    File sebenar untuk edit
                  </p>
                  <span className="rounded-full border border-[#d7d2c7] bg-white/70 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#6a7080]">
                    {fileType}
                  </span>
                </div>
                <FilePreview
                  file={uploadedFile}
                  fileName={fileName}
                  filePreviewUrl={filePreviewUrl}
                  fileType={fileType}
                />
                <div className="mt-4 rounded-2xl border border-[#d7d2c7] bg-white/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#14161d]">
                        Shadow AI
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#6a7080]">
                        Tulis ayat kasar, kemudian jana cadangan ayat yang lebih
                        kemas.
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-[#c8c2b8] bg-[#14161d] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition duration-300 hover:bg-[#2a3140]"
                      onClick={generateAiSuggestion}
                      type="button"
                    >
                      Cadang Ayat
                    </button>
                  </div>
                  <textarea
                    className="mt-4 min-h-28 w-full resize-none rounded-xl border border-[#d7d2c7] bg-white px-4 py-3 text-sm leading-6 text-[#14161d] outline-none transition duration-300 placeholder:text-[#9a958e] focus:border-[#7da1ff]"
                    onChange={(event) => setAiDraft(event.target.value)}
                    placeholder="Contoh: murid buat aktiviti mewarna ikut arahan guru tapi perlu bimbingan sikit"
                    value={aiDraft}
                  />
                  {aiSuggestion ? (
                    <div className="mt-4 rounded-xl border border-[#d7d2c7] bg-[#f7f4ed] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a7080]">
                        Cadangan
                      </p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#14161d]">
                        {aiSuggestion}
                      </p>
                      <button
                        className="mt-4 rounded-full border border-[#c8c2b8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#14161d] transition duration-300 hover:border-[#7da1ff]"
                        onClick={copyAiSuggestion}
                        type="button"
                      >
                        Copy Jawapan
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function buildShadowSuggestion(text: string, fileName: string) {
  const cleanText = normalizeSentence(text);
  const documentHint = fileName.toLowerCase();

  if (!cleanText) {
    return "Sila tulis ayat kasar terlebih dahulu supaya cadangan ayat dapat disediakan dengan lebih tepat.";
  }

  if (documentHint.includes("rph")) {
    return `Aktiviti pengajaran dan pembelajaran dilaksanakan secara terancang dengan bimbingan guru. ${cleanText} Murid diberi peluang untuk menyertai aktiviti mengikut tahap keupayaan masing-masing.`;
  }

  if (documentHint.includes("rpa")) {
    return `Aktiviti dilaksanakan mengikut perancangan yang telah ditetapkan. ${cleanText} Pemerhatian dibuat bagi memastikan peserta dapat mengikuti arahan, memberi respons dan menunjukkan perkembangan secara berperingkat.`;
  }

  if (documentHint.includes("rpi")) {
    return `Intervensi dilaksanakan secara berfokus berdasarkan keperluan individu. ${cleanText} Penilaian dibuat secara berterusan bagi mengenal pasti perkembangan, cabaran dan tindakan susulan yang sesuai.`;
  }

  if (documentHint.includes("laporan")) {
    return `Program telah dilaksanakan dengan teratur dan mencapai tujuan yang dirancang. ${cleanText} Secara keseluruhan, pelaksanaan berjalan lancar dengan kerjasama semua pihak yang terlibat.`;
  }

  return `Maklumat ini disusun semula dalam bentuk ayat yang lebih kemas dan profesional. ${cleanText}`;
}

function normalizeSentence(text: string) {
  const collapsed = text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1");

  if (!collapsed) return "";

  const sentences = collapsed
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => {
      const trimmed = sentence.trim();
      if (!trimmed) return "";
      const withCapital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      return /[.!?]$/.test(withCapital) ? withCapital : `${withCapital}.`;
    })
    .filter(Boolean);

  return sentences.join(" ");
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
    <div className="mt-4 overflow-hidden rounded-xl border border-[#d7d2c7] bg-white">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`File sebenar ${fileName}`}
          className="max-h-[36rem] w-full object-contain"
          src={filePreviewUrl}
        />
      ) : null}

      {isPdf ? (
        <object
          className="h-[36rem] w-full"
          data={filePreviewUrl}
          title={`File sebenar ${fileName}`}
          type="application/pdf"
        />
      ) : null}

      {isDocx ? <DocxPreview file={file} /> : null}

      {!isImage && !isPdf && !isDocx ? (
        <div className="grid min-h-48 place-items-center p-6 text-center">
          <div>
            <p className="text-sm font-bold text-[#14161d]">{fileName}</p>
            <p className="mt-2 text-sm leading-6 text-[#6a7080]">
              File ini sudah dipilih. Preview visual untuk format ini akan
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
        if (!cancelled) {
          container.contentEditable = "true";
          container.setAttribute("spellcheck", "false");
        }
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
        File DOCX belum tersedia.
      </div>
    );
  }

  if (error) {
    return <div className="p-5 text-sm leading-6 text-[#8f3131]">{error}</div>;
  }

  return (
    <div
      className="max-h-[42rem] overflow-auto bg-white text-black outline-none"
      ref={containerRef}
      suppressContentEditableWarning
    />
  );
}
