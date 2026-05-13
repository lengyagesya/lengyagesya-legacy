"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type UploadState = {
  name: string;
  type: string;
  kind: "image" | "pdf" | "office";
  previewUrl?: string;
  status: "Template Aktif";
};

type LayoutStyle = "Format Ringkas" | "Format Jadual";
type PageCount = "1 Page" | "2 Pages";
type ScanState = "idle" | "scanning" | "done";
type DetectedType = "RPA" | "RPH" | "RPI" | "General Template";
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

type SavedState = {
  detectedType: DetectedType;
  editableOutput: string;
  fields: string[];
  pageCount: PageCount;
  layoutStyle: LayoutStyle;
  selectedProfile: UserProfile;
  upload: UploadState | null;
  values: Record<string, string>;
};

const storageKey = "ly-docs-upload-first-state";
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
const defaultDetectedFields = [
  "Nama Organisasi",
  "Nama Guru / Petugas",
  "Nama Murid / Pelatih",
  "Tarikh",
  "Tajuk Aktiviti",
  "Objektif",
  "Bahan / Alat",
  "Langkah Pelaksanaan",
  "Pemerhatian",
  "Refleksi",
  "Catatan",
  "Standard Kandungan",
  "Standard Pembelajaran",
  "Tandatangan",
];

const longFieldHints = [
  "Objektif",
  "Bahan",
  "Langkah",
  "Pemerhatian",
  "Refleksi",
  "Standard",
  "Catatan",
  "Rumusan",
];

