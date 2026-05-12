"use client";

import { ChangeEvent, useMemo, useState } from "react";

type DocumentType = "RPA" | "RPH" | "RPI" | "Laporan Aktiviti" | "Custom Template";
type LayoutOption = "1 Page" | "2 Pages";

type UploadState = {
  name: string;
  type: string;
  kind: "image" | "file";
  previewUrl?: string;
};

const documentTypes: DocumentType[] = [
  "RPA",
  "RPH",
  "RPI",
  "Laporan Aktiviti",
  "Custom Template",
];

const profiles = [
  "PPDK",
  "Taska",
  "Tadika",
  "Sekolah",
  "Pendidikan Khas",
  "Pusat Terapi",
  "Custom",
];

const workflow = [
  "Pilih Jenis Dokumen",
  "Upload Format Rujukan",
  "Isi Maklumat",
  "Jana Preview",
];

const fieldMap: Record<DocumentType, string[]> = {
  RPA: [
    "Nama Organisasi",
    "Nama Petugas / Guru / Pendidik",
    "Nama Pelatih / Murid / Kanak-kanak",
    "Tarikh",
    "Masa",
    "Tempat",
    "Tajuk Aktiviti",
    "Bidang / Fokus",
    "Objektif",
    "Bahan / Alat",
    "Langkah Pelaksanaan",
    "Pemerhatian",
    "Refleksi",
  ],
  RPH: [
    "Nama Sekolah / Organisasi",
    "Nama Guru",
    "Mata Pelajaran",
    "Tahun / Kelas",
    "Tarikh",
    "Masa",
    "Tajuk",
    "Standard Kandungan",
    "Standard Pembelajaran",
    "Objektif Pembelajaran",
    "Aktiviti PdP",
    "Bahan Bantu Mengajar",
    "Refleksi",
  ],
  RPI: [
    "Nama Organisasi",
    "Nama Murid / Klien",
    "Kategori / Keperluan",
    "Matlamat Jangka Panjang",
    "Objektif Jangka Pendek",
    "Strategi / Intervensi",
    "Tempoh Pelaksanaan",
    "Penilaian",
    "Catatan / Refleksi",
  ],
  "Laporan Aktiviti": [
    "Nama Organisasi",
    "Nama Aktiviti / Program",
    "Tarikh",
    "Masa",
    "Tempat",
    "Petugas / Penyelaras",
    "Peserta",
    "Objektif",
    "Ringkasan Aktiviti",
    "Pemerhatian",
    "Rumusan / Cadangan",
  ],
  "Custom Template": [
    "Nama Dokumen",
    "Nama Organisasi",
    "Tajuk",
    "Tarikh",
    "Maklumat Utama",
    "Isi Kandungan",
    "Catatan",
    "Penutup",
  ],
};

const longFields = new Set([
  "Objektif",
  "Langkah Pelaksanaan",
  "Pemerhatian",
  "Refleksi",
  "Aktiviti PdP",
  "Bahan Bantu Mengajar",
  "Strategi / Intervensi",
  "Penilaian",
  "Catatan / Refleksi",
  "Ringkasan Aktiviti",
  "Rumusan / Cadangan",
  "Maklumat Utama",
  "Isi Kandungan",
  "Catatan",
  "Penutup",
]);

const allowedExtensions = ["png", "jpg", "jpeg", "pdf", "doc", "docx"];

