"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const storageKey = "ly-docs-progress";

type ShadowPrediction = {
  text: string;
  width?: number;
  x: number;
  y: number;
};

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [shadowPrediction, setShadowPrediction] = useState<ShadowPrediction | null>(null);

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
    setShadowPrediction(null);
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
                  onPredictionChange={setShadowPrediction}
                  shadowPrediction={shadowPrediction}
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function buildShadowPrediction(
  textBeforeCursor: string,
  documentText: string,
  fileName: string,
  fieldQuestion = "",
) {
  const lastWord = getLastWord(textBeforeCursor);
  const documentNeed = detectDocumentNeed(`${fileName} ${documentText} ${fieldQuestion}`);
  const fieldSuggestion = buildFieldSuggestion(fieldQuestion, documentNeed);

  if (fieldSuggestion) return fieldSuggestion;

  const suggestions: Record<string, Record<string, string>> = {
    laporan: {
      aktiviti: "dilaksanakan dengan lancar",
      cadangan: "penambahbaikan akan diambil kira",
      objektif: "program telah dicapai",
      pemerhatian: "menunjukkan penglibatan yang baik",
      program: "berjalan mengikut perancangan",
      rumusan: "pelaksanaan berjalan dengan baik",
    },
    rpa: {
      aktiviti: "dilaksanakan secara berperingkat",
      bahan: "digunakan semasa aktiviti",
      objektif: "dapat dicapai dengan bimbingan",
      pelatih: "memberi respons yang baik",
      pemerhatian: "menunjukkan perkembangan positif",
      refleksi: "perlu diteruskan dengan penambahbaikan",
    },
    rph: {
      aktiviti: "pembelajaran dijalankan secara terancang",
      guru: "membimbing murid secara berfokus",
      murid: "dapat mengikuti pembelajaran",
      objektif: "pembelajaran dapat dicapai",
      refleksi: "pengajaran perlu diperkukuh",
      standard: "pembelajaran telah dirujuk",
    },
    rpi: {
      intervensi: "dilaksanakan secara konsisten",
      klien: "menunjukkan perkembangan berperingkat",
      matlamat: "dicapai secara berperingkat",
      murid: "memerlukan bimbingan berterusan",
      objektif: "jangka pendek telah dikenal pasti",
      penilaian: "dibuat secara berkala",
    },
    surat: {
      berhubung: "perkara di atas",
      dimaklumkan: "bahawa pihak kami",
      kerjasama: "pihak tuan amat dihargai",
      memohon: "pertimbangan pihak tuan",
      perkara: "tersebut adalah dirujuk",
      surat: "ini dikemukakan untuk perhatian",
    },
    umum: {
      aktiviti: "dilaksanakan dengan teratur",
      dokumen: "disediakan dengan lengkap",
      maklumat: "telah dikemaskini",
      objektif: "telah dikenal pasti",
      perkara: "ini perlu diberi perhatian",
      tujuan: "dokumen ini disediakan",
    },
  };

  const partialMatch = Object.keys(suggestions[documentNeed]).find((word) =>
    word.startsWith(lastWord),
  );

  const starter: Record<string, string> = {
    laporan: "Cadangan: Aktiviti telah dilaksanakan dengan lancar dan mencapai objektif yang ditetapkan.",
    rpa: "Cadangan: Peserta dapat mengikuti aktiviti dengan bimbingan dan menunjukkan respons yang baik.",
    rph: "Cadangan: Murid dapat mengikuti pembelajaran secara aktif dengan bimbingan guru.",
    rpi: "Cadangan: Intervensi dilaksanakan secara berfokus mengikut keperluan individu.",
    surat: "Cadangan: Dengan segala hormatnya, perkara di atas adalah dirujuk.",
    umum: "Cadangan: Maklumat ini boleh ditulis secara ringkas, jelas dan profesional.",
  };

  if (!lastWord) {
    return starter[documentNeed];
  }

  const prediction = partialMatch
    ? suggestions[documentNeed][partialMatch]
    : suggestions[documentNeed].perkara || suggestions.umum.perkara;

  return prediction || starter[documentNeed];
}

function detectDocumentNeed(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("rph") || normalized.includes("standard kandungan")) return "rph";
  if (normalized.includes("rpa") || normalized.includes("tajuk aktiviti")) return "rpa";
  if (normalized.includes("rpi") || normalized.includes("intervensi")) return "rpi";
  if (normalized.includes("laporan") || normalized.includes("rumusan")) return "laporan";
  if (normalized.includes("surat") || normalized.includes("tuan") || normalized.includes("puan")) return "surat";

  return "umum";
}

function getLastWord(text: string) {
  const words = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words.at(-1) || "";
}

function buildFieldSuggestion(fieldQuestion: string, documentNeed: string) {
  const field = fieldQuestion.toLowerCase();

  if (!field) return "";
  if (field.includes("bilangan") || field.includes("jumlah")) return "3";
  if (field.includes("tarikh")) return new Date().toLocaleDateString("ms-MY");
  if (field.includes("masa")) return "9.00 pagi";
  if (field.includes("tempat")) return "Bilik aktiviti";
  if (field.includes("nama guru")) return "Nama guru";
  if (field.includes("nama murid") || field.includes("nama pelatih")) return "Nama murid";
  if (field.includes("bahan") || field.includes("alat")) return "Kad gambar, pensel warna dan lembaran kerja";
  if (field.includes("objektif")) {
    return documentNeed === "rph"
      ? "Murid dapat mencapai objektif pembelajaran dengan bimbingan guru."
      : "Peserta dapat mengikuti aktiviti dan memberi respons mengikut tahap keupayaan.";
  }
  if (field.includes("pemerhatian")) return "Peserta menunjukkan minat dan kerjasama yang baik.";
  if (field.includes("refleksi")) return "Aktiviti berjalan lancar dan boleh ditambah baik pada sesi seterusnya.";
  if (field.includes("rumusan")) return "Secara keseluruhan, pelaksanaan berjalan dengan baik.";
  if (field.includes("tajuk")) return documentNeed === "surat" ? "Permohonan Rasmi" : "Aktiviti Harian";
  if (field.includes("perkara")) return "Permohonan dan makluman rasmi";

  return "";
}