export default function Home() {
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [detectedType, setDetectedType] = useState<DetectedType>("General Template");
  const [fields, setFields] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("Format Ringkas");
  const [pageCount, setPageCount] = useState<PageCount>("1 Page");
  const [message, setMessage] = useState("");
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [editableOutput, setEditableOutput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [officeFile, setOfficeFile] = useState<File | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>("Petugas PPDK");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as SavedState;
          setUpload(parsed.upload);
          setDetectedType(parsed.detectedType || "General Template");
          setEditableOutput(parsed.editableOutput || "");
          setFields(parsed.fields || []);
          setValues(parsed.values || {});
          setLayoutStyle(parsed.layoutStyle || "Format Ringkas");
          setPageCount(parsed.pageCount || "1 Page");
          setSelectedProfile(parsed.selectedProfile || "Petugas PPDK");
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
      detectedType,
      editableOutput,
      fields,
      layoutStyle,
      pageCount,
      selectedProfile,
      upload,
      values,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [detectedType, editableOutput, fields, hydrated, layoutStyle, pageCount, selectedProfile, upload, values]);

  function startScan(nextUpload: UploadState, extractedText = "") {
    setUpload(nextUpload);
    setDetectedType("General Template");
    setFields([]);
    setValues({});
    setEditableOutput("");
    setPreviewGenerated(false);
    setScanState("scanning");
    setMessage("Membuka fail asal...");

    window.setTimeout(() => {
      const result = detectDocument(
        nextUpload.name,
        nextUpload.type,
        extractedText,
        selectedProfile,
      );
      setDetectedType(result.type);
      setFields(result.fields);
      setEditableOutput("");
      setPreviewGenerated(true);
      setScanState("done");
      setMessage("Fail telah dibuka. Medan penting telah dikesan untuk diisi oleh user.");
    }, 1350);
  }

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
    setOfficeFile(extension === "doc" || extension === "docx" ? file : null);
    const extractedText = extension === "docx" ? await extractDocxText(file) : "";

    startScan({
      kind:
        extension === "png" || extension === "jpg" || extension === "jpeg"
          ? "image"
          : extension === "pdf"
            ? "pdf"
            : "office",
      name: file.name,
      previewUrl,
      status: "Template Aktif",
      type,
    }, extractedText);
  }

  function updateFieldName(index: number, nextName: string) {
    setFields((current) => {
      const previousName = current[index];
      const next = [...current];
      next[index] = nextName;
      setValues((currentValues) => {
        const nextValues = { ...currentValues };
        if (previousName && previousName !== nextName) {
          nextValues[nextName] = nextValues[previousName] || "";
          delete nextValues[previousName];
        }
        return nextValues;
      });
      return next;
    });
  }

  function removeField(field: string) {
    setFields((current) => current.filter((item) => item !== field));
    setValues((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function moveField(index: number, direction: -1 | 1) {
    setFields((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addField() {
    let count = 1;
    let nextField = "Medan Custom";
    while (fields.includes(nextField)) {
      count += 1;
      nextField = `Medan Custom ${count}`;
    }
    setFields((current) => [...current, nextField]);
  }

  function updateValue(field: string, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function generatePreview() {
    setPreviewGenerated(true);
    setMessage("Maklumat telah dihantar ke output dan disusun ikut medan yang dikesan.");
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(
        buildFilledText(selectedProfile, detectedType, fields, values),
      );
      setMessage("Maklumat output telah disalin.");
    } catch {
      setMessage("Teks tidak dapat disalin pada pelayar ini.");
    }
  }

  function showExportAlert() {
    window.alert("Fungsi export akan diaktifkan dalam fasa seterusnya.");
  }

  function resetAll() {
    setUpload(null);
    setScanState("idle");
    setDetectedType("General Template");
    setFields([]);
    setValues({});
    setEditableOutput("");
    setOfficeFile(null);
    setSelectedProfile("Petugas PPDK");
    setLayoutStyle("Format Ringkas");
    setPageCount("1 Page");
    setPreviewGenerated(false);
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
              Upload-first document intelligence
            </span>
          </div>
        </header>

        <section className="px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#b9caff]">
              Workspace
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
              Upload template dahulu.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#aeb7c8]">
              Jadikan format asal sebagai titik mula. lY Docs akan mensimulasikan
              pengesanan struktur, membina medan, dan menyediakan preview
              dokumen profesional.
            </p>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.86fr_1.14fr]">
            <div className="space-y-6">
              <Panel title="Pilih Profil User">
                <p className="mb-4 text-sm leading-6 text-[#aeb7c8]">
                  Pilih siapa yang akan guna format ini supaya medan yang dikesan
                  lebih sesuai dengan kerja sebenar.
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

              <Panel title="Upload Template">
                <label className="group flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#b9caff]/35 bg-[#7da1ff]/8 px-6 py-10 text-center shadow-[0_28px_120px_rgba(71,102,180,0.14)] transition duration-500 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/12">
                  <span className="grid h-20 w-20 place-items-center rounded-[1.5rem] border border-white/10 bg-white/[0.07] text-4xl text-[#d7e3ff] transition group-hover:scale-105">
                    &uarr;
                  </span>
                  <span className="mt-7 text-3xl font-semibold tracking-[-0.02em] text-white">
                    Upload format dokumen anda
                  </span>
                  <span className="mt-3 max-w-lg text-sm leading-6 text-[#aeb7c8]">
                    Sistem akan mengesan struktur dan medan utama secara
                    automatik.
                  </span>
                  <span className="mt-6 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b9caff]">
                    PNG / JPG / PDF / DOC / DOCX
                  </span>
                  <input
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                    className="sr-only"
                    onChange={handleUpload}
                    type="file"
                  />
                </label>

                {upload ? <TemplatePreview upload={upload} /> : null}
                {scanState === "scanning" ? <ScanCard /> : null}
                {message ? (
                  <p className="mt-5 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 px-4 py-3 text-sm text-[#d7e3ff]">
                    {message}
                  </p>
                ) : null}
                {scanState === "done" && upload ? (
                  <div className="mt-5 rounded-2xl border border-[#b9caff]/20 bg-white/[0.045] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d98ad]">
                      Fail Asal Aktif
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {upload.type}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                      Profil: {selectedProfile}. Sistem memilih medan yang
                      perlu diisi berdasarkan format dan jenis user.
                    </p>
                  </div>
                ) : null}
              </Panel>

              {fields.length > 0 ? (
                <Panel title="Medan yang dikesan">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#aeb7c8]">
                      Edit, buang atau susun semula medan sebelum mengisi borang.
                    </p>
                    <button className="btn-secondary" onClick={addField}>
                      Tambah Medan
                    </button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_auto]"
                        key={`${field}-${index}`}
                      >
                        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8d98ad]">
                          Edit Nama Medan
                          <input
                            className="input-field"
                            onChange={(event) =>
                              updateFieldName(index, event.target.value)
                            }
                            value={field}
                          />
                        </label>
                        <div className="flex gap-2 sm:items-end">
                          <button
                            className="mini-button"
                            disabled={index === 0}
                            onClick={() => moveField(index, -1)}
                            type="button"
                          >
                            Atas
                          </button>
                          <button
                            className="mini-button"
                            disabled={index === fields.length - 1}
                            onClick={() => moveField(index, 1)}
                            type="button"
                          >
                            Bawah
                          </button>
                          <button
                            className="mini-button-danger"
                            onClick={() => removeField(field)}
                            type="button"
                          >
                            Buang
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              ) : null}

              {fields.length > 0 ? (
                <Panel title="Isi Maklumat">
                  <div className="grid gap-4">
                    {fields.map((field) => (
                      <Field key={field} label={field}>
                        {inputTypeForField(field) === "textarea" ? (
                          <textarea
                            className="input-field min-h-28 resize-none"
                            onChange={(event) => updateValue(field, event.target.value)}
                            placeholder={`Masukkan ${field.toLowerCase()}`}
                            value={values[field] || ""}
                          />
                        ) : (
                          <input
                            className="input-field"
                            onChange={(event) => updateValue(field, event.target.value)}
                            placeholder={`Masukkan ${field.toLowerCase()}`}
                            type={inputTypeForField(field)}
                            value={values[field] || ""}
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                </Panel>
              ) : null}
            </div>

            <div className="space-y-6">
              <Panel title="Layout Options">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["Format Ringkas", "Format Jadual"] as LayoutStyle[]).map(
                    (item) => (
                      <Choice
                        active={layoutStyle === item}
                        key={item}
                        label={item}
                        onClick={() => setLayoutStyle(item)}
                      />
                    ),
                  )}
                  {(["1 Page", "2 Pages"] as PageCount[]).map((item) => (
                    <Choice
                      active={pageCount === item}
                      key={item}
                      label={item}
                      onClick={() => setPageCount(item)}
                    />
                  ))}
                </div>
              </Panel>

              <Panel title="Preview & Export">
                <div className="mb-5 flex flex-wrap gap-3">
                  <button className="btn-primary" onClick={generatePreview}>
                    Hantar Ke Output
                  </button>
                  <button className="btn-secondary" onClick={copyText}>
                    Copy Text
                  </button>
                  <button className="btn-secondary" onClick={showExportAlert}>
                    Download Word
                  </button>
                  <button className="btn-secondary" onClick={showExportAlert}>
                    Download PDF
                  </button>
                  <button className="btn-quiet" onClick={resetAll}>
                    Reset
                  </button>
                </div>

                <DocumentPreview
                  officeFile={officeFile}
                  previewGenerated={previewGenerated}
                  upload={upload}
                />

                {previewGenerated && fields.length > 0 ? (
                  <FilledOutputSheet
                    detectedType={detectedType}
                    fields={fields}
                    layoutStyle={layoutStyle}
                    pageCount={pageCount}
                    selectedProfile={selectedProfile}
                    values={values}
                  />
                ) : null}
              </Panel>
            </div>
          </div>
        </section>
      </div>
    </main>
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

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#d8deea]">
      {label}
      {children}
    </label>
  );
}

function TemplatePreview({ upload }: { upload: UploadState }) {
  return (
    <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{upload.name}</p>
          <p className="mt-1 text-sm text-[#aeb7c8]">Jenis fail: {upload.type}</p>
          <p className="mt-1 text-sm text-[#d7e3ff]">Status: {upload.status}</p>
        </div>
        <span className="rounded-full bg-[#dce7ff] px-4 py-2 text-xs font-semibold text-[#28447d]">
          Template Aktif
        </span>
      </div>
      {upload.kind === "image" && upload.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Preview template"
          className="mt-5 max-h-80 w-full rounded-2xl object-contain"
          src={upload.previewUrl}
        />
      ) : upload.kind === "pdf" && upload.previewUrl ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white">
          <object
            className="h-80 w-full"
            data={upload.previewUrl}
            title="Preview PDF asal"
            type="application/pdf"
          />
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-sm text-[#c8d0df]">
          Fail asal telah dimuat naik. Jika browser menyokong format ini,
          kandungan akan dibuka terus dalam output A4 tanpa teks tambahan.
        </div>
      )}
    </div>
  );
}

function ScanCard() {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-[1.25rem] border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4 text-[#d7e3ff]">
      <span className="scan-dot h-3 w-3 rounded-full bg-[#d7e3ff]" />
      <span className="text-sm font-medium">Membuka dan menyediakan fail asal...</span>
    </div>
  );
}

function DocumentPreview({
  officeFile,
  previewGenerated,
  upload,
}: {
  officeFile: File | null;
  previewGenerated: boolean;
  upload: UploadState | null;
}) {
  if (!previewGenerated) {
    return (
      <article className="rounded-[1.5rem] border border-[#ded8ce] bg-[#f8f4ed] p-6 text-[#171513] shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-sm leading-7 text-[#655f58]">
          Upload fail, kemudian sistem akan memaparkannya sebagai output A4
          tanpa menambah teks pada dokumen asal.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-6">
      <div className="mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden rounded-sm bg-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        {upload?.kind === "image" && upload.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Output A4 berdasarkan fail upload"
            className="h-full w-full object-contain"
            src={upload.previewUrl}
          />
        ) : null}

        {upload?.kind === "pdf" && upload.previewUrl ? (
          <object
            className="h-full w-full"
            data={upload.previewUrl}
            title="Output A4 PDF"
            type="application/pdf"
          />
        ) : null}

        {upload?.kind === "office" && upload.previewUrl ? (
          <OfficeDocumentPreview file={officeFile} upload={upload} />
        ) : null}

        {upload && !upload.previewUrl ? (
          <div className="flex h-full items-center justify-center p-10 text-center text-[#171513]">
            <div>
              <p className="text-2xl font-semibold">{upload.name}</p>
              <p className="mt-3 text-sm text-[#655f58]">
                Fail asal perlu diupload semula untuk dibuka dalam preview A4.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function FilledOutputSheet({
  detectedType,
  fields,
  layoutStyle,
  pageCount,
  selectedProfile,
  values,
}: {
  detectedType: DetectedType;
  fields: string[];
  layoutStyle: LayoutStyle;
  pageCount: PageCount;
  selectedProfile: UserProfile;
  values: Record<string, string>;
}) {
  const visibleFields =
    pageCount === "2 Pages" ? splitForPage(fields, 0) : fields;
  const secondFields = pageCount === "2 Pages" ? splitForPage(fields, 1) : [];

  return (
    <div className="mt-6 space-y-5">
      <OutputPage
        detectedType={detectedType}
        fields={visibleFields}
        layoutStyle={layoutStyle}
        pageLabel={pageCount === "2 Pages" ? "Halaman 1" : "Output Maklumat"}
        selectedProfile={selectedProfile}
        values={values}
      />
      {secondFields.length > 0 ? (
        <OutputPage
          detectedType={detectedType}
          fields={secondFields}
          layoutStyle={layoutStyle}
          pageLabel="Halaman 2"
          selectedProfile={selectedProfile}
          values={values}
        />
      ) : null}
    </div>
  );
}

function OutputPage({
  detectedType,
  fields,
  layoutStyle,
  pageLabel,
  selectedProfile,
  values,
}: {
  detectedType: DetectedType;
  fields: string[];
  layoutStyle: LayoutStyle;
  pageLabel: string;
  selectedProfile: UserProfile;
  values: Record<string, string>;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[#ded8ce] bg-[#f8f4ed] p-6 text-[#171513] shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-8">
      <div className="border-b border-[#ded8ce] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f7f9f]">
          {pageLabel}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          Maklumat Diisi
        </h3>
        <p className="mt-2 text-sm text-[#655f58]">
          Profil: {selectedProfile} · Jenis dikesan: {detectedType}
        </p>
      </div>

      {layoutStyle === "Format Jadual" ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#cfc6b8]">
          {fields.map((field) => (
            <div
              className="grid border-b border-[#cfc6b8] last:border-b-0 sm:grid-cols-[0.35fr_0.65fr]"
              key={field}
            >
              <div className="bg-[#e8dfd1] p-4 text-sm font-semibold text-[#27231f]">
                {field}
              </div>
              <div className="min-h-14 bg-[#fbf7f0] p-4 text-sm leading-6 text-[#332f2a]">
                {fieldValue(values, field)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {fields.map((field) => (
            <section key={field}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f7f9f]">
                {field}
              </h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#332f2a]">
                {fieldValue(values, field)}
              </p>
            </section>
          ))}
        </div>
      )}
    </article>
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

function detectDocument(
  fileName: string,
  fileType: string,
  extractedText = "",
  selectedProfile: UserProfile = "Petugas PPDK",
) {
  const lowerName = fileName.toLowerCase();
  const lowerText = `${lowerName} ${extractedText.toLowerCase()}`;
  const scannedFields = detectFieldsFromText(lowerText, selectedProfile);

  if (lowerName.includes("rpa")) {
    return {
      fields: mergeFields([
        "Nama Organisasi",
        "Nama Guru / Petugas",
        "Nama Murid / Pelatih",
        "Tarikh",
        "Tajuk Aktiviti",
        "Objektif",
        "Bahan / Alat",
        "Langkah Pelaksanaan",
        "Pemerhatian",
        "Refleksi",
        "Tandatangan",
      ], scannedFields),
      type: "RPA" as DetectedType,
    };
  }

  if (lowerText.includes("rph") || lowerText.includes("lesson") || lowerText.includes("pengajaran")) {
    return {
      fields: mergeFields([
        "Nama Organisasi",
        "Nama Guru / Petugas",
        "Mata Pelajaran",
        "Kelas",
        "Tarikh",
        "Tajuk Aktiviti",
        "Standard Kandungan",
        "Standard Pembelajaran",
        "Objektif",
        "Aktiviti PdP",
        "Refleksi",
        "Tandatangan",
      ], scannedFields),
      type: "RPH" as DetectedType,
    };
  }

  if (lowerText.includes("rpi") || lowerText.includes("individu")) {
    return {
      fields: mergeFields([
        "Nama Organisasi",
        "Nama Murid / Pelatih",
        "Kategori / Keperluan",
        "Matlamat",
        "Objektif Jangka Pendek",
        "Intervensi",
        "Penilaian",
        "Catatan",
        "Tandatangan",
      ], scannedFields),
      type: "RPI" as DetectedType,
    };
  }

  if (lowerText.includes("laporan") || lowerText.includes("report")) {
    return {
      fields: mergeFields([
        "Nama Organisasi",
        "Nama Guru / Petugas",
        "Tarikh",
        "Tajuk Aktiviti",
        "Objektif",
        "Langkah Pelaksanaan",
        "Pemerhatian",
        "Refleksi",
        "Tandatangan",
      ], scannedFields),
      type: "General Template" as DetectedType,
    };
  }

  if (fileType === "DOC" || fileType === "DOCX") {
    return {
      fields: scannedFields.length
        ? scannedFields
        : mergeFields(profileFields(selectedProfile), defaultDetectedFields),
      type: "General Template" as DetectedType,
    };
  }

  return {
    fields: scannedFields.length
      ? scannedFields
      : mergeFields(profileFields(selectedProfile), defaultDetectedFields.slice(0, 11)),
    type: "General Template" as DetectedType,
  };
}

function inputTypeForField(field: string) {
  const lower = field.toLowerCase();
  if (lower.includes("tarikh")) return "date";
  if (lower.includes("masa")) return "time";
  if (longFieldHints.some((hint) => field.includes(hint))) return "textarea";
  return "text";
}

function detectFieldsFromText(text: string, selectedProfile: UserProfile) {
  const detected = profileFields(selectedProfile);
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
  ];

  candidates.forEach(([field, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      detected.push(field);
    }
  });

  return mergeFields(detected, []);
}

function profileFields(selectedProfile: UserProfile) {
  if (selectedProfile === "Guru Sekolah" || selectedProfile === "Guru Pendidikan Khas") {
    return ["Nama Sekolah", "Nama Guru", "Mata Pelajaran", "Kelas"];
  }

  if (selectedProfile === "Pendidik Taska" || selectedProfile === "Guru Tadika") {
    return ["Nama Organisasi", "Nama Pendidik", "Nama Kanak-kanak"];
  }

  if (selectedProfile === "Terapis") {
    return ["Nama Pusat Terapi", "Nama Terapis", "Nama Klien"];
  }

  if (selectedProfile === "Penyelaras Program") {
    return ["Nama Organisasi", "Nama Penyelaras", "Nama Program"];
  }

  if (selectedProfile === "Admin Organisasi") {
    return ["Nama Organisasi", "Nama Admin", "Jawatan"];
  }

  return ["Nama Organisasi", "Nama Petugas", "Nama Pelatih"];
}

function mergeFields(primary: string[], secondary: string[]) {
  return Array.from(new Set([...primary, ...secondary])).slice(0, 18);
}

function fieldValue(values: Record<string, string>, field: string) {
  return values[field]?.trim() || "Belum diisi";
}

function splitForPage(fields: string[], index: 0 | 1) {
  const midpoint = Math.ceil(fields.length / 2);
  return index === 0 ? fields.slice(0, midpoint) : fields.slice(midpoint);
}

function buildFilledText(
  selectedProfile: UserProfile,
  detectedType: DetectedType,
  fields: string[],
  values: Record<string, string>,
) {
  return [
    `Profil: ${selectedProfile}`,
    `Jenis dikesan: ${detectedType}`,
    "",
    ...fields.map((field) => `${field}: ${fieldValue(values, field)}`),
  ].join("\n");
}