export default function Home() {
  const [documentType, setDocumentType] = useState<DocumentType>("RPA");
  const [profile, setProfile] = useState("PPDK");
  const [layout, setLayout] = useState<LayoutOption>("1 Page");
  const [values, setValues] = useState<Record<string, string>>({});
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState(false);

  const fields = fieldMap[documentType];
  const pages = useMemo(
    () => buildPreview(documentType, profile, values, layout, Boolean(upload)),
    [documentType, layout, profile, upload, values],
  );
  const outputText = pages.join("\n\n--- HALAMAN SETERUSNYA ---\n\n");

  function updateDocumentType(nextType: DocumentType) {
    setDocumentType(nextType);
    setValues({});
    setGenerated(false);
    setMessage(`${nextType} dipilih. Medan borang telah dikemas kini.`);
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

    const fileType = extension === "jpg" || extension === "jpeg" ? "JPG" : extension.toUpperCase();

    if (extension === "png" || extension === "jpg" || extension === "jpeg") {
      const reader = new FileReader();
      reader.onload = () => {
        setUpload({
          name: file.name,
          type: fileType,
          kind: "image",
          previewUrl: String(reader.result),
        });
        setMessage("Template ini digunakan sebagai rujukan format.");
      };
      reader.readAsDataURL(file);
      return;
    }

    setUpload({
      name: file.name,
      type: fileType,
      kind: "file",
    });
    setMessage("Template ini digunakan sebagai rujukan format.");
  }

  function generateDocument() {
    setGenerated(true);
    setMessage("Preview dokumen berjaya dijana.");
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(outputText);
      setMessage("Teks dokumen telah disalin.");
    } catch {
      setMessage("Teks tidak dapat disalin pada pelayar ini.");
    }
  }

  function showExportMessage() {
    setMessage("Fungsi export akan diaktifkan dalam fasa seterusnya.");
  }

  function resetWorkspace() {
    setDocumentType("RPA");
    setProfile("PPDK");
    setLayout("1 Page");
    setValues({});
    setUpload(null);
    setGenerated(false);
    setMessage("Ruang kerja telah dikosongkan.");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-[#f6efe3]">
      <HeroBackground />

      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#050507]/75 px-5 py-4 backdrop-blur-2xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <a className="text-lg font-semibold tracking-tight text-white" href="#">
            lY Docs
          </a>
          <div className="hidden items-center gap-7 text-sm text-[#aaa39a] md:flex">
            <a className="transition hover:text-white" href="#jenis">
              Jenis Dokumen
            </a>
            <a className="transition hover:text-white" href="#upload">
              Format Rujukan
            </a>
            <a className="transition hover:text-white" href="#jana">
              Jana Preview
            </a>
          </div>
          <a className="btn-primary hidden sm:inline-flex" href="#jana">
            Mula Sekarang
          </a>
        </div>
      </nav>

      <section className="px-5 pb-16 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="fade-up">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#d9b76c]">
              Platform Dokumen Berstruktur
            </p>
            <h1 className="text-6xl font-semibold leading-[0.92] tracking-normal text-white sm:text-8xl lg:text-9xl">
              lY Docs
            </h1>
            <p className="mt-7 max-w-3xl text-2xl leading-9 text-[#f6efe3] sm:text-4xl">
              Jana perancangan dan laporan dengan format yang lebih kemas.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#c8c0b5] sm:text-lg">
              Pilih jenis dokumen, upload format rujukan, isi maklumat penting
              dan lihat preview profesional yang disusun mengikut struktur
              dokumen pendidikan, terapi dan organisasi.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a className="btn-primary" href="#jana">
                Jana Dokumen
              </a>
              <a className="btn-secondary" href="#jenis">
                Pilih Template
              </a>
            </div>
          </div>

          <div className="fade-up rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_120px_rgba(217,183,108,0.12)] backdrop-blur-2xl sm:p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
              <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[#aaa39a]">
                <span>Ruang Kerja</span>
                <span>Fasa 1</span>
              </div>
              <div className="space-y-3">
                {workflow.map((step, index) => (
                  <div
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                    key={step}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d9b76c]/15 text-sm font-semibold text-[#d9b76c]">
                      {index + 1}
                    </span>
                    <span className="font-medium text-white">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-[#f8f3eb] p-5 text-[#171513]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a7632]">
                  Preview
                </p>
                <h2 className="mt-4 text-2xl font-semibold">RPA / RPH / RPI</h2>
                <p className="mt-4 text-sm leading-6 text-[#4a4540]">
                  Format rujukan, maklumat pengguna dan output berstruktur
                  dipaparkan dalam satu ruang kerja yang kemas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {workflow.map((step, index) => (
            <GlassCard key={step}>
              <p className="text-sm text-[#d9b76c]">Langkah {index + 1}</p>
              <h2 className="mt-4 text-xl font-semibold text-white">{step}</h2>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12" id="jana">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Generator"
            title="Pilih format, upload rujukan dan jana preview dokumen."
          />

          <div className="mt-10 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
            <div className="space-y-6">
              <Panel id="jenis" title="1. Jenis dokumen">
                <div className="grid gap-3 sm:grid-cols-2">
                  {documentTypes.map((type) => (
                    <ChoiceButton
                      active={documentType === type}
                      key={type}
                      label={type}
                      onClick={() => updateDocumentType(type)}
                    />
                  ))}
                </div>
              </Panel>

              <Panel title="2. Organisasi / profil">
                <div className="grid gap-3 sm:grid-cols-2">
                  {profiles.map((item) => (
                    <ChoiceButton
                      active={profile === item}
                      key={item}
                      label={item}
                      onClick={() => setProfile(item)}
                    />
                  ))}
                </div>
              </Panel>

              <Panel id="upload" title="3. Upload format rujukan">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-[#d9b76c]/35 bg-[#d9b76c]/8 px-5 py-8 text-center transition hover:border-[#d9b76c]/70 hover:bg-[#d9b76c]/12">
                  <span className="text-lg font-semibold text-white">
                    Pilih fail template
                  </span>
                  <span className="mt-2 text-sm leading-6 text-[#aaa39a]">
                    PNG, JPG, PDF, DOC atau DOCX
                  </span>
                  <input
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                    className="sr-only"
                    onChange={handleUpload}
                    type="file"
                  />
                </label>

                {upload ? <UploadPreview upload={upload} /> : null}
              </Panel>

              <Panel title="4. Layout preview">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["1 Page", "2 Pages"] as LayoutOption[]).map((item) => (
                    <ChoiceButton
                      active={layout === item}
                      key={item}
                      label={item}
                      onClick={() => setLayout(item)}
                    />
                  ))}
                </div>
              </Panel>

              <Panel title="5. Isi maklumat">
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

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button className="btn-primary" onClick={generateDocument}>
                    Jana Dokumen
                  </button>
                  <button className="btn-secondary" onClick={copyText}>
                    Copy Text
                  </button>
                  <button className="btn-secondary" onClick={showExportMessage}>
                    Download Word
                  </button>
                  <button className="btn-secondary" onClick={showExportMessage}>
                    Download PDF
                  </button>
                  <button className="btn-quiet sm:col-span-2" onClick={resetWorkspace}>
                    Reset
                  </button>
                </div>

                {message ? (
                  <p className="mt-5 rounded-2xl border border-[#d9b76c]/20 bg-[#d9b76c]/10 px-4 py-3 text-sm text-[#f3dca4]">
                    {message}
                  </p>
                ) : null}
              </Panel>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d9b76c]">
                    Preview Output
                  </p>
                  <p className="mt-2 text-sm text-[#aaa39a]">
                    {documentType} / {profile} / {layout}
                  </p>
                </div>
                {upload ? (
                  <span className="rounded-full border border-[#d9b76c]/30 bg-[#d9b76c]/10 px-4 py-2 text-xs font-semibold text-[#f3dca4]">
                    Template Reference Active
                  </span>
                ) : null}
              </div>

              {upload?.kind === "image" && upload.previewUrl ? (
                <div className="mb-5 rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                  <p className="mb-3 text-sm font-semibold text-white">
                    Rujukan Format
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Rujukan format yang dimuat naik"
                    className="max-h-72 w-full rounded-2xl object-contain"
                    src={upload.previewUrl}
                  />
                </div>
              ) : null}

              <div className="space-y-6">
                {(generated ? pages : buildPreview(documentType, profile, values, layout, Boolean(upload))).map(
                  (page, index) => (
                    <DocumentPage
                      key={`${documentType}-${layout}-${index}`}
                      label={layout === "2 Pages" ? `Page ${index + 1}` : "Preview"}
                      text={page}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl font-semibold text-white">lY Docs</p>
            <p className="mt-3 max-w-xl leading-7 text-[#aaa39a]">
              Ruang kerja dokumen premium untuk perancangan, laporan dan output
              berstruktur yang lebih kemas.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[#aaa39a]">
            <a className="hover:text-white" href="#jenis">
              Jenis Dokumen
            </a>
            <a className="hover:text-white" href="#upload">
              Format Rujukan
            </a>
            <a className="hover:text-white" href="#jana">
              Jana Preview
            </a>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-[#807970]">
          Hak cipta 2026. lY Docs. Semua hak terpelihara.
        </div>
      </footer>
    </main>
  );
}

function ChoiceButton({
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
          ? "border-[#d9b76c]/65 bg-[#d9b76c]/12 text-white shadow-[0_16px_50px_rgba(217,183,108,0.12)]"
          : "border-white/10 bg-black/20 text-[#aaa39a] hover:border-white/25 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Panel({
  children,
  id,
  title,
}: {
  children: React.ReactNode;
  id?: string;
  title: string;
}) {
  return (
    <section
      className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl sm:p-6"
      id={id}
    >
      <h2 className="mb-5 text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function UploadPreview({ upload }: { upload: UploadState }) {
  return (
    <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{upload.name}</p>
          <p className="mt-1 text-sm text-[#aaa39a]">Jenis fail: {upload.type}</p>
        </div>
        <span className="rounded-full border border-[#d9b76c]/30 bg-[#d9b76c]/10 px-3 py-1 text-xs font-semibold text-[#f3dca4]">
          Rujukan
        </span>
      </div>
      {upload.kind === "image" && upload.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Preview template rujukan"
          className="mt-4 max-h-64 w-full rounded-2xl object-contain"
          src={upload.previewUrl}
        />
      ) : (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-[#c8c0b5]">
          Fail rujukan disimpan untuk preview format. Kandungan fail akan
          diproses dalam fasa seterusnya.
        </div>
      )}
      <p className="mt-4 text-sm text-[#f3dca4]">
        Template ini digunakan sebagai rujukan format.
      </p>
    </div>
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
    <label className="grid gap-2 text-sm font-medium text-[#d8d0c5]">
      {label}
      {children}
    </label>
  );
}

function DocumentPage({ label, text }: { label: string; text: string }) {
  return (
    <article className="rounded-[1.5rem] border border-[#ded4c2] bg-[#f8f3eb] p-5 text-[#171513] shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-[#ded4c2] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a7632]">
          {label}
        </span>
        <span className="text-xs text-[#756c62]">lY Docs</span>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-7 sm:text-[15px]">
        {text}
      </pre>
    </article>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="min-h-full rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#d9b76c]/35 hover:bg-white/[0.075]">
      {children}
    </article>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d9b76c]">
        {label}
      </p>
      <h2 className="section-title mt-6">{title}</h2>
    </div>
  );
}

function HeroBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_20%_8%,rgba(217,183,108,0.18),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(105,112,255,0.1),transparent_25%),linear-gradient(135deg,#050507_0%,#101013_45%,#050507_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />
    </>
  );
}

function value(values: Record<string, string>, key: string, fallback: string) {
  return values[key]?.trim() || fallback;
}

function buildPreview(
  type: DocumentType,
  profile: string,
  values: Record<string, string>,
  layout: LayoutOption,
  hasTemplate: boolean,
) {
  const pages = createPages(type, profile, values, hasTemplate);
  return layout === "1 Page" ? [pages.join("\n\n")] : pages;
}

function createPages(
  type: DocumentType,
  profile: string,
  values: Record<string, string>,
  hasTemplate: boolean,
) {
  const reference = hasTemplate
    ? "Rujukan format: Template Reference Active"
    : "Rujukan format: Tiada template dimuat naik";

  if (type === "RPA") {
    const org = value(values, "Nama Organisasi", "Nama Organisasi");
    const petugas = value(values, "Nama Petugas / Guru / Pendidik", "Nama Petugas");
    const pelatih = value(values, "Nama Pelatih / Murid / Kanak-kanak", "Nama Pelatih");
    const tajuk = value(values, "Tajuk Aktiviti", "Tajuk Aktiviti");
    return [
      `RANCANGAN PELAKSANAAN AKTIVITI (RPA)

Profil: ${profile}
${reference}

Nama Organisasi: ${org}
Nama Petugas / Guru / Pendidik: ${petugas}
Nama Pelatih / Murid / Kanak-kanak: ${pelatih}
Tarikh: ${value(values, "Tarikh", "Tarikh")}
Masa: ${value(values, "Masa", "Masa")}
Tempat: ${value(values, "Tempat", "Tempat")}

Tajuk Aktiviti
${tajuk}

Bidang / Fokus
${value(values, "Bidang / Fokus", "Bidang atau fokus aktiviti")}

Objektif
${value(values, "Objektif", "Objektif aktiviti disusun secara jelas dan boleh diperhatikan.")}`,
      `BAHAN / ALAT
${value(values, "Bahan / Alat", "Senarai bahan dan alat yang digunakan.")}

LANGKAH PELAKSANAAN
${value(values, "Langkah Pelaksanaan", "Langkah pelaksanaan aktiviti diterangkan mengikut urutan.")}

PEMERHATIAN
${value(values, "Pemerhatian", "Pemerhatian terhadap penglibatan, respons dan perkembangan pelatih direkodkan.")}

REFLEKSI
${value(values, "Refleksi", "Refleksi ringkas untuk penambahbaikan aktiviti seterusnya.")}

Disediakan oleh,

${petugas}`,
    ];
  }

  if (type === "RPH") {
    const sekolah = value(values, "Nama Sekolah / Organisasi", "Nama Sekolah / Organisasi");
    const guru = value(values, "Nama Guru", "Nama Guru");
    return [
      `RANCANGAN PENGAJARAN HARIAN (RPH)

Profil: ${profile}
${reference}

Nama Sekolah / Organisasi: ${sekolah}
Nama Guru: ${guru}
Mata Pelajaran: ${value(values, "Mata Pelajaran", "Mata Pelajaran")}
Tahun / Kelas: ${value(values, "Tahun / Kelas", "Tahun / Kelas")}
Tarikh: ${value(values, "Tarikh", "Tarikh")}
Masa: ${value(values, "Masa", "Masa")}

Tajuk
${value(values, "Tajuk", "Tajuk pembelajaran")}

Standard Kandungan
${value(values, "Standard Kandungan", "Standard kandungan dinyatakan di sini.")}

Standard Pembelajaran
${value(values, "Standard Pembelajaran", "Standard pembelajaran dinyatakan di sini.")}`,
      `OBJEKTIF PEMBELAJARAN
${value(values, "Objektif Pembelajaran", "Pada akhir pembelajaran, murid dapat mencapai objektif yang dirancang.")}

AKTIVITI PDP
${value(values, "Aktiviti PdP", "Set induksi, aktiviti utama, latihan dan penutup disusun dengan kemas.")}

BAHAN BANTU MENGAJAR
${value(values, "Bahan Bantu Mengajar", "Bahan bantu mengajar yang sesuai digunakan.")}

REFLEKSI
${value(values, "Refleksi", "Refleksi pengajaran dan tindakan susulan direkodkan.")}

Disediakan oleh,

${guru}`,
    ];
  }

  if (type === "RPI") {
    const org = value(values, "Nama Organisasi", "Nama Organisasi");
    const murid = value(values, "Nama Murid / Klien", "Nama Murid / Klien");
    return [
      `RANCANGAN PENDIDIKAN INDIVIDU (RPI)

Profil: ${profile}
${reference}

Nama Organisasi: ${org}
Nama Murid / Klien: ${murid}
Kategori / Keperluan: ${value(values, "Kategori / Keperluan", "Kategori / Keperluan")}

Matlamat Jangka Panjang
${value(values, "Matlamat Jangka Panjang", "Matlamat perkembangan jangka panjang murid atau klien.")}

Objektif Jangka Pendek
${value(values, "Objektif Jangka Pendek", "Objektif kecil yang boleh diukur dan dipantau.")}`,
      `STRATEGI / INTERVENSI
${value(values, "Strategi / Intervensi", "Strategi intervensi dilaksanakan secara konsisten mengikut keperluan.")}

TEMPOH PELAKSANAAN
${value(values, "Tempoh Pelaksanaan", "Tempoh pelaksanaan ditetapkan mengikut sasaran.")}

PENILAIAN
${value(values, "Penilaian", "Penilaian dibuat melalui pemerhatian, rekod perkembangan dan maklum balas.")}

CATATAN / REFLEKSI
${value(values, "Catatan / Refleksi", "Catatan perkembangan dan refleksi tindakan susulan.")}

Disahkan oleh,

________________________`,
    ];
  }

  if (type === "Laporan Aktiviti") {
    const org = value(values, "Nama Organisasi", "Nama Organisasi");
    const aktiviti = value(values, "Nama Aktiviti / Program", "Nama Aktiviti / Program");
    const penyelaras = value(values, "Petugas / Penyelaras", "Petugas / Penyelaras");
    return [
      `LAPORAN AKTIVITI

Profil: ${profile}
${reference}

Nama Organisasi: ${org}
Nama Aktiviti / Program: ${aktiviti}
Tarikh: ${value(values, "Tarikh", "Tarikh")}
Masa: ${value(values, "Masa", "Masa")}
Tempat: ${value(values, "Tempat", "Tempat")}
Petugas / Penyelaras: ${penyelaras}
Peserta: ${value(values, "Peserta", "Peserta")}

Objektif
${value(values, "Objektif", "Objektif aktiviti dinyatakan secara ringkas dan jelas.")}`,
      `RINGKASAN AKTIVITI
${value(values, "Ringkasan Aktiviti", "Ringkasan pelaksanaan aktiviti diterangkan mengikut turutan.")}

PEMERHATIAN
${value(values, "Pemerhatian", "Pemerhatian terhadap pelaksanaan, penglibatan peserta dan hasil aktiviti.")}

RUMUSAN / CADANGAN
${value(values, "Rumusan / Cadangan", "Rumusan keseluruhan dan cadangan penambahbaikan.")}

Disediakan oleh,

${penyelaras}`,
    ];
  }

  const namaDokumen = value(values, "Nama Dokumen", "Nama Dokumen");
  const organisasi = value(values, "Nama Organisasi", "Nama Organisasi");
  return [
    `${namaDokumen.toUpperCase()}

Profil: ${profile}
${reference}

Nama Organisasi: ${organisasi}
Tajuk: ${value(values, "Tajuk", "Tajuk dokumen")}
Tarikh: ${value(values, "Tarikh", "Tarikh")}

Maklumat Utama
${value(values, "Maklumat Utama", "Maklumat utama dokumen disusun mengikut keperluan format rujukan.")}`,
    `ISI KANDUNGAN
${value(values, "Isi Kandungan", "Isi kandungan utama diterangkan dengan susunan yang kemas dan profesional.")}

CATATAN
${value(values, "Catatan", "Catatan tambahan untuk rujukan pihak berkaitan.")}

PENUTUP
${value(values, "Penutup", "Penutup dokumen disediakan secara ringkas dan sesuai.")}

Tandatangan / Pengesahan

________________________`,
  ];
}
