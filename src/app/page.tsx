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

type SavedState = {
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
  const [fields, setFields] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("Format Ringkas");
  const [pageCount, setPageCount] = useState<PageCount>("1 Page");
  const [message, setMessage] = useState("");
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const previewText = useMemo(
    () => buildPreview(fields, values, layoutStyle, pageCount, Boolean(upload)),
    [fields, layoutStyle, pageCount, upload, values],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as SavedState;
          setUpload(parsed.upload);
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
      fields,
      layoutStyle,
      pageCount,
      upload,
      values,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [fields, hydrated, layoutStyle, pageCount, upload, values]);

  function startScan(nextUpload: UploadState) {
    setUpload(nextUpload);
    setFields([]);
    setValues({});
    setPreviewGenerated(false);
    setScanState("scanning");
    setMessage("Menganalisis struktur dokumen...");

    window.setTimeout(() => {
      const detected = detectFields(nextUpload.name, nextUpload.type);
      setFields(detected);
      setScanState("done");
      setMessage("Medan utama berjaya dikesan secara automatik.");
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
    setPreviewGenerated(true);
    setMessage("Preview dokumen telah dijana.");
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(previewText);
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
    setFields([]);
    setValues({});
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
                    ↑
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
                  fields={fields}
                  hasTemplate={Boolean(upload)}
                  layoutStyle={layoutStyle}
                  pageCount={pageCount}
                  previewGenerated={previewGenerated}
                  previewText={previewText}
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
  fields,
  hasTemplate,
  layoutStyle,
  pageCount,
  previewGenerated,
  previewText,
  values,
}: {
  fields: string[];
  hasTemplate: boolean;
  layoutStyle: LayoutStyle;
  pageCount: PageCount;
  previewGenerated: boolean;
  previewText: string;
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

  const pages =
    pageCount === "2 Pages" ? splitPreview(previewText) : [previewText];

  return (
    <div className="space-y-6">
      {pages.map((page, index) => (
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
                {value(values, "Tajuk Aktiviti", "Dokumen Profesional")}
              </h1>
            </div>
            {hasTemplate ? (
              <span className="rounded-full bg-[#dce7ff] px-4 py-2 text-xs font-semibold text-[#28447d]">
                Template Aktif
              </span>
            ) : null}
          </div>

          {layoutStyle === "Format Jadual" ? (
            <div className="mt-7 overflow-hidden rounded-2xl border border-[#ded8ce]">
              {fields.map((field) => (
                <div
                  className="grid border-b border-[#ded8ce] last:border-b-0 sm:grid-cols-[0.38fr_0.62fr]"
                  key={field}
                >
                  <div className="bg-[#ece4d7] p-3 text-sm font-semibold">
                    {field}
                  </div>
                  <div className="p-3 text-sm leading-6">
                    {value(values, field, `Placeholder ${field.toLowerCase()}`)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="mt-7 whitespace-pre-wrap font-sans text-sm leading-7 text-[#2c2925] sm:text-[15px]">
              {page}
            </pre>
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

function detectFields(fileName: string, fileType: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes("rph") || lowerName.includes("lesson")) {
    return [
      "Nama Organisasi",
      "Nama Guru / Petugas",
      "Tarikh",
      "Tajuk Aktiviti",
      "Standard Kandungan",
      "Standard Pembelajaran",
      "Objektif",
      "Bahan / Alat",
      "Langkah Pelaksanaan",
      "Refleksi",
      "Tandatangan",
    ];
  }

  if (lowerName.includes("laporan") || lowerName.includes("report")) {
    return [
      "Nama Organisasi",
      "Nama Guru / Petugas",
      "Tarikh",
      "Tajuk Aktiviti",
      "Objektif",
      "Langkah Pelaksanaan",
      "Pemerhatian",
      "Refleksi",
      "Tandatangan",
    ];
  }

  if (fileType === "DOC" || fileType === "DOCX") {
    return defaultDetectedFields;
  }

  return defaultDetectedFields.slice(0, 11);
}

function inputTypeForField(field: string) {
  if (field.toLowerCase().includes("tarikh")) return "date";
  if (longFieldHints.some((hint) => field.includes(hint))) return "textarea";
  return "text";
}

function value(values: Record<string, string>, key: string, fallback: string) {
  return values[key]?.trim() || fallback;
}

function buildPreview(
  fields: string[],
  values: Record<string, string>,
  layoutStyle: LayoutStyle,
  pageCount: PageCount,
  hasTemplate: boolean,
) {
  const title = value(values, "Tajuk Aktiviti", "Dokumen Berdasarkan Template");
  const header = `${title.toUpperCase()}

Status Template: ${hasTemplate ? "Template Aktif" : "Tiada template"}
Format: ${layoutStyle}
Susunan: ${pageCount}`;

  const body = fields
    .map((field, index) => {
      const content = value(values, field, `Placeholder ${field.toLowerCase()}`);
      return `${index + 1}. ${field}
${content}`;
    })
    .join("\n\n");

  return `${header}

${body}`;
}

function splitPreview(text: string) {
  const blocks = text.split("\n\n");
  const midpoint = Math.ceil(blocks.length / 2);
  return [blocks.slice(0, midpoint).join("\n\n"), blocks.slice(midpoint).join("\n\n")];
}
