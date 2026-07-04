import { getRelevantTemplates } from "./templates";

const exampleBank = [
  {
    aliases: ["surat", "permohonan", "rayuan", "cuti"],
    sample: [
      "PERMOHONAN CUTI SEKOLAH",
      "Saya merujuk kepada perkara di atas dan ingin memaklumkan bahawa anak saya tidak dapat hadir ke sekolah pada tarikh yang dinyatakan kerana urusan keluarga yang tidak dapat dielakkan.",
      "Sehubungan itu, saya memohon jasa baik pihak sekolah untuk mempertimbangkan permohonan ini. Saya akan memastikan tugasan atau kerja sekolah yang tertinggal disiapkan dengan kadar segera.",
      "Sekian, terima kasih.",
    ].join("\n"),
  },
  {
    aliases: ["laporan kes", "case report", "kes"],
    sample: [
      "LAPORAN KES",
      "Maklumat Kes: Kes ini melibatkan seorang pelajar yang menunjukkan perubahan tingkah laku semasa sesi pembelajaran.",
      "Pemerhatian: Pelajar kelihatan kurang memberi tumpuan dan memerlukan teguran berulang sebelum menyelesaikan tugasan.",
      "Tindakan Diambil: Guru telah memberi bimbingan secara individu dan memaklumkan perkara ini kepada pihak berkaitan untuk pemantauan lanjut.",
      "Cadangan: Pemantauan berkala dicadangkan supaya perkembangan pelajar dapat dinilai dengan lebih teratur.",
    ].join("\n"),
  },
  {
    aliases: ["rpa", "aktiviti ppdk"],
    sample: [
      "Objektif: Pelatih dapat mengenal dan menyebut sekurang-kurangnya tiga warna asas dengan bimbingan.",
      "Langkah Pelaksanaan: Petugas memperkenalkan bahan berwarna, meminta pelatih memadankan warna yang sama dan memberi pujian selepas setiap percubaan.",
      "Pemerhatian: Pelatih memberi respons positif dan memerlukan sedikit bimbingan semasa membezakan warna yang hampir sama.",
      "Refleksi: Aktiviti sesuai diteruskan dengan bahan yang lebih pelbagai untuk mengukuhkan kefahaman pelatih.",
    ].join("\n"),
  },
  {
    aliases: ["rph", "lesson plan"],
    sample: [
      "Objektif Pembelajaran: Murid dapat menyatakan dua isi penting berdasarkan bahan rangsangan yang diberikan.",
      "Aktiviti PdP: Guru menerangkan tajuk, membimbing murid membaca bahan, mengadakan soal jawab dan meminta murid mencatat isi penting secara ringkas.",
      "Refleksi: Sebahagian besar murid dapat mengikuti aktiviti dengan baik. Pengukuhan tambahan perlu diberi kepada murid yang masih memerlukan bimbingan.",
    ].join("\n"),
  },
  {
    aliases: ["invoice", "quotation", "resit", "sebut harga"],
    sample: [
      "Butiran | Kuantiti | Harga | Jumlah",
      "Servis repair telefon | 1 | RM80.00 | RM80.00",
      "Casing telefon | 1 | RM20.00 | RM20.00",
      "Jumlah Keseluruhan: RM100.00",
    ].join("\n"),
  },
  {
    aliases: ["resume", "cv"],
    sample: [
      "Profil Ringkas: Calon lepasan SPM yang berdisiplin, mudah belajar dan berminat untuk membina pengalaman dalam bidang perkhidmatan pelanggan.",
      "Kemahiran: Komunikasi asas yang baik, boleh bekerja mengikut arahan, menepati masa dan selesa bekerja dalam pasukan.",
    ].join("\n"),
  },
  {
    aliases: ["minit", "mesyuarat"],
    sample: [
      "Agenda Mesyuarat: Perancangan gotong-royong kawasan sekolah.",
      "Keputusan Mesyuarat: Program akan dijalankan pada tarikh yang dipersetujui dengan penglibatan guru, murid dan ibu bapa.",
      "Tindakan Susulan: Penyelaras program menyediakan senarai tugas dan memaklumkan keperluan peralatan kepada pihak sekolah.",
    ].join("\n"),
  },
];

export function getRelevantExamples(prompt: string, limit = 2) {
  const lowerPrompt = prompt.toLowerCase();
  const templateAliases = getRelevantTemplates(prompt, limit).flatMap((template) => template.aliases);
  const scored = exampleBank
    .map((example) => ({
      example,
      score: example.aliases.reduce((total, alias) => total + (lowerPrompt.includes(alias) || templateAliases.includes(alias) ? 1 : 0), 0),
    }))
    .sort((first, second) => second.score - first.score);

  return scored.filter((item) => item.score > 0).slice(0, limit).map((item) => item.example.sample);
}
