"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const storageKey = "ly-docs-progress";

type ShadowPrediction = {
  label?: string;
  mode?: "field";
  options?: string[];
  replacement?: string;
  text: string;
  width?: number;
  x: number;
  y: number;
};

const formalMalayDatabase = {
  commonWords: [
    "aktiviti",
    "arahan",
    "bimbingan",
    "catatan",
    "dokumen",
    "guru",
    "hasil",
    "kemahiran",
    "kerjasama",
    "maklumat",
    "membaca",
    "memberi",
    "membimbing",
    "membuat",
    "memerlukan",
    "memahami",
    "menarik",
    "mencapai",
    "mencatat",
    "mengenal",
    "mengikut",
    "mengira",
    "menggunakan",
    "menilai",
    "menulis",
    "menunjukkan",
    "menyediakan",
    "menyebut",
    "murid",
    "objektif",
    "pelaksanaan",
    "pembelajaran",
    "pemerhatian",
    "penambahbaikan",
    "penilaian",
    "peserta",
    "program",
    "refleksi",
    "respons",
    "rumusan",
    "sekolah",
    "secara",
    "semasa",
    "sesi",
    "sokongan",
    "tindakan",
    "tugasan",
  ],
  fieldWords: {
    bahan: ["kad", "lembaran", "pensel", "gambar", "objek", "bahan", "alat", "carta"],
    fokus: ["bahasa", "komunikasi", "motor", "kognitif", "sosioemosi", "membaca", "menulis"],
    langkah: ["memberi", "membimbing", "menunjukkan", "menilai", "memulakan", "mengulang"],
    objektif: ["membaca", "menulis", "menyebut", "mengenal", "memahami", "mengira", "memadankan", "melengkapkan"],
    pemerhatian: ["memberi", "menunjukkan", "mengikuti", "memerlukan", "menumpukan", "berusaha"],
    refleksi: ["aktiviti", "peserta", "bahan", "masa", "bimbingan", "sesi"],
    rumusan: ["secara", "aktiviti", "program", "objektif", "kerjasama", "penambahbaikan"],
    umum: [],
  } as Record<string, string[]>,
  nextPhrases: {
    aktiviti: ["dijalankan", "berjalan", "dimulakan", "diteruskan", "dilaksanakan"],
    "aktiviti berjalan": ["dengan lancar mengikut perancangan.", "dengan baik sepanjang sesi dijalankan."],
    "aktiviti dijalankan": ["secara berperingkat mengikut tahap peserta.", "dengan bimbingan dan pemantauan yang sesuai."],
    "aktiviti dimulakan": ["dengan penerangan ringkas kepada peserta.", "dengan set induksi yang mudah difahami."],
    boleh: ["membaca", "menulis", "menyebut", "mengira", "mengenal", "memadankan"],
    "boleh membaca": ["ayat mudah dengan bimbingan guru.", "perkataan mudah berdasarkan bahan yang diberikan."],
    "boleh menulis": ["perkataan mudah dengan kemas dan betul.", "nama sendiri dengan bimbingan guru."],
    "boleh menyebut": ["perkataan mudah berdasarkan gambar yang ditunjukkan.", "bunyi huruf dengan sebutan yang jelas."],
    "boleh mengira": ["nombor dalam lingkungan yang sesuai dengan tahap semasa.", "objek dengan bimbingan guru."],
    "boleh mengenal": ["huruf, nombor atau gambar melalui aktiviti berpandu.", "warna asas berdasarkan bahan yang ditunjukkan."],
    dapat: ["membaca", "menulis", "menyebut", "mengira", "mengenal", "mengikuti", "menyiapkan"],
    "dapat membaca": ["ayat mudah dengan bimbingan guru.", "perkataan mudah secara berpandu."],
    "dapat menulis": ["perkataan mudah dengan kemas dan betul.", "jawapan ringkas mengikut arahan."],
    "dapat mengikuti": ["aktiviti dengan bimbingan yang sesuai.", "arahan mudah secara berperingkat."],
    dengan: ["bimbingan", "jelas", "baik", "lancar", "teratur"],
    guru: ["membimbing", "memberi", "memantau", "menilai"],
    "guru membimbing": ["murid secara berperingkat mengikut tahap penguasaan."],
    memberi: ["respons", "bimbingan", "kerjasama", "tumpuan", "perhatian"],
    "memberi respons": ["yang baik apabila arahan diberikan.", "secara positif semasa aktiviti dijalankan."],
    menunjukkan: ["minat", "respons", "perkembangan", "kerjasama", "usaha"],
    "menunjukkan minat": ["semasa aktiviti dijalankan.", "dan memberi tumpuan terhadap tugasan."],
    "menunjukkan perkembangan": ["positif sepanjang sesi dijalankan.", "yang boleh diperhatikan dari semasa ke semasa."],
    murid: ["boleh", "dapat", "menunjukkan", "memerlukan", "mengikuti"],
    "murid boleh": ["membaca", "menulis", "menyebut", "mengira", "mengenal"],
    "murid dapat": ["mengikuti", "membaca", "menulis", "menyebut", "menyiapkan"],
    peserta: ["boleh", "dapat", "menunjukkan", "memerlukan", "mengikuti"],
    "peserta dapat": ["mengikuti aktiviti dengan bimbingan yang sesuai.", "memberi respons mengikut tahap keupayaan."],
    "peserta menunjukkan": ["minat dan memberi respons yang baik.", "usaha untuk melibatkan diri dalam aktiviti."],
    saya: ["akan", "membuat", "menyediakan", "mengisi", "menulis"],
    "saya akan": ["menyediakan maklumat yang diperlukan.", "mengisi maklumat dengan lengkap."],
    "saya membuat": ["catatan berdasarkan maklumat yang diberikan."],
    secara: ["berperingkat", "keseluruhan", "teratur", "berpandu", "konsisten"],
    "secara keseluruhan": ["aktiviti berjalan dengan baik.", "pelaksanaan mencapai tujuan yang dirancang."],
  } as Record<string, string[]>,
  typoCorrections: {
    aktviti: "aktiviti",
    arahn: "arahan",
    bimbingn: "bimbingan",
    bolh: "boleh",
    dpat: "dapat",
    guruu: "guru",
    maklmat: "maklumat",
    membca: "membaca",
    menuls: "menulis",
    menyebt: "menyebut",
    murd: "murid",
    objektf: "objektif",
    pemrhatian: "pemerhatian",
    pesrta: "peserta",
    refleks: "refleksi",
    respon: "respons",
    tugasn: "tugasan",
  } as Record<string, string>,
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
  const documentNeed = detectDocumentNeed(`${fileName} ${documentText} ${fieldQuestion}`);
  const keyboardPrediction = buildKeyboardStylePrediction({
    documentNeed,
    fieldQuestion,
    textBeforeCursor,
  });

  if (keyboardPrediction.length > 0) return createKeyboardPrediction(keyboardPrediction);

  const lastWord = getLastWord(textBeforeCursor);
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

  const finalSuggestion = partialMatch ? suggestions[documentNeed][partialMatch] : "";

  if (!finalSuggestion) {
    const automaticSuggestion = adaptSuggestionToInput(
      fieldText || lastWord,
      getDocumentDefaultSuggestion(documentNeed),
      documentNeed,
      fieldQuestion,
    );

    return createFieldPrediction(automaticSuggestion, fieldText);
  }

  return createFieldPrediction(
    adaptSuggestionToInput(fieldText, finalSuggestion, documentNeed, fieldQuestion),
    fieldText,
  );
}

