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
  formatName: string;
  isConfirmed: boolean;
  outputFormat: OutputFormat;
  selectedProfile: UserProfile;
  showOutputFile: boolean;
  upload: UploadState | null;
  values: Record<string, string>;
};

type SavedFormat = {
  createdAt: string;
  fields: string[];
  fileName: string;
  id: string;
  name: string;
  outputFormat: OutputFormat;
  selectedProfile: UserProfile;
  type: string;
};

type BuiltInTemplate = {
  description: string;
  fields: string[];
  name: string;
  outputFormat: OutputFormat;
  recommendedProfile: UserProfile;
};

const storageKey = "ly-docs-simple-scan-state";
const savedFormatsKey = "ly-docs-saved-formats";
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

const builtInTemplates: BuiltInTemplate[] = [
  {
    description: "Perancangan aktiviti harian untuk PPDK, taska dan tadika.",
    fields: [
      "Nama Organisasi",
      "Nama Guru / Petugas",
      "Nama Murid / Pelatih",
      "Tarikh",
      "Hari",
      "Masa",
      "Tajuk Aktiviti",
      "Objektif",
      "Bahan / Alat",
      "Langkah Pelaksanaan",
      "Pemerhatian",
      "Refleksi",
    ],
    name: "RPA Aktiviti Harian",
    outputFormat: "RPA",
    recommendedProfile: "Petugas PPDK",
  },
  {
    description: "Rancangan pengajaran harian untuk guru sekolah.",
    fields: [
      "Nama Organisasi",
      "Nama Guru / Petugas",
      "Mata Pelajaran",
      "Kelas",
      "Tarikh",
      "Masa",
      "Tajuk Aktiviti",
      "Standard Kandungan",
      "Standard Pembelajaran",
      "Objektif",
      "Bahan / Alat",
      "Langkah Pelaksanaan",
      "Refleksi",
    ],
    name: "RPH Sekolah",
    outputFormat: "RPH",
    recommendedProfile: "Guru Sekolah",
  },
  {
    description: "Pelan individu untuk murid pendidikan khas atau klien terapi.",
    fields: [
      "Nama Organisasi",
      "Nama Murid / Pelatih",
      "Kategori / Keperluan",
      "Matlamat",
      "Objektif Jangka Pendek",
      "Intervensi",
      "Penilaian",
      "Catatan",
    ],
    name: "RPI Pendidikan Khas",
    outputFormat: "RPI",
    recommendedProfile: "Guru Pendidikan Khas",
  },
  {
    description: "Laporan selepas program, lawatan atau aktiviti organisasi.",
    fields: [
      "Nama Organisasi",
      "Tajuk Aktiviti",
      "Tarikh",
      "Masa",
      "Tempat",
      "Nama Guru / Petugas",
      "Objektif",
      "Ringkasan Aktiviti",
      "Pemerhatian",
      "Rumusan",
      "Catatan",
    ],
    name: "Laporan Aktiviti",
    outputFormat: "Laporan Aktiviti",
    recommendedProfile: "Penyelaras Program",
  },
];

