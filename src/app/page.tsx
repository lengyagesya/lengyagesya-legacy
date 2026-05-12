"use client";

import { useMemo, useState } from "react";

type FormState = {
  jenis: string;
  nama: string;
  jawatan: string;
  organisasi: string;
  tujuan: string;
  butiran: string;
  gaya: string;
  panjang: string;
};

type DocCategory = {
  title: string;
  description: string;
};

const navItems = ["Template", "Jana Dokumen", "Harga", "Visi"];

const stats = [
  { value: "1,000+", label: "Dokumen Dijana" },
  { value: "500+", label: "Pengguna Sasaran" },
  { value: "9+", label: "Template Profesional" },
  { value: "AI Ready", label: "Platform" },
];

const features = [
  {
    icon: "01",
    title: "Jana dokumen pantas",
    description:
      "Susun kandungan penting menjadi draf dokumen yang kemas dalam beberapa langkah.",
  },
  {
    icon: "02",
    title: "Template profesional",
    description:
      "Pilihan template sesuai untuk pejabat, pendidikan, perniagaan kecil dan kegunaan kerjaya.",
  },
  {
    icon: "03",
    title: "Preview segera",
    description:
      "Lihat struktur dokumen secara langsung sebelum disalin atau dieksport pada fasa seterusnya.",
  },
  {
    icon: "04",
    title: "Format lebih kemas",
    description:
      "Susunan tajuk, perenggan, butiran dan penutup direka agar nampak teratur dan serius.",
  },
  {
    icon: "05",
    title: "Sesuai untuk pejabat & organisasi",
    description:
      "Dibina untuk pengguna yang kerap menyediakan surat, laporan, memo dan dokumen kerja.",
  },
  {
    icon: "06",
    title: "Sedia untuk AI integration",
    description:
      "Asas frontend yang bersih untuk disambungkan kepada fungsi AI pada fasa akan datang.",
  },
];

const categories: DocCategory[] = [
  {
    title: "Surat Rasmi",
    description: "Surat formal untuk permohonan, makluman dan urusan organisasi.",
  },
  {
    title: "Resume",
    description: "Profil kerjaya moden untuk permohonan kerja dan latihan industri.",
  },
  {
    title: "Biodata",
    description: "Maklumat diri tersusun untuk sekolah, program, kerja atau pendaftaran.",
  },
  {
    title: "RPA / Laporan Aktiviti",
    description: "Rangka laporan ringkas untuk aktiviti pendidikan dan komuniti.",
  },
  {
    title: "Proposal Ringkas",
    description: "Cadangan program, projek kecil atau inisiatif organisasi.",
  },
  {
    title: "Minit Mesyuarat",
    description: "Catatan mesyuarat dengan agenda, keputusan dan tindakan susulan.",
  },
  {
    title: "Laporan Program",
    description: "Laporan pasca program dengan objektif, pelaksanaan dan impak.",
  },
  {
    title: "Surat Permohonan",
    description: "Permohonan bantuan, kebenaran, tajaan atau kerjasama.",
  },
  {
    title: "Memo Organisasi",
    description: "Memo dalaman yang ringkas, jelas dan mudah diedarkan.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "RM0",
    points: ["Template asas", "Preview dokumen", "Copy text"],
  },
  {
    name: "Pro",
    price: "RM9/bulan",
    points: ["Semua template", "Export PDF", "AI generation"],
    featured: true,
  },
  {
    name: "Business",
    price: "Harga custom",
    points: ["Dashboard organisasi", "Sokongan pasukan", "Kawalan penggunaan"],
  },
];

const roadmap = [
  "Export PDF sebenar",
  "Simpan sejarah dokumen",
  "Login pengguna",
  "AI document generation",
  "Dashboard organisasi",
  "Automation workflow",
  "Payment & subscription system",
];

