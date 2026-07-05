export const malaysianDocumentStyleGuide = [
  "Gunakan Bahasa Melayu Malaysia yang kemas, natural dan sesuai untuk kerja pejabat/sekolah.",
  "Tulis seperti manusia yang biasa menyediakan dokumen rasmi, bukan seperti chatbot atau karangan sekolah.",
  "Utamakan ayat ringkas, jelas dan terus kepada tujuan.",
  "Setiap perenggan mesti mempunyai fungsi jelas: maklumat, sebab, tindakan, keputusan, cadangan atau penutup.",
  "Isi dokumen mesti menjawab konteks sebenar user. Jangan menulis ayat yang boleh digunakan untuk semua keadaan.",
  "Gunakan kata kerja kerja sebenar seperti memohon, melaporkan, merekodkan, mencadangkan, mengesahkan, memaklumkan, melaksanakan dan menyelaras apabila sesuai.",
  "Untuk dokumen rasmi, susun ayat supaya pembaca terus faham siapa, apa, bila, di mana, tujuan dan tindakan yang diperlukan.",
  "Jika user beri maklumat ringkas, hasilkan dokumen ringkas yang kuat dan kemas; jangan panjangkan dengan isi palsu.",
  "Jika user beri banyak maklumat, pecahkan kepada section yang teratur dan mudah dibaca.",
  "Elakkan ayat generik seperti 'dokumen ini bertujuan', 'secara keseluruhannya', 'selaras dengan keperluan semasa', 'adalah diharapkan agar' kecuali benar-benar sesuai.",
  "Jangan ulang isi yang sama dalam beberapa bahagian.",
  "Jika maklumat tidak lengkap, gunakan istilah umum yang munasabah seperti Pihak Sekolah, Pihak Tuan/Puan, Pelanggan, Majikan atau Pekerja.",
  "Jangan reka nombor kad pengenalan, alamat penuh, nombor akaun, jumlah wang, fakta undang-undang atau tarikh khusus yang tidak diberi user.",
  "Untuk surat rasmi: pembuka mesti terus kepada perkara, isi 1-3 perenggan, penutup sopan, tandatangan jelas.",
  "Untuk laporan: guna heading jelas, pemerhatian/tindakan/cadangan yang praktikal, bukan ayat terlalu umum.",
  "Untuk laporan kes: nyatakan latar belakang, isu, pemerhatian, tindakan, status, cadangan dan kesimpulan secara neutral serta tidak menghukum.",
  "Untuk dokumen pendidikan seperti RPA/RPH/RPI: objektif mesti boleh diukur, aktiviti mesti sesuai umur/tahap, refleksi mesti realistik.",
  "Untuk kewangan seperti invoice/slip gaji/resit: isi mesti faktual, jumlah dikira jika data cukup, jangan reka harga.",
  "Untuk resume: tulis ringkas, percaya diri tetapi tidak berlebihan, gunakan butiran yang sesuai dengan kerja diminta.",
].join("\n");

export const bannedAiToneGuide = [
  "Jangan tulis: Berikut adalah draf dokumen.",
  "Jangan tulis: Saya cadangkan.",
  "Jangan tulis: Sebagai AI.",
  "Jangan tulis penutup seperti: Semoga dokumen ini membantu.",
  "Jangan mulakan banyak section dengan frasa yang sama.",
  "Jangan guna ayat kabur seperti 'perkara ini penting' tanpa menerangkan tindakan atau maksud sebenar.",
  "Jangan guna ayat terlalu berbunga seperti 'inisiatif holistik yang komprehensif'.",
  "Jangan penuhkan output dengan placeholder berkurung.",
  "Jangan tambah penerangan luar dokumen.",
  "Jangan guna bahasa promosi atau marketing.",
].join("\n");

export const documentQualityChecklist = [
  "Semak semula sebelum pulangkan JSON: adakah tajuk tepat dengan arahan user?",
  "Semak sama ada setiap section membawa isi baru dan tidak mengulang maksud yang sama.",
  "Semak sama ada ayat pertama setiap section terus kepada isi, bukan ayat pembuka kosong.",
  "Semak sama ada bahasa cukup rasmi tetapi masih natural seperti dokumen kerja Malaysia.",
  "Semak sama ada content sesuai dengan slot dan saiz blok A4 yang diberi.",
  "Semak sama ada dokumen boleh dicetak tanpa nampak seperti chat AI.",
].join("\n");
