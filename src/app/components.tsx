"use client";

import { motion, Reorder } from "framer-motion";
import Link from "next/link";
import { ChangeEvent, useState } from "react";

const documentTypes = [
  "RPA",
  "Surat rasmi",
  "Minit mesyuarat",
  "Laporan",
  "Resume",
  "Memo",
  "Tugasan",
  "Borang",
  "Proposal",
  "Kertas kerja",
  "Dokumen sekolah",
  "PPDK",
  "Taska",
  "Template custom",
];

const templates: Record<string, string[]> = {
  RPA: ["Tajuk Aktiviti", "Objektif", "Bahan / Alat", "Langkah Pelaksanaan", "Pemerhatian", "Refleksi"],
  "Surat rasmi": ["Rujukan", "Tarikh", "Penerima", "Perkara", "Isi Surat", "Penutup", "Tandatangan"],
  "Minit mesyuarat": ["Butiran Mesyuarat", "Kehadiran", "Agenda", "Perbincangan", "Keputusan", "Tindakan Susulan"],
  Laporan: ["Tajuk Laporan", "Objektif", "Ringkasan Aktiviti", "Dapatan", "Rumusan", "Cadangan"],
  Resume: ["Nama & Tajuk", "Ringkasan Profil", "Pengalaman", "Pendidikan", "Kemahiran", "Rujukan"],
  Memo: ["Kepada", "Daripada", "Tarikh", "Perkara", "Isi Memo", "Tindakan"],
  Tugasan: ["Tajuk", "Arahan", "Isi Utama", "Rujukan", "Kesimpulan"],
  Borang: ["Nama", "Maklumat Peribadi", "Butiran", "Pengesahan", "Tandatangan"],
  Proposal: ["Tajuk Proposal", "Latar Belakang", "Objektif", "Cadangan Pelaksanaan", "Kos", "Penutup"],
  "Kertas kerja": ["Tajuk", "Tujuan", "Latar Belakang", "Objektif", "Pelaksanaan", "Anggaran Kos", "Penutup"],
  "Dokumen sekolah": ["Nama Sekolah", "Tajuk", "Butiran", "Isi Kandungan", "Pengesahan"],
  PPDK: ["Nama PPDK", "Maklumat Pelatih", "Aktiviti", "Objektif", "Pemerhatian", "Refleksi"],
  Taska: ["Nama Taska", "Nama Kanak-kanak", "Aktiviti", "Perkembangan", "Catatan"],
  "Template custom": ["Tajuk Dokumen", "Bahagian 1", "Bahagian 2", "Catatan", "Penutup"],
};

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:84px_84px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <Nav />
        {children}
      </div>
    </main>
  );
}

