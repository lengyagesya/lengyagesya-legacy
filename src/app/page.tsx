"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type UploadState = {
  name: string;
  type: string;
  kind: "image" | "file";
  previewUrl?: string;
  status: "Template Aktif";
};

type LayoutStyle = "Format Ringkas" | "Format Jadual";
type PageCount = "1 Page" | "2 Pages";
type ScanState = "idle" | "scanning" | "done";
type DetectedType = "RPA" | "RPH" | "RPI" | "General Template";

type SavedState = {
  detectedType: DetectedType;
  editableOutput: string;
  fields: string[];
  pageCount: PageCount;
  layoutStyle: LayoutStyle;
  upload: UploadState | null;
  values: Record<string, string>;
};

const storageKey = "ly-docs-upload-first-state";
const allowedExtensions = ["png", "jpg", "jpeg", "pdf", "doc", "docx"];
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

  const previewText = useMemo(
    () => buildPreview(detectedType, fields, values, layoutStyle, pageCount, Boolean(upload), upload),
    [detectedType, fields, layoutStyle, pageCount, upload, values],
  );

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
      upload,
      values,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [detectedType, editableOutput, fields, hydrated, layoutStyle, pageCount, upload, values]);

  function startScan(nextUpload: UploadState) {
    setUpload(nextUpload);
    setDetectedType("General Template");
    setFields([]);
    setValues({});
    setEditableOutput("");
    setPreviewGenerated(false);
    setScanState("scanning");
    setMessage("Menganalisis struktur dokumen...");

    window.setTimeout(() => {
      const result = detectDocument(nextUpload.name, nextUpload.type);
      const nextOutput = buildPreview(
        result.type,
        result.fields,
        {},
        layoutStyle,
        pageCount,
        true,
        nextUpload,
      );
      setDetectedType(result.type);
      setFields(result.fields);
      setEditableOutput(nextOutput);
      setPreviewGenerated(true);
      setScanState("done");
      setMessage(`Jenis dokumen dikesan: ${result.type}. Output awal telah dijana dan boleh diedit.`);
    }, 1350);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
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

    if (extension === "png" || extension === "jpg" || extension === "jpeg") {
      const reader = new FileReader();
      reader.onload = () => {
        startScan({
          kind: "image",
          name: file.name,
          previewUrl: String(reader.result),
          status: "Template Aktif",
          type,
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    startScan({
      kind: "file",
      name: file.name,
      status: "Template Aktif",
      type,
    });
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
    setEditableOutput(previewText);
    setPreviewGenerated(true);
    setMessage("Preview dokumen telah dijana.");
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(editableOutput || previewText);
      setMessage("Teks preview telah disalin.");
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
                      Detected Document Type
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {detectedType}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                      Template yang dimuat naik digunakan sebagai rujukan format
                      sahaja. Struktur preview dijana melalui simulasi frontend.
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
                    Jana Preview
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
                  detectedType={detectedType}
                  fields={fields}
                  hasTemplate={Boolean(upload)}
                  editableOutput={editableOutput}
                  layoutStyle={layoutStyle}
                  pageCount={pageCount}
                  previewGenerated={previewGenerated}
                  setEditableOutput={setEditableOutput}
                  upload={upload}
                  values={values}
                />
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
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-sm text-[#c8d0df]">
          Fail template telah dimuat naik sebagai rujukan format. Kandungan
          sebenar akan diproses dalam fasa seterusnya.
        </div>
      )}
    </div>
  );
}

function ScanCard() {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-[1.25rem] border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4 text-[#d7e3ff]">
      <span className="scan-dot h-3 w-3 rounded-full bg-[#d7e3ff]" />
      <span className="text-sm font-medium">Menganalisis struktur dokumen...</span>
    </div>
  );
}

function DocumentPreview({
  detectedType,
  editableOutput,
  fields,
  hasTemplate,
  layoutStyle,
  pageCount,
  previewGenerated,
  setEditableOutput,
  upload,
  values,
}: {
  detectedType: DetectedType;
  editableOutput: string;
  fields: string[];
  hasTemplate: boolean;
  layoutStyle: LayoutStyle;
  pageCount: PageCount;
  previewGenerated: boolean;
  setEditableOutput: (value: string) => void;
  upload: UploadState | null;
  values: Record<string, string>;
}) {
  if (!previewGenerated) {
    return (
      <article className="rounded-[1.5rem] border border-[#ded8ce] bg-[#f8f4ed] p-6 text-[#171513] shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-sm leading-7 text-[#655f58]">
          Upload template, semak medan yang dikesan, isi maklumat dan tekan
          Jana Preview untuk menghasilkan dokumen.
        </p>
      </article>
    );
  }

  const outputText =
    editableOutput ||
    buildPreview(detectedType, fields, values, layoutStyle, pageCount, hasTemplate, upload);
  const pages = pageCount === "2 Pages" ? splitEditableOutput(outputText) : [outputText];
  const visiblePages =
    pageCount === "2 Pages" ? pages : [outputText];

  return (
    <div className="space-y-6">
      {visiblePages.map((page, index) => (
        <article
          className="rounded-[1.5rem] border border-[#ded8ce] bg-[#f8f4ed] p-6 text-[#171513] shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-8"
          key={`${pageCount}-${index}`}
        >
          <div className="flex flex-col gap-4 border-b border-[#ded8ce] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6f7f9f]">
                {pageCount === "2 Pages" ? `Halaman ${index + 1}` : "Preview"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {previewTitle(detectedType, values)}
              </h1>
              <p className="mt-2 text-sm text-[#655f58]">
                Jenis dikesan: {detectedType}
              </p>
            </div>
            {hasTemplate ? (
              <span className="rounded-full bg-[#dce7ff] px-4 py-2 text-xs font-semibold text-[#28447d]">
                Template Aktif
              </span>
            ) : null}
          </div>

          {layoutStyle === "Format Jadual" ? (
            <>
              <DocumentTable
                detectedType={detectedType}
                fields={fields}
                pageIndex={index}
                pageCount={pageCount}
                values={values}
              />
              <label className="mt-7 grid gap-3 text-sm font-semibold text-[#2c2925]">
                Edit Output
                <textarea
                  className="min-h-56 resize-y rounded-2xl border border-[#cfc6b8] bg-[#fffdf8] p-4 font-sans text-sm font-normal leading-7 text-[#2c2925] outline-none focus:border-[#6f7f9f]"
                  onChange={(event) => setEditableOutput(event.target.value)}
                  value={outputText}
                />
              </label>
            </>
          ) : (
            <label className="mt-7 grid gap-3 text-sm font-semibold text-[#2c2925]">
              Edit Output
              <textarea
                className="min-h-[32rem] resize-y rounded-2xl border border-[#cfc6b8] bg-[#fffdf8] p-4 font-sans text-sm font-normal leading-7 text-[#2c2925] outline-none focus:border-[#6f7f9f] sm:text-[15px]"
                onChange={(event) => {
                  if (pageCount === "2 Pages") {
                    const nextPages = [...visiblePages];
                    nextPages[index] = event.target.value;
                    setEditableOutput(nextPages.join("\n\n--- HALAMAN SETERUSNYA ---\n\n"));
                    return;
                  }
                  setEditableOutput(event.target.value);
                }}
                value={page}
              />
            </label>
          )}

          <div className="mt-10 grid gap-2 text-sm text-[#2c2925]">
            <span>Disediakan oleh,</span>
            <span className="mt-8 border-t border-[#8d857b] pt-2">
              {value(values, "Tandatangan", "Tandatangan")}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function DocumentTable({
  detectedType,
  fields,
  pageCount,
  pageIndex,
  values,
}: {
  detectedType: DetectedType;
  fields: string[];
  pageCount: PageCount;
  pageIndex: number;
  values: Record<string, string>;
}) {
  const rows = tableRowsForType(detectedType, fields, values);
  const visibleRows =
    pageCount === "2 Pages"
      ? rows.filter((row) => row.page === pageIndex + 1)
      : rows;

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-[#cfc6b8]">
      {visibleRows.map((row) => (
        <div
          className="grid border-b border-[#cfc6b8] last:border-b-0 sm:grid-cols-[0.34fr_0.66fr]"
          key={`${row.label}-${row.page}`}
        >
          <div className="bg-[#e8dfd1] p-4 text-sm font-semibold text-[#27231f]">
            {row.label}
          </div>
          <div className="min-h-14 bg-[#fbf7f0] p-4 text-sm leading-6 text-[#332f2a]">
            {row.content}
          </div>
        </div>
      ))}
    </div>
  );
}

function detectDocument(fileName: string, fileType: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes("rpa")) {
    return {
      fields: [
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
      ],
      type: "RPA" as DetectedType,
    };
  }

  if (lowerName.includes("rph") || lowerName.includes("lesson")) {
    return {
      fields: [
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
      ],
      type: "RPH" as DetectedType,
    };
  }

  if (lowerName.includes("rpi") || lowerName.includes("individu")) {
    return {
      fields: [
        "Nama Organisasi",
        "Nama Murid / Pelatih",
        "Kategori / Keperluan",
        "Matlamat",
        "Objektif Jangka Pendek",
        "Intervensi",
        "Penilaian",
        "Catatan",
        "Tandatangan",
      ],
      type: "RPI" as DetectedType,
    };
  }

  if (lowerName.includes("laporan") || lowerName.includes("report")) {
    return {
      fields: [
        "Nama Organisasi",
        "Nama Guru / Petugas",
        "Tarikh",
        "Tajuk Aktiviti",
        "Objektif",
        "Langkah Pelaksanaan",
        "Pemerhatian",
        "Refleksi",
        "Tandatangan",
      ],
      type: "General Template" as DetectedType,
    };
  }

  if (fileType === "DOC" || fileType === "DOCX") {
    return {
      fields: defaultDetectedFields,
      type: "General Template" as DetectedType,
    };
  }

  return {
    fields: defaultDetectedFields.slice(0, 11),
    type: "General Template" as DetectedType,
  };
}

function inputTypeForField(field: string) {
  if (field.toLowerCase().includes("tarikh")) return "date";
  if (longFieldHints.some((hint) => field.includes(hint))) return "textarea";
  return "text";
}

function value(values: Record<string, string>, key: string, fallback: string) {
  return values[key]?.trim() || fallback;
}

function splitEditableOutput(text: string) {
  if (text.includes("--- HALAMAN SETERUSNYA ---")) {
    return text.split(/\n\n--- HALAMAN SETERUSNYA ---\n\n|\n\n--- HALAMAN 2 ---\n\n/);
  }

  const blocks = text.split("\n\n");
  const midpoint = Math.ceil(blocks.length / 2);
  return [
    blocks.slice(0, midpoint).join("\n\n"),
    blocks.slice(midpoint).join("\n\n"),
  ];
}

function buildPreview(
  detectedType: DetectedType,
  fields: string[],
  values: Record<string, string>,
  layoutStyle: LayoutStyle,
  pageCount: PageCount,
  hasTemplate: boolean,
  upload: UploadState | null,
) {
  return buildPreviewPages(detectedType, fields, values, hasTemplate, upload)
    .join(pageCount === "2 Pages" ? "\n\n--- HALAMAN 2 ---\n\n" : "\n\n")
    .concat(`\n\nFormat: ${layoutStyle}`);
}

function buildPreviewPages(
  detectedType: DetectedType,
  fields: string[],
  values: Record<string, string>,
  hasTemplate: boolean,
  upload: UploadState | null,
) {
  if (detectedType === "RPA") return rpaPages(values, hasTemplate, upload);
  if (detectedType === "RPH") return rphPages(values, hasTemplate, upload);
  if (detectedType === "RPI") return rpiPages(values, hasTemplate, upload);

  const title = value(values, "Tajuk Aktiviti", "Dokumen Berdasarkan Template");
  const header = `${title.toUpperCase()}

Status Template: ${hasTemplate ? "Template Aktif" : "Tiada template"}
Fail Rujukan: ${upload ? `${upload.name} (${upload.type})` : "Tiada"}
Nota: Template digunakan sebagai rujukan format sahaja.`;

  const body = fields
    .map((field, index) => {
      const content = value(values, field, `Placeholder ${field.toLowerCase()}`);
      return `${index + 1}. ${field}
${content}`;
    })
    .join("\n\n");

  const full = `${header}

${body}`;

  const midpoint = Math.ceil(fields.length / 2);
  const first = `${header}

${fields
  .slice(0, midpoint)
  .map((field, index) => `${index + 1}. ${field}\n${value(values, field, `Placeholder ${field.toLowerCase()}`)}`)
  .join("\n\n")}`;
  const second = fields
    .slice(midpoint)
    .map((field, index) => `${midpoint + index + 1}. ${field}\n${value(values, field, `Placeholder ${field.toLowerCase()}`)}`)
    .join("\n\n");

  return [first, second || full];
}

function previewTitle(type: DetectedType, values: Record<string, string>) {
  if (type === "RPI") return value(values, "Nama Murid / Pelatih", "Rancangan Individu");
  return value(values, "Tajuk Aktiviti", type === "General Template" ? "Dokumen Profesional" : type);
}

function tableRowsForType(
  type: DetectedType,
  fields: string[],
  values: Record<string, string>,
) {
  if (type === "RPA") {
    return [
      row("Nama Organisasi", "Nama Organisasi", values, 1),
      row("Nama Guru / Petugas", "Nama Guru / Petugas", values, 1),
      row("Nama Murid / Pelatih", "Nama Murid / Pelatih", values, 1),
      row("Tarikh", "Tarikh", values, 1),
      row("Tajuk Aktiviti", "Tajuk Aktiviti", values, 1),
      row("Objektif", "Objektif", values, 1),
      row("Bahan / Alat", "Bahan / Alat", values, 1),
      row("Langkah Pelaksanaan", "Langkah Pelaksanaan", values, 1),
      row("Pemerhatian", "Pemerhatian", values, 2),
      row("Refleksi", "Refleksi", values, 2),
      row("Tandatangan", "Tandatangan", values, 2),
    ];
  }

  if (type === "RPH") {
    return [
      row("Mata Pelajaran", "Mata Pelajaran", values, 1),
      row("Kelas", "Kelas", values, 1),
      row("Tarikh", "Tarikh", values, 1),
      row("Standard Kandungan", "Standard Kandungan", values, 1),
      row("Standard Pembelajaran", "Standard Pembelajaran", values, 1),
      row("Objektif", "Objektif", values, 1),
      row("Aktiviti PdP", "Aktiviti PdP", values, 1),
      row("Refleksi", "Refleksi", values, 2),
      row("Tandatangan", "Tandatangan", values, 2),
    ];
  }

  if (type === "RPI") {
    return [
      row("Maklumat Murid/Klien", "Nama Murid / Pelatih", values, 1),
      row("Kategori / Keperluan", "Kategori / Keperluan", values, 1),
      row("Matlamat", "Matlamat", values, 1),
      row("Objektif Jangka Pendek", "Objektif Jangka Pendek", values, 1),
      row("Intervensi", "Intervensi", values, 1),
      row("Penilaian", "Penilaian", values, 2),
      row("Catatan", "Catatan", values, 2),
      row("Tandatangan", "Tandatangan", values, 2),
    ];
  }

  return fields.map((field, index) => row(field, field, values, index < Math.ceil(fields.length / 2) ? 1 : 2));
}

function row(
  label: string,
  field: string,
  values: Record<string, string>,
  page: 1 | 2,
) {
  return {
    content: value(values, field, `Placeholder ${label.toLowerCase()}`),
    label,
    page,
  };
}

function rpaPages(
  values: Record<string, string>,
  hasTemplate: boolean,
  upload: UploadState | null,
) {
  return [
    `RANCANGAN PELAKSANAAN AKTIVITI (RPA)

Status Template: ${hasTemplate ? "Template Aktif" : "Tiada template"}
Fail Rujukan: ${upload ? `${upload.name} (${upload.type})` : "Tiada"}
Nota: Template digunakan sebagai rujukan format sahaja.

Maklumat Aktiviti
Nama Organisasi: ${value(values, "Nama Organisasi", "Nama Organisasi")}
Nama Guru / Petugas: ${value(values, "Nama Guru / Petugas", "Nama Guru / Petugas")}
Nama Murid / Pelatih: ${value(values, "Nama Murid / Pelatih", "Nama Murid / Pelatih")}
Tarikh: ${value(values, "Tarikh", "Tarikh")}
Tajuk Aktiviti: ${value(values, "Tajuk Aktiviti", "Tajuk Aktiviti")}

Objektif
${value(values, "Objektif", "Objektif aktiviti dinyatakan dengan jelas.")}

Bahan / Alat
${value(values, "Bahan / Alat", "Senarai bahan dan alat yang digunakan.")}`,
    `Langkah Pelaksanaan
${value(values, "Langkah Pelaksanaan", "Langkah aktiviti disusun mengikut urutan pelaksanaan.")}

Pemerhatian
${value(values, "Pemerhatian", "Pemerhatian terhadap respons dan penglibatan murid/pelatih.")}

Refleksi
${value(values, "Refleksi", "Refleksi ringkas untuk penambahbaikan aktiviti.")}

Tandatangan
${value(values, "Tandatangan", "Tandatangan")}`,
  ];
}

function rphPages(
  values: Record<string, string>,
  hasTemplate: boolean,
  upload: UploadState | null,
) {
  return [
    `RANCANGAN PENGAJARAN HARIAN (RPH)

Status Template: ${hasTemplate ? "Template Aktif" : "Tiada template"}
Fail Rujukan: ${upload ? `${upload.name} (${upload.type})` : "Tiada"}
Nota: Template digunakan sebagai rujukan format sahaja.

Mata Pelajaran: ${value(values, "Mata Pelajaran", "Mata Pelajaran")}
Kelas: ${value(values, "Kelas", "Kelas")}
Tarikh: ${value(values, "Tarikh", "Tarikh")}
Tajuk: ${value(values, "Tajuk Aktiviti", "Tajuk pengajaran")}

Standard Kandungan
${value(values, "Standard Kandungan", "Standard kandungan dinyatakan di sini.")}

Standard Pembelajaran
${value(values, "Standard Pembelajaran", "Standard pembelajaran dinyatakan di sini.")}`,
    `Objektif
${value(values, "Objektif", "Objektif pembelajaran yang boleh dicapai dan diukur.")}

Aktiviti PdP
${value(values, "Aktiviti PdP", value(values, "Langkah Pelaksanaan", "Aktiviti pengajaran dan pembelajaran disusun mengikut fasa."))}

Refleksi
${value(values, "Refleksi", "Refleksi pengajaran dan tindakan susulan.")}

Tandatangan
${value(values, "Tandatangan", "Tandatangan")}`,
  ];
}

function rpiPages(
  values: Record<string, string>,
  hasTemplate: boolean,
  upload: UploadState | null,
) {
  return [
    `RANCANGAN PENDIDIKAN INDIVIDU (RPI)

Status Template: ${hasTemplate ? "Template Aktif" : "Tiada template"}
Fail Rujukan: ${upload ? `${upload.name} (${upload.type})` : "Tiada"}
Nota: Template digunakan sebagai rujukan format sahaja.

Maklumat Murid/Klien
Nama: ${value(values, "Nama Murid / Pelatih", "Nama Murid / Klien")}
Organisasi: ${value(values, "Nama Organisasi", "Nama Organisasi")}
Kategori / Keperluan: ${value(values, "Kategori / Keperluan", "Kategori / Keperluan")}

Matlamat
${value(values, "Matlamat", "Matlamat perkembangan jangka panjang.")}

Objektif Jangka Pendek
${value(values, "Objektif Jangka Pendek", "Objektif kecil yang boleh diukur.")}`,
    `Intervensi
${value(values, "Intervensi", "Strategi intervensi dilaksanakan mengikut keperluan individu.")}

Penilaian
${value(values, "Penilaian", "Penilaian berdasarkan pemerhatian dan rekod perkembangan.")}

Catatan
${value(values, "Catatan", "Catatan tambahan dan tindakan susulan.")}

Tandatangan
${value(values, "Tandatangan", "Tandatangan")}`,
  ];
}
