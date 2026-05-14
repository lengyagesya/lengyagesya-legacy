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
    setMessage("Menyemak soalan dalam format...");

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
          ? "Format disimpan. Isi soalan/medan yang dikesan, kemudian jana output."
          : "Format disimpan, tetapi tiada soalan jelas dikesan dalam file.",
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
    if (upload?.type !== "DOCX") {
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
              Upload file, preview sama, edit terus.
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
                Upload file, edit dalam output.
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
                      Output akan memaparkan file asal. Untuk DOCX, klik teks
                      dalam preview untuk edit terus.
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
                      <p className="text-sm leading-6 text-[#aeb7c8]">
                        Adakah ini file format yang betul?
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button className="btn-primary" onClick={confirmFile}>
                          Ya, Ini File Betul
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
                            {item.fileName} · {item.fields.length} soalan dikesan
                          </p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {scanState === "done" && fields.length > 0 ? (
                  <Panel title="4. Isi Soalan Format">
                    <div className="grid gap-4">
                      {fields.map((field) => (
                        <AnswerControl
                          field={field}
                          key={field}
                          onChange={updateValue}
                          value={values[field] || ""}
                        />
                      ))}
                    </div>
                    <button className="btn-primary mt-5" onClick={generateOutputFromAnswers}>
                      Jana Output Ke File
                    </button>
                  </Panel>
                ) : scanState === "done" ? (
                  <Panel title="4. Isi Soalan Format">
                    <p className="text-sm leading-6 text-[#aeb7c8]">
                      Tiada soalan jelas dikesan. File masih boleh diedit terus
                      pada output jika formatnya DOCX.
                    </p>
                  </Panel>
                ) : null}
              </div>

              <div className="space-y-6">
                <Panel title="Output">
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
                      Tempat tulis: klik terus pada teks dalam kertas putih di
                      bawah, kemudian taip seperti editor dokumen.
                    </div>
                  ) : null}

                  {showOutputFile ? (
                    <DocumentPreview
                      applyValuesVersion={applyValuesVersion}
                      fields={fields}
                      officeFile={officeFile}
                      upload={upload}
                      values={values}
                    />
                  ) : (
                    <HiddenOutputCard upload={upload} />
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
  officeFile,
  upload,
  values,
}: {
  applyValuesVersion: number;
  fields: string[];
  officeFile: File | null;
  upload: UploadState | null;
  values: Record<string, string>;
}) {
  if (!upload) {
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

function HiddenOutputCard({ upload }: { upload: UploadState | null }) {
  return (
    <article className="rounded-[1.5rem] border border-[#b9caff]/20 bg-[#7da1ff]/8 p-6 text-center shadow-[0_28px_100px_rgba(0,0,0,0.24)] sm:p-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xl text-[#d7e3ff]">
        OK
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-white">
        {upload ? "Sedia untuk isi maklumat" : "Belum ada file"}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#aeb7c8]">
        {upload
          ? "Isi kolum yang muncul di sebelah kiri. Output akan dibuka semula selepas klik Jana Output Ke File."
          : "Upload file dahulu. Selepas upload, file akan dipaparkan untuk disahkan."}
      </p>
    </article>
  );
}

function AnswerControl({
  field,
  onChange,
  value,
}: {
  field: string;
  onChange: (field: string, value: string) => void;
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
