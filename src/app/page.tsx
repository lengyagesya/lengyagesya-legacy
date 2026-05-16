"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const storageKey = "ly-docs-progress";

type ShadowPrediction = {
  label?: string;
  mode?: "field";
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
  fieldText,
  fieldQuestion,
  fileName,
  textBeforeCursor,
}: {
  documentText: string;
  fieldText: string;
  fieldQuestion: string;
  fileName: string;
  textBeforeCursor: string;
}): Pick<ShadowPrediction, "mode" | "replacement" | "text"> | null {
  const lastWord = getLastWord(textBeforeCursor);
  const documentNeed = detectDocumentNeed(`${fileName} ${documentText} ${fieldQuestion}`);
  const fieldSuggestion = buildFieldSuggestion(fieldQuestion, documentNeed, fieldText);
  if (fieldSuggestion) return createFieldPrediction(fieldSuggestion, fieldText);

  const suggestions: Record<string, Record<string, string>> = {
    laporan: {
      aktiviti: "Aktiviti telah dilaksanakan mengikut perancangan dan mendapat kerjasama yang baik daripada peserta.",
      cadangan: "Cadangan penambahbaikan akan diambil kira bagi memastikan pelaksanaan seterusnya lebih teratur.",
      objektif: "Objektif program dapat dicapai melalui pelaksanaan aktiviti yang tersusun dan bersesuaian.",
      pemerhatian: "Peserta kelihatan berminat, memberi respons yang baik dan melibatkan diri sepanjang aktiviti dijalankan.",
      program: "Program berjalan mengikut perancangan dengan penglibatan yang baik daripada semua pihak.",
      rumusan: "Secara keseluruhan, program berjalan dengan baik dan mencapai tujuan yang telah dirancang.",
    },
    rpa: {
      aktiviti: "Aktiviti dijalankan secara berperingkat supaya peserta dapat mengikuti arahan dengan lebih mudah.",
      bahan: "Bahan yang digunakan membantu menarik perhatian peserta dan menyokong pelaksanaan aktiviti.",
      objektif: "Peserta dapat mengikuti aktiviti dengan bimbingan serta memberi respons mengikut tahap keupayaan masing-masing.",
      pelatih: "Pelatih memberi respons yang baik dan masih memerlukan bimbingan berterusan mengikut keperluan semasa.",
      pemerhatian: "Peserta menunjukkan minat dan berusaha melibatkan diri sepanjang aktiviti dijalankan.",
      refleksi: "Aktiviti sesuai diteruskan dengan penyesuaian kecil mengikut tahap dan keperluan peserta.",
    },
    rph: {
      aktiviti: "Aktiviti pembelajaran dijalankan secara berpandu dan murid diberi ruang untuk mencuba mengikut kemampuan.",
      guru: "Guru membimbing murid secara dekat berdasarkan tahap penguasaan dan keperluan pembelajaran masing-masing.",
      murid: "Murid dapat mengikuti pembelajaran dengan sokongan, arahan yang jelas dan bimbingan berterusan.",
      objektif: "Murid dapat mencapai objektif pembelajaran melalui aktiviti yang dirancang secara berperingkat.",
      refleksi: "Sebahagian murid masih memerlukan bimbingan tambahan bagi mengukuhkan kefahaman pada sesi seterusnya.",
      standard: "Standard pembelajaran dijadikan rujukan utama semasa merancang dan melaksanakan aktiviti.",
    },
    rpi: {
      intervensi: "Intervensi dijalankan secara konsisten berdasarkan keperluan semasa dan tahap perkembangan murid.",
      klien: "Klien menunjukkan perkembangan kecil yang positif dan perlu terus dipantau dari semasa ke semasa.",
      matlamat: "Matlamat dicapai secara berperingkat melalui latihan, bimbingan dan pemantauan berterusan.",
      murid: "Murid masih memerlukan sokongan bagi mengukuhkan kemahiran yang disasarkan dalam pelan ini.",
      objektif: "Objektif jangka pendek ditetapkan berdasarkan keupayaan semasa dan keperluan utama murid.",
      penilaian: "Penilaian dibuat melalui pemerhatian, respons murid dan pencapaian semasa aktiviti dijalankan.",
    },
    surat: {
      berhubung: "Berhubung perkara di atas, pihak kami ingin memaklumkan perkara berikut.",
      dimaklumkan: "Dimaklumkan bahawa perkara ini memerlukan perhatian dan tindakan lanjut daripada pihak tuan.",
      kerjasama: "Kerjasama dan pertimbangan pihak tuan amat kami hargai.",
      memohon: "Memohon jasa baik pihak tuan untuk mempertimbangkan permohonan ini.",
      perkara: "Perkara tersebut dirujuk untuk makluman dan tindakan lanjut pihak tuan.",
      surat: "Surat ini dikemukakan sebagai makluman dan rujukan pihak tuan.",
    },
    umum: {
      aktiviti: "Aktiviti dijalankan secara tersusun dan mengikut keperluan yang telah ditetapkan.",
      dokumen: "Dokumen ini disediakan sebagai rujukan dan rekod pelaksanaan.",
      maklumat: "Maklumat disemak dan disusun semula supaya lebih jelas, kemas dan mudah difahami.",
      objektif: "Objektif dinyatakan dengan jelas supaya pelaksanaan dapat berjalan dengan lebih terarah.",
      tujuan: "Dokumen ini disediakan untuk memudahkan rujukan pihak berkaitan.",
    },
  };

  const partialMatch = Object.keys(suggestions[documentNeed]).find((word) =>
    word.startsWith(lastWord),
  );

  if (!lastWord) {
    return createFieldPrediction(buildStarterSentence(documentNeed, fieldText), fieldText);
  }

  const finalSuggestion = partialMatch ? suggestions[documentNeed][partialMatch] : "";

  if (!finalSuggestion) {
    return createFieldPrediction(buildStarterSentence(documentNeed, fieldText), fieldText);
  }

  return createFieldPrediction(
    adaptSuggestionToInput(fieldText, finalSuggestion, documentNeed, fieldQuestion),
    fieldText,
  );
}