const initialForm: FormState = {
  jenis: "Surat Rasmi",
  nama: "",
  jawatan: "",
  organisasi: "",
  tujuan: "",
  butiran: "",
  gaya: "Profesional",
  panjang: "Sederhana",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [documentText, setDocumentText] = useState("");
  const [message, setMessage] = useState("");

  const previewText = useMemo(
    () => documentText || createPlaceholderDocument(form),
    [documentText, form],
  );

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function selectCategory(category: string) {
    setForm((current) => ({ ...current, jenis: category }));
    setDocumentText("");
    setMessage(`Template ${category} dipilih.`);
  }

  function generateDocument() {
    setDocumentText(createDocument(form));
    setMessage("Dokumen berjaya dijana untuk preview.");
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(previewText);
      setMessage("Teks dokumen telah disalin.");
    } catch {
      setMessage("Teks tidak dapat disalin pada pelayar ini.");
    }
  }

  function resetWorkspace() {
    setForm(initialForm);
    setDocumentText("");
    setMessage("Ruang kerja telah dikosongkan.");
  }

  function showPdfMessage() {
    setMessage("Fungsi PDF akan tersedia dalam fasa seterusnya.");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-[#f6efe3]">
      <HeroBackground />

      <nav className="fade-up sticky top-0 z-40 border-b border-white/10 bg-[#050507]/75 px-5 py-4 backdrop-blur-2xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#" className="text-lg font-semibold tracking-tight text-white">
            lY Docs
          </a>
          <div className="hidden items-center gap-7 text-sm text-[#aaa39a] md:flex">
            {navItems.map((item) => (
              <a
                className="transition duration-300 hover:text-white"
                href={`#${navHref(item)}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
          <a className="btn-primary hidden sm:inline-flex" href="#jana-dokumen">
            Mula Sekarang
          </a>
        </div>
      </nav>

      <section className="relative px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="fade-up">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.45em] text-[#d9b76c]">
              Platform Dokumen Profesional
            </p>
            <h1 className="text-6xl font-semibold leading-[0.92] tracking-normal text-white sm:text-8xl lg:text-9xl">
              lY Docs
            </h1>
            <p className="mt-7 max-w-2xl text-2xl leading-9 text-[#d9b76c] sm:text-3xl">
              Jana dokumen profesional dalam beberapa minit.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#c8c0b5] sm:text-lg">
              Platform pintar untuk menghasilkan surat rasmi, resume, biodata,
              laporan, proposal dan dokumen kerja dengan lebih cepat, kemas dan
              profesional.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a className="btn-primary" href="#jana-dokumen">
                Mula Jana Dokumen
              </a>
              <a className="btn-secondary" href="#template">
                Lihat Template
              </a>
            </div>
          </div>

          <div className="fade-up relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_120px_rgba(217,183,108,0.12)] backdrop-blur-2xl sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(217,183,108,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
            <div className="relative rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
              <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[#aaa39a]">
                <span>Ruang Preview</span>
                <span>Fasa 1</span>
              </div>
              <div className="rounded-2xl bg-[#f8f3eb] p-6 text-[#171513] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9a7632]">
                  Dokumen
                </p>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                  Surat Rasmi
                </h2>
                <div className="mt-6 space-y-3 text-sm leading-6 text-[#4a4540]">
                  <p>Kepada pihak berkenaan,</p>
                  <p>
                    Dengan segala hormatnya, perkara di atas adalah dirujuk.
                    Dokumen ini disediakan secara profesional berdasarkan
                    maklumat yang diberikan.
                  </p>
                  <p>Sekian, terima kasih.</p>
                </div>
                <div className="mt-8 h-px bg-[#ddd2c1]" />
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#756c62]">
                  <span>Format kemas</span>
                  <span>Preview segera</span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {["Surat", "Resume", "Laporan"].map((item) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-4 text-center text-sm text-[#c8c0b5]"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <GlassCard key={`${stat.value}-${stat.label}`}>
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-[#aaa39a]">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeader
          label="Ciri Utama"
          title="Direka untuk pengguna Malaysia yang perlu menyiapkan dokumen dengan cepat dan kemas."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <GlassCard key={feature.title}>
              <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl border border-[#d9b76c]/25 bg-[#d9b76c]/10 text-sm font-semibold text-[#d9b76c]">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-4 leading-7 text-[#aaa39a]">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="template">
        <SectionHeader
          label="Template"
          title="Pilih kategori dokumen dan ruang jana akan dikemas kini secara automatik."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const active = form.jenis === category.title;

            return (
              <button
                className={`group rounded-[1.5rem] border p-5 text-left backdrop-blur-xl transition duration-500 hover:-translate-y-1 ${
                  active
                    ? "border-[#d9b76c]/70 bg-[#d9b76c]/12 shadow-[0_24px_90px_rgba(217,183,108,0.16)]"
                    : "border-white/10 bg-white/[0.055] hover:border-[#d9b76c]/35 hover:bg-white/[0.075]"
                }`}
                key={category.title}
                onClick={() => selectCategory(category.title)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold text-white">
                    {category.title}
                  </h3>
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      active ? "bg-[#d9b76c]" : "bg-white/20"
                    }`}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-[#aaa39a]">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      </Section>

      <section
        className="px-5 py-20 sm:px-8 lg:px-12"
        id="jana-dokumen"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Jana Dokumen"
            title="Ruang kerja frontend untuk menjana preview dokumen profesional."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl sm:p-7">
              <div className="grid gap-5">
                <Field label="Jenis Dokumen">
                  <select
                    className="input-field"
                    value={form.jenis}
                    onChange={(event) => updateField("jenis", event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.title}>{category.title}</option>
                    ))}
                  </select>
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nama Penuh">
                    <input
                      className="input-field"
                      onChange={(event) => updateField("nama", event.target.value)}
                      placeholder="Contoh: Nur Aina Binti Rahman"
                      value={form.nama}
                    />
                  </Field>
                  <Field label="Jawatan / Peranan">
                    <input
                      className="input-field"
                      onChange={(event) =>
                        updateField("jawatan", event.target.value)
                      }
                      placeholder="Contoh: Guru, Kerani, Pelajar"
                      value={form.jawatan}
                    />
                  </Field>
                </div>

                <Field label="Organisasi">
                  <input
                    className="input-field"
                    onChange={(event) =>
                      updateField("organisasi", event.target.value)
                    }
                    placeholder="Contoh: PPDK Seri Murni"
                    value={form.organisasi}
                  />
                </Field>

                <Field label="Tujuan Dokumen">
                  <input
                    className="input-field"
                    onChange={(event) => updateField("tujuan", event.target.value)}
                    placeholder="Contoh: Permohonan kelulusan program"
                    value={form.tujuan}
                  />
                </Field>

                <Field label="Butiran Penting">
                  <textarea
                    className="input-field min-h-32 resize-none"
                    onChange={(event) =>
                      updateField("butiran", event.target.value)
                    }
                    placeholder="Masukkan tarikh, tempat, objektif, latar belakang atau maklumat penting lain."
                    value={form.butiran}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Gaya Bahasa">
                    <SegmentedControl
                      current={form.gaya}
                      options={["Ringkas", "Formal", "Profesional", "Mesra"]}
                      onChange={(value) => updateField("gaya", value)}
                    />
                  </Field>
                  <Field label="Panjang Dokumen">
                    <SegmentedControl
                      current={form.panjang}
                      options={["Pendek", "Sederhana", "Lengkap"]}
                      onChange={(value) => updateField("panjang", value)}
                    />
                  </Field>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="btn-primary" onClick={generateDocument}>
                    Jana Dokumen
                  </button>
                  <button className="btn-secondary" onClick={copyText}>
                    Copy Text
                  </button>
                  <button className="btn-secondary" onClick={showPdfMessage}>
                    Download PDF
                  </button>
                  <button className="btn-quiet" onClick={resetWorkspace}>
                    Reset
                  </button>
                </div>

                {message ? (
                  <p className="rounded-2xl border border-[#d9b76c]/20 bg-[#d9b76c]/10 px-4 py-3 text-sm text-[#f3dca4]">
                    {message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d9b76c]">
                    Preview Dokumen
                  </p>
                  <p className="mt-1 text-sm text-[#aaa39a]">
                    {form.jenis} · {form.gaya} · {form.panjang}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#aaa39a]">
                  Langsung
                </span>
              </div>
              <div className="max-h-[760px] overflow-auto rounded-[1.5rem] bg-[#f8f3eb] p-5 text-[#171513] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] sm:p-8">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 sm:text-[15px]">
                  {previewText}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="harga" tone="dark">
        <SectionHeader
          label="Harga"
          title="Pelan ringkas untuk menggambarkan hala tuju produk."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              className={`rounded-[1.7rem] border p-7 backdrop-blur-xl ${
                plan.featured
                  ? "border-[#d9b76c]/60 bg-[#d9b76c]/12 shadow-[0_30px_100px_rgba(217,183,108,0.18)]"
                  : "border-white/10 bg-white/[0.055]"
              }`}
              key={plan.name}
            >
              <p className="text-xl font-semibold text-white">{plan.name}</p>
              <p className="mt-5 text-4xl font-semibold text-white">
                {plan.price}
              </p>
              <div className="mt-8 space-y-3">
                {plan.points.map((point) => (
                  <p className="text-sm text-[#c8c0b5]" key={point}>
                    {point}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-7 text-sm text-[#aaa39a]">
          Integrasi bayaran akan ditambah dalam fasa seterusnya.
        </p>
      </Section>

      <Section id="visi">
        <SectionHeader
          label="Visi"
          title="Roadmap produk untuk menjadikan lY Docs platform dokumen yang lebih lengkap."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roadmap.map((item, index) => (
            <GlassCard key={item}>
              <p className="text-sm text-[#d9b76c]">Fasa {index + 2}</p>
              <h3 className="mt-5 text-xl font-semibold text-white">{item}</h3>
            </GlassCard>
          ))}
        </div>
      </Section>

      <footer className="border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-2xl font-semibold text-white">lY Docs</p>
            <p className="mt-4 max-w-xl leading-7 text-[#aaa39a]">
              Platform dokumen moden untuk pengguna Malaysia yang mahukan
              proses kerja lebih pantas, teratur dan profesional.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-[#aaa39a] sm:grid-cols-4 md:text-right">
            {navItems.map((item) => (
              <a
                className="transition hover:text-white"
                href={`#${navHref(item)}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[#807970] sm:flex-row sm:items-center sm:justify-between">
          <span>lY Docs</span>
          <span>Hak cipta 2026. Semua hak terpelihara.</span>
        </div>
      </footer>
    </main>
  );
}

function navHref(item: string) {
  if (item === "Jana Dokumen") return "jana-dokumen";
  if (item === "Harga") return "harga";
  if (item === "Visi") return "visi";
  return "template";
}

function Section({
  children,
  id,
  tone,
}: {
  children: React.ReactNode;
  id?: string;
  tone?: "dark";
}) {
  return (
    <section
      className={`px-5 py-20 sm:px-8 lg:px-12 ${
        tone === "dark" ? "border-y border-white/10 bg-[#09090b]" : ""
      }`}
      id={id}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
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

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="group min-h-full rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#d9b76c]/35 hover:bg-white/[0.075]">
      {children}
    </article>
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

function SegmentedControl({
  current,
  onChange,
  options,
}: {
  current: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <button
          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
            current === option
              ? "border-[#d9b76c]/60 bg-[#d9b76c]/12 text-white"
              : "border-white/10 bg-black/20 text-[#aaa39a] hover:border-white/25 hover:text-white"
          }`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
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

function createPlaceholderDocument(form: FormState) {
  return `PREVIEW DOKUMEN

Jenis Dokumen: ${form.jenis}
Nama: ${form.nama || "Nama penuh akan dipaparkan di sini"}
Organisasi: ${form.organisasi || "Organisasi akan dipaparkan di sini"}

Isi maklumat pada borang dan tekan "Jana Dokumen" untuk menghasilkan preview yang lebih lengkap dan profesional.

Dokumen ini akan disusun mengikut jenis template, gaya bahasa dan panjang dokumen yang dipilih.`;
}

function createDocument(form: FormState) {
  const nama = form.nama || "Nama Penuh";
  const jawatan = form.jawatan || "Jawatan / Peranan";
  const organisasi = form.organisasi || "Organisasi";
  const tujuan = form.tujuan || "Tujuan dokumen";
  const butiran =
    form.butiran ||
    "Butiran penting berkaitan tarikh, tempat, objektif, penerima, skop kerja atau maklumat sokongan.";
  const toneLine = `Gaya bahasa: ${form.gaya}. Panjang dokumen: ${form.panjang}.`;

  switch (form.jenis) {
    case "Resume":
      return `RESUME PROFESIONAL

${nama}
${jawatan}
${organisasi}

RINGKASAN PROFIL
${nama} merupakan individu yang berdisiplin, tersusun dan komited dalam melaksanakan tanggungjawab. Berpengalaman dalam menyediakan tugasan berkaitan ${tujuan.toLowerCase()} serta mampu menyesuaikan diri dengan keperluan organisasi secara profesional.

KEKUATAN UTAMA
- Komunikasi kerja yang jelas dan tersusun
- Pengurusan masa dan tugasan yang konsisten
- Penyediaan dokumen, laporan dan rekod dengan teliti
- Kesediaan mempelajari sistem dan proses baharu

PENGALAMAN / LATAR BELAKANG
${butiran}

OBJEKTIF KERJAYA
Untuk menyumbang kemahiran, etika kerja dan keupayaan dokumentasi kepada organisasi yang menghargai ketelitian, produktiviti dan perkembangan profesional.

${toneLine}`;

    case "Biodata":
      return `BIODATA

Nama Penuh
${nama}

Jawatan / Peranan
${jawatan}

Organisasi
${organisasi}

Tujuan Biodata
${tujuan}

Maklumat Ringkas
${nama} menyediakan biodata ini bagi tujuan ${tujuan.toLowerCase()}. Maklumat yang dikemukakan disusun secara ringkas, kemas dan mudah dirujuk oleh pihak berkaitan.

Butiran Penting
${butiran}

Pengesahan
Saya mengesahkan bahawa maklumat yang diberikan adalah benar dan boleh digunakan untuk tujuan yang dinyatakan.

Disediakan oleh,

${nama}
${jawatan}`;

    case "Proposal Ringkas":
      return `PROPOSAL RINGKAS

Tajuk Cadangan
${tujuan}

Disediakan oleh
${nama}
${jawatan}
${organisasi}

1. Ringkasan Cadangan
Proposal ini dikemukakan bagi menerangkan cadangan ${tujuan.toLowerCase()} dengan pendekatan yang tersusun, praktikal dan sesuai untuk pelaksanaan organisasi.

2. Latar Belakang
${butiran}

3. Objektif
- Memastikan cadangan dapat dilaksanakan secara terancang
- Menyediakan hala tuju yang jelas kepada pihak terlibat
- Meningkatkan keberkesanan kerja, program atau penyampaian perkhidmatan

4. Cadangan Pelaksanaan
Pelaksanaan dicadangkan melalui perancangan ringkas, pembahagian tugasan, penyediaan dokumen sokongan dan pemantauan hasil secara berkala.

5. Penutup
Diharapkan proposal ini dapat dipertimbangkan dan diluluskan untuk tindakan selanjutnya.

${toneLine}`;

    case "RPA / Laporan Aktiviti":
    case "Laporan Program":
      return `LAPORAN AKTIVITI / PROGRAM

Nama Program
${tujuan}

Disediakan oleh
${nama}
${jawatan}
${organisasi}

1. Pengenalan
Laporan ini disediakan bagi merekodkan pelaksanaan ${tujuan.toLowerCase()} serta menghuraikan maklumat penting berkaitan aktiviti yang telah atau akan dijalankan.

2. Objektif
- Merekod perjalanan program secara kemas
- Menilai keberkesanan pelaksanaan aktiviti
- Menyediakan rujukan untuk tindakan dan penambahbaikan

3. Butiran Aktiviti
${butiran}

4. Pemerhatian
Aktiviti ini memberi ruang kepada peserta dan pihak terlibat untuk mencapai matlamat yang dirancang melalui pelaksanaan yang lebih tersusun.

5. Penutup
Secara keseluruhannya, laporan ini disediakan sebagai rekod rasmi dan rujukan organisasi untuk tindakan susulan.

Disediakan oleh,

${nama}
${jawatan}`;

    case "Minit Mesyuarat":
      return `MINIT MESYUARAT

Perkara
${tujuan}

Organisasi
${organisasi}

Dicatat oleh
${nama}
${jawatan}

1. Pembukaan
Mesyuarat dimulakan dengan perbincangan berkaitan ${tujuan.toLowerCase()} dan perkara-perkara yang memerlukan perhatian pihak terlibat.

2. Agenda Perbincangan
${butiran}

3. Keputusan Mesyuarat
- Perkara utama telah dibincangkan secara teratur
- Pihak berkaitan diminta mengambil tindakan mengikut keperluan
- Rekod mesyuarat akan dijadikan rujukan untuk susulan

4. Tindakan Susulan
Setiap tindakan perlu dilaksanakan mengikut keutamaan dan dilaporkan semula kepada pihak bertanggungjawab.

5. Penutup
Mesyuarat ditangguhkan selepas semua perkara selesai dibincangkan.

Disediakan oleh,
${nama}`;

    case "Memo Organisasi":
      return `MEMO ORGANISASI

Kepada: Warga / Pihak Berkaitan
Daripada: ${nama}, ${jawatan}
Organisasi: ${organisasi}
Perkara: ${tujuan}

Dengan hormatnya perkara di atas adalah dirujuk.

Memo ini dikeluarkan bagi memaklumkan perkara berkaitan ${tujuan.toLowerCase()}. Pihak berkaitan diminta mengambil perhatian terhadap maklumat berikut:

${butiran}

Kerjasama semua pihak amat dihargai bagi memastikan urusan ini berjalan dengan lancar dan teratur.

Sekian, terima kasih.

${nama}
${jawatan}`;

    case "Surat Permohonan":
    case "Surat Rasmi":
    default:
      return `SURAT RASMI

${nama}
${jawatan}
${organisasi}

Tarikh: ${new Date().toLocaleDateString("ms-MY")}

Kepada pihak yang berkenaan,

Tuan/Puan,

PERKARA: ${tujuan.toUpperCase()}

Dengan segala hormatnya, perkara di atas adalah dirujuk.

2. Saya, ${nama}, selaku ${jawatan} di ${organisasi}, ingin mengemukakan dokumen ini bagi tujuan ${tujuan.toLowerCase()}. Permohonan / makluman ini disediakan dengan mengambil kira keperluan rasmi dan kepentingan pihak berkaitan.

3. Butiran penting adalah seperti berikut:
${butiran}

4. Sehubungan itu, saya berharap agar perkara ini dapat diberikan pertimbangan dan perhatian sewajarnya. Segala kerjasama daripada pihak tuan/puan amat dihargai.

Sekian, terima kasih.

Yang benar,


${nama}
${jawatan}
${organisasi}

${toneLine}`;
  }
}
