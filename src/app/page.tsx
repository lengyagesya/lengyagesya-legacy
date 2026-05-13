"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type UploadState = {
  kind: "image" | "pdf" | "office";
  name: string;
  previewUrl: string;
  type: string;
};

type ScanState = "idle" | "scanning" | "done";

type UserProfile =
  | "Petugas PPDK"
  | "Guru Sekolah"
  | "Guru Pendidikan Khas"
  | "Pendidik Taska"
  | "Guru Tadika"
  | "Terapis"
  | "Penyelaras Program"
  | "Admin Organisasi"
  | "Custom";

type OutputFormat =
  | "RPA"
  | "RPH"
  | "RPI"
  | "Laporan Aktiviti"
  | "Laporan Program"
  | "Minit Mesyuarat"
  | "Memo"
  | "Custom";

type SavedState = {
  fields: string[];
  outputFormat: OutputFormat;
  selectedProfile: UserProfile;
  upload: UploadState | null;
  values: Record<string, string>;
};

const storageKey = "ly-docs-simple-scan-state";
const allowedExtensions = ["png", "jpg", "jpeg", "pdf", "doc", "docx"];

const profiles: UserProfile[] = [
  "Petugas PPDK",
  "Guru Sekolah",
  "Guru Pendidikan Khas",
  "Pendidik Taska",
  "Guru Tadika",
  "Terapis",
  "Penyelaras Program",
  "Admin Organisasi",
  "Custom",
];

const outputFormats: OutputFormat[] = [
  "RPA",
  "RPH",
  "RPI",
  "Laporan Aktiviti",
  "Laporan Program",
  "Minit Mesyuarat",
  "Memo",
  "Custom",
];

const longFieldHints = [
  "Objektif",
  "Bahan",
  "Langkah",
  "Pemerhatian",
  "Refleksi",
  "Catatan",
  "Rumusan",
  "Aktiviti",
  "Standard",
  "Intervensi",
  "Penilaian",
];