function createKeyboardPrediction(
  options: string[],
): Pick<ShadowPrediction, "mode" | "options" | "replacement" | "text"> | null {
  const cleanOptions = options.filter((option) => option.trim());
  const firstOption = cleanOptions[0] || "";
  const displayOptions = cleanOptions.map((option) => option.trim());
  if (!firstOption) return null;

  return {
    mode: "field",
    options: cleanOptions,
    replacement: firstOption,
    text: displayOptions[0],
  };
}

function buildKeyboardStylePrediction({
  documentNeed,
  fieldQuestion,
  textBeforeCursor,
}: {
  documentNeed: string;
  fieldQuestion: string;
  textBeforeCursor: string;
}) {
  const input = normalizeFieldText(textBeforeCursor);
  if (!input) return [];

  const fieldKind = detectFieldKind(fieldQuestion);
  const endsWithSpace = /\s$/.test(textBeforeCursor);
  const words = input.toLowerCase().split(/\s+/).filter(Boolean);
  const currentWord = endsWithSpace ? "" : words.at(-1) || "";
  const previousWord = endsWithSpace ? words.at(-1) || "" : words.at(-2) || "";
  const previousTwo = words.slice(-2).join(" ");

  if (!endsWithSpace && currentWord) {
    const sentenceSuggestions = pickSentenceSuggestionsFromPrefix(fieldKind, documentNeed, currentWord);
    if (sentenceSuggestions.length > 0) return sentenceSuggestions;
  }

  return pickNextPhrases(fieldKind, documentNeed, previousTwo || previousWord).map((phrase) =>
    phrase.startsWith(" ") ? phrase : ` ${phrase}`,
  );
}

function pickSentenceSuggestionsFromPrefix(fieldKind: string, documentNeed: string, prefix: string) {
  const lowerPrefix = prefix.toLowerCase();
  const typoCorrection = formalMalayDatabase.typoCorrections[lowerPrefix];
  const matches = getContextWords(fieldKind, documentNeed)
    .filter((word) => {
      const lowerWord = word.toLowerCase();
      return lowerWord.startsWith(lowerPrefix) && lowerWord !== lowerPrefix;
    })
    .slice(0, 6)
    .map((word) => buildSentenceFromKeyword(fieldKind, documentNeed, word));

  if (typoCorrection) {
    return [
      buildSentenceFromKeyword(fieldKind, documentNeed, typoCorrection),
      ...matches,
    ].slice(0, 6);
  }

  if (matches.length > 0) return matches;

  return buildRandomPrefixFallbacks(fieldKind, documentNeed, prefix);
}

function buildSentenceFromKeyword(fieldKind: string, documentNeed: string, keyword: string) {
  const subject = getDocumentSubject(documentNeed);
  const word = normalizeFieldText(keyword).toLowerCase();

  if (fieldKind === "objektif") {
    if (startsWithActionVerb(word)) return `${word} dengan bimbingan yang sesuai.`;
    return `${subject} dapat ${word} dengan bimbingan yang sesuai.`;
  }

  if (fieldKind === "pemerhatian") {
    return `${subject} menunjukkan ${word} semasa aktiviti dijalankan.`;
  }

  if (fieldKind === "refleksi") {
    return `${word} perlu diberi perhatian pada sesi seterusnya.`;
  }

  if (fieldKind === "bahan") {
    return `${word} digunakan sebagai bahan sokongan aktiviti.`;
  }

  if (fieldKind === "langkah") {
    return `${word} aktiviti secara berperingkat mengikut tahap peserta.`;
  }

  if (fieldKind === "fokus") {
    return `${sentenceCase(word)} dipilih sebagai fokus utama aktiviti.`;
  }

  if (word === "saya") return "saya akan menyediakan maklumat yang diperlukan.";
  if (word === "murid") return "murid dapat mengikuti aktiviti dengan bimbingan yang sesuai.";
  if (word === "peserta") return "peserta menunjukkan minat dan memberi respons yang baik.";
  if (word === "aktiviti") return "aktiviti dijalankan secara berperingkat mengikut perancangan.";

  return getContextualSentenceSuggestions(fieldKind, documentNeed)[0] || "";
}

function buildRandomPrefixFallbacks(fieldKind: string, documentNeed: string, prefix: string) {
  const cleanPrefix = normalizeFieldText(prefix);
  if (!cleanPrefix) return [];

  const options: Record<string, string[]> = {
    bahan: [
      "Bahan bantu mengajar digunakan mengikut tahap dan keperluan peserta.",
      "Kad gambar dan lembaran kerja digunakan sebagai sokongan aktiviti.",
      "Bahan maujud membantu peserta memahami aktiviti dengan lebih jelas.",
    ],
    fokus: [
      "Kemahiran komunikasi dipilih sebagai fokus utama aktiviti.",
      "Kemahiran motor halus diberi penekanan melalui aktiviti berpandu.",
      "Kemahiran kognitif diperkukuh melalui tugasan yang sesuai.",
    ],
    langkah: [
      "Aktiviti dimulakan dengan penerangan ringkas kepada peserta.",
      "Peserta dibimbing melaksanakan tugasan secara berperingkat.",
      "Guru memberi contoh sebelum peserta mencuba tugasan.",
    ],
    objektif: [
      "Murid dapat mengikuti aktiviti dengan bimbingan yang sesuai.",
      "Murid dapat menyelesaikan tugasan mengikut arahan yang diberikan.",
      "Murid dapat memberi respons berdasarkan bahan yang ditunjukkan.",
    ],
    pemerhatian: [
      "Peserta menunjukkan minat semasa aktiviti dijalankan.",
      "Peserta memberi respons yang baik apabila arahan diberikan.",
      "Peserta masih memerlukan bimbingan untuk menyiapkan tugasan.",
    ],
    refleksi: [
      "Aktiviti perlu diteruskan dengan bimbingan yang lebih berfokus.",
      "Bahan aktiviti boleh dipelbagaikan supaya peserta lebih fokus.",
      "Sesi seterusnya perlu disesuaikan dengan tahap peserta.",
    ],
    umum: getContextualSentenceSuggestions(fieldKind, documentNeed),
  };

  return (options[fieldKind] || options.umum).slice(0, 6);
}

