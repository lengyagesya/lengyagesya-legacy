"use client";

import { ChangeEvent, useEffect, useState } from "react";

const storageKey = "ly-docs-progress";

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [documentText, setDocumentText] = useState("");

  useEffect(() => {
    window.localStorage.removeItem(storageKey);
  }, []);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
    setFileType(file?.name.split(".").pop()?.toUpperCase() || "");
    setDocumentText("");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050507] px-4 py-8 text-center text-white sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(125,161,255,0.22),transparent_30%),radial-gradient(circle_at_18%_18%,rgba(230,237,255,0.08),transparent_25%),linear-gradient(135deg,#050507_0%,#10131a_48%,#050507_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:86px_86px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7da1ff]/20 blur-3xl sm:h-[34rem] sm:w-[34rem]" />

      <section className={`relative z-10 w-full animate-[fadeIn_900ms_ease-out_both] transition-all duration-700 ${fileName ? "max-w-4xl" : "max-w-xl"}`}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#c7d7ff]/75 sm:tracking-[0.42em]">
          Professional document generation
        </p>
        <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(199,215,255,0.2)] sm:text-8xl">
          lY Docs
        </h1>

        <div className="mx-auto mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_28px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:mt-12 sm:rounded-[2rem] sm:p-6">
          <label className={`group flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-[#b9caff]/35 bg-black/25 px-4 transition duration-500 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/10 sm:rounded-[1.5rem] sm:px-6 ${fileName ? "min-h-36 py-6" : "min-h-56 py-8"}`}>
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-3xl text-[#d7e3ff] transition duration-300 group-hover:scale-105">
              +
            </span>
            <span className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">
              Upload format dokumen anda
            </span>
            <span className="mt-3 max-w-sm text-sm leading-6 text-[#aeb7c8]">
              Masukkan file PDF, DOC, DOCX, PNG atau JPG. Kita mula semula dari
              langkah upload ini dahulu.
            </span>
            <input
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={handleUpload}
              type="file"
            />
          </label>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8aa0]">
              File dipilih
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-white">
              {fileName || "Belum ada file"}
            </p>
            {fileType ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b9caff]">
                {fileType}
              </p>
            ) : null}
          </div>

          {fileName ? (
            <div className="mt-4 grid gap-4 text-left lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4">
                <p className="text-base font-semibold text-white">
                  Isi teks untuk file ini
                </p>
                <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                  Taip maklumat yang mahu dimasukkan ke dokumen. Kita bina asas
                  ini dahulu sebelum tambah fungsi scan dan susun automatik.
                </p>
                <textarea
                  className="mt-4 min-h-48 w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white outline-none transition duration-300 placeholder:text-[#687386] focus:border-[#b9caff]/60 focus:bg-black/50"
                  onChange={(event) => setDocumentText(event.target.value)}
                  placeholder="Contoh: Nama, tarikh, objektif, aktiviti, pemerhatian atau apa-apa teks yang mahu dimasukkan..."
                  value={documentText}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#f7f4ed] p-5 text-[#14161d] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a7080]">
                  Draf teks
                </p>
                <div className="mt-4 min-h-48 whitespace-pre-wrap rounded-xl border border-[#d7d2c7] bg-white/70 p-4 text-sm leading-7">
                  {documentText || "Teks yang diisi akan muncul di sini."}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