export default function Home() {
  const [selectedProfile, setSelectedProfile] =
    useState<UserProfile>("Petugas PPDK");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("RPA");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [officeFile, setOfficeFile] = useState<File | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as SavedState;
          setFields(parsed.fields || []);
          setOutputFormat(parsed.outputFormat || "RPA");
          setSelectedProfile(parsed.selectedProfile || "Petugas PPDK");
          setUpload(parsed.upload || null);
          setValues(parsed.values || {});
          setScanState(parsed.fields?.length ? "done" : "idle");
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const state: SavedState = {
      fields,
      outputFormat,
      selectedProfile,
      upload,
      values,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [fields, hydrated, outputFormat, selectedProfile, upload, values]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(extension)) {
      setMessage("Fail tidak disokong. Sila upload PNG, JPG, PDF, DOC atau DOCX.");
      event.target.value = "";
      return;
    }

    const type =
      extension === "jpg" || extension === "jpeg"
        ? "JPG"
        : extension.toUpperCase();
    const previewUrl = URL.createObjectURL(file);
    const extractedText = extension === "docx" ? await extractDocxText(file) : "";
    const nextUpload: UploadState = {
      kind:
        extension === "png" || extension === "jpg" || extension === "jpeg"
          ? "image"
          : extension === "pdf"
            ? "pdf"
            : "office",
      name: file.name,
      previewUrl,
      type,
    };

    setUpload(nextUpload);
    setOfficeFile(extension === "doc" || extension === "docx" ? file : null);
    setFields([]);
    setValues({});
    setScanState("scanning");
    setMessage("Scan format sedang berjalan...");

    window.setTimeout(() => {
      const scannedFields = scanFields(
        `${file.name} ${extractedText}`,
      );
      setFields(scannedFields);
      setScanState("done");
      setMessage(
        scannedFields.length
          ? "Scan siap. Kolum yang muncul hanya berdasarkan format file yang diupload."
          : "Scan siap, tetapi tiada kolum jelas dikesan dalam format ini.",
      );
    }, 900);
  }

  function updateValue(field: string, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function resetAll() {
    setUpload(null);
    setOfficeFile(null);
    setFields([]);
    setValues({});
    setScanState("idle");
    setSelectedProfile("Petugas PPDK");
    setOutputFormat("RPA");
    setMessage("Ruang kerja telah dikosongkan.");
    window.localStorage.removeItem(storageKey);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <Background />
      <IntroOverlay />

      <div className="main-reveal relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050507]/80 px-5 py-4 backdrop-blur-2xl sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <a className="text-lg font-semibold tracking-tight text-white" href="#">
              lY Docs
            </a>
            <span className="hidden text-sm text-[#aeb7c8] sm:inline">
              Scan format, isi kolum, jana output.
            </span>
          </div>
        </header>

        <section className="px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#b9caff]">
                lY Docs
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
                Upload format, isi kolum, lihat output.
              </h1>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-6">
                <Panel title="1. Pilih User">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profiles.map((profile) => (
                      <Choice
                        active={selectedProfile === profile}
                        key={profile}
                        label={profile}
                        onClick={() => setSelectedProfile(profile)}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel title="2. Pilih Format Output">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {outputFormats.map((format) => (
                      <Choice
                        active={outputFormat === format}
                        key={format}
                        label={format}
                        onClick={() => setOutputFormat(format)}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel title="3. Upload Format File">
                  <label className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#b9caff]/35 bg-[#7da1ff]/8 px-6 py-10 text-center shadow-[0_28px_120px_rgba(71,102,180,0.14)] transition duration-500 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/12">
                    <span className="grid h-16 w-16 place-items-center rounded-[1.25rem] border border-white/10 bg-white/[0.07] text-3xl text-[#d7e3ff] transition group-hover:scale-105">
                      &uarr;
                    </span>
                    <span className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-white">
                      Upload format dokumen
                    </span>
                    <span className="mt-3 max-w-lg text-sm leading-6 text-[#aeb7c8]">
                      Sistem scan apa yang diperlukan dalam format ini dan
                      keluarkan kolum untuk diisi.
                    </span>
                    <span className="mt-5 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b9caff]">
                      PNG / JPG / PDF / DOC / DOCX
                    </span>
                    <input
                      accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                      className="sr-only"
                      onChange={handleUpload}
                      type="file"
                    />
                  </label>

                  {upload ? <FileCard upload={upload} /> : null}
                  {scanState === "scanning" ? <ScanCard /> : null}
                  {message ? <Message text={message} /> : null}
                </Panel>

                {fields.length > 0 ? (
                  <Panel title="4. Kolum Untuk Diisi">
                    <div className="grid gap-4">
                      {fields.map((field) => (
                        <FieldInput
                          field={field}
                          key={field}
                          onChange={updateValue}
                          value={values[field] || ""}
                        />
                      ))}
                    </div>
                  </Panel>
                ) : scanState === "done" ? (
                  <Panel title="4. Kolum Untuk Diisi">
                    <p className="text-sm leading-6 text-[#aeb7c8]">
                      Tiada kolum dikesan daripada format file ini. Kolum hanya
                      akan muncul jika label medan memang wujud dalam file yang
                      diupload.
                    </p>
                  </Panel>
                ) : null}
              </div>

              <div className="space-y-6">
                <Panel title="Output">
                  <div className="mb-5 flex flex-wrap gap-3">
                    <button className="btn-quiet" onClick={resetAll}>
                      Reset
                    </button>
                  </div>

                  <DocumentPreview
                    fields={fields}
                    officeFile={officeFile}
                    outputFormat={outputFormat}
                    selectedProfile={selectedProfile}
                    upload={upload}
                    values={values}
                  />
                </Panel>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FieldInput({
  field,
  onChange,
  value,
}: {
  field: string;
  onChange: (field: string, value: string) => void;
  value: string;
}) {
  const inputType = inputTypeForField(field);

  return (
    <label className="grid gap-2 text-sm font-medium text-[#d8deea]">
      {field}
      {inputType === "textarea" ? (
        <textarea
          className="input-field min-h-28 resize-none"
          onChange={(event) => onChange(field, event.target.value)}
          placeholder={`Isi ${field.toLowerCase()}`}
          value={value}
        />
      ) : (
        <input
          className="input-field"
          onChange={(event) => onChange(field, event.target.value)}
          placeholder={`Isi ${field.toLowerCase()}`}
          type={inputType}
          value={value}
        />
      )}
    </label>
  );
}

function DocumentPreview({
  fields,
  officeFile,
  outputFormat,
  selectedProfile,
  upload,
  values,
}: {
  fields: string[];
  officeFile: File | null;
  outputFormat: OutputFormat;
  selectedProfile: UserProfile;
  upload: UploadState | null;
  values: Record<string, string>;
}) {
  if (!upload) {
    return (
      <article className="rounded-[1.5rem] border border-[#ded8ce] bg-[#f8f4ed] p-6 text-[#171513] shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-sm leading-7 text-[#655f58]">
          Upload format file untuk lihat preview asal. Kolum yang diisi akan
          masuk terus dalam preview ini.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-6">
      <div className="relative mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden rounded-sm bg-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        {upload.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Preview format asal"
            className="h-full w-full object-contain"
            src={upload.previewUrl}
          />
        ) : null}

        {upload.kind === "pdf" ? (
          <object
            className="h-full w-full"
            data={upload.previewUrl}
            title="Preview PDF asal"
            type="application/pdf"
          />
        ) : null}

        {upload.kind === "office" ? (
          <OfficeDocumentPreview file={officeFile} upload={upload} />
        ) : null}

        {fields.length > 0 ? (
          <FilledPreviewLayer
            fields={fields}
            outputFormat={outputFormat}
            selectedProfile={selectedProfile}
            values={values}
          />
        ) : null}
      </div>
    </article>
  );
}

function FilledPreviewLayer({
  fields,
  outputFormat,
  selectedProfile,
  values,
}: {
  fields: string[];
  outputFormat: OutputFormat;
  selectedProfile: UserProfile;
  values: Record<string, string>;
}) {
  const visibleFields = fields.filter((field) => values[field]?.trim()).slice(0, 10);

  if (visibleFields.length === 0) {
    return (
      <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-[#cfc6b8] bg-[#fffdf8]/95 p-4 text-[#171513] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7f9f]">
          {outputFormat}
        </p>
        <p className="mt-2 text-sm text-[#655f58]">
          Isi kolum di sebelah kiri. Maklumat akan muncul terus dalam preview ini.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-5 left-5 right-5 max-h-[45%] overflow-auto rounded-xl border border-[#cfc6b8] bg-[#fffdf8]/95 p-4 text-[#171513] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="mb-3 border-b border-[#ded8ce] pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7f9f]">
          {outputFormat}
        </p>
        <p className="mt-1 text-xs text-[#655f58]">User: {selectedProfile}</p>
      </div>
      <div className="grid gap-2">
        {visibleFields.map((field) => (
          <div
            className="grid gap-1 border-b border-[#ebe2d6] pb-2 last:border-b-0 sm:grid-cols-[0.36fr_0.64fr]"
            key={field}
          >
            <span className="text-xs font-semibold text-[#27231f]">{field}</span>
            <span className="whitespace-pre-wrap text-xs leading-5 text-[#332f2a]">
              {values[field]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfficeDocumentPreview({
  file,
  upload,
}: {
  file: File | null;
  upload: UploadState;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState("");
  const immediateError =
    upload.type !== "DOCX"
      ? "Format DOC lama tidak boleh dibaca tepat dalam browser. Sila upload DOCX."
      : !file
        ? "Sila upload semula fail DOCX untuk preview."
        : "";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    window.setTimeout(() => setRenderError(""), 0);
    if (immediateError) return;

    let cancelled = false;

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
      .catch(() => {
        if (!cancelled) {
          setRenderError("DOCX ini tidak dapat dirender. Cuba simpan semula sebagai DOCX moden.");
        }
      });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [file, immediateError, upload.name, upload.type]);

  const error = immediateError || renderError;

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-center text-[#171513]">
        <div>
          <p className="text-2xl font-semibold">{upload.name}</p>
          <p className="mt-3 text-sm text-[#655f58]">{error}</p>
        </div>
      </div>
    );
  }

  return <div className="ly-docx-output h-full w-full overflow-auto" ref={containerRef} />;
}

function FileCard({ upload }: { upload: UploadState }) {
  return (
    <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
      <p className="font-semibold text-white">{upload.name}</p>
      <p className="mt-1 text-sm text-[#aeb7c8]">Jenis fail: {upload.type}</p>
      <p className="mt-1 text-sm text-[#d7e3ff]">Status: Format aktif</p>
    </div>
  );
}

function ScanCard() {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-[1.25rem] border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4 text-[#d7e3ff]">
      <span className="scan-dot h-3 w-3 rounded-full bg-[#d7e3ff]" />
      <span className="text-sm font-medium">Scan format dan mencari kolum...</span>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 px-4 py-3 text-sm text-[#d7e3ff]">
      {text}
    </p>
  );
}

function IntroOverlay() {
  return (
    <div className="intro-overlay fixed inset-0 z-50 grid place-items-center bg-[#050507] px-6 text-center">
      <div className="intro-grid absolute inset-0 opacity-30" />
      <div className="intro-glow absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-[34rem] sm:w-[34rem]" />
      <section className="intro-enter relative z-10">
        <h1 className="intro-brand text-6xl font-semibold tracking-[-0.04em] text-white sm:text-8xl lg:text-9xl">
          lY Docs
        </h1>
        <p className="intro-kicker mt-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#c7d7ff]/75 sm:text-sm">
          Professional document generation
        </p>
      </section>
    </div>
  );
}

function Background() {
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_18%_10%,rgba(125,161,255,0.16),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(225,235,255,0.08),transparent_28%),linear-gradient(135deg,#050507_0%,#101116_46%,#050507_100%)]" />
      <div className="intro-grid fixed inset-0 -z-10 opacity-20" />
    </>
  );
}

function Panel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition duration-500 hover:border-white/15 sm:p-6">
      <h2 className="mb-5 text-2xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Choice({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition duration-300 ${
        active
          ? "border-[#b9caff]/65 bg-[#7da1ff]/12 text-white shadow-[0_16px_50px_rgba(125,161,255,0.12)]"
          : "border-white/10 bg-black/20 text-[#aeb7c8] hover:border-white/25 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

async function extractDocxText(file: File) {
  try {
    const [{ default: JSZip }, buffer] = await Promise.all([
      import("jszip"),
      file.arrayBuffer(),
    ]);
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file("word/document.xml")?.async("string");
    if (!xml) return "";

    const documentXml = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(documentXml.getElementsByTagName("w:t"))
      .map((node) => node.textContent || "")
      .join(" ");
  } catch {
    return "";
  }
}

function scanFields(sourceText: string) {
  const lowerText = sourceText.toLowerCase();
  const detected: string[] = [];
  const candidates: Array<[string, string[]]> = [
    ["Nama Organisasi", ["nama organisasi", "nama sekolah", "nama taska", "nama tadika", "organisasi"]],
    ["Nama Guru / Petugas", ["nama guru", "nama petugas", "nama pendidik", "disediakan oleh"]],
    ["Nama Murid / Pelatih", ["nama murid", "nama pelatih", "nama kanak", "nama klien"]],
    ["Tarikh", ["tarikh"]],
    ["Masa", ["masa"]],
    ["Tempat", ["tempat", "lokasi"]],
    ["Mata Pelajaran", ["mata pelajaran", "subjek"]],
    ["Kelas", ["kelas", "tahun"]],
    ["Tajuk Aktiviti", ["tajuk", "aktiviti", "tema"]],
    ["Objektif", ["objektif", "hasil pembelajaran"]],
    ["Bahan / Alat", ["bahan", "alat", "bbm", "bantu mengajar"]],
    ["Langkah Pelaksanaan", ["langkah", "pelaksanaan", "aktiviti pdp", "prosedur"]],
    ["Pemerhatian", ["pemerhatian", "observasi"]],
    ["Refleksi", ["refleksi", "rumusan"]],
    ["Catatan", ["catatan", "nota"]],
    ["Standard Kandungan", ["standard kandungan"]],
    ["Standard Pembelajaran", ["standard pembelajaran"]],
    ["Tandatangan", ["tandatangan", "pengesahan"]],
    ["Ringkasan Aktiviti", ["ringkasan aktiviti", "ringkasan"]],
    ["Rumusan", ["rumusan"]],
    ["Matlamat", ["matlamat"]],
    ["Objektif Jangka Pendek", ["objektif jangka pendek"]],
    ["Intervensi", ["intervensi"]],
    ["Penilaian", ["penilaian"]],
    ["Agenda", ["agenda"]],
    ["Kehadiran", ["kehadiran"]],
    ["Keputusan", ["keputusan"]],
    ["Tindakan", ["tindakan"]],
    ["Daripada", ["daripada"]],
    ["Kepada", ["kepada"]],
    ["Perkara", ["perkara"]],
    ["Isi Memo", ["isi memo"]],
  ];

  candidates.forEach(([field, keywords]) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      detected.push(field);
    }
  });

  return Array.from(new Set(detected)).slice(0, 18);
}

function inputTypeForField(field: string) {
  const lower = field.toLowerCase();
  if (lower.includes("tarikh")) return "date";
  if (lower.includes("masa")) return "time";
  if (longFieldHints.some((hint) => field.includes(hint))) return "textarea";
  return "text";
}
