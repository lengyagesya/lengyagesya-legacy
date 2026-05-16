"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const storageKey = "ly-docs-progress";

type ShadowPrediction = {
  label?: string;
  mode?: "field" | "word";
  replacement?: string;
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

function buildFieldAssistantSuggestion({
  documentText,
  fieldQuestion,
  fileName,
  textBeforeCursor,
}: {
  documentText: string;
  fieldQuestion: string;
  fileName: string;
  textBeforeCursor: string;
}): Pick<ShadowPrediction, "mode" | "replacement" | "text"> | null {
  const lastWord = getLastWord(textBeforeCursor);
  const documentNeed = detectDocumentNeed(`${fileName} ${documentText} ${fieldQuestion}`);
  const wordOptions = buildWordOptions(lastWord, documentNeed);

  if (wordOptions.length > 0) {
    return {
      mode: "word",
      replacement: wordOptions[0],
      text: wordOptions.join(" / "),
    };
  }

  const fieldSuggestion = buildFieldSuggestion(fieldQuestion, documentNeed);
  if (fieldSuggestion) {
    return {
      mode: "field",
      replacement: fieldSuggestion,
      text: fieldSuggestion,
    };
  }

  const suggestions: Record<string, Record<string, string>> = {
    laporan: {
      aktiviti: "Aktiviti berjalan lancar dan peserta memberi kerjasama yang baik.",
      cadangan: "Cadangan penambahbaikan akan digunakan untuk sesi seterusnya.",
      objektif: "Objektif program dapat dicapai melalui pelaksanaan yang teratur.",
      pemerhatian: "Peserta kelihatan berminat dan memberi respons sepanjang aktiviti.",
      program: "Program berjalan mengikut perancangan dengan penglibatan semua pihak.",
      rumusan: "Secara keseluruhan, program berjalan baik dan mencapai tujuan yang dirancang.",
    },
    rpa: {
      aktiviti: "Aktiviti dijalankan secara berperingkat supaya peserta lebih mudah mengikuti arahan.",
      bahan: "Bahan digunakan sebagai rangsangan supaya peserta lebih fokus semasa aktiviti.",
      objektif: "Peserta dapat mengikuti aktiviti dengan bimbingan dan memberi respons mengikut kemampuan.",
      pelatih: "Pelatih memberi respons yang baik walaupun masih memerlukan bimbingan.",
      pemerhatian: "Peserta menunjukkan minat dan cuba melibatkan diri sepanjang aktiviti.",
      refleksi: "Aktiviti sesuai diteruskan dengan sedikit penyesuaian mengikut tahap peserta.",
    },
    rph: {
      aktiviti: "Aktiviti pembelajaran dijalankan secara berpandu dan murid diberi peluang mencuba.",
      guru: "Guru membimbing murid secara dekat mengikut tahap penguasaan masing-masing.",
      murid: "Murid dapat mengikuti pembelajaran dengan sokongan dan arahan yang jelas.",
      objektif: "Murid dapat mencapai objektif pembelajaran melalui aktiviti yang dirancang.",
      refleksi: "Sebahagian murid masih memerlukan bimbingan tambahan pada sesi seterusnya.",
      standard: "Standard pembelajaran digunakan sebagai rujukan utama semasa merancang aktiviti.",
    },
    rpi: {
      intervensi: "Intervensi dijalankan secara konsisten mengikut keperluan semasa murid.",
      klien: "Klien menunjukkan perkembangan kecil yang positif dan perlu terus dipantau.",
      matlamat: "Matlamat dicapai secara berperingkat melalui latihan dan bimbingan berterusan.",
      murid: "Murid masih memerlukan sokongan untuk mengukuhkan kemahiran yang disasarkan.",
      objektif: "Objektif jangka pendek dipilih berdasarkan keupayaan semasa murid.",
      penilaian: "Penilaian dibuat melalui pemerhatian dan respons murid semasa aktiviti.",
    },
    surat: {
      berhubung: "Berhubung perkara di atas, pihak kami ingin memaklumkan perkara berikut.",
      dimaklumkan: "Dimaklumkan bahawa perkara ini memerlukan perhatian dan tindakan pihak tuan.",
      kerjasama: "Kerjasama dan pertimbangan pihak tuan amat kami hargai.",
      memohon: "Memohon jasa baik pihak tuan untuk mempertimbangkan permohonan ini.",
      perkara: "Perkara tersebut adalah dirujuk untuk tindakan dan makluman lanjut.",
      surat: "Surat ini dikemukakan sebagai makluman dan rujukan pihak tuan.",
    },
    umum: {
      aktiviti: "Aktiviti dijalankan dengan tersusun dan mengikut keperluan yang ditetapkan.",
      dokumen: "Dokumen ini disediakan sebagai rujukan dan rekod pelaksanaan.",
      maklumat: "Maklumat telah disemak dan disusun supaya lebih jelas.",
      objektif: "Objektif dinyatakan dengan jelas supaya pelaksanaan lebih terarah.",
      perkara: "Perkara ini dicatatkan untuk makluman dan tindakan selanjutnya.",
      tujuan: "Dokumen ini disediakan untuk memudahkan rujukan pihak berkaitan.",
    },
  };

  const partialMatch = Object.keys(suggestions[documentNeed]).find((word) =>
    word.startsWith(lastWord),
  );

  const starter: Record<string, string> = {
    laporan: "Secara keseluruhan, aktiviti berjalan lancar dan peserta memberi kerjasama yang baik.",
    rpa: "Peserta dapat mengikuti aktiviti dengan bimbingan dan menunjukkan respons yang positif.",
    rph: "Murid dapat mengikuti pembelajaran dengan arahan yang jelas dan bimbingan guru.",
    rpi: "Intervensi boleh diteruskan secara konsisten mengikut keperluan individu.",
    surat: "Dengan segala hormatnya, pihak kami ingin memaklumkan perkara berikut.",
    umum: "Maklumat ini boleh disusun dengan ringkas, jelas dan mudah difahami.",
  };

  if (!lastWord) {
    return {
      mode: "field",
      replacement: starter[documentNeed],
      text: starter[documentNeed],
    };
  }

  const prediction = partialMatch
    ? suggestions[documentNeed][partialMatch]
    : suggestions[documentNeed].perkara || suggestions.umum.perkara;

  const finalSuggestion = prediction || starter[documentNeed];

  return {
    mode: "field",
    replacement: finalSuggestion,
    text: finalSuggestion,
  };
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

function buildWordOptions(prefix: string, documentNeed: string) {
  if (!prefix) return [];

  const words = [
    "aktiviti",
    "alat",
    "bahan",
    "bahasa",
    "bimbingan",
    "cadangan",
    "catatan",
    "fizikal",
    "fokus",
    "guru",
    "harimau",
    "hantu",
    "intervensi",
    "kemahiran",
    "kognitif",
    "komunikasi",
    "laporan",
    "masa",
    "motor",
    "murid",
    "objektif",
    "pemerhatian",
    "penilaian",
    "peserta",
    "program",
    "refleksi",
    "sosial",
    "sosioemosi",
    "tarikh",
    "tempat",
    "urus",
  ];

  const contextWords: Record<string, string[]> = {
    laporan: ["laporan", "program", "pemerhatian", "rumusan", "cadangan"],
    rpa: ["aktiviti", "motor", "kognitif", "komunikasi", "sosial", "urus"],
    rph: ["bahasa", "kognitif", "sosioemosi", "fizikal", "kreativiti"],
    rpi: ["intervensi", "penilaian", "objektif", "kemahiran", "bimbingan"],
    surat: ["perkara", "permohonan", "kerjasama", "makluman", "rujukan"],
    umum: [],
  };

  return Array.from(new Set([...(contextWords[documentNeed] || []), ...words]))
    .filter((word) => word.startsWith(prefix) && word !== prefix)
    .slice(0, 4);
}

function buildFieldSuggestion(fieldQuestion: string, documentNeed: string) {
  const field = fieldQuestion.toLowerCase();

  if (!field) return "";
  if (field.includes("bilangan") || field.includes("jumlah")) return "3";
  if (field.includes("bidang") || field.includes("fokus")) {
    return documentNeed === "rph"
      ? "Bahasa dan komunikasi / Kognitif / Sosioemosi / Fizikal / Kreativiti"
      : "Motor halus / Motor kasar / Kognitif / Komunikasi / Sosial / Urus diri";
  }
  if (field.includes("tarikh")) return new Date().toLocaleDateString("ms-MY");
  if (field.includes("masa")) return "9.00 pagi";
  if (field.includes("tempat")) return "Bilik aktiviti / ruang pembelajaran";
  if (field.includes("nama guru")) return "Nama guru / pendidik";
  if (field.includes("nama murid") || field.includes("nama pelatih")) return "Nama murid / pelatih";
  if (field.includes("bahan") || field.includes("alat")) return "Kad gambar, pensel warna, lembaran kerja dan bahan maujud";
  if (field.includes("objektif")) {
    return documentNeed === "rph"
      ? "Murid dapat mencapai objektif pembelajaran melalui aktiviti berpandu dan bimbingan guru."
      : "Peserta dapat mengikuti aktiviti dan memberi respons mengikut tahap keupayaan masing-masing.";
  }
  if (field.includes("pemerhatian")) return "Peserta menunjukkan minat, memberi respons dan cuba mengikuti arahan yang diberikan.";
  if (field.includes("refleksi")) return "Aktiviti berjalan lancar, namun beberapa penyesuaian boleh dibuat mengikut keperluan peserta.";
  if (field.includes("rumusan")) return "Secara keseluruhan, pelaksanaan berjalan baik dan mencapai tujuan yang dirancang.";
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
          className="pointer-events-none absolute z-20 max-w-[28rem] rounded-md border border-[#d7d2c7] bg-[#f7f4ed]/95 px-3 py-2 text-xs font-semibold leading-5 text-[#14161d] shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
          style={{
            left: shadowPrediction.x,
            top: shadowPrediction.y,
            minWidth: shadowPrediction.width ? Math.min(shadowPrediction.width, 240) : undefined,
          }}
        >
          {shadowPrediction.label ? (
            <span className="mr-2 text-[#6a7080]">{shadowPrediction.label}</span>
          ) : null}
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
    const fieldQuestion = getFieldQuestionNearCaret(container);
    const suggestion = buildFieldAssistantSuggestion({
      documentText: container.textContent || "",
      fieldQuestion,
      fileName,
      textBeforeCursor: getTextBeforeCaret(container),
    });
    const position = getActiveFieldPosition(container, previewRootRef.current) ||
      getCaretPosition(container, previewRootRef.current) || {
      x: 24,
      y: 56,
    };
    onPredictionChange(
      suggestion && position
        ? {
            label: suggestion.mode === "word" ? "" : fieldQuestion || "Cadangan",
            ...suggestion,
            ...position,
          }
        : null,
    );
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
          onPredictionChange(null);
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
          if (shadowPrediction.mode === "word") {
            replaceLastWord(shadowPrediction.replacement || shadowPrediction.text);
          } else {
            document.execCommand(
              "insertText",
              false,
              ` ${shadowPrediction.replacement || shadowPrediction.text}`,
            );
          }
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
    x: Math.max(8, markerRect.left - rootRect.left + 18),
    y: Math.max(8, markerRect.top - rootRect.top - 42),
    width,
  };

  marker.remove();
  selection.removeAllRanges();
  selection.addRange(range);

  return position;
}

function getActiveFieldPosition(container: HTMLElement, previewRoot: HTMLElement | null) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !previewRoot) return null;

  const node = selection.getRangeAt(0).startContainer;
  if (!container.contains(node)) return null;

  const element =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  const cell = element?.closest("td, th");
  if (!cell) return null;

  const cellRect = cell.getBoundingClientRect();
  const rootRect = previewRoot.getBoundingClientRect();

  return {
    width: Math.max(160, Math.min(cellRect.width - 12, 320)),
    x: Math.max(8, cellRect.left - rootRect.left + 10),
    y: Math.max(8, cellRect.top - rootRect.top - 42),
  };
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

function replaceLastWord(replacement: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;

  if (node.nodeType !== Node.TEXT_NODE) {
    document.execCommand("insertText", false, replacement);
    return;
  }

  const text = node.textContent || "";
  const before = text.slice(0, range.startOffset);
  const after = text.slice(range.startOffset);
  const match = before.match(/[\p{L}\p{N}-]+$/u);

  if (!match) {
    document.execCommand("insertText", false, replacement);
    return;
  }

  const nextText = `${before.slice(0, -match[0].length)}${replacement}${after}`;
  const nextOffset = before.length - match[0].length + replacement.length;
  node.textContent = nextText;

  const nextRange = document.createRange();
  nextRange.setStart(node, nextOffset);
  nextRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(nextRange);
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