export default function Home() {
  const [selectedProfile, setSelectedProfile] =
    useState<UserProfile>("Petugas PPDK");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("RPA");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [officeFile, setOfficeFile] = useState<File | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [formatName, setFormatName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [savedFormats, setSavedFormats] = useState<SavedFormat[]>([]);
  const [showOutputFile, setShowOutputFile] = useState(false);
  const [applyValuesVersion, setApplyValuesVersion] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as SavedState;
          setFields(parsed.fields || []);
          setFormatName(parsed.formatName || "");
          setIsConfirmed(Boolean(parsed.isConfirmed));
          setOutputFormat(parsed.outputFormat || "RPA");
          setSelectedProfile(parsed.selectedProfile || "Petugas PPDK");
          setShowOutputFile(
            typeof parsed.showOutputFile === "boolean"
              ? parsed.showOutputFile
              : Boolean(parsed.upload && !parsed.isConfirmed),
          );
          setUpload(parsed.upload || null);
          setValues(parsed.values || {});
          setScanState(parsed.fields?.length ? "done" : "idle");
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }
      try {
        setSavedFormats(JSON.parse(window.localStorage.getItem(savedFormatsKey) || "[]"));
      } catch {
        window.localStorage.removeItem(savedFormatsKey);
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const state: SavedState = {
      fields,
      formatName,
      isConfirmed,
      outputFormat,
      selectedProfile,
      showOutputFile,
      upload,
      values,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [fields, formatName, hydrated, isConfirmed, outputFormat, selectedProfile, showOutputFile, upload, values]);

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
    setFormatName(file.name.replace(/\.[^.]+$/, ""));
    setFields([]);
    setIsConfirmed(false);
    setShowOutputFile(true);
    setApplyValuesVersion(0);
    setSourceText(`${file.name} ${extractedText}`);
    setValues({});
    setScanState("idle");
    setMessage("Sahkan dahulu sama ada ini file yang betul.");
  }

  function confirmFile() {
    if (!upload) return;
    setIsConfirmed(true);
    setShowOutputFile(false);
    setApplyValuesVersion(0);
    saveFormatAndScan(true);
  }

  function saveFormatAndScan(skipConfirmCheck = false) {
    if (!upload) {
      setMessage("Upload file dahulu.");
      return;
    }

    if (!skipConfirmCheck && !isConfirmed) {
      setMessage("Sahkan file dahulu sebelum simpan format.");
      return;
    }

    const name = formatName.trim();
    if (!name) {
      setMessage("Tulis nama format dahulu.");
      return;
    }

    setScanState("scanning");
    setShowOutputFile(false);
    setMessage("Menyemak ruangan dalam format...");

    window.setTimeout(() => {
      const scannedFields = scanFields(sourceText || upload.name);
      const nextFormat: SavedFormat = {
        createdAt: new Date().toISOString(),
        fields: scannedFields,
        fileName: upload.name,
        id: `${Date.now()}`,
        name,
        outputFormat,
        selectedProfile,
        type: upload.type,
      };
      const nextSaved = [nextFormat, ...savedFormats].slice(0, 12);
      setSavedFormats(nextSaved);
      window.localStorage.setItem(savedFormatsKey, JSON.stringify(nextSaved));
      setFields(scannedFields);
      setScanState("done");
      setMessage(
        scannedFields.length
          ? "Format disimpan. Isi ruangan yang dikesan, kemudian masukkan ke dokumen."
          : "Format disimpan, tetapi tiada ruangan jelas dikesan dalam file.",
      );
    }, 900);
  }

  function resetAll() {
    setUpload(null);
    setOfficeFile(null);
    setFields([]);
    setFormatName("");
    setIsConfirmed(false);
    setShowOutputFile(false);
    setApplyValuesVersion(0);
    setValues({});
    setScanState("idle");
    setSelectedProfile("Petugas PPDK");
    setOutputFormat("RPA");
    setSourceText("");
    setMessage("Ruang kerja telah dikosongkan.");
    window.localStorage.removeItem(storageKey);
  }

  function selectBuiltInTemplate(template: BuiltInTemplate) {
    setSelectedProfile(template.recommendedProfile);
    setOutputFormat(template.outputFormat);
    setUpload(null);
    setOfficeFile(null);
    setFormatName(template.name);
    setFields(template.fields);
    setIsConfirmed(true);
    setShowOutputFile(false);
    setApplyValuesVersion(0);
    setSourceText(template.fields.join(" "));
    setValues({});
    setScanState("done");
    setMessage(`${template.name} dipilih. Isi maklumat, kemudian masukkan ke dokumen.`);
  }

  function selectSavedFormat(format: SavedFormat) {
    setSelectedProfile(format.selectedProfile);
    setOutputFormat(format.outputFormat);
    setUpload(null);
    setOfficeFile(null);
    setFormatName(format.name);
    setFields(format.fields);
    setIsConfirmed(true);
    setShowOutputFile(false);
    setApplyValuesVersion(0);
    setSourceText(format.fields.join(" "));
    setValues({});
    setScanState("done");
    setMessage(`${format.name} dimuat. Isi maklumat, kemudian masukkan ke dokumen.`);
  }

  function updateValue(field: string, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function insertAiSuggestion() {
    const editor = document.querySelector<HTMLElement>(".ly-docx-output");
    if (!editor || upload?.type !== "DOCX") {
      setShowOutputFile(true);
      setMessage(
        upload?.type === "DOCX"
          ? "Output dibuka semula. Klik tempat dalam file, kemudian guna AI Cadangkan Ayat."
          : "Upload DOCX dahulu untuk guna cadangan AI terus dalam file.",
      );
      return;
    }

    const suggestion = buildAiSuggestion(selectedProfile, outputFormat);
    const selection = window.getSelection();
    const range =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const isInsideEditor =
      range && editor.contains(range.commonAncestorContainer);

    if (range && isInsideEditor) {
      range.deleteContents();
      range.insertNode(document.createTextNode(suggestion));
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = suggestion;
      paragraph.style.marginTop = "12px";
      editor.appendChild(paragraph);
      paragraph.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setMessage("Cadangan AI telah dimasukkan dalam output DOCX.");
  }

  function generateOutputFromAnswers() {
    if (!upload) {
      setShowOutputFile(true);
      setMessage("Dokumen dijana daripada template pilihan.");
      return;
    }

    if (upload.type !== "DOCX") {
      setShowOutputFile(true);
      setMessage("Jana output terus ke file hanya tersedia untuk DOCX.");
      return;
    }

    setApplyValuesVersion((current) => current + 1);
    setShowOutputFile(true);
    setMessage("Output dibuka semula. Jawapan dimasukkan ke ruang format asal yang sepadan.");
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
              Upload format, isi maklumat, jana terus ke dokumen.
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
                Siapkan RPH, RPA dan laporan dengan lebih mudah.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#aeb7c8] sm:text-lg">
                Pilih peranan, pilih dokumen, upload format sendiri, kemudian isi
                maklumat yang dikesan. lY Docs akan masukkan jawapan ke dalam
                format asal.
              </p>
              </div>

            <WorkflowSteps
              hasFields={scanState === "done" && fields.length > 0}
              hasUpload={Boolean(upload)}
              isConfirmed={isConfirmed}
              showOutputFile={showOutputFile}
            />

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-[#b9caff]/20 bg-[#7da1ff]/8 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.2)] backdrop-blur-2xl sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b9caff]">
                    Main workspace
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white">
                    Upload format dokumen anda
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#aeb7c8]">
                    Mula dengan template siap atau upload format sendiri untuk
                    jana dokumen kerja yang kemas.
                  </p>
                </section>

                <Panel title="Template Siap">
                  <p className="mb-4 text-sm leading-6 text-[#aeb7c8]">
                    Pilih template asas kalau mahu mula cepat tanpa upload file.
                    Sesuai untuk RPH, RPA, RPI dan laporan harian.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {builtInTemplates.map((template) => (
                      <TemplateCard
                        key={template.name}
                        onClick={() => selectBuiltInTemplate(template)}
                        template={template}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel title="1. Saya Sebagai">
                  <p className="mb-4 text-sm leading-6 text-[#aeb7c8]">
                    Pilih peranan supaya cadangan ayat lebih sesuai dengan kerja
                    harian anda.
                  </p>
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

                <Panel title="2. Dokumen Yang Mahu Dibuat">
                  <p className="mb-4 text-sm leading-6 text-[#aeb7c8]">
                    Pilih jenis dokumen. Format sebenar tetap ikut file yang anda upload.
                  </p>
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

                <Panel title="3. Upload Format">
                  <label className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#b9caff]/35 bg-[#7da1ff]/8 px-6 py-10 text-center shadow-[0_28px_120px_rgba(71,102,180,0.14)] transition duration-500 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/12">
                    <span className="grid h-16 w-16 place-items-center rounded-[1.25rem] border border-white/10 bg-white/[0.07] text-3xl text-[#d7e3ff] transition group-hover:scale-105">
                      &uarr;
                    </span>
                    <span className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-white">
                      Upload format dokumen
                    </span>
                    <span className="mt-3 max-w-lg text-sm leading-6 text-[#aeb7c8]">
                      Gunakan format sekolah, taska, PPDK atau organisasi sendiri.
                      Untuk edit terus dalam output, upload DOCX.
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
                  {upload && !isConfirmed ? (
                    <div className="mt-5 rounded-2xl border border-[#b9caff]/20 bg-white/[0.045] p-4">
                      <p className="text-base font-semibold text-white">
                        Ini format yang betul?
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                        Jika ya, lY Docs akan simpan format ini dan cari ruangan
                        yang perlu diisi.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button className="btn-primary" onClick={confirmFile}>
                          Ya, Teruskan
                        </button>
                        <label className="btn-secondary cursor-pointer">
                          Upload Semula
                          <input
                            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                            className="sr-only"
                            onChange={handleUpload}
                            type="file"
                          />
                        </label>
                      </div>
                    </div>
                  ) : null}
                  {scanState === "scanning" ? <ScanCard /> : null}
                  {message ? <Message text={message} /> : null}
                </Panel>

                {savedFormats.length > 0 ? (
                  <Panel title="Format Disimpan">
                    <div className="space-y-3">
                      {savedFormats.slice(0, 4).map((item) => (
                        <div
                          className="rounded-2xl border border-white/10 bg-black/20 p-3"
                          key={item.id}
                        >
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-xs text-[#aeb7c8]">
                            {item.fileName} - {item.fields.length} ruangan dikesan
                          </p>
                          <button
                            className="mini-button mt-3 min-h-0 rounded-full px-3 py-1.5 text-[0.65rem]"
                            onClick={() => selectSavedFormat(item)}
                            type="button"
                          >
                            Guna Format Ini
                          </button>
                        </div>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {scanState === "done" && fields.length > 0 ? (
                  <Panel title="4. Isi Maklumat">
                    <p className="mb-4 text-sm leading-6 text-[#aeb7c8]">
                      Isi ruangan di bawah. Untuk ayat seperti objektif, refleksi
                      atau rumusan, guna butang cadangan jika mahu cepat.
                    </p>
                    <div className="grid gap-4">
                      {fields.map((field) => (
                        <AnswerControl
                          field={field}
                          key={field}
                          onChange={updateValue}
                          outputFormat={outputFormat}
                          selectedProfile={selectedProfile}
                          value={values[field] || ""}
                        />
                      ))}
                    </div>
                    <button className="btn-primary mt-5" onClick={generateOutputFromAnswers}>
                      Masukkan Ke Dokumen
                    </button>
                  </Panel>
                ) : scanState === "done" ? (
                  <Panel title="4. Isi Maklumat">
                    <p className="text-sm leading-6 text-[#aeb7c8]">
                      Tiada ruangan jelas dikesan. Jika file DOCX, buka output
                      dan klik terus pada dokumen untuk menaip.
                    </p>
                  </Panel>
                ) : null}
              </div>

              <div className="space-y-6">
                <Panel title="Dokumen Output">
                  <div className="mb-5 flex flex-wrap gap-3">
                    {upload?.type === "DOCX" && showOutputFile ? (
                      <button className="btn-secondary" onClick={insertAiSuggestion}>
                        AI Cadangkan Ayat
                      </button>
                    ) : null}
                    <button className="btn-quiet" onClick={resetAll}>
                      Reset
                    </button>
                  </div>
                  {upload?.type === "DOCX" && showOutputFile ? (
                    <div className="mb-5 rounded-2xl border border-[#b9caff]/25 bg-[#7da1ff]/10 px-4 py-3 text-sm leading-6 text-[#d7e3ff]">
                      Boleh edit manual: klik pada teks dalam dokumen putih,
                      kemudian taip seperti editor dokumen.
                    </div>
                  ) : null}

                  {showOutputFile ? (
                    <DocumentPreview
                      applyValuesVersion={applyValuesVersion}
                      fields={fields}
                      formatName={formatName}
                      officeFile={officeFile}
                      upload={upload}
                      values={values}
                    />
                  ) : (
                    <HiddenOutputCard
                      formatName={formatName}
                      hasFields={fields.length > 0}
                      upload={upload}
                    />
                  )}
                </Panel>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DocumentPreview({
  applyValuesVersion,
  fields,
  formatName,
  officeFile,
  upload,
  values,
}: {
  applyValuesVersion: number;
  fields: string[];
  formatName: string;
  officeFile: File | null;
  upload: UploadState | null;
  values: Record<string, string>;
}) {
  if (!upload) {
    if (fields.length > 0) {
      return (
        <CleanDocumentPreview
          fields={fields}
          formatName={formatName}
          values={values}
        />
      );
    }

    return (
      <article className="rounded-[1.5rem] border border-[#ded8ce] bg-[#f8f4ed] p-6 text-[#171513] shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-sm leading-7 text-[#655f58]">
          Upload format file untuk lihat preview asal yang sama dengan file itu.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-6">
      <div className="mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden rounded-sm bg-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
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
          <OfficeDocumentPreview
            applyValuesVersion={applyValuesVersion}
            fields={fields}
            file={officeFile}
            upload={upload}
            values={values}
          />
        ) : null}
      </div>
    </article>
  );
}

function CleanDocumentPreview({
  fields,
  formatName,
  values,
}: {
  fields: string[];
  formatName: string;
  values: Record<string, string>;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-6">
      <div className="mx-auto aspect-[210/297] w-full max-w-[794px] overflow-auto rounded-sm bg-[#fbfaf6] p-8 text-[#171513] shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-10">
        <div className="border-b border-[#d9d2c7] pb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6d655c]">
            lY Docs
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-wide">
            {formatName || "Dokumen"}
          </h2>
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-[#d9d2c7]">
          {fields.map((field) => (
            <div
              className="grid border-b border-[#d9d2c7] last:border-b-0 sm:grid-cols-[0.36fr_0.64fr]"
              key={field}
            >
              <div className="bg-[#f0ece4] px-4 py-3 text-sm font-bold">
                {field}
              </div>
              <div className="min-h-12 px-4 py-3 text-sm leading-6">
                {values[field]?.trim() || "-"}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div>
            <div className="h-px bg-[#9d9488]" />
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6d655c]">
              Disediakan oleh
            </p>
          </div>
          <div>
            <div className="h-px bg-[#9d9488]" />
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6d655c]">
              Disahkan oleh
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function TemplateCard({
  onClick,
  template,
}: {
  onClick: () => void;
  template: BuiltInTemplate;
}) {
  return (
    <button
      className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition duration-300 hover:border-[#b9caff]/55 hover:bg-[#7da1ff]/10"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{template.name}</p>
          <p className="mt-1 text-xs text-[#b9caff]">
            {template.outputFormat} - {template.recommendedProfile}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#d7e3ff]">
          Pilih
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#aeb7c8]">
        {template.description}
      </p>
      <p className="mt-3 text-xs text-[#7f8aa0]">
        {template.fields.length} ruangan asas
      </p>
    </button>
  );
}

function WorkflowSteps({
  hasFields,
  hasUpload,
  isConfirmed,
  showOutputFile,
}: {
  hasFields: boolean;
  hasUpload: boolean;
  isConfirmed: boolean;
  showOutputFile: boolean;
}) {
  const steps = [
    {
      done: true,
      label: "Pilih peranan",
      note: "Guru, petugas, taska atau organisasi",
    },
    {
      done: hasUpload,
      label: "Upload format",
      note: "Guna format sebenar anda",
    },
    {
      done: hasFields,
      label: "Isi maklumat",
      note: "Kolum ikut format yang dikesan",
    },
    {
      done: showOutputFile && isConfirmed,
      label: "Jana dokumen",
      note: "Masuk terus ke format asal",
    },
  ];

  return (
    <div className="mb-8 grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => (
        <div
          className={`rounded-2xl border p-4 transition duration-300 ${
            step.done
              ? "border-[#b9caff]/45 bg-[#7da1ff]/12"
              : "border-white/10 bg-white/[0.045]"
          }`}
          key={step.label}
        >
          <div className="flex items-center gap-3">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                step.done
                  ? "bg-[#d7e3ff] text-[#050507]"
                  : "bg-white/[0.08] text-[#aeb7c8]"
              }`}
            >
              {index + 1}
            </span>
            <p className="font-semibold text-white">{step.label}</p>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#aeb7c8]">{step.note}</p>
        </div>
      ))}
    </div>
  );
}

function HiddenOutputCard({
  formatName,
  hasFields,
  upload,
}: {
  formatName: string;
  hasFields: boolean;
  upload: UploadState | null;
}) {
  const hasTemplate = Boolean(upload || hasFields);

  return (
    <article className="rounded-[1.5rem] border border-[#b9caff]/20 bg-[#7da1ff]/8 p-6 text-center shadow-[0_28px_100px_rgba(0,0,0,0.24)] sm:p-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xl text-[#d7e3ff]">
        OK
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-white">
        {hasTemplate ? "Terus isi maklumat" : "Belum ada template"}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#aeb7c8]">
        {hasTemplate
          ? `${formatName || "Template"} sudah sedia. Isi kolum yang muncul di sebelah kiri, kemudian klik Masukkan Ke Dokumen.`
          : "Pilih template siap atau upload format sendiri dahulu."}
      </p>
    </article>
  );
}

function AnswerControl({
  field,
  onChange,
  outputFormat,
  selectedProfile,
  value,
}: {
  field: string;
  onChange: (field: string, value: string) => void;
  outputFormat: OutputFormat;
  selectedProfile: UserProfile;
  value: string;
}) {
  const lower = field.toLowerCase();
  const isSelect =
    lower.includes("hari") ||
    lower.includes("status") ||
    lower.includes("kehadiran") ||
    lower.includes("format");
  const isLong =
    lower.includes("objektif") ||
    lower.includes("langkah") ||
    lower.includes("pemerhatian") ||
    lower.includes("refleksi") ||
    lower.includes("catatan") ||
    lower.includes("rumusan") ||
    lower.includes("aktiviti");

  if (isSelect) {
    const options = lower.includes("hari")
      ? ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"]
      : ["Ya", "Tidak", "Lengkap", "Tidak Lengkap"];
    return (
      <label className="grid gap-2 text-sm font-medium text-[#d8deea]">
        {field}
        <select
          className="input-field"
          onChange={(event) => onChange(field, event.target.value)}
          value={value}
        >
          <option value="">Pilih jawapan</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="grid gap-2 text-sm font-medium text-[#d8deea]">
      <span className="flex items-center justify-between gap-3">
        <span>{field}</span>
        {isLong ? (
          <button
            className="mini-button min-h-0 rounded-full px-3 py-1.5 text-[0.65rem]"
            onClick={() =>
              onChange(field, buildFieldSuggestion(field, selectedProfile, outputFormat))
            }
            type="button"
          >
            Cadang Ayat
          </button>
        ) : null}
      </span>
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
          type={lower.includes("tarikh") ? "date" : lower.includes("masa") ? "time" : "text"}
          value={value}
        />
      )}
    </label>
  );
}

function OfficeDocumentPreview({
  applyValuesVersion,
  fields,
  file,
  upload,
  values,
}: {
  applyValuesVersion: number;
  fields: string[];
  file: File | null;
  upload: UploadState;
  values: Record<string, string>;
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
      .then(() => {
        if (cancelled) return;
        container.contentEditable = "true";
        container.spellcheck = false;
        container.setAttribute("aria-label", "Editor output DOCX");
        container
          .querySelectorAll<HTMLElement>(".docx-wrapper section.docx")
          .forEach((section) => {
            section.contentEditable = "true";
            section.spellcheck = false;
            section.setAttribute("aria-label", "Edit output DOCX");
          });

        if (applyValuesVersion > 0) {
          applyValuesToDocument(container, fields, values);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRenderError("DOCX ini tidak dapat dirender. Cuba simpan semula sebagai DOCX moden.");
        }
      });

    return () => {
      cancelled = true;
      container.contentEditable = "false";
      container.innerHTML = "";
    };
  }, [applyValuesVersion, fields, file, immediateError, upload.name, upload.type, values]);

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

function applyValuesToDocument(
  container: HTMLElement,
  fields: string[],
  values: Record<string, string>,
) {
  const entries = fields
    .map((field) => [field, values[field]?.trim() || ""] as const)
    .filter(([, value]) => value.length > 0);

  entries.forEach(([field, value]) => {
    if (fillTableField(container, field, value)) return;
    fillInlineField(container, field, value);
  });
}

function fillTableField(container: HTMLElement, field: string, value: string) {
  const rows = Array.from(container.querySelectorAll("tr"));

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll<HTMLElement>("td, th"));
    const labelIndex = cells.findIndex((cell) =>
      textIncludesField(cell.textContent || "", field),
    );

    if (labelIndex === -1) continue;

    const targetCell = cells[labelIndex + 1];
    if (targetCell) {
      targetCell.textContent = value;
      targetCell.dataset.lyFilled = "true";
      return true;
    }

    appendValueInside(cells[labelIndex], value);
    return true;
  }

  return false;
}

function fillInlineField(container: HTMLElement, field: string, value: string) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    const text = current.textContent || "";
    const parent = current.parentElement;

    if (
      parent &&
      textIncludesField(text, field) &&
      !parent.closest("[data-ly-filled='true']") &&
      !(parent.textContent || "").includes(value)
    ) {
      appendValueInside(parent, value);
      return true;
    }

    current = walker.nextNode();
  }

  return false;
}

function appendValueInside(element: HTMLElement, value: string) {
  const separator = (element.textContent || "").trim().endsWith(":") ? " " : " : ";
  const valueNode = document.createElement("span");
  valueNode.dataset.lyFilled = "true";
  valueNode.textContent = `${separator}${value}`;
  element.appendChild(valueNode);
}

function textIncludesField(text: string, field: string) {
  return normalizeText(text).includes(normalizeText(field));
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    ["NAMA PPDK", ["nama ppdk"]],
    ["Nama Guru / Petugas", ["nama guru", "nama petugas", "nama pendidik", "disediakan oleh"]],
    ["Kad Pengenalan", ["kad pengenalan"]],
    ["Nama Murid / Pelatih", ["nama murid", "nama pelatih", "nama kanak", "nama klien"]],
    ["Tarikh", ["tarikh"]],
    ["Hari", ["hari"]],
    ["Masa", ["masa"]],
    ["Umur", ["umur"]],
    ["Bil. Kanak-kanak", ["bil. kanak-kanak", "bil kanak-kanak", "bilangan kanak"]],
    ["Tema", ["tema"]],
    ["Tempat", ["tempat", "lokasi"]],
    ["Mata Pelajaran", ["mata pelajaran", "subjek"]],
    ["Kelas", ["kelas", "tahun"]],
    ["Tajuk Aktiviti", ["tajuk", "aktiviti", "tema"]],
    ["Objektif", ["objektif", "hasil pembelajaran"]],
    ["Pengetahuan Sedia Ada", ["pengetahuan sedia ada"]],
    ["Bahan / Alat", ["bahan", "alat", "bbm", "bantu mengajar"]],
    ["Senarai Bahan/Alat", ["senarai bahan", "senarai bahan/alat"]],
    ["Tempat / Ruang Aktiviti", ["tempat /", "ruang aktiviti"]],
    ["Langkah Pelaksanaan", ["langkah", "pelaksanaan", "aktiviti pdp", "prosedur"]],
    ["Langkah-langkah Pelaksanaan", ["langkah-langkah"]],
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

function buildAiSuggestion(
  selectedProfile: UserProfile,
  outputFormat: OutputFormat,
) {
  if (outputFormat === "RPA") {
    return "Pelatih dapat mengikuti aktiviti dengan bimbingan dan galakan daripada petugas. Pelatih menunjukkan minat, memberi respons terhadap arahan mudah serta melaksanakan tugasan mengikut tahap keupayaan masing-masing.";
  }

  if (outputFormat === "RPH") {
    return "Murid dapat mengikuti sesi pembelajaran dengan baik melalui penerangan guru, aktiviti berpandu dan latihan pengukuhan. Objektif pembelajaran dicapai secara berperingkat mengikut tahap penguasaan murid.";
  }

  if (outputFormat === "RPI") {
    return "Intervensi dilaksanakan secara berfokus berdasarkan keperluan individu. Murid/klien menunjukkan perkembangan positif dan masih memerlukan bimbingan berterusan untuk mengukuhkan kemahiran yang disasarkan.";
  }

  if (outputFormat.includes("Laporan")) {
    return "Program telah dilaksanakan dengan lancar dan mencapai objektif yang ditetapkan. Peserta memberi kerjasama yang baik sepanjang aktiviti, manakala penambahbaikan boleh dibuat dari aspek susun atur masa, bahan dan pemantauan.";
  }

  if (outputFormat === "Minit Mesyuarat") {
    return "Mesyuarat bersetuju supaya tindakan susulan dilaksanakan oleh pihak berkaitan mengikut tempoh yang ditetapkan. Perkembangan tindakan akan dibentangkan semula dalam mesyuarat berikutnya.";
  }

  if (outputFormat === "Memo") {
    return "Perkara ini perlu diberi perhatian dan dilaksanakan mengikut ketetapan organisasi. Kerjasama semua pihak amat dihargai bagi memastikan urusan berjalan lancar dan teratur.";
  }

  return `${selectedProfile} boleh menggunakan cadangan ini sebagai ayat profesional: Dokumen ini disediakan berdasarkan maklumat semasa, keperluan organisasi dan tujuan pelaksanaan yang telah dikenal pasti.`;
}

function buildFieldSuggestion(
  field: string,
  selectedProfile: UserProfile,
  outputFormat: OutputFormat,
) {
  const lower = field.toLowerCase();

  if (lower.includes("objektif")) {
    if (outputFormat === "RPH") {
      return "Murid dapat memahami isi pembelajaran, melibatkan diri dalam aktiviti PdP, dan menyelesaikan tugasan mengikut tahap penguasaan masing-masing.";
    }

    if (outputFormat === "RPA") {
      return "Peserta dapat mengikuti aktiviti yang dirancang, memberi respons terhadap arahan mudah, dan menunjukkan perkembangan mengikut tahap keupayaan masing-masing.";
    }

    return "Dokumen ini disediakan bagi memastikan aktiviti, tindakan dan hasil kerja dapat dilaksanakan secara tersusun, jelas dan profesional.";
  }

  if (lower.includes("langkah") || lower.includes("ringkasan")) {
    return "Aktiviti dimulakan dengan penerangan ringkas, diikuti pelaksanaan secara berpandu, pemerhatian terhadap respons peserta, dan penutup melalui rumusan serta maklum balas.";
  }

  if (lower.includes("pemerhatian")) {
    return "Peserta menunjukkan minat dan kerjasama yang baik sepanjang aktiviti. Bimbingan diberikan mengikut keperluan bagi memastikan penglibatan yang lebih menyeluruh.";
  }

  if (lower.includes("refleksi") || lower.includes("rumusan")) {
    return "Secara keseluruhan, aktiviti berjalan lancar dan mencapai tujuan yang dirancang. Penambahbaikan boleh dibuat dari aspek masa, bahan dan bimbingan individu pada sesi seterusnya.";
  }

  if (lower.includes("catatan")) {
    return "Perkara ini direkodkan untuk tindakan susulan dan rujukan pihak berkaitan.";
  }

  return buildAiSuggestion(selectedProfile, outputFormat);
}
