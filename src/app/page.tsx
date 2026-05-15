"use client";

import { ChangeEvent, useState } from "react";

const userOptions = [
  "Petugas PPDK",
  "Guru Sekolah",
  "Guru Pendidikan Khas",
  "Pendidik Taska",
  "Guru Tadika",
  "Terapis",
  "Penyelaras Program",
  "Admin Organisasi",
];

const documentOptions = ["RPA", "RPH", "RPI", "Laporan Aktiviti"];

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
    setIsConfirmed(false);
    setSelectedUser("");
    setSelectedDocument("");
  }

  function confirmFile() {
    if (!fileName) return;
    setIsConfirmed(true);
  }

  function backToUpload() {
    setIsConfirmed(false);
    setSelectedUser("");
    setSelectedDocument("");
  }

  function backToUserSelection() {
    setSelectedDocument("");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050507] px-6 py-12 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(125,161,255,0.2),transparent_30%),radial-gradient(circle_at_18%_16%,rgba(230,237,255,0.08),transparent_24%),linear-gradient(135deg,#050507_0%,#11131a_48%,#050507_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:86px_86px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7da1ff]/20 blur-3xl sm:h-[34rem] sm:w-[34rem]" />

      <section className="relative z-10 w-full max-w-3xl animate-[fadeIn_900ms_ease-out_both]">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#c7d7ff]/75 sm:text-sm">
          Professional document generation
        </p>
        <h1 className="text-6xl font-semibold tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(199,215,255,0.2)] sm:text-8xl lg:text-9xl">
          lY Docs
        </h1>
        <div className="mx-auto mt-12 max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_28px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
          {!isConfirmed ? (
            <label className="group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#b9caff]/35 bg-black/25 px-6 py-8 transition duration-300 hover:border-[#d7e3ff]/80 hover:bg-[#7da1ff]/10">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-3xl text-[#d7e3ff] transition duration-300 group-hover:scale-105">
                +
              </span>
              <span className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">
                Upload format dokumen anda
              </span>
              <span className="mt-3 max-w-sm text-sm leading-6 text-[#aeb7c8]">
                Pilih file PDF, DOC, DOCX, PNG atau JPG. Fasa ini hanya papar nama
                file dahulu.
              </span>
              <input
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={handleUpload}
                type="file"
              />
            </label>
          ) : null}

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8aa0]">
              File dipilih
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-white">
              {fileName || "Belum ada file"}
            </p>
          </div>

          {fileName && !isConfirmed ? (
            <div className="mt-4 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4 text-left">
              <p className="text-base font-semibold text-white">
                Ini file format yang betul?
              </p>
              <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                Sahkan file ini sebelum kita sambung ke langkah seterusnya.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="btn-primary"
                  onClick={confirmFile}
                  type="button"
                >
                  Ya, Teruskan
                </button>
                <label className="btn-secondary cursor-pointer">
                  Upload Semula
                  <input
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="sr-only"
                    onChange={handleUpload}
                    type="file"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {isConfirmed ? (
            <div className="mt-4 rounded-2xl border border-[#b9caff]/20 bg-[#7da1ff]/10 p-4 text-left">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <button className="btn-quiet" onClick={backToUpload} type="button">
                  Back
                </button>
                {selectedUser ? (
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-[#d7e3ff]">
                    {selectedUser}
                  </span>
                ) : null}
              </div>

              {!selectedUser ? (
                <>
                  <p className="text-base font-semibold text-white">
                    Pilih pengguna
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                    Pilihan ini akan bantu susun langkah seterusnya.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {userOptions.map((option) => (
                      <button
                        className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-sm font-semibold text-[#aeb7c8] transition duration-300 hover:border-[#b9caff]/45 hover:text-white"
                        key={option}
                        onClick={() => setSelectedUser(option)}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">
                        Pilih jenis dokumen
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#aeb7c8]">
                        Pilih dokumen yang mahu disediakan.
                      </p>
                    </div>
                    <button
                      className="btn-quiet"
                      onClick={backToUserSelection}
                      type="button"
                    >
                      Back
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {documentOptions.map((option) => (
                      <button
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition duration-300 ${
                          selectedDocument === option
                            ? "border-[#b9caff]/70 bg-[#7da1ff]/20 text-white"
                            : "border-white/10 bg-black/25 text-[#aeb7c8] hover:border-[#b9caff]/45 hover:text-white"
                        }`}
                        key={option}
                        onClick={() => setSelectedDocument(option)}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
