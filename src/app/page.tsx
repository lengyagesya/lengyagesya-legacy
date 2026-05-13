"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Category = "Perancangan" | "Laporan";
type Mode = "Basic" | "Advanced";

type UploadState = {
  name: string;
  type: string;
  kind: "image" | "file";
  previewUrl?: string;
};

const profiles = [
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

const categories = [
  {
    title: "Perancangan" as Category,
    description: "Dokumen sebelum aktiviti/pengajaran dilaksanakan.",
  },
  {
    title: "Laporan" as Category,
    description: "Dokumen selepas aktiviti/program dilaksanakan.",
  },
];

const planningDocuments = [
  "RPA",
  "RPH",
  "RPI",
  "Lesson Plan",
  "Pelan Sesi Terapi",
  "Pelan Aktiviti Harian",
  "Pelan Aktiviti Mingguan",
  "Rancangan Program",
];

const reportDocuments = [
  "Laporan Aktiviti",
  "Laporan Program",
  "Laporan Harian",
  "Laporan Mingguan",
  "Laporan Bulanan",
  "Laporan Kehadiran",
  "Laporan Kemajuan",
  "Laporan Pemerhatian",
  "Laporan Refleksi",
  "Laporan Intervensi",
  "Laporan Lawatan",
  "Laporan Mesyuarat",
  "Laporan Penilaian",
  "Laporan Prestasi",
  "Laporan Kes",
  "Laporan Insiden",
  "Laporan Penutup Program",
];

const essentialFields = [
  "Nama Organisasi",
  "Nama Pengguna",
  "Nama Peserta",
  "Tarikh",
  "Tajuk / Nama Aktiviti",
  "Objektif",
  "Ringkasan",
];

const advancedFields = [
  "Nama Organisasi",
  "Nama Pengguna",
  "Nama Peserta",
  "Tarikh",
  "Masa",
  "Tempat",
  "Tajuk / Nama Aktiviti",
  "Bidang / Fokus",
  "Objektif",
  "Bahan / Alat",
  "Langkah / Ringkasan",
  "Pemerhatian",
  "Refleksi / Rumusan",
];

const longFields = new Set([
  "Objektif",
  "Ringkasan",
  "Langkah / Ringkasan",
  "Pemerhatian",
  "Refleksi / Rumusan",
]);

const allowedExtensions = ["png", "jpg", "jpeg", "pdf", "doc", "docx"];

export default function Home() {
  const [profile, setProfile] = useState("Petugas PPDK");
  const [category, setCategory] = useState<Category>("Perancangan");
  const [documentType, setDocumentType] = useState("RPA");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [mode, setMode] = useState<Mode>("Basic");
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [previewGenerated, setPreviewGenerated] = useState(false);

  const documentOptions =
    category === "Perancangan" ? planningDocuments : reportDocuments;
  const fields = mode === "Basic" ? essentialFields : advancedFields;
  const previewText = useMemo(
    () =>
      buildPreview({
        category,
        documentType,
        hasTemplate: Boolean(upload),
        profile,
        values,
      }),
    [category, documentType, profile, upload, values],
  );

  function selectCategory(nextCategory: Category) {
    const nextDocument =
      nextCategory === "Perancangan" ? planningDocuments[0] : reportDocuments[0];
    setCategory(nextCategory);
    setDocumentType(nextDocument);
    setPreviewGenerated(false);
    setMessage("");
  }

  function updateValue(field: string, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(extension)) {
      setUpload(null);
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
        setUpload({
          kind: "image",
          name: file.name,
          previewUrl: String(reader.result),
          type,
        });
        setMessage("Template ini digunakan sebagai rujukan format.");
      };
      reader.readAsDataURL(file);
      return;
    }

    setUpload({ kind: "file", name: file.name, type });
    setMessage("Template ini digunakan sebagai rujukan format.");
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
    setProfile("Petugas PPDK");
    setCategory("Perancangan");
    setDocumentType("RPA");
    setUpload(null);
    setMode("Basic");
    setValues({});
    setPreviewGenerated(false);
    setMessage("Ruang kerja telah dikosongkan.");
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
            <nav className="hidden items-center gap-6 text-sm text-[#aeb7c8] md:flex">
              <a className="transition hover:text-white" href="#profil">
                Profil
              </a>
              <a className="transition hover:text-white" href="#kategori">
                Kategori
              </a>
              <a className="transition hover:text-white" href="#preview">
                Preview
              </a>
            </nav>
          </div>
        </header>

        <section className="px-5 pb-12 pt-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_28px_120px_rgba(71,102,180,0.14)] backdrop-blur-2xl sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#b9caff]">
                Workflow
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {[
                  "Pilih Profil",
                  "Pilih Kategori",
                  "Pilih Jenis Dokumen",
                  "Upload Format",
                  "Isi Maklumat",
                  "Preview & Export",
                ].map((step, index) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    key={step}
                  >
                    <span className="text-xs text-[#8d98ad]">
                      Step {index + 1}
                    </span>
                    <p className="mt-2 text-sm font-medium text-white">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <Panel id="profil" eyebrow="Step 1" title="Pilih Profil">
                <div className="grid gap-3 sm:grid-cols-2">
                  {profiles.map((item) => (
                    <Choice
                      active={profile === item}
                      key={item}
                      label={item}
                      onClick={() => setProfile(item)}
                    />
                  ))}
                </div>
              </Panel>

              <Panel id="kategori" eyebrow="Step 2" title="Pilih Kategori">
                <div className="grid gap-4 sm:grid-cols-2">
                  {categories.map((item) => (
                    <button
                      className={`rounded-[1.5rem] border p-5 text-left transition duration-300 ${
                        category === item.title
                          ? "border-[#b9caff]/60 bg-[#7da1ff]/12 text-white"
                          : "border-white/10 bg-black/20 text-[#aeb7c8] hover:border-white/25 hover:text-white"
                      }`}
                      key={item.title}
                      onClick={() => selectCategory(item.title)}
                      type="button"
                    >
                      <span className="text-lg font-semibold">{item.title}</span>
                      <span className="mt-3 block text-sm leading-6 text-[#aeb7c8]">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel eyebrow="Step 3" title="Pilih Jenis Dokumen">
                <div className="grid gap-3 sm:grid-cols-2">
                  {documentOptions.map((item) => (
                    <Choice
                      active={documentType === item}
                      key={item}
                      label={item}
                      onClick={() => {
                        setDocumentType(item);
                        setPreviewGenerated(false);
                      }}
                    />
                  ))}
                </div>
              </Panel>

              <Panel eyebrow="Step 4" title="Upload Format">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#b9caff]/35 bg-[#7da1ff]/8 px-5 py-8 text-center transition hover:border-[#b9caff]/70 hover:bg-[#7da1ff]/12">
                  <span className="text-lg font-semibold text-white">
                    Pilih fail rujukan
                  </span>
                  <span className="mt-2 text-sm text-[#aeb7c8]">
                    PNG, JPG, PDF, DOC atau DOCX
                  </span>
                  <input
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                    className="sr-only"
                    onChange={handleUpload}
                    type="file"
                  />
                </label>
                {upload ? <UploadCard upload={upload} /> : null}
              </Panel>

              <Panel eyebrow="Step 5" title="Isi Maklumat">
                <div className="mb-5 grid grid-cols-2 gap-3">
                  {(["Basic", "Advanced"] as Mode[]).map((item) => (
                    <Choice
                      active={mode === item}
                      key={item}
                      label={`${item} Mode`}
                      onClick={() => setMode(item)}
                    />
                  ))}
                </div>

                <div className="grid gap-4">
                  {fields.map((field) => (
                    <Field key={field} label={field}>
                      {longFields.has(field) ? (
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
                          value={values[field] || ""}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel id="preview" eyebrow="Step 6" title="Preview & Export">
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

              {message ? (
                <p className="mb-5 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 px-4 py-3 text-sm text-[#d7e3ff]">
                  {message}
                </p>
              ) : null}

              <article className="rounded-[1.5rem] border border-[#ded8ce] bg-[#f8f4ed] p-6 text-[#171513] shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-8">
                <div className="flex flex-col gap-4 border-b border-[#ded8ce] pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6f7f9f]">
                      {documentType}
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                      {value(values, "Tajuk / Nama Aktiviti", documentType)}
                    </h1>
                    <p className="mt-2 text-sm text-[#655f58]">
                      {profile} / {category}
                    </p>
                  </div>
                  {upload ? (
                    <span className="rounded-full bg-[#dce7ff] px-4 py-2 text-xs font-semibold text-[#28447d]">
                      Template Aktif
                    </span>
                  ) : null}
                </div>

                {upload?.kind === "image" && upload.previewUrl ? (
                  <div className="mt-6 rounded-2xl border border-[#ded8ce] bg-white/55 p-4">
                    <p className="mb-3 text-sm font-semibold text-[#28231f]">
                      Rujukan Format
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Rujukan format"
                      className="max-h-72 w-full rounded-xl object-contain"
                      src={upload.previewUrl}
                    />
                  </div>
                ) : null}

                <pre className="mt-7 whitespace-pre-wrap font-sans text-sm leading-7 text-[#2c2925] sm:text-[15px]">
                  {previewGenerated
                    ? previewText
                    : "Tekan Jana Preview untuk melihat output dokumen yang disusun berdasarkan pilihan dan maklumat anda."}
                </pre>
              </article>
            </Panel>
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
  eyebrow,
  id,
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  id?: string;
  title: string;
}) {
  return (
    <section
      className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition duration-500 hover:border-white/15 sm:p-6"
      id={id}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b9caff]">
        {eyebrow}
      </p>
      <h2 className="mb-5 mt-3 text-2xl font-semibold text-white">{title}</h2>
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

function UploadCard({ upload }: { upload: UploadState }) {
  return (
    <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{upload.name}</p>
          <p className="mt-1 text-sm text-[#aeb7c8]">Jenis fail: {upload.type}</p>
        </div>
        <span className="rounded-full border border-[#b9caff]/30 bg-[#7da1ff]/10 px-3 py-1 text-xs font-semibold text-[#d7e3ff]">
          Rujukan
        </span>
      </div>
      {upload.kind === "image" && upload.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Preview format rujukan"
          className="mt-4 max-h-64 w-full rounded-2xl object-contain"
          src={upload.previewUrl}
        />
      ) : (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-[#c8d0df]">
          Fail rujukan telah dimuat naik dan akan digunakan sebagai rujukan
          format.
        </div>
      )}
      <p className="mt-4 text-sm text-[#d7e3ff]">
        Template ini digunakan sebagai rujukan format.
      </p>
    </div>
  );
}

function value(values: Record<string, string>, key: string, fallback: string) {
  return values[key]?.trim() || fallback;
}

function buildPreview({
  category,
  documentType,
  hasTemplate,
  profile,
  values,
}: {
  category: Category;
  documentType: string;
  hasTemplate: boolean;
  profile: string;
  values: Record<string, string>;
}) {
  const title = value(values, "Tajuk / Nama Aktiviti", documentType);
  const org = value(values, "Nama Organisasi", "Nama organisasi");
  const user = value(values, "Nama Pengguna", "Nama pengguna");
  const participant = value(values, "Nama Peserta", "Nama peserta");
  const date = value(values, "Tarikh", "Tarikh");
  const time = value(values, "Masa", "Masa");
  const place = value(values, "Tempat", "Tempat");
  const focus = value(values, "Bidang / Fokus", "Bidang atau fokus");
  const objective = value(values, "Objektif", "Objektif dokumen");
  const tools = value(values, "Bahan / Alat", "Bahan atau alat berkaitan");
  const summary = value(
    values,
    "Langkah / Ringkasan",
    value(values, "Ringkasan", "Ringkasan pelaksanaan atau kandungan utama."),
  );
  const observation = value(values, "Pemerhatian", "Pemerhatian akan direkodkan di sini.");
  const reflection = value(
    values,
    "Refleksi / Rumusan",
    "Refleksi atau rumusan akan dilengkapkan berdasarkan hasil pelaksanaan.",
  );

  return `${documentType.toUpperCase()}

Profil: ${profile}
Kategori: ${category}
Organisasi: ${org}
Nama Pengguna: ${user}
Nama Peserta: ${participant}
Tarikh: ${date}
Masa: ${time}
Tempat: ${place}
Status Template: ${hasTemplate ? "Template Aktif" : "Tiada template dimuat naik"}

TAJUK
${title}

BIDANG / FOKUS
${focus}

OBJEKTIF
${objective}

BAHAN / ALAT
${tools}

STRUKTUR KANDUNGAN
${summary}

PEMERHATIAN
${observation}

REFLEKSI / RUMUSAN
${reflection}

Disediakan oleh,

${user}`;
}