function createFieldPrediction(
  text: string,
  currentInput = "",
): Pick<ShadowPrediction, "mode" | "replacement" | "text"> | null {
  const cleanText = text.trim();
  if (!cleanText) return null;

  return {
    mode: "field",
    replacement: buildInsertionText(currentInput, cleanText),
    text: cleanText,
  };
}

function buildInsertionText(currentInput: string, suggestion: string) {
  const input = normalizeFieldText(currentInput);
  if (!input) return suggestion;

  if (suggestion.toLowerCase().startsWith(input.toLowerCase())) {
    return suggestion.slice(input.length);
  }

  return ` ${suggestion}`;
}

function buildStarterSentence(documentNeed: string, input: string) {
  const starters: Record<string, string> = {
    laporan: "Aktiviti telah dilaksanakan mengikut perancangan dan mendapat kerjasama yang baik daripada peserta.",
    rpa: "Peserta dapat mengikuti aktiviti dengan bimbingan serta menunjukkan respons yang positif.",
    rph: "Murid dapat mengikuti pembelajaran melalui arahan yang jelas dan bimbingan guru.",
    rpi: "Intervensi dilaksanakan secara berfokus berdasarkan keperluan individu.",
    surat: "Dengan segala hormatnya, perkara ini dikemukakan untuk perhatian pihak tuan.",
    umum: "Maklumat ini disusun dengan ringkas, jelas dan mudah difahami.",
  };

  return adaptSuggestionToInput(input, starters[documentNeed] || starters.umum, documentNeed, "");
}

function adaptSuggestionToInput(
  input: string,
  suggestion: string,
  documentNeed: string,
  fieldQuestion: string,
) {
  const cleanInput = normalizeFieldText(input);
  if (!cleanInput) return suggestion;
  const fieldKind = detectFieldKind(fieldQuestion);
  if (cleanInput.length < 4 || !cleanInput.includes(" ")) {
    return buildFieldKindSuggestion(fieldKind, documentNeed, cleanInput) || suggestion;
  }

  const lowerInput = cleanInput.toLowerCase();
  const lowerSuggestion = suggestion.toLowerCase();

  if (lowerSuggestion.startsWith(lowerInput)) {
    return `${cleanInput}${suggestion.slice(cleanInput.length)}`;
  }

  if (lowerSuggestion.includes(lowerInput)) {
    return suggestion;
  }

  const fieldSuggestion = buildFieldKindSuggestion(fieldKind, documentNeed, cleanInput);
  if (fieldSuggestion) return fieldSuggestion;

  const continuation = getTopicContinuation(documentNeed, cleanInput);
  return `${sentenceCase(cleanInput)} ${continuation}`;
}