function getContextualSentenceSuggestions(fieldKind: string, documentNeed: string) {
  const byDocument: Record<string, string[]> = {
    laporan: [
      "Aktiviti telah dilaksanakan mengikut perancangan yang ditetapkan.",
      "Peserta memberi kerjasama yang baik sepanjang program dijalankan.",
      "Cadangan penambahbaikan akan diambil kira untuk pelaksanaan seterusnya.",
      "Secara keseluruhan, program berjalan dengan baik dan mencapai tujuan yang dirancang.",
    ],
    rpa: [
      "Peserta dapat mengikuti aktiviti dengan bimbingan petugas.",
      "Aktiviti dijalankan secara berperingkat mengikut tahap keupayaan peserta.",
      "Peserta menunjukkan minat dan memberi respons semasa aktiviti dijalankan.",
      "Bahan aktiviti digunakan untuk membantu peserta memahami tugasan.",
    ],
    rph: [
      "Murid dapat mengikuti pembelajaran melalui arahan yang jelas.",
      "Guru membimbing murid mengikut tahap penguasaan masing-masing.",
      "Aktiviti pembelajaran dijalankan secara berpandu dan berperingkat.",
      "Sebahagian murid memerlukan bimbingan tambahan untuk mencapai objektif pembelajaran.",
    ],
    rpi: [
      "Intervensi dilaksanakan mengikut keperluan individu.",
      "Murid menunjukkan perkembangan kecil yang perlu dipantau secara berterusan.",
      "Objektif jangka pendek ditetapkan berdasarkan keupayaan semasa murid.",
      "Penilaian dibuat melalui pemerhatian dan respons murid semasa aktiviti.",
    ],
    surat: [
      "Perkara ini dikemukakan untuk perhatian dan tindakan pihak tuan.",
      "Kerjasama dan pertimbangan pihak tuan amat dihargai.",
      "Maklumat ini disampaikan sebagai rujukan pihak berkaitan.",
    ],
    umum: [
      "Maklumat ini dinyatakan dengan jelas mengikut keperluan dokumen.",
      "Butiran yang diberikan perlu selaras dengan tujuan dokumen.",
      "Catatan ini boleh disesuaikan mengikut maklumat yang hendak disampaikan.",
    ],
  };

  const byField: Record<string, string[]> = {
    bahan: [
      "Bahan bantu mengajar digunakan sebagai sokongan aktiviti.",
      "Kad gambar dan bahan maujud digunakan untuk menarik perhatian peserta.",
      "Lembaran kerja membantu peserta melengkapkan tugasan secara berpandu.",
      "Bahan visual digunakan supaya peserta lebih mudah memahami arahan.",
      "Alat bantu mengajar dipilih mengikut tahap dan keperluan peserta.",
      "Bahan aktiviti disediakan lebih awal bagi memastikan sesi berjalan lancar.",
    ],
    langkah: [
      "Aktiviti dimulakan dengan penerangan ringkas.",
      "Peserta dibimbing melaksanakan tugasan secara berperingkat.",
      "Guru menunjukkan contoh sebelum peserta mencuba tugasan secara kendiri.",
      "Arahan diberikan satu demi satu supaya peserta lebih mudah mengikuti aktiviti.",
      "Peserta diberi masa yang mencukupi untuk memahami dan melaksanakan tugasan.",
      "Peneguhan positif diberikan apabila peserta menunjukkan respons yang sesuai.",
    ],
    objektif: [
      "Murid dapat mencapai objektif pembelajaran melalui aktiviti berpandu.",
      "Peserta dapat memberi respons mengikut tahap keupayaan masing-masing.",
      "Murid dapat membaca ayat mudah dengan bimbingan guru.",
      "Murid dapat menulis perkataan mudah dengan kemas dan betul.",
      "Peserta dapat mengikuti arahan mudah secara berperingkat.",
      "Murid dapat mengenal huruf dan bunyi awal melalui bahan bergambar.",
      "Peserta dapat melibatkan diri dalam aktiviti dengan sokongan yang sesuai.",
      "Murid dapat menyelesaikan tugasan berdasarkan contoh yang diberikan.",
    ],
    pemerhatian: [
      "Peserta menunjukkan minat semasa aktiviti dijalankan.",
      "Murid memberi respons yang baik apabila arahan diberikan.",
      "Peserta dapat memberi tumpuan dalam tempoh yang sesuai dengan keupayaan semasa.",
      "Murid masih memerlukan bimbingan tambahan untuk menyiapkan tugasan.",
      "Peserta berusaha melibatkan diri walaupun memerlukan sokongan berterusan.",
      "Murid menunjukkan perkembangan positif berbanding sesi sebelumnya.",
      "Peserta mudah terganggu tetapi boleh kembali fokus selepas diberi bimbingan.",
      "Murid dapat mengikuti aktiviti dalam kumpulan kecil dengan pemantauan guru.",
    ],
    refleksi: [
      "Aktiviti berjalan dengan baik dan perlu diteruskan dengan penambahbaikan.",
      "Bimbingan tambahan diperlukan pada sesi seterusnya.",
      "Arahan perlu diberikan secara lebih ringkas supaya peserta mudah memahami tugasan.",
      "Bahan aktiviti perlu dipelbagaikan bagi menarik perhatian peserta.",
      "Tempoh aktiviti perlu disesuaikan dengan tahap tumpuan peserta.",
      "Pendekatan secara individu boleh membantu peserta yang masih belum menguasai kemahiran.",
      "Aktiviti sesuai diteruskan dengan penyesuaian kecil mengikut keperluan peserta.",
      "Peneguhan positif membantu meningkatkan keyakinan dan penglibatan peserta.",
    ],
    rumusan: [
      "Secara keseluruhan, aktiviti berjalan dengan baik dan mencapai tujuan yang dirancang.",
      "Pelaksanaan aktiviti memberi manfaat kepada peserta dan boleh diteruskan.",
      "Cadangan penambahbaikan akan diambil kira untuk sesi seterusnya.",
      "Objektif aktiviti dicapai secara berperingkat berdasarkan respons peserta.",
      "Kerjasama semua pihak membantu memastikan aktiviti berjalan dengan lancar.",
      "Pemerhatian yang dibuat boleh digunakan sebagai rujukan tindakan susulan.",
    ],
    umum: [
      "Maklumat ini boleh ditulis dengan lebih jelas dan tersusun.",
      "Ayat ini boleh disambung dengan maklumat yang lebih khusus.",
      "Butiran ini boleh diterangkan mengikut tujuan dokumen.",
      "Maklumat yang diisi perlu selaras dengan format dokumen.",
      "Catatan ini boleh dilengkapkan berdasarkan keadaan sebenar.",
      "Ayat ini boleh diperkemas supaya lebih sesuai untuk dokumen rasmi.",
    ],
  };

  return byField[fieldKind] || byDocument[documentNeed] || byDocument.umum;
}

