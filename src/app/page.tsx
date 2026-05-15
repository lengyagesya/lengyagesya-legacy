"use client";

import { ChangeEvent, useMemo, useState } from "react";

type UploadedFile = {
  name: string;
  size: string;
  type: string;
};

const supportedTypes = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [message, setMessage] = useState("Sedia untuk menerima format dokumen.");

  const workspaceStatus = useMemo(() => {
    if (!uploadedFile) return "Belum ada dokumen";
    return "Format diterima";
  }, [uploadedFile]);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    setUploadedFile({
      name: file.name,
      size: formatFileSize(file.size),
      type: extension,
    });
    setMessage("Format dokumen anda sudah masuk ke workspace.");
  }

  function resetWorkspace() {
    setUploadedFile(null);
    setMessage("Sedia untuk menerima format dokumen.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(112,151,255,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(235,241,255,0.1),transparent_26%),linear-gradient(135deg,#050507_0%,#101217_52%,#050507_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:84px_84px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7da1ff]/20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <span className="text-lg font-semibold tracking-tight text-white">
            lY Docs
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c7d7ff]">
            Main workspace
          </span>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#b9caff]">
              lY Docs
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
              Upload format dokumen anda
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#aeb7c8] sm:text-lg">
              Workspace premium untuk menyediakan format dokumen kerja dengan
              lebih kemas, cepat dan profesional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn-primary" href="#workspace">
                Buka Workspace
              </a>
              <button className="btn-secondary" onClick={resetWorkspace} type="button">
                Reset
              </button>
            </div>
          </div>

          <section
            className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_140px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-6"
            id="workspace"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b9caff]">
                  Main workspace
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
                  Upload document workspace
                </h2>
              </div>
              <span className="rounded-full border border-[#b9caff]/25 bg-[#7da1ff]/10 px-3 py-1 text-xs font-semibold text-[#d7e3ff]">
                {workspaceStatus}
              </span>
            </div>

            <label className="group flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#b9caff]/35 bg-black/25 px-6 py-10 text-center transition duration-300 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/10">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-3xl text-[#d7e3ff] transition duration-300 group-hover:scale-105">
                +
              </span>
              <span className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-white">
                Pilih atau letak file di sini
              </span>
              <span className="mt-3 max-w-md text-sm leading-6 text-[#aeb7c8]">
                Sokongan format PDF, DOC, DOCX, PNG dan JPG untuk persediaan
                dokumen kerja.
              </span>
              <span className="mt-5 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#b9caff]">
                Upload format dokumen anda
              </span>
              <input
                accept={supportedTypes}
                className="sr-only"
                onChange={handleUpload}
                type="file"
              />
            </label>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-sm font-medium text-[#d7e3ff]">{message}</p>
              {uploadedFile ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <InfoTile label="Nama file" value={uploadedFile.name} />
                  <InfoTile label="Jenis" value={uploadedFile.type} />
                  <InfoTile label="Saiz" value={uploadedFile.size} />
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[#aeb7c8]">
                  Selepas upload, maklumat file akan muncul di sini.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[#7f8aa0]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