function FilePreview({
  file,
  fileName,
  filePreviewUrl,
  fileType,
  onPredictionChange,
  shadowPrediction,
}: {
  file: File | null;
  fileName: string;
  filePreviewUrl: string;
  fileType: string;
  onPredictionChange: (prediction: ShadowPrediction | null) => void;
  shadowPrediction: ShadowPrediction | null;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const type = fileType.toLowerCase();
  const isImage = ["jpg", "jpeg", "png"].includes(type);
  const isPdf = type === "pdf";
  const isDocx = type === "docx";

  return (
    <div
      className="relative mt-4 overflow-hidden rounded-xl border border-[#d7d2c7] bg-white"
      ref={previewRef}
    >
      {shadowPrediction ? (
        <span
          className="pointer-events-none absolute z-20 max-w-[28rem] rounded-md bg-[#111318]/90 px-3 py-2 text-sm font-semibold leading-6 text-white/85 shadow-[0_12px_36px_rgba(0,0,0,0.25)]"
          style={{
            left: shadowPrediction.x,
            top: shadowPrediction.y,
            minWidth: shadowPrediction.width ? Math.min(shadowPrediction.width, 240) : undefined,
          }}
        >
          {shadowPrediction.text}
        </span>
      ) : null}

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

      {isDocx ? (
        <DocxPreview
          file={file}
          fileName={fileName}
          onPredictionChange={onPredictionChange}
          previewRootRef={previewRef}
          shadowPrediction={shadowPrediction}
        />
      ) : null}

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

function DocxPreview({
  file,
  fileName,
  onPredictionChange,
  previewRootRef,
  shadowPrediction,
}: {
  file: File | null;
  fileName: string;
  onPredictionChange: (prediction: ShadowPrediction | null) => void;
  previewRootRef: React.RefObject<HTMLDivElement | null>;
  shadowPrediction: ShadowPrediction | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  function updatePrediction(container: HTMLElement) {
    const text = buildShadowPrediction(
      getTextBeforeCaret(container),
      container.textContent || "",
      fileName,
      getFieldQuestionNearCaret(container),
    );
    const position = getCaretPosition(container, previewRootRef.current) || {
      x: 24,
      y: 56,
    };
    onPredictionChange(text && position ? { text, ...position } : null);
  }

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
          const text = buildShadowPrediction("", container.textContent || "", fileName);
          onPredictionChange(text ? { text, x: 24, y: 56 } : null);
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
      onPredictionChange(null);
    };
  }, [file, fileName, onPredictionChange]);

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
      onInput={(event) => {
        updatePrediction(event.currentTarget);
      }}
      onKeyUp={(event) => {
        updatePrediction(event.currentTarget);
      }}
      onMouseUp={(event) => {
        updatePrediction(event.currentTarget);
      }}
      onFocus={(event) => {
        updatePrediction(event.currentTarget);
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab" && shadowPrediction?.text) {
          event.preventDefault();
          document.execCommand("insertText", false, ` ${shadowPrediction.text}`);
          onPredictionChange(null);
        }
      }}
      ref={containerRef}
      suppressContentEditableWarning
    />
  );
}

function getCaretPosition(container: HTMLElement, previewRoot: HTMLElement | null) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !previewRoot) return null;

  const range = selection.getRangeAt(0).cloneRange();
  if (!container.contains(range.commonAncestorContainer)) return null;

  range.collapse(false);
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  range.insertNode(marker);

  const markerRect = marker.getBoundingClientRect();
  const rootRect = previewRoot.getBoundingClientRect();
  const width = markerRect.width || 220;
  const position = {
    x: Math.max(8, markerRect.left - rootRect.left + 8),
    y: Math.max(8, markerRect.top - rootRect.top - 24),
    width,
  };

  marker.remove();
  selection.removeAllRanges();
  selection.addRange(range);

  return position;
}

function getTextBeforeCaret(container: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";

  const range = selection.getRangeAt(0).cloneRange();
  if (!container.contains(range.commonAncestorContainer)) return "";

  const textRange = document.createRange();
  textRange.selectNodeContents(container);
  textRange.setEnd(range.endContainer, range.endOffset);

  return textRange.toString();
}

function getFieldQuestionNearCaret(container: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";

  const node = selection.getRangeAt(0).startContainer;
  if (!container.contains(node)) return "";

  const element =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  if (!element) return "";

  const cell = element.closest("td, th");
  if (cell) {
    const row = cell.closest("tr");
    const cells = row ? Array.from(row.querySelectorAll("td, th")) : [];
    const cellIndex = cells.indexOf(cell);
    const leftCell = cellIndex > 0 ? cells[cellIndex - 1] : null;
    const firstCell = cells[0] && cells[0] !== cell ? cells[0] : null;
    const question = leftCell?.textContent || firstCell?.textContent || "";

    if (question.trim()) return cleanFieldQuestion(question);
  }

  const paragraphText = element.closest("p, div")?.textContent || "";
  return cleanFieldQuestion(paragraphText);
}

function cleanFieldQuestion(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[:：]+$/g, "")
    .trim()
    .slice(0, 90);
}