function pickNextPhrases(fieldKind: string, documentNeed: string, previousText: string) {
  const key = previousText.toLowerCase();
  const nextByPrevious: Record<string, string[]> = {
    ...formalMalayDatabase.nextPhrases,
    aktiviti: ["dijalankan", "berjalan", "dimulakan", "diteruskan"],
    "aktiviti berjalan": ["dengan lancar mengikut perancangan."],
    "aktiviti dijalankan": ["secara berperingkat mengikut tahap peserta."],
    boleh: ["membaca", "menulis", "menyebut", "mengira", "mengenal"],
    "boleh membaca": ["ayat mudah dengan bimbingan guru."],
    "boleh menulis": ["perkataan mudah dengan kemas dan betul."],
    "boleh menyebut": ["perkataan mudah berdasarkan gambar yang ditunjukkan."],
    "boleh mengira": ["nombor dalam lingkungan yang sesuai dengan tahap semasa."],
    "boleh mengenal": ["huruf, nombor atau gambar melalui aktiviti berpandu."],
    dapat: ["membaca", "menulis", "menyebut", "mengira", "mengenal", "mengikuti"],
    "dapat membaca": ["ayat mudah dengan bimbingan guru."],
    "dapat menulis": ["perkataan mudah dengan kemas dan betul."],
    "dapat mengikuti": ["aktiviti dengan bimbingan yang sesuai."],
    dengan: ["bimbingan", "jelas", "baik", "lancar"],
    guru: ["membimbing", "memberi", "memantau"],
    "guru membimbing": ["murid secara berperingkat mengikut tahap penguasaan."],
    memberi: ["respons", "bimbingan", "kerjasama", "tumpuan"],
    "memberi respons": ["yang baik apabila arahan diberikan."],
    menunjukkan: ["minat", "respons", "perkembangan", "kerjasama"],
    "menunjukkan minat": ["semasa aktiviti dijalankan."],
    murid: ["boleh", "dapat", "menunjukkan", "memerlukan"],
    "murid boleh": ["membaca", "menulis", "menyebut", "mengira"],
    "murid dapat": ["mengikuti", "membaca", "menulis", "menyebut"],
    peserta: ["boleh", "dapat", "menunjukkan", "memerlukan"],
    "peserta dapat": ["mengikuti aktiviti dengan bimbingan yang sesuai."],
    "peserta menunjukkan": ["minat dan memberi respons yang baik."],
    saya: ["akan", "membuat", "menyediakan", "mengisi"],
    "saya akan": ["menyediakan maklumat yang diperlukan."],
    "saya membuat": ["catatan berdasarkan maklumat yang diberikan."],
    secara: ["berperingkat", "keseluruhan", "teratur", "berpandu"],
    "secara keseluruhan": ["aktiviti berjalan dengan baik."],
  };
  const contextDefaults: Record<string, string[]> = {
    bahan: [
      "Bahan bantu mengajar digunakan sebagai sokongan aktiviti.",
      "Kad gambar dan bahan maujud digunakan untuk menarik perhatian peserta.",
      "Lembaran kerja membantu peserta melengkapkan tugasan secara berpandu.",
    ],
    fokus: [
      "Kemahiran komunikasi dipilih sebagai fokus utama aktiviti.",
      "Kemahiran motor halus diberi penekanan melalui aktiviti berpandu.",
      "Kemahiran kognitif diperkukuh melalui tugasan yang sesuai.",
    ],
    langkah: [
      "Aktiviti dimulakan dengan penerangan ringkas kepada peserta.",
      "Peserta dibimbing melaksanakan tugasan secara berperingkat.",
      "Guru menunjukkan contoh sebelum peserta mencuba tugasan.",
    ],
    objektif: [
      "Murid dapat membaca ayat mudah dengan bimbingan guru.",
      "Murid dapat menulis perkataan mudah dengan kemas dan betul.",
      "Peserta dapat mengikuti arahan mudah secara berperingkat.",
    ],
    pemerhatian: [
      "Peserta menunjukkan minat semasa aktiviti dijalankan.",
      "Murid memberi respons yang baik apabila arahan diberikan.",
      "Peserta masih memerlukan bimbingan untuk menyiapkan tugasan.",
    ],
    refleksi: [
      "Aktiviti berjalan dengan baik dan perlu diteruskan dengan penambahbaikan.",
      "Bahan aktiviti perlu dipelbagaikan supaya peserta lebih fokus.",
      "Bimbingan tambahan diperlukan pada sesi seterusnya.",
    ],
    rumusan: [
      "Secara keseluruhan, aktiviti berjalan dengan baik dan mencapai tujuan yang dirancang.",
      "Cadangan penambahbaikan akan diambil kira untuk sesi seterusnya.",
      "Pemerhatian yang dibuat boleh digunakan sebagai rujukan tindakan susulan.",
    ],
    standardKandungan: [
      "Standard kandungan dipilih berdasarkan keperluan pembelajaran semasa.",
      "Standard kandungan disesuaikan dengan fokus pengajaran yang dirancang.",
    ],
    standardPembelajaran: [
      "Murid boleh mendengar dan memberi respons terhadap arahan mudah.",
      "Murid boleh membaca perkataan mudah dengan bimbingan guru.",
      "Murid boleh menulis perkataan mudah dengan betul.",
    ],
    umum: getDocumentDefaultNextPhrases(documentNeed),
  };
  const lastKey = key.split(" ").at(-1) || "";
  const options = nextByPrevious[key] || nextByPrevious[lastKey] || contextDefaults[fieldKind] || contextDefaults.umum;

  return rotateSuggestions(options, `${fieldKind}-${documentNeed}-${key}`)
    .map((option) => expandShortPrediction(fieldKind, documentNeed, option))
    .slice(0, 6);
}

function expandShortPrediction(fieldKind: string, documentNeed: string, option: string) {
  const text = option.trim();
  if (!text) return "";
  if (/[.!?]$/.test(text) || text.split(/\s+/).length > 2) return text;

  const subject = getDocumentSubject(documentNeed).toLowerCase();

  if (fieldKind === "objektif") return `${text} dengan bimbingan yang sesuai.`;
  if (fieldKind === "pemerhatian") return `${text} semasa aktiviti dijalankan.`;
  if (fieldKind === "refleksi") return `${text} untuk penambahbaikan sesi seterusnya.`;
  if (fieldKind === "langkah") return `${text} secara berperingkat mengikut tahap ${subject}.`;
  if (fieldKind === "bahan") return `${text} sebagai bahan sokongan aktiviti.`;

  if (text === "membaca") return "membaca ayat mudah dengan bimbingan guru.";
  if (text === "menulis") return "menulis perkataan mudah dengan kemas dan betul.";
  if (text === "menyebut") return "menyebut perkataan mudah berdasarkan gambar yang ditunjukkan.";
  if (text === "mengira") return "mengira nombor mengikut tahap semasa.";
  if (text === "mengenal") return "mengenal huruf, nombor atau gambar melalui aktiviti berpandu.";
  if (text === "akan") return "akan menyediakan maklumat yang diperlukan.";
  if (text === "membuat") return "membuat catatan berdasarkan maklumat yang diberikan.";

  return `${text} dengan jelas dan tepat.`;
}

function getContextWords(fieldKind: string, documentNeed: string) {
  const commonWords = [
    ...formalMalayDatabase.commonWords,
    "aktiviti",
    "arahan",
    "ayat",
    "bahan",
    "baik",
    "bimbingan",
    "boleh",
    "catatan",
    "dapat",
    "dengan",
    "guru",
    "kemahiran",
    "lancar",
    "maklumat",
    "membaca",
    "memberi",
    "membimbing",
    "membuat",
    "memerlukan",
    "memahami",
    "menarik",
    "menulis",
    "menunjukkan",
    "menyebut",
    "murid",
    "objektif",
    "pelaksanaan",
    "pembelajaran",
    "pemerhatian",
    "peserta",
    "refleksi",
    "respons",
    "saya",
    "secara",
    "semasa",
    "sesi",
    "sokongan",
    "tugasan",
  ];
  const byField: Record<string, string[]> = {
    ...formalMalayDatabase.fieldWords,
    bahan: ["kad", "lembaran", "bahan", "pensel", "gambar", "objek"],
    fokus: ["bahasa", "komunikasi", "motor", "kognitif", "sosioemosi", "membaca", "menulis"],
    langkah: ["memberi", "membimbing", "menunjukkan", "menilai", "memulakan", "mengulang"],
    objektif: ["membaca", "menulis", "menyebut", "mengenal", "memahami", "mengira", "memadankan", "melengkapkan"],
    pemerhatian: ["memberi", "menunjukkan", "mengikuti", "memerlukan", "menumpukan", "berusaha"],
    refleksi: ["aktiviti", "peserta", "bahan", "masa", "bimbingan", "sesi"],
    rumusan: ["secara", "aktiviti", "program", "objektif", "kerjasama", "penambahbaikan"],
    umum: [],
  };

  return Array.from(new Set([...(byField[fieldKind] || []), ...getDocumentWords(documentNeed), ...commonWords]));
}