function detectFieldKind(fieldQuestion: string) {
  const field = fieldQuestion.toLowerCase();

  if (field.includes("objektif") || field.includes("hasil pembelajaran")) return "objektif";
  if (field.includes("pemerhatian")) return "pemerhatian";
  if (field.includes("refleksi")) return "refleksi";
  if (field.includes("rumusan") || field.includes("cadangan")) return "rumusan";
  if (field.includes("bahan") || field.includes("alat")) return "bahan";
  if (field.includes("langkah") || field.includes("aktiviti pdp") || field.includes("ringkasan")) return "langkah";
  if (field.includes("bidang") || field.includes("fokus")) return "fokus";
  if (field.includes("tajuk") || field.includes("perkara")) return "tajuk";
  if (field.includes("standard kandungan")) return "standardKandungan";
  if (field.includes("standard pembelajaran")) return "standardPembelajaran";

  return "";
}

function buildFieldKindSuggestion(fieldKind: string, documentNeed: string, input: string) {
  const phrase = normalizeFieldText(input);
  const subject = getDocumentSubject(documentNeed);

  if (!fieldKind) return "";

  if (!phrase || phrase.length < 4) {
    const defaults: Record<string, string> = {
      bahan: "Kad gambar, bahan maujud dan lembaran kerja digunakan sebagai sokongan aktiviti.",
      fokus: documentNeed === "rph" ? "Bahasa dan komunikasi" : "Kemahiran motor halus",
      langkah: "Aktiviti dimulakan dengan penerangan ringkas sebelum peserta dibimbing melaksanakan tugasan.",
      objektif: `${subject} dapat mengikuti aktiviti yang dirancang dengan bimbingan yang sesuai.`,
      pemerhatian: `${subject} menunjukkan minat dan memberi respons yang baik sepanjang aktiviti dijalankan.`,
      refleksi: "Aktiviti berjalan dengan baik dan boleh ditambah baik mengikut keperluan peserta.",
      rumusan: "Secara keseluruhan, pelaksanaan berjalan dengan baik dan mencapai tujuan yang dirancang.",
      standardKandungan: "Standard kandungan dipilih berdasarkan keperluan pembelajaran semasa.",
      standardPembelajaran: "Standard pembelajaran disesuaikan dengan tahap penguasaan murid.",
      tajuk: documentNeed === "surat" ? "Permohonan dan makluman rasmi" : "Aktiviti pembelajaran harian",
    };

    return defaults[fieldKind] || "";
  }

  const sentence = sentenceCase(phrase);

  if (fieldKind === "objektif") {
    if (startsWithActionVerb(phrase)) {
      return `${sentence} melalui aktiviti yang dirancang dan bimbingan yang sesuai.`;
    }

    return `${subject} dapat ${phrase} melalui aktiviti yang dirancang dan bimbingan yang sesuai.`;
  }

  if (fieldKind === "pemerhatian") {
    return `${sentence} diperhatikan sepanjang aktiviti dan menunjukkan perkembangan yang boleh direkodkan.`;
  }

  if (fieldKind === "refleksi") {
    return `${sentence} dijadikan asas untuk penambahbaikan pada sesi seterusnya.`;
  }

  if (fieldKind === "rumusan") {
    return `${sentence} menunjukkan bahawa pelaksanaan berjalan dengan baik dan sesuai untuk tindakan susulan.`;
  }

  if (fieldKind === "langkah") {
    return `${sentence} dilaksanakan secara berperingkat supaya peserta dapat mengikuti aktiviti dengan lebih jelas.`;
  }

  if (fieldKind === "bahan") {
    return `${sentence} digunakan sebagai bahan sokongan bagi membantu pelaksanaan aktiviti.`;
  }

  if (fieldKind === "fokus") {
    return sentence;
  }

  if (fieldKind === "tajuk") {
    return sentence;
  }

  if (fieldKind === "standardKandungan") {
    return `${sentence} dijadikan rujukan utama dalam perancangan pembelajaran.`;
  }

  if (fieldKind === "standardPembelajaran") {
    return `${sentence} disesuaikan dengan tahap penguasaan murid.`;
  }

  return "";
}