function Nav() {
  return (
    <header className="surface mb-6 flex items-center justify-between rounded-[1.5rem] px-4 py-3">
      <Link className="text-lg font-semibold tracking-[-0.04em]" href="/">
        lY Docs
      </Link>
      <nav className="hidden items-center gap-2 text-sm text-[#b7becc] md:flex">
        <Link className="rounded-full px-3 py-2 hover:text-white" href="/dashboard">Dashboard</Link>
        <Link className="rounded-full px-3 py-2 hover:text-white" href="/create">Dokumen</Link>
        <Link className="rounded-full px-3 py-2 hover:text-white" href="/builder">Builder</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link className="button-secondary min-h-10 px-4 py-2" href="/login">Login</Link>
        <Link className="button-primary min-h-10 px-4 py-2" href="/register">Mula</Link>
      </div>
    </header>
  );
}

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Landing() {
  const features = [
    ["Template siap susun", "Pilih struktur awal yang kemas untuk surat, laporan, RPA, resume dan dokumen kerja."],
    ["Drag & edit item", "Susun semula blok, ubah teks terus pada kertas, dan bina dokumen ikut cara kerja sendiri."],
    ["Token AI hanya bila submit", "Edit manual dahulu. Token digunakan hanya apabila dokumen dihantar untuk bantuan AI."],
    ["Export PDF", "Sediakan dokumen yang bersih untuk fasa export dan perkongsian profesional."],
  ];

  return (
    <AppShell>
      <section className="grid min-h-[calc(100vh-7rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.34em] text-[#9db4ff]">
            lY Docs
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Bina dokumen kemas tanpa mula dari kosong.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b8bfcc]">
            Pilih jenis dokumen, susun item, isi maklumat, kemudian hantar ke AI
            untuk hasil akhir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary" href="/create">Mula Buat Dokumen</Link>
            <Link className="button-secondary" href="/builder">Lihat Contoh</Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {features.map(([title, body], index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="surface rounded-[1.35rem] p-4"
                initial={{ opacity: 0, y: 14 }}
                key={title}
                transition={{ delay: 0.12 + index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-semibold tracking-[-0.02em]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#aeb6c6]">{body}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="surface rounded-[2rem] p-4">
            <div className="a4-page mx-auto rounded-xl p-10">
              <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-black/45">lY Docs</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Dokumen Kerja</h2>
                </div>
                <div className="h-14 w-14 rounded-2xl border border-black/10 bg-black/5" />
              </div>
              {["Template siap", "Blok boleh edit", "Sedia hantar ke AI"].map((item) => (
                <div className="mb-4 rounded-xl border border-black/10 p-4" key={item}>
                  <p className="text-sm font-semibold">{item}</p>
                  <p className="mt-2 text-xs leading-5 text-black/55">
                    Ruang dokumen disusun kemas untuk diisi, disemak dan disiapkan.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </AppShell>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  return (
    <AppShell>
      <section className="grid min-h-[calc(100vh-7rem)] place-items-center py-10">
        <Reveal>
          <div className="surface w-full max-w-md rounded-[2rem] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9db4ff]">
              {isLogin ? "Masuk semula" : "Daftar akaun"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
              {isLogin ? "Login lY Docs" : "Register lY Docs"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#aeb6c6]">
              UI sahaja untuk fasa ini. Butang akan membawa anda terus ke dashboard.
            </p>
            <div className="mt-6 space-y-3">
              {!isLogin ? <input className="input" placeholder="Nama penuh" /> : null}
              <input className="input" placeholder="Alamat emel" />
              <input className="input" placeholder="Kata laluan" type="password" />
              <Link className="button-primary w-full" href="/dashboard">
                {isLogin ? "Login" : "Daftar"}
              </Link>
            </div>
            <p className="mt-5 text-sm text-[#aeb6c6]">
              {isLogin ? "Belum ada akaun? " : "Sudah ada akaun? "}
              <Link className="text-white underline" href={isLogin ? "/register" : "/login"}>
                {isLogin ? "Register" : "Login"}
              </Link>
            </p>
          </div>
        </Reveal>
      </section>
    </AppShell>
  );
}

export function Dashboard() {
  const cards = [
    ["Buat Dokumen Baru", "Pilih template dan buka canvas A4 yang boleh diedit.", "/create"],
    ["Dokumen Saya", "Ruang simpanan dokumen akan tersedia dalam fasa seterusnya.", "/builder"],
    ["Beli Token", "Tambah token AI apabila fungsi submit diaktifkan nanti.", "/dashboard"],
    ["Template Popular", "RPA, surat rasmi, laporan, resume, memo dan proposal.", "/create"],
  ];
  const recent = [
    ["RPA Aktiviti Harian", "Draf terakhir", "Belum disimpan ke cloud"],
    ["Surat Rasmi", "Contoh dokumen", "Template asas"],
    ["Laporan Program", "Placeholder", "Akan aktif selepas database"],
  ];

  return (
    <AppShell>
      <section className="py-8">
        <Reveal>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#9db4ff]">
                lY Docs
              </p>
              <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">Dashboard</h1>
              <p className="mt-4 max-w-2xl text-[#b8bfcc]">
                Ruang kerja ringkas untuk mula bina dokumen, semak draf dan
                urus token AI apabila fungsi AI diaktifkan.
              </p>
            </div>
            <div className="surface inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold">
              🪙 25 Token
            </div>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([title, body, href], index) => (
            <Reveal delay={index * 0.04} key={title}>
              <Link
                className="surface block min-h-40 rounded-[1.5rem] p-5 transition hover:-translate-y-1 hover:border-[#9db4ff]/50"
                href={href}
              >
                <p className="text-xl font-semibold tracking-[-0.03em]">{title}</p>
                <p className="mt-3 text-sm leading-6 text-[#aeb6c6]">{body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.18}>
          <section className="surface mt-8 rounded-[1.75rem] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em]">Dokumen Terkini</h2>
                <p className="mt-2 text-sm text-[#aeb6c6]">
                  Placeholder untuk sejarah dokumen pengguna.
                </p>
              </div>
              <Link className="button-secondary hidden sm:inline-flex" href="/create">
                Baru
              </Link>
            </div>
            <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
              {recent.map(([title, status, note]) => (
                <div className="grid gap-2 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={title}>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-[#aeb6c6]">{status}</p>
                  <p className="text-xs text-[#7f8899]">{note}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </section>
    </AppShell>
  );
}

export function CreateDocument() {
  return (
    <AppShell>
      <section className="py-8">
        <Reveal>
          <h1 className="text-5xl font-semibold tracking-[-0.06em]">Create Document</h1>
          <p className="mt-4 max-w-2xl text-[#b8bfcc]">
            Select a document type. Phase 1 opens a pre-arranged builder canvas
            with editable blocks.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documentTypes.map((type, index) => (
            <Reveal delay={index * 0.025} key={type}>
              <Link
                className="surface block rounded-[1.35rem] p-4 transition hover:-translate-y-1 hover:border-[#9db4ff]/50"
                href={`/builder?type=${encodeURIComponent(type)}`}
              >
                <p className="font-semibold">{type}</p>
                <p className="mt-2 text-xs leading-5 text-[#aeb6c6]">
                  Open editable A4 blocks.
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export function DocumentBuilder({ initialType = "Surat rasmi" }: { initialType?: string }) {
  const [docType, setDocType] = useState(initialType);
  const [blocks, setBlocks] = useState(() => buildBlocks(initialType));
  const [logo, setLogo] = useState("");

  function changeType(value: string) {
    setDocType(value);
    setBlocks(buildBlocks(value));
  }

  function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogo(URL.createObjectURL(file));
  }

  return (
    <AppShell>
      <section className="grid gap-5 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Reveal>
          <aside className="surface sticky top-5 self-start rounded-[1.5rem] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9db4ff]">
              Builder controls
            </p>
            <label className="mt-5 block text-sm text-[#aeb6c6]">Document type</label>
            <select
              className="input mt-2"
              onChange={(event) => changeType(event.target.value)}
              value={docType}
            >
              {documentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <label className="mt-4 block text-sm text-[#aeb6c6]">Upload logo</label>
            <input accept="image/*" className="input mt-2" onChange={uploadLogo} type="file" />
            <button className="button-secondary mt-4 w-full" type="button">
              Submit to AI later
            </button>
          </aside>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="surface rounded-[2rem] p-4">
            <div className="a4-page mx-auto rounded-xl p-8 sm:p-12">
              <div className="mb-8 flex items-start justify-between gap-6 border-b border-black/10 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-black/45">lY Docs</p>
                  <h1
                    className="editable-block mt-2 text-3xl font-semibold tracking-[-0.04em]"
                    contentEditable
                    suppressContentEditableWarning
                  >
                    {docType}
                  </h1>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-2xl border border-black/10 bg-black/5 text-xs text-black/40">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Uploaded logo" className="h-full w-full rounded-2xl object-contain" src={logo} />
                  ) : (
                    "Logo"
                  )}
                </div>
              </div>
              <Reorder.Group axis="y" className="space-y-4" onReorder={setBlocks} values={blocks}>
                {blocks.map((block) => (
                  <Reorder.Item
                    className="cursor-grab rounded-xl border border-black/10 bg-white p-4 shadow-sm active:cursor-grabbing"
                    key={block.id}
                    value={block}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                      {block.title}
                    </p>
                    <div
                      className="editable-block mt-3 min-h-12 text-sm leading-7 text-black/75"
                      contentEditable
                      suppressContentEditableWarning
                    >
                      {block.content}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        </Reveal>
      </section>
    </AppShell>
  );
}

function buildBlocks(type: string) {
  const selected = templates[type] || templates["Template custom"];
  return selected.map((title, index) => ({
    content: defaultContent(title),
    id: `${type}-${title}-${index}`,
    title,
  }));
}

function defaultContent(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("objektif")) return "Tuliskan objektif dokumen atau aktiviti di sini.";
  if (lower.includes("penutup")) return "Masukkan penutup yang ringkas dan profesional.";
  if (lower.includes("tandatangan")) return "Nama, jawatan dan tandatangan.";
  if (lower.includes("ringkasan")) return "Ringkasan utama dokumen.";
  return "Klik untuk edit kandungan blok ini.";
}
