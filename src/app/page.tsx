"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const userOptions = [
  "Petugas PPDK",
  "Guru Sekolah",
  "Guru Pendidikan Khas",
  "Pendidik Taska",
  "Guru Tadika",
  "Terapis",
  "Penyelaras Program",
  "Admin Organisasi",
];

const documentOptions = ["RPA", "RPH", "RPI", "Laporan Aktiviti"];

const detectedFieldsByDocument: Record<string, string[]> = {
  "Laporan Aktiviti": [
    "Nama Organisasi",
    "Nama Aktiviti",
    "Tarikh",
    "Masa",
    "Tempat",
    "Penyelaras",
    "Peserta",
    "Objektif",
    "Ringkasan Aktiviti",
    "Pemerhatian",
    "Rumusan",
  ],
  RPA: [
    "Nama Organisasi",
    "Nama Guru / Petugas",
    "Nama Murid / Pelatih",
    "Tarikh",
    "Masa",
    "Tajuk Aktiviti",
    "Objektif",
    "Bahan / Alat",
    "Langkah Pelaksanaan",
    "Pemerhatian",
    "Refleksi",
  ],
  RPH: [
    "Nama Sekolah",
    "Nama Guru",
    "Mata Pelajaran",
    "Kelas",
    "Tarikh",
    "Masa",
    "Tajuk",
    "Standard Kandungan",
    "Standard Pembelajaran",
    "Objektif",
    "Aktiviti PdP",
    "Refleksi",
  ],
  RPI: [
    "Nama Organisasi",
    "Nama Murid / Klien",
    "Kategori / Keperluan",
    "Matlamat",
    "Objektif Jangka Pendek",
    "Intervensi",
    "Penilaian",
    "Catatan",
  ],
};

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFields, setDetectedFields] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
    setUploadedFile(file || null);
    setFilePreviewUrl(file ? URL.createObjectURL(file) : "");
    setFileType(file?.name.split(".").pop()?.toLowerCase() || "");
    setIsConfirmed(false);
    setSelectedUser("");
    setSelectedDocument("");
    setIsScanning(false);
    setDetectedFields([]);
    setFormValues({});
    setShowPreview(false);
  }

  function confirmFile() {
    if (!fileName) return;
    setIsConfirmed(true);
  }

  function backToUpload() {
    setIsConfirmed(false);
    setSelectedUser("");
    setSelectedDocument("");
    setIsScanning(false);
    setDetectedFields([]);
    setFormValues({});
    setShowPreview(false);
  }

  function backToUserSelection() {
    setSelectedDocument("");
    setIsScanning(false);
    setDetectedFields([]);
    setFormValues({});
    setShowPreview(false);
  }

  function selectDocument(documentName: string) {
    setSelectedDocument(documentName);
    setIsScanning(false);
    setDetectedFields([]);
    setFormValues({});
    setShowPreview(false);
  }

  function scanFields() {
    if (!selectedDocument) return;

    setIsScanning(true);
    setDetectedFields([]);
    setFormValues({});
    setShowPreview(false);

    window.setTimeout(() => {
      setDetectedFields(detectedFieldsByDocument[selectedDocument] || []);
      setIsScanning(false);
    }, 900);
  }

  function updateField(field: string, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
    setShowPreview(false);
  }

  function generatePreview() {
    if (detectedFields.length === 0) return;
    setShowPreview(true);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050507] px-6 py-12 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(125,161,255,0.2),transparent_30%),radial-gradient(circle_at_18%_16%,rgba(230,237,255,0.08),transparent_24%),linear-gradient(135deg,#050507_0%,#11131a_48%,#050507_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:86px_86px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7da1ff]/20 blur-3xl sm:h-[34rem] sm:w-[34rem]" />

      <section className="relative z-10 w-full max-w-3xl animate-[fadeIn_900ms_ease-out_both]">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#c7d7ff]/75 sm:text-sm">
          Professional document generation
        </p>
        <h1 className="text-6xl font-semibold tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(199,215,255,0.2)] sm:text-8xl lg:text-9xl">
          lY Docs
        </h1>
        <div className="mx-auto mt-12 max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_28px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
          {!isConfirmed ? (
            <label className="group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#b9caff]/35 bg-black/25 px-6 py-8 transition duration-300 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/10">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-3xl text-[#d7e3ff] transition duration-300 group-hover:scale-105">
                +
              </span>
              <span className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">
                Upload format dokumen anda
              </span>
              <span className="mt-3 max-w-sm text-sm leading-6 text-[#aeb7c8]">
                Pilih file PDF, DOC, DOCX, PNG atau JPG. Fasa ini hanya papar nama
                file dahulu.
              </span>
              <input
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={handleUpload}
                type="file"
              />
            </label>
          ) : null}

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8aa0]">
              File dipilih
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-white">
              {fileName || "Belum ada file"}
            </p>
          </div>

          {fileName ? (
            <OriginalFilePreview
              fileName={fileName}
              filePreviewUrl={filePreviewUrl}
              fileType={fileType}
              uploadedFile={uploadedFile}
            />
          ) : null}

          {fileName && !isConfirmed ? (
            <div className="mt-4 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4 text-left">
              <p className="text-base font-semibold text-white">
                Ini file format yang betul?
              </p>
              <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                Sahkan file ini sebelum kita sambung ke langkah seterusnya.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="btn-primary"
                  onClick={confirmFile}
                  type="button"
                >
                  Ya, Teruskan
                </button>
                <label className="btn-secondary cursor-pointer">
                  Upload Semula
                  <input
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="sr-only"
                    onChange={handleUpload}
                    type="file"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {isConfirmed ? (
            <div className="mt-4 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4 text-left">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <button className="btn-quiet" onClick={backToUpload} type="button">
                  Back
                </button>
                {selectedUser ? (
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-[#d7e3ff]">
                    {selectedUser}
                  </span>
                ) : null}
              </div>

              {!selectedUser ? (
                <>
                  <p className="text-base font-semibold text-white">
                    Pilih pengguna
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                    Pilihan ini akan bantu susun langkah seterusnya.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {userOptions.map((option) => (
                      <button
                        className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-sm font-semibold text-[#aeb7c8] transition duration-300 hover:border-[#b9caff]/45 hover:text-white"
                        key={option}
                        onClick={() => setSelectedUser(option)}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">
                        Pilih jenis dokumen
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                        Pilih dokumen yang mahu disediakan.
                      </p>
                    </div>
                    <button
                      className="btn-quiet"
                      onClick={backToUserSelection}
                      type="button"
                    >
                      Back
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {documentOptions.map((option) => (
                      <button
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition duration-300 ${
                          selectedDocument === option
                            ? "border-[#b9caff]/70 bg-[#7da1ff]/20 text-white"
                            : "border-white/10 bg-black/25 text-[#aeb7c8] hover:border-[#b9caff]/45 hover:text-white"
                        }`}
                        key={option}
                        onClick={() => selectDocument(option)}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {selectedDocument ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <button
                        className="btn-primary"
                        disabled={isScanning}
                        onClick={scanFields}
                        type="button"
                      >
                        {isScanning ? "Sedang Scan..." : "Scan Ruangan Format"}
                      </button>

                      {isScanning ? (
                        <p className="mt-4 text-sm text-[#d7e3ff]">
                          Mengesan ruangan dalam format...
                        </p>
                      ) : null}

                      {detectedFields.length > 0 ? (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-white">
                            Ruangan dikesan
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {detectedFields.map((field) => (
                              <div
                                className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm font-medium text-[#d8deea]"
                                key={field}
                              >
                                {field}
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 space-y-4">
                            <p className="text-sm font-semibold text-white">
                              Isi maklumat
                            </p>
                            {detectedFields.map((field) => (
                              <FieldInput
                                field={field}
                                key={field}
                                onChange={updateField}
                                value={formValues[field] || ""}
                              />
                            ))}
                            <button
                              className="btn-primary"
                              onClick={generatePreview}
                              type="button"
                            >
                              Jana Preview
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
        {showPreview ? (
          <DocumentPreview
            detectedFields={detectedFields}
            fileName={fileName}
            formValues={formValues}
            selectedDocument={selectedDocument}
            selectedUser={selectedUser}
          />
        ) : null}
      </section>
    </main>
  );
}

function DocumentPreview({
  detectedFields,
  fileName,
  formValues,
  selectedDocument,
  selectedUser,
}: {
  detectedFields: string[];
  fileName: string;
  formValues: Record<string, string>;
  selectedDocument: string;
  selectedUser: string;
}) {
  return (
    <section className="mx-auto mt-8 max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-left shadow-[0_28px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#b9caff]">
        Preview Output
      </p>
      <article className="rounded-xl bg-[#fbfaf6] p-6 text-[#171513] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="border-b border-[#d9d2c7] pb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d655c]">
            {selectedUser}
          </p>
          <h2 className="mt-2 text-2xl font-bold uppercase tracking-wide">
            {selectedDocument}
          </h2>
          <p className="mt-2 text-xs text-[#6d655c]">{fileName}</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-[#d9d2c7]">
          {detectedFields.map((field) => (
            <div
              className="grid border-b border-[#d9d2c7] last:border-b-0 sm:grid-cols-[0.38fr_0.62fr]"
              key={field}
            >
              <div className="bg-[#f0ece4] px-4 py-3 text-sm font-bold">
                {field}
              </div>
              <div className="min-h-12 px-4 py-3 text-sm leading-6">
                {formValues[field]?.trim() || "Belum diisi"}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function OriginalFilePreview({
  fileName,
  filePreviewUrl,
  fileType,
  uploadedFile,
}: {
  fileName: string;
  filePreviewUrl: string;
  fileType: string;
  uploadedFile: File | null;
}) {
  const isImage = ["jpg", "jpeg", "png"].includes(fileType);
  const isPdf = fileType === "pdf";
  const isDocx = fileType === "docx";

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8aa0]">
        Preview file asal
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`Preview ${fileName}`}
            className="max-h-80 w-full object-contain"
            src={filePreviewUrl}
          />
        ) : null}

        {isPdf ? (
          <object
            className="h-80 w-full bg-white"
            data={filePreviewUrl}
            title={`Preview ${fileName}`}
            type="application/pdf"
          />
        ) : null}

        {isDocx ? <DocxPreview file={uploadedFile} /> : null}

        {!isImage && !isPdf && !isDocx ? (
          <div className="p-5">
            <p className="text-sm font-semibold text-white">{fileName}</p>
            <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
              Preview visual untuk DOC lama akan dibuat pada fasa seterusnya.
              Buat masa ini file sudah diterima sebagai rujukan.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DocxPreview({ file }: { file: File | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !file) return;

    container.innerHTML = "";
    setError("");
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
          setError("DOCX ini tidak dapat dipaparkan. Cuba simpan semula sebagai DOCX moden.");
        }
      });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [file]);

  if (!file) {
    return (
      <div className="p-5 text-sm leading-6 text-[#aeb7c8]">
        File DOCX belum tersedia untuk preview.
      </div>
    );
  }

  if (error) {
    return <div className="p-5 text-sm leading-6 text-[#ffd2d2]">{error}</div>;
  }

  return (
    <div
      className="max-h-96 overflow-auto bg-white text-black"
      ref={containerRef}
    />
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
  const lower = field.toLowerCase();
  const isLong =
    lower.includes("objektif") ||
    lower.includes("langkah") ||
    lower.includes("aktiviti") ||
    lower.includes("pemerhatian") ||
    lower.includes("refleksi") ||
    lower.includes("rumusan") ||
    lower.includes("catatan") ||
    lower.includes("intervensi");

  return (
    <label className="grid gap-2 text-sm font-semibold text-[#d8deea]">
      {field}
      {isLong ? (
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
          type={
            lower.includes("tarikh")
              ? "date"
              : lower.includes("masa")
                ? "time"
                : "text"
          }
          value={value}
        />
      )}
    </label>
  );
}