function getDocumentWords(documentNeed: string) {
  const words: Record<string, string[]> = {
    laporan: ["laporan", "program", "rumusan", "cadangan", "pelaksanaan"],
    rpa: ["rpa", "aktiviti", "pelatih", "peserta", "petugas"],
    rph: ["rph", "murid", "guru", "kelas", "standard", "pembelajaran"],
    rpi: ["rpi", "intervensi", "murid", "klien", "matlamat", "penilaian"],
    surat: ["surat", "tuan", "puan", "permohonan", "makluman", "kerjasama"],
    umum: [],
  };

  return words[documentNeed] || words.umum;
}

function getDocumentDefaultNextPhrases(documentNeed: string) {
  const phrases: Record<string, string[]> = {
    laporan: ["dengan jelas dalam laporan aktiviti."],
    rpa: ["mengikut keperluan aktiviti dan tahap peserta."],
    rph: ["mengikut keperluan pembelajaran murid."],
    rpi: ["mengikut keperluan individu dan tindakan susulan."],
    surat: ["untuk perhatian pihak berkaitan."],
    umum: ["dengan jelas dan tepat."],
  };

  return phrases[documentNeed] || phrases.umum;
}

function getDocumentDefaultSuggestion(documentNeed: string) {
  const suggestions: Record<string, string> = {
    laporan: "Maklumat ini direkodkan sebagai rujukan pelaksanaan aktiviti.",
    rpa: "Maklumat ini disusun mengikut keperluan aktiviti dan tahap peserta.",
    rph: "Maklumat ini disusun mengikut keperluan pembelajaran murid.",
    rpi: "Maklumat ini disusun mengikut keperluan individu dan tindakan susulan.",
    surat: "Maklumat ini dikemukakan untuk perhatian pihak berkaitan.",
    umum: "Maklumat ini disusun supaya lebih jelas dan mudah difahami.",
  };

  return suggestions[documentNeed] || suggestions.umum;
}