function getDocumentSubject(documentNeed: string) {
  if (documentNeed === "rph" || documentNeed === "rpi") return "Murid";
  if (documentNeed === "surat") return "Pihak kami";
  return "Peserta";
}

function startsWithActionVerb(text: string) {
  const firstWord = normalizeFieldText(text).toLowerCase().split(" ")[0];
  return [
    "membaca",
    "menulis",
    "menyebut",
    "mengenal",
    "memahami",
    "menjawab",
    "melengkapkan",
    "mengikut",
    "melakukan",
    "menyusun",
    "memadankan",
    "mengira",
    "mewarna",
    "menampal",
    "menggunakan",
  ].includes(firstWord);
}

function getTopicContinuation(documentNeed: string, input: string) {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("murid") || lowerInput.includes("pelatih") || lowerInput.includes("peserta")) {
    return "menunjukkan respons yang positif dan masih memerlukan bimbingan berdasarkan keperluan semasa.";
  }

  if (lowerInput.includes("aktiviti") || lowerInput.includes("program")) {
    return "dilaksanakan secara teratur mengikut perancangan yang telah ditetapkan.";
  }

  if (lowerInput.includes("objektif")) {
    return "dinyatakan dengan jelas supaya pelaksanaan aktiviti lebih terarah dan mudah dinilai.";
  }

  if (lowerInput.includes("pemerhatian")) {
    return "merekodkan perkembangan peserta dan boleh dijadikan rujukan untuk tindakan susulan.";
  }

  if (lowerInput.includes("refleksi") || lowerInput.includes("rumusan")) {
    return "dibuat berdasarkan pelaksanaan sebenar serta keperluan penambahbaikan pada masa akan datang.";
  }

  const continuations: Record<string, string> = {
    laporan: "direkodkan untuk makluman, rujukan dan tindakan susulan oleh pihak berkaitan.",
    rpa: "disusun mengikut tahap keupayaan peserta supaya aktiviti dapat dilaksanakan dengan lebih berkesan.",
    rph: "disusun berdasarkan objektif pembelajaran supaya murid dapat mengikuti sesi dengan lebih jelas.",
    rpi: "disesuaikan dengan keperluan individu supaya perkembangan dapat dipantau secara berterusan.",
    surat: "dikemukakan untuk perhatian dan pertimbangan pihak tuan.",
    umum: "disusun dengan jelas supaya mudah difahami dan sesuai dijadikan rujukan.",
  };

  return continuations[documentNeed] || continuations.umum;
}

function sentenceCase(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

function normalizeFieldText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[|_]{2,}/g, "")
    .trim();
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

