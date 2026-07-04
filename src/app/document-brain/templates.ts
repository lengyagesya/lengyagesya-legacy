export type BrainReferenceTemplate = {
  aliases: string[];
  formatNotes: string[];
  slots: string[];
  title: string;
};

export const documentBrainTemplates: BrainReferenceTemplate[] = [
  {
    aliases: ["surat", "surat rasmi", "permohonan", "rayuan", "cuti", "sokongan", "pengesahan"],
    formatNotes: [
      "Satu kolum; elakkan kotak berlebihan.",
      "Tajuk uppercase dan terus kepada perkara.",
      "Gunakan penerima/salam jika slot wujud.",
      "Penutup ringkas dengan tandatangan.",
    ],
    slots: ["sender", "date", "recipient", "title", "salutation", "body", "closing", "signature"],
    title: "Surat rasmi Malaysia",
  },
  {
    aliases: ["laporan kes", "case report", "kes disiplin", "kes"],
    formatNotes: [
      "Satu kolum; jangan jadikan surat.",
      "Heading bold dan isi pendek.",
      "Pemerhatian, tindakan dan cadangan mesti praktikal.",
    ],
    slots: ["title", "case_info", "background", "issue", "observation", "action_taken", "current_status", "recommendation", "conclusion"],
    title: "Laporan kes",
  },
  {
    aliases: ["laporan", "laporan aktiviti", "laporan program", "laporan harian", "laporan mingguan", "laporan bulanan"],
    formatNotes: [
      "Satu kolum dengan heading jelas.",
      "Nyatakan objektif, ringkasan, pemerhatian dan cadangan.",
      "Gunakan bahasa kerja, bukan karangan panjang.",
    ],
    slots: ["title", "date", "objective", "summary", "observation", "recommendation", "conclusion", "signature"],
    title: "Laporan umum",
  },
  {
    aliases: ["minit", "minit mesyuarat", "mesyuarat"],
    formatNotes: [
      "Satu kolum; setiap bahagian mesti berlabel.",
      "Agenda, keputusan dan tindakan susulan perlu jelas.",
      "Gunakan bullet/list bila sesuai.",
    ],
    slots: ["title", "meeting_info", "attendees", "agenda", "discussion", "decision", "follow_up", "closing"],
    title: "Minit mesyuarat",
  },
  {
    aliases: ["rpa", "rancangan pelaksanaan aktiviti", "aktiviti ppdk"],
    formatNotes: [
      "Fokus kepada aktiviti, objektif boleh diukur, bahan, langkah, pemerhatian dan refleksi.",
      "Ayat sesuai untuk petugas/guru/pendidik.",
      "Jangan jadikan laporan umum jika user minta perancangan.",
    ],
    slots: ["title", "date", "time", "place", "objective", "materials", "steps", "observation", "reflection", "signature"],
    title: "RPA",
  },
  {
    aliases: ["rph", "rancangan pengajaran harian", "lesson plan"],
    formatNotes: [
      "Struktur pengajaran: mata pelajaran, kelas, standard, objektif, aktiviti PdP, bahan bantu mengajar dan refleksi.",
      "Objektif mesti boleh dinilai.",
      "Aktiviti perlu tersusun mengikut permulaan, perkembangan dan penutup jika sesuai.",
    ],
    slots: ["title", "date", "subject", "class", "standard_content", "standard_learning", "objective", "activity", "materials", "reflection"],
    title: "RPH",
  },
  {
    aliases: ["rpi", "rancangan pendidikan individu", "pendidikan khas", "intervensi"],
    formatNotes: [
      "Fokus kepada murid/klien, keperluan, matlamat, objektif jangka pendek, intervensi dan penilaian.",
      "Jangan guna ayat menghukum; gunakan bahasa profesional dan empati.",
    ],
    slots: ["title", "student_info", "needs", "long_term_goal", "short_term_objective", "intervention", "evaluation", "remarks"],
    title: "RPI",
  },
  {
    aliases: ["resume", "cv", "kerja", "mohon kerja"],
    formatNotes: [
      "Tidak berbentuk surat.",
      "Gunakan profil ringkas, pendidikan, kemahiran dan pengalaman.",
      "Elakkan klaim berlebihan jika user tidak beri bukti.",
    ],
    slots: ["title", "name", "contact", "summary", "education", "skills", "experience", "references"],
    title: "Resume",
  },
  {
    aliases: ["invoice", "quotation", "sebut harga", "resit", "bayaran"],
    formatNotes: [
      "Gunakan jadual item dan total yang jelas.",
      "Kira jumlah jika harga diberi.",
      "Jangan reka harga, nombor invoice atau maklumat pelanggan yang tidak diberi.",
    ],
    slots: ["title", "date", "reference", "customer_info", "item_table", "total", "payment_info", "footer"],
    title: "Invoice / Quotation / Resit",
  },
  {
    aliases: ["slip gaji", "gaji", "payslip"],
    formatNotes: [
      "Maklumat pekerja dan majikan mesti jelas.",
      "Gunakan jadual pendapatan/potongan dan total gaji bersih.",
      "Jangan reka potongan jika tidak diberi.",
    ],
    slots: ["title", "employee_info", "employer_info", "date", "table", "total", "remarks", "signature"],
    title: "Slip gaji",
  },
  {
    aliases: ["borang", "pendaftaran", "maklumat diri", "form"],
    formatNotes: [
      "Gunakan label medan yang sejajar dan mudah diisi.",
      "Placeholder dibenarkan kerana borang memang untuk diisi.",
      "Tambah pengakuan/tandatangan jika sesuai.",
    ],
    slots: ["title", "section", "name", "date", "description", "declaration", "signature"],
    title: "Borang",
  },
];

export function getRelevantTemplates(prompt: string, limit = 3) {
  const lowerPrompt = prompt.toLowerCase();
  const scored = documentBrainTemplates
    .map((template) => ({
      score: template.aliases.reduce((total, alias) => total + (lowerPrompt.includes(alias) ? 1 : 0), 0),
      template,
    }))
    .sort((first, second) => second.score - first.score);

  const matched = scored.filter((item) => item.score > 0).slice(0, limit).map((item) => item.template);
  return matched.length > 0 ? matched : documentBrainTemplates.slice(0, 2);
}