function createFieldPrediction(
  text: string,
  currentInput = "",
): Pick<ShadowPrediction, "mode" | "replacement" | "text"> | null {
  const cleanText = text.trim();
  const displayText = formatMalayPredictionContinuation(
    buildPredictionDisplayText(currentInput, cleanText),
  );
  if (!cleanText || !displayText) return null;

  return {
    mode: "field",
    replacement: buildInsertionText(currentInput, cleanText),
    text: displayText,
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

function buildPredictionDisplayText(currentInput: string, suggestion: string) {
  const input = normalizeFieldText(currentInput);
  if (!input) return suggestion;

  const lowerInput = input.toLowerCase();
  const lowerSuggestion = suggestion.toLowerCase();
  const inputAsSentence = sentenceCase(input);
  const lowerInputAsSentence = inputAsSentence.toLowerCase();
  const directIndex = lowerSuggestion.indexOf(lowerInput);
  const sentenceIndex = lowerSuggestion.indexOf(lowerInputAsSentence);

  if (lowerSuggestion.startsWith(lowerInput)) {
    return suggestion.slice(input.length).trim();
  }

  if (lowerSuggestion.startsWith(lowerInputAsSentence)) {
    return suggestion.slice(inputAsSentence.length).trim();
  }

  if (directIndex > -1) {
    return suggestion.slice(directIndex + input.length).trim();
  }

  if (sentenceIndex > -1) {
    return suggestion.slice(sentenceIndex + inputAsSentence.length).trim();
  }

  return suggestion;
}

function formatMalayPredictionContinuation(text: string) {
  const cleanText = text
    .trim()
    .replace(/^(maklumat|catatan|perkara)\s+ini\s+/i, "")
    .replace(/^(murid|peserta|pelatih|pihak kami)\s+/i, "")
    .replace(/^\s*[,.;:!?-]+\s*/, "")
    .trim();

  if (!cleanText) return "";

  const normalized = cleanText.replace(/\s+/g, " ");
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function adaptSuggestionToInput(
  input: string,
  suggestion: string,
  documentNeed: string,
  fieldQuestion: string,
) {
  const cleanInput = normalizeFieldText(input);
  const fieldKind = detectFieldKind(fieldQuestion);
  if (!cleanInput) return "";

  if (!cleanInput.includes(" ") && !startsWithActionVerb(cleanInput)) {
    const prefixSuggestion = buildPrefixSuggestion(fieldKind, cleanInput);
    if (prefixSuggestion) return prefixSuggestion;
    return buildShortInputContinuation(fieldKind, documentNeed, cleanInput);
  }

  if (!cleanInput.includes(" ")) {
    const prefixSuggestion = buildPrefixSuggestion(fieldKind, cleanInput);
    if (prefixSuggestion) return prefixSuggestion;

    const fieldSuggestion = buildFieldKindSuggestion(fieldKind, documentNeed, cleanInput);
    return fieldSuggestion || "";
  }

  const lowerInput = cleanInput.toLowerCase();
  const lowerSuggestion = suggestion.toLowerCase();

  const smartSuggestion = buildSmartChangingSuggestion(fieldKind, documentNeed, cleanInput);
  if (smartSuggestion) return smartSuggestion;

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

  return "umum";
}

function buildFieldKindSuggestion(fieldKind: string, documentNeed: string, input: string) {
  const phrase = normalizeFieldText(input);
  const subject = getDocumentSubject(documentNeed);

  if (!fieldKind) return "";
  if (!phrase) return "";

  const sentence = sentenceCase(phrase);

  if (fieldKind === "objektif") {
    if (startsWithActionVerb(phrase)) {
      return `${sentence} melalui aktiviti yang dirancang dan bimbingan yang sesuai.`;
    }

    return `${subject} dapat ${phrase} melalui aktiviti yang dirancang dan bimbingan yang sesuai.`;
  }

  if (fieldKind === "pemerhatian") {
    return `${sentence} sepanjang aktiviti dijalankan.`;
  }

  if (fieldKind === "refleksi") {
    return `${sentence} dan perlu diberi perhatian dalam sesi seterusnya.`;
  }

  if (fieldKind === "rumusan") {
    return `${sentence} dan boleh diteruskan dengan penambahbaikan yang sesuai.`;
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
    return `${sentence} dalam perancangan pembelajaran.`;
  }

  if (fieldKind === "standardPembelajaran") {
    return `${sentence} disesuaikan dengan tahap penguasaan murid.`;
  }

  if (fieldKind === "umum") {
    return buildNaturalMalaySentence(fieldKind, documentNeed, phrase);
  }

  return "";
}

function buildShortInputContinuation(fieldKind: string, documentNeed: string, input: string) {
  const phrase = normalizeFieldText(input);
  if (!phrase) return "";

  const options: Record<string, string[]> = {
    bahan: [
      `${sentenceCase(phrase)} digunakan sebagai bahan sokongan aktiviti.`,
      `${sentenceCase(phrase)} disediakan untuk membantu pelaksanaan aktiviti.`,
    ],
    fokus: [
      `${sentenceCase(phrase)} dan komunikasi`,
      `${sentenceCase(phrase)} motor halus`,
      `${sentenceCase(phrase)} sosial`,
    ],
    langkah: [
      `${sentenceCase(phrase)} peserta secara berperingkat.`,
      `${sentenceCase(phrase)} penerangan ringkas sebelum aktiviti dimulakan.`,
    ],
    objektif: [
      startsWithActionVerb(phrase)
        ? `${sentenceCase(phrase)} dengan bimbingan yang sesuai.`
        : `${getDocumentSubject(documentNeed)} dapat ${phrase} dengan bimbingan yang sesuai.`,
      startsWithActionVerb(phrase)
        ? `${sentenceCase(phrase)} mengikut tahap keupayaan semasa.`
        : `${getDocumentSubject(documentNeed)} dapat ${phrase} mengikut tahap keupayaan semasa.`,
    ],
    pemerhatian: [
      `${sentenceCase(phrase)} sepanjang aktiviti dijalankan.`,
      `${sentenceCase(phrase)} dengan bimbingan yang sesuai.`,
    ],
    refleksi: [
      `${sentenceCase(phrase)} dan perlu diteruskan dengan pendekatan yang lebih sesuai.`,
      `${sentenceCase(phrase)} dengan penambahbaikan pada sesi seterusnya.`,
    ],
    rumusan: [
      `${sentenceCase(phrase)} menunjukkan pelaksanaan berjalan dengan baik.`,
      `${sentenceCase(phrase)} dan sesuai diteruskan dalam aktiviti seterusnya.`,
    ],
    standardKandungan: [
      `${sentenceCase(phrase)} dalam perancangan pembelajaran.`,
      `${sentenceCase(phrase)} dipilih mengikut keperluan pembelajaran semasa.`,
    ],
    standardPembelajaran: [
      `${sentenceCase(phrase)} disesuaikan dengan tahap penguasaan murid.`,
      `${sentenceCase(phrase)} digunakan sebagai panduan pelaksanaan aktiviti.`,
    ],
    tajuk: [
      `${sentenceCase(phrase)} pembelajaran harian`,
      `${sentenceCase(phrase)} kemahiran asas`,
    ],
    umum: [
      buildNaturalMalaySentence(fieldKind, documentNeed, phrase),
      `${sentenceCase(phrase)} dengan jelas dan tepat.`,
      `${sentenceCase(phrase)} mengikut keperluan yang dinyatakan.`,
    ],
  };

  return pickChangingSuggestion(options[fieldKind] || options.umum, phrase);
}

function buildSmartChangingSuggestion(fieldKind: string, documentNeed: string, input: string) {
  const phrase = normalizeFieldText(input);
  if (!fieldKind || !phrase) return "";

  const subject = getDocumentSubject(documentNeed).toLowerCase();
  const sentence = sentenceCase(phrase);
  const variants: Record<string, string[]> = {
    bahan: [
      `${sentence} digunakan sebagai bahan sokongan semasa aktiviti dijalankan.`,
      `${sentence} disediakan bagi membantu peserta memahami aktiviti dengan lebih jelas.`,
      `${sentence} digunakan mengikut kesesuaian tahap dan keperluan peserta.`,
      `${sentence} membantu menarik perhatian peserta sepanjang aktiviti berlangsung.`,
      `${sentence} digunakan untuk mengukuhkan kefahaman peserta terhadap tugasan yang diberikan.`,
    ],
    langkah: [
      `${sentence} dilaksanakan secara berperingkat supaya ${subject} dapat mengikuti aktiviti dengan lebih teratur.`,
      `${sentence} dimulakan dengan penerangan ringkas sebelum aktiviti diteruskan.`,
      `${sentence} dijalankan dengan bimbingan supaya pelaksanaan aktiviti lebih jelas.`,
      `${sentence} disusun mengikut urutan supaya aktiviti dapat berjalan dengan lancar.`,
      `${sentence} diteruskan dengan pemantauan supaya respons peserta dapat diperhatikan.`,
    ],
    objektif: [
      startsWithActionVerb(phrase)
        ? `${sentence} dengan bimbingan yang sesuai.`
        : `${getDocumentSubject(documentNeed)} dapat ${phrase} dengan bimbingan yang sesuai.`,
      startsWithActionVerb(phrase)
        ? `${sentence} melalui aktiviti yang dirancang secara berperingkat.`
        : `${getDocumentSubject(documentNeed)} dapat ${phrase} melalui aktiviti yang dirancang secara berperingkat.`,
      startsWithActionVerb(phrase)
        ? `${sentence} mengikut tahap keupayaan semasa.`
        : `${getDocumentSubject(documentNeed)} dapat ${phrase} mengikut tahap keupayaan semasa.`,
      startsWithActionVerb(phrase)
        ? `${sentence} dengan lebih yakin melalui latihan yang bersesuaian.`
        : `${getDocumentSubject(documentNeed)} dapat ${phrase} dengan lebih yakin melalui latihan yang bersesuaian.`,
      startsWithActionVerb(phrase)
        ? `${sentence} secara berperingkat berdasarkan arahan yang diberikan.`
        : `${getDocumentSubject(documentNeed)} dapat ${phrase} secara berperingkat berdasarkan arahan yang diberikan.`,
    ],
    pemerhatian: [
      `${sentence} sepanjang aktiviti dijalankan.`,
      `${sentence} dengan respons yang boleh diperhatikan.`,
      `${sentence} berlaku dengan bimbingan dan pemantauan yang sesuai.`,
      `${sentence} menunjukkan perubahan yang positif berbanding permulaan aktiviti.`,
      `${sentence} memerlukan sokongan tambahan bagi memastikan tugasan dapat disiapkan.`,
    ],
    refleksi: [
      `${sentence} dan perlu diberi perhatian pada sesi seterusnya.`,
      `${sentence} menunjukkan bahawa aktiviti perlu disesuaikan mengikut keperluan peserta.`,
      `${sentence} membantu mengenal pasti tindakan susulan yang lebih sesuai.`,
      `${sentence} menunjukkan keperluan untuk mempelbagaikan kaedah bimbingan.`,
      `${sentence} memberi gambaran bahawa aktiviti boleh diteruskan dengan penyesuaian tertentu.`,
    ],
    rumusan: [
      `${sentence} menunjukkan pelaksanaan berjalan dengan baik dan sesuai diteruskan.`,
      `${sentence} dan sesuai digunakan dalam perancangan seterusnya.`,
      `${sentence} memberi gambaran bahawa objektif aktiviti dapat dicapai secara berperingkat.`,
      `${sentence} menunjukkan hasil yang boleh digunakan untuk tindakan susulan.`,
      `${sentence} membantu memperjelas pencapaian dan keperluan penambahbaikan.`,
    ],
    standardKandungan: [
      `${sentence} dalam perancangan pembelajaran.`,
      `${sentence} dipilih berdasarkan keperluan pembelajaran semasa.`,
      `${sentence} disesuaikan dengan fokus pengajaran yang dirancang.`,
    ],
    standardPembelajaran: [
      `${sentence} disesuaikan dengan tahap penguasaan murid.`,
      `${sentence} digunakan sebagai panduan pelaksanaan aktiviti pembelajaran.`,
      `${sentence} dirancang supaya murid dapat mencapai hasil pembelajaran yang ditetapkan.`,
    ],
    umum: [
      buildNaturalMalaySentence(fieldKind, documentNeed, phrase),
      `${sentence} dengan jelas dan tepat.`,
      `${sentence} mengikut keperluan yang dinyatakan.`,
      `${sentence} secara ringkas dan mudah difahami.`,
      `${sentence} dengan maklumat yang lengkap dan sesuai.`,
    ],
  };

  return pickChangingSuggestion(variants[fieldKind] || [], phrase);
}

function buildNaturalMalaySentence(fieldKind: string, documentNeed: string, input: string) {
  const phrase = normalizeFieldText(input);
  const lowerPhrase = phrase.toLowerCase();
  const sentence = sentenceCase(phrase);

  if (!phrase) return "";

  if (lowerPhrase.includes("boleh membaca") || lowerPhrase.includes("dapat membaca")) {
    return `${sentence} ayat mudah dengan bimbingan guru.`;
  }

  if (lowerPhrase.includes("boleh menulis") || lowerPhrase.includes("dapat menulis")) {
    return `${sentence} perkataan mudah dengan kemas dan betul.`;
  }

  if (lowerPhrase.includes("boleh menyebut") || lowerPhrase.includes("dapat menyebut")) {
    return `${sentence} perkataan mudah berdasarkan gambar yang ditunjukkan.`;
  }

  if (lowerPhrase.includes("boleh mengira") || lowerPhrase.includes("dapat mengira")) {
    return `${sentence} nombor dalam lingkungan yang sesuai dengan tahap semasa.`;
  }

  if (lowerPhrase.includes("boleh mengenal") || lowerPhrase.includes("dapat mengenal")) {
    return `${sentence} huruf, nombor atau gambar melalui aktiviti berpandu.`;
  }

  if (lowerPhrase.includes("murid boleh") || lowerPhrase.includes("peserta boleh")) {
    return `${sentence} dengan bimbingan yang sesuai.`;
  }

  if (fieldKind === "pemerhatian") {
    return `${sentence} sepanjang aktiviti dijalankan.`;
  }

  if (fieldKind === "refleksi") {
    return `${sentence} dan perlu diberi perhatian pada sesi seterusnya.`;
  }

  if (fieldKind === "objektif") {
    return startsWithActionVerb(phrase)
      ? `${sentence} dengan bimbingan yang sesuai.`
      : `${getDocumentSubject(documentNeed)} dapat ${phrase} dengan bimbingan yang sesuai.`;
  }

  return `${sentence} dengan jelas dan tepat.`;
}

function buildPrefixSuggestion(fieldKind: string, input: string) {
  const prefix = normalizeFieldText(input).toLowerCase();
  if (!prefix) return "";

  const phraseBank: Record<string, string[]> = {
    bahan: [
      "Kad gambar, lembaran kerja dan bahan maujud digunakan sebagai sokongan aktiviti.",
      "Pensel warna, kertas aktiviti dan kad imbasan digunakan semasa sesi dijalankan.",
      "Bahan bantu mengajar disediakan mengikut tahap dan keperluan peserta.",
      "Kad imbasan digunakan untuk membantu peserta mengenal perkataan dengan lebih jelas.",
      "Objek sebenar digunakan bagi menarik minat peserta semasa aktiviti dijalankan.",
      "Lembaran kerja mudah disediakan supaya peserta dapat melengkapkan tugasan secara berpandu.",
      "Bahan sensori digunakan untuk merangsang perhatian dan penglibatan peserta.",
      "Carta bergambar digunakan sebagai panduan visual sepanjang aktiviti.",
    ],
    fokus: [
      "Bahasa dan komunikasi",
      "Kemahiran motor halus",
      "Kemahiran motor kasar",
      "Kemahiran sosial",
      "Pengurusan diri",
      "Kognitif",
      "Sosioemosi",
      "Bahasa Melayu",
      "Matematik awal",
      "Kemahiran membaca",
      "Kemahiran menulis",
      "Kemahiran pra-nombor",
      "Kemahiran mendengar",
      "Kemahiran bertutur",
      "Fizikal dan estetika",
    ],
    langkah: [
      "Memberi penerangan ringkas sebelum aktiviti dimulakan.",
      "Membimbing peserta melaksanakan tugasan secara berperingkat.",
      "Menunjukkan contoh terlebih dahulu sebelum peserta mencuba sendiri.",
      "Menilai respons peserta selepas aktiviti selesai dijalankan.",
      "Memulakan aktiviti dengan set induksi yang ringkas dan mudah difahami.",
      "Memberi arahan satu demi satu supaya peserta dapat mengikuti aktiviti dengan jelas.",
      "Menggalakkan peserta mencuba tugasan secara kendiri selepas demonstrasi diberikan.",
      "Memberi pujian dan peneguhan positif apabila peserta menunjukkan respons yang sesuai.",
      "Merekodkan pemerhatian selepas aktiviti bagi tujuan penambahbaikan.",
      "Mengulang semula arahan sekiranya peserta memerlukan bimbingan tambahan.",
    ],
    objektif: [
      "Membaca ayat mudah dengan bimbingan guru.",
      "Menulis nama sendiri dengan kemas dan betul.",
      "Menyebut perkataan mudah berdasarkan gambar yang ditunjukkan.",
      "Mengenal huruf dan bunyi awal perkataan.",
      "Memahami arahan mudah yang diberikan secara lisan.",
      "Mengira nombor dalam lingkungan yang sesuai dengan tahap murid.",
      "Memadankan gambar dengan perkataan yang betul.",
      "Melengkapkan tugasan mengikut arahan yang diberikan.",
      "Menjawab soalan mudah secara lisan dengan bimbingan guru.",
      "Mengenal warna asas melalui aktiviti padanan gambar.",
      "Menyusun objek mengikut kategori yang ditetapkan.",
      "Menggunakan alat tulis dengan cara yang betul.",
      "Menumpukan perhatian sepanjang aktiviti dalam tempoh yang sesuai.",
      "Mengikuti arahan mudah secara berperingkat.",
      "Menunjukkan kemahiran komunikasi melalui respons yang sesuai.",
      "Menghasilkan tugasan ringkas mengikut contoh yang diberikan.",
      "Mengenal nombor melalui bahan bantu mengajar yang sesuai.",
      "Menceritakan semula pengalaman ringkas dengan ayat mudah.",
    ],
    pemerhatian: [
      "Memberi respons yang baik apabila arahan diberikan.",
      "Menunjukkan minat semasa aktiviti dijalankan.",
      "Mengikuti arahan dengan bimbingan yang minimum.",
      "Memerlukan bimbingan tambahan untuk menyiapkan tugasan.",
      "Memberi tumpuan dalam tempoh yang sesuai dengan keupayaan semasa.",
      "Menunjukkan keyakinan semasa mencuba tugasan yang diberikan.",
      "Berusaha melibatkan diri walaupun masih memerlukan sokongan.",
      "Dapat menyiapkan sebahagian tugasan dengan bantuan guru.",
      "Mudah terganggu tetapi boleh kembali fokus selepas diberi bimbingan.",
      "Memberi kerjasama yang baik sepanjang aktiviti dijalankan.",
      "Menunjukkan perkembangan positif berbanding sesi sebelumnya.",
      "Memerlukan arahan yang jelas dan berulang untuk memahami tugasan.",
      "Dapat mengikuti aktiviti dalam kumpulan kecil dengan pemantauan.",
    ],
    refleksi: [
      "Aktiviti berjalan dengan baik dan peserta dapat mengikuti arahan.",
      "Peserta masih memerlukan bimbingan tambahan pada sesi seterusnya.",
      "Bahan aktiviti perlu dipelbagaikan supaya peserta lebih fokus.",
      "Masa pelaksanaan perlu disesuaikan dengan tahap keupayaan peserta.",
      "Aktiviti perlu diteruskan dengan pendekatan yang lebih ringkas dan berpandu.",
      "Arahan perlu diberikan secara berperingkat supaya peserta lebih mudah memahami tugasan.",
      "Bahan visual membantu peserta memberi perhatian dengan lebih baik.",
      "Bimbingan secara individu diperlukan bagi peserta yang masih belum menguasai kemahiran.",
      "Aktiviti boleh ditambah baik dengan penggunaan bahan yang lebih menarik.",
      "Peneguhan positif membantu meningkatkan penglibatan peserta.",
      "Sesi seterusnya perlu memberi fokus kepada kemahiran yang masih belum dikuasai.",
      "Tempoh aktiviti perlu dipendekkan supaya peserta dapat mengekalkan tumpuan.",
    ],
    rumusan: [
      "Secara keseluruhan, aktiviti berjalan dengan baik.",
      "Program mencapai tujuan yang dirancang dan sesuai diteruskan.",
      "Cadangan penambahbaikan akan diambil kira untuk sesi seterusnya.",
      "Pelaksanaan aktiviti memberi manfaat kepada peserta dan boleh diteruskan.",
      "Objektif aktiviti dicapai secara berperingkat berdasarkan respons peserta.",
      "Kerjasama semua pihak membantu memastikan aktiviti berjalan dengan lancar.",
      "Pemerhatian yang direkodkan boleh digunakan sebagai rujukan tindakan susulan.",
      "Penambahbaikan akan dibuat berdasarkan keperluan peserta semasa.",
      "Aktiviti ini sesuai dijadikan asas untuk perancangan sesi berikutnya.",
    ],
    standardKandungan: [
      "Kemahiran mendengar dan bertutur",
      "Kemahiran membaca",
      "Kemahiran menulis",
      "Perkembangan fizikal dan estetika",
      "Perkembangan bahasa, komunikasi dan literasi awal",
      "Perkembangan kognitif",
      "Perkembangan sosioemosi",
      "Keterampilan diri",
      "Kreativiti dan estetika",
    ],
    standardPembelajaran: [
      "Murid boleh mendengar dan memberi respons terhadap arahan mudah.",
      "Murid boleh membaca perkataan mudah dengan bimbingan.",
      "Murid boleh menulis perkataan mudah dengan betul.",
      "Murid boleh menyebut perkataan mudah berdasarkan gambar.",
      "Murid boleh mengenal huruf melalui aktiviti berpandu.",
      "Murid boleh memadankan objek mengikut kategori.",
      "Murid boleh mengikuti arahan mudah secara berperingkat.",
      "Murid boleh menggunakan bahan aktiviti dengan bimbingan guru.",
      "Murid boleh memberi respons secara lisan mengikut situasi.",
    ],
    tajuk: [
      "Aktiviti pembelajaran harian",
      "Latihan kemahiran asas",
      "Pengukuhan kemahiran komunikasi",
      "Permohonan dan makluman rasmi",
      "Aktiviti mengenal huruf",
      "Aktiviti mengenal nombor",
      "Latihan motor halus",
      "Aktiviti komunikasi mudah",
      "Program intervensi individu",
      "Laporan pemerhatian peserta",
    ],
    umum: [
      "Maklumat ini disusun dengan jelas dan mudah difahami.",
      "Catatan ini direkodkan sebagai rujukan pelaksanaan.",
      "Perkara ini boleh digunakan untuk tindakan susulan yang sesuai.",
      "Maklumat tersebut perlu dikemas kini mengikut keperluan semasa.",
      "Maklumat ini boleh diperincikan supaya lebih lengkap dan teratur.",
      "Catatan ini membantu memudahkan semakan dan rujukan pihak berkaitan.",
      "Perkara ini perlu dinyatakan dengan ringkas, tepat dan mudah difahami.",
      "Maklumat yang diberikan perlu selaras dengan tujuan dokumen.",
      "Butiran ini boleh dijadikan asas untuk penyediaan laporan yang lebih lengkap.",
      "Catatan tersebut sesuai dimasukkan sebagai rekod rasmi pelaksanaan.",
    ],
  };

  const matches =
    phraseBank[fieldKind]?.filter((phrase) => {
      const lowerPhrase = phrase.toLowerCase();
      return lowerPhrase.startsWith(prefix) || lowerPhrase.includes(` ${prefix}`);
    }) || [];

  return pickChangingSuggestion(matches, prefix);
}

function pickChangingSuggestion(options: string[], input: string) {
  if (options.length === 0) return "";

  const score = Array.from(input).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    input.length,
  );

  return options[score % options.length];
}

function rotateSuggestions(options: string[], input: string) {
  if (options.length === 0) return [];

  const score = Array.from(input).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    input.length,
  );
  const startIndex = score % options.length;

  return [...options.slice(startIndex), ...options.slice(0, startIndex)];
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
          className="pointer-events-none absolute z-20 max-w-[26rem] rounded-lg border border-[#88a9ff] bg-[#111827]/95 px-3 py-2 text-left text-sm font-semibold leading-5 text-[#e7eeff] shadow-[0_14px_42px_rgba(43,91,255,0.28)]"
          style={{
            left: shadowPrediction.x,
            top: shadowPrediction.y,
            minWidth: shadowPrediction.width ? Math.min(shadowPrediction.width, 300) : undefined,
          }}
        >
          <div className="grid gap-1">
            {(shadowPrediction.options || [shadowPrediction.text]).slice(0, 6).map((option, index) => (
              <div
                className="flex items-start gap-2 rounded-md px-2 py-1 text-left"
                key={`${option}-${index}`}
              >
                <span className="mt-0.5 rounded bg-[#88a9ff]/20 px-1.5 text-[0.65rem] font-bold text-[#b8c8ff]">
                  {index + 1}
                </span>
                <span>{option.trim()}</span>
              </div>
            ))}
          </div>
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
    return prediction.replacement || prediction.options?.[0] || prediction.text;
  }

  if (event.altKey && /^[1-6]$/.test(event.key)) {
    return prediction.options?.[Number(event.key) - 1] || "";
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