function buildFieldSuggestion(fieldQuestion: string, documentNeed: string, input: string) {
  const field = fieldQuestion.toLowerCase();

  if (!field) return "";
  if (field.includes("bilangan") || field.includes("jumlah")) return adaptSuggestionToInput(input, "3 orang peserta", documentNeed, fieldQuestion);
  if (field.includes("bidang") || field.includes("fokus")) {
    return adaptSuggestionToInput(
      input,
      documentNeed === "rph" ? "Bahasa dan komunikasi" : "Kemahiran motor halus",
      documentNeed,
      fieldQuestion,
    );
  }
  if (field.includes("tarikh")) return new Date().toLocaleDateString("ms-MY");
  if (field.includes("masa")) return adaptSuggestionToInput(input, "9.00 pagi", documentNeed, fieldQuestion);
  if (field.includes("tempat")) return adaptSuggestionToInput(input, "Bilik aktiviti", documentNeed, fieldQuestion);
  if (field.includes("nama guru")) return adaptSuggestionToInput(input, "Nama guru / pendidik", documentNeed, fieldQuestion);
  if (field.includes("nama murid") || field.includes("nama pelatih")) return adaptSuggestionToInput(input, "Nama murid / pelatih", documentNeed, fieldQuestion);
  if (field.includes("bahan") || field.includes("alat")) {
    return adaptSuggestionToInput(input, "Kad gambar, pensel warna dan lembaran kerja digunakan sebagai bahan sokongan aktiviti.", documentNeed, fieldQuestion);
  }
  if (field.includes("objektif")) {
    return adaptSuggestionToInput(
      input,
      documentNeed === "rph"
        ? "Murid dapat mencapai objektif pembelajaran melalui aktiviti berpandu dan bimbingan guru secara berperingkat."
        : "Peserta dapat mengikuti aktiviti dan memberi respons mengikut tahap keupayaan masing-masing.",
      documentNeed,
      fieldQuestion,
    );
  }
  if (field.includes("pemerhatian")) {
    return adaptSuggestionToInput(input, "Peserta menunjukkan minat, memberi respons yang baik dan berusaha mengikuti arahan yang diberikan.", documentNeed, fieldQuestion);
  }
  if (field.includes("refleksi")) {
    return adaptSuggestionToInput(input, "Aktiviti berjalan dengan baik, namun beberapa penyesuaian boleh dibuat mengikut keperluan peserta.", documentNeed, fieldQuestion);
  }
  if (field.includes("rumusan")) {
    return adaptSuggestionToInput(input, "Secara keseluruhan, pelaksanaan berjalan dengan baik dan mencapai tujuan yang telah dirancang.", documentNeed, fieldQuestion);
  }
  if (field.includes("tajuk")) return adaptSuggestionToInput(input, documentNeed === "surat" ? "Permohonan Rasmi" : "Aktiviti Harian", documentNeed, fieldQuestion);
  if (field.includes("perkara")) {
    return adaptSuggestionToInput(input, "Permohonan dan makluman rasmi", documentNeed, fieldQuestion);
  }

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
        <div
          className="pointer-events-none absolute z-20 grid max-w-[18rem] gap-1 rounded-md border border-[#d7d2c7] bg-[#f7f4ed]/95 p-2 text-xs font-semibold leading-5 text-[#14161d] shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
          style={{
            left: shadowPrediction.x,
            top: shadowPrediction.y,
            minWidth: shadowPrediction.width ? Math.min(shadowPrediction.width, 220) : undefined,
          }}
        >
          <span className="rounded px-2 py-1 text-left">{shadowPrediction.text}</span>
        </div>
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
    const fieldText = getActiveFieldText(container);
    const suggestion = buildFieldAssistantSuggestion({
      documentText: container.textContent || "",
      fieldText,
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
        const activePrediction = shadowPrediction;
        const selectedOption = getPredictionHotkeyOption(event, activePrediction);

        if (selectedOption) {
          event.preventDefault();
          document.execCommand("insertText", false, selectedOption);
          onPredictionChange(null);
        }
      }}
      ref={containerRef}
      suppressContentEditableWarning
    />
  );
}

function getPredictionHotkeyOption(
  event: React.KeyboardEvent<HTMLDivElement>,
  prediction: ShadowPrediction | null,
) {
  if (!prediction?.text) return "";

  if (event.key === "Tab") {
    return prediction.replacement || prediction.text;
  }

  return "";
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
    y: Math.max(8, markerRect.top - rootRect.top - 112),
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
    y: Math.max(8, cellRect.top - rootRect.top - 112),
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

function getActiveFieldText(container: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";

  const node = selection.getRangeAt(0).startContainer;
  if (!container.contains(node)) return "";

  const element =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  if (!element) return "";

  const cell = element.closest("td, th");
  if (cell) return cleanFieldQuestion(cell.textContent || "");

  return cleanFieldQuestion(element.closest("p, div")?.textContent || "");
}

function cleanFieldQuestion(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[:：]+$/g, "")
    .trim()
    .slice(0, 90);
}
