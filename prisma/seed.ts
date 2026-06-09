import { PrismaClient, Role, ContentStatus, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Seed UPTDs ──────────────────────────────────────────────────────────────
  // Koordinat menggunakan titik pusat wilayah. Perlu diverifikasi oleh admin.
  const uptdData = [
    {
      code: "UPTD-001",
      name: "UPTD Samsat Kota Jambi",
      address: "Jl. Sultan Thaha No. 17, Ps. Jambi, Kota Jambi",
      phone: "0741-23355",
      email: "samsat.kotajambi@bapenda.jambiprov.go.id",
      headName: "Dr. H. Ahmad Fauzi, M.Si",
      province: "Jambi",
      city: "Kota Jambi",
      district: "Pasar Jambi",
      latitude: -1.6101,
      longitude: 103.6131,
      googleMapsUrl: "https://maps.google.com/?q=-1.6101,103.6131",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-002",
      name: "UPTD Samsat Muaro Jambi",
      address: "Jl. Lintas Sumatera, Sengeti, Muaro Jambi",
      phone: "0741-7076000",
      email: "samsat.muarojambi@bapenda.jambiprov.go.id",
      headName: "Drs. H. Budiman, M.M",
      province: "Jambi",
      city: "Kabupaten Muaro Jambi",
      district: "Sekernan",
      latitude: -1.5982,
      longitude: 103.4670,
      googleMapsUrl: "https://maps.google.com/?q=-1.5982,103.4670",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-003",
      name: "UPTD Samsat Batanghari",
      address: "Jl. Depati Purbo No. 1, Muara Bulian, Batanghari",
      phone: "0743-21098",
      email: "samsat.batanghari@bapenda.jambiprov.go.id",
      headName: "H. Ridwan Syah, S.E., M.M",
      province: "Jambi",
      city: "Kabupaten Batanghari",
      district: "Muara Bulian",
      latitude: -1.7249,
      longitude: 103.2614,
      googleMapsUrl: "https://maps.google.com/?q=-1.7249,103.2614",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-004",
      name: "UPTD Samsat Muara Bungo",
      address: "Jl. Lintas Sumatera, Muara Bungo",
      phone: "0747-21024",
      email: "samsat.bungo@bapenda.jambiprov.go.id",
      headName: "H. Syamsul Bahri, S.E.",
      province: "Jambi",
      city: "Kabupaten Bungo",
      district: "Muara Bungo",
      latitude: -1.5543,
      longitude: 102.1186,
      googleMapsUrl: "https://maps.google.com/?q=-1.5543,102.1186",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-005",
      name: "UPTD Samsat Tebo",
      address: "Jl. Lintas Muara Tebo, Kabupaten Tebo",
      phone: "0744-21138",
      email: "samsat.tebo@bapenda.jambiprov.go.id",
      headName: "Hj. Yusnita, S.E., M.M",
      province: "Jambi",
      city: "Kabupaten Tebo",
      district: "Tebo Tengah",
      latitude: -1.3822,
      longitude: 102.1508,
      googleMapsUrl: "https://maps.google.com/?q=-1.3822,102.1508",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-006",
      name: "UPTD Samsat Sarolangun",
      address: "Jl. Lintas Sumatera, Sarolangun",
      phone: "0745-91024",
      email: "samsat.sarolangun@bapenda.jambiprov.go.id",
      headName: "Drs. H. Amir Hamzah",
      province: "Jambi",
      city: "Kabupaten Sarolangun",
      district: "Sarolangun",
      latitude: -2.3281,
      longitude: 102.6916,
      googleMapsUrl: "https://maps.google.com/?q=-2.3281,102.6916",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-007",
      name: "UPTD Samsat Merangin",
      address: "Jl. Jenderal Sudirman, Bangko, Merangin",
      phone: "0746-21059",
      email: "samsat.merangin@bapenda.jambiprov.go.id",
      headName: "H. Fahmi Arya, S.H.",
      province: "Jambi",
      city: "Kabupaten Merangin",
      district: "Bangko",
      latitude: -2.2733,
      longitude: 102.4656,
      googleMapsUrl: "https://maps.google.com/?q=-2.2733,102.4656",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-008",
      name: "UPTD Samsat Kerinci",
      address: "Jl. Depati Parbo, Sungai Penuh, Kerinci",
      phone: "0748-21058",
      email: "samsat.kerinci@bapenda.jambiprov.go.id",
      headName: "Dra. Hj. Rosmiati, M.Si",
      province: "Jambi",
      city: "Kota Sungai Penuh",
      district: "Sungai Penuh",
      latitude: -2.0622,
      longitude: 101.3930,
      googleMapsUrl: "https://maps.google.com/?q=-2.0622,101.3930",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-009",
      name: "UPTD Samsat Tanjung Jabung Barat",
      address: "Jl. Zainir Haviz, Kuala Tungkal, Tanjab Barat",
      phone: "0742-21216",
      email: "samsat.tanjabbar@bapenda.jambiprov.go.id",
      headName: "H. Edy Kurniawan, S.E.",
      province: "Jambi",
      city: "Kabupaten Tanjung Jabung Barat",
      district: "Tungkal Ilir",
      latitude: -0.8540,
      longitude: 103.4634,
      googleMapsUrl: "https://maps.google.com/?q=-0.8540,103.4634",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-010",
      name: "UPTD Samsat Tanjung Jabung Timur",
      address: "Jl. Komplek Perkantoran, Muara Sabak, Tanjab Timur",
      phone: "0740-7353001",
      email: "samsat.tabjtim@bapenda.jambiprov.go.id",
      headName: "Drs. H. Fauzan, M.M",
      province: "Jambi",
      city: "Kabupaten Tanjung Jabung Timur",
      district: "Muara Sabak Barat",
      latitude: -1.0812,
      longitude: 103.8698,
      googleMapsUrl: "https://maps.google.com/?q=-1.0812,103.8698",
      isActive: true,
      showOnPublicMap: true,
    },
    {
      code: "UPTD-011",
      name: "UPTD Samsat Sungai Penuh",
      address: "Jl. Muradi, Sungai Penuh",
      phone: "0748-322058",
      email: "samsat.sungaipenuh@bapenda.jambiprov.go.id",
      headName: "H. Hermansyah, S.E., M.Si",
      province: "Jambi",
      city: "Kota Sungai Penuh",
      district: "Sungai Penuh",
      latitude: -2.0534,
      longitude: 101.3974,
      googleMapsUrl: "https://maps.google.com/?q=-2.0534,101.3974",
      isActive: true,
      showOnPublicMap: true,
    },
  ];

  const uptdRecords: Record<string, { id: number }> = {};
  for (const u of uptdData) {
    const record = await prisma.uptd.upsert({
      where: { code: u.code },
      update: {
        latitude: u.latitude,
        longitude: u.longitude,
        city: u.city,
        district: u.district,
        province: u.province,
        googleMapsUrl: u.googleMapsUrl,
        showOnPublicMap: u.showOnPublicMap,
      },
      create: u,
    });
    uptdRecords[u.code] = { id: record.id };
  }

  const uptd1 = uptdRecords["UPTD-001"];
  const uptd2 = uptdRecords["UPTD-002"];
  const uptd3 = uptdRecords["UPTD-003"];

  // Seed Users
  const passwordHash = await bcrypt.hash("password", 12);

  await prisma.user.upsert({
    where: { email: "superadmin@bapenda.jambiprov.go.id" },
    update: {},
    create: {
      role: Role.Super_Admin,
      name: "Super Administrator",
      email: "superadmin@bapenda.jambiprov.go.id",
      passwordHash: passwordHash,
      phone: "081234567890",
      gender: "Laki-laki",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@bapenda.jambiprov.go.id" },
    update: {},
    create: {
      role: Role.Admin,
      name: "Administrator",
      email: "admin@bapenda.jambiprov.go.id",
      passwordHash: passwordHash,
      phone: "081234567891",
      gender: "Laki-laki",
      isActive: true,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@bapenda.jambiprov.go.id" },
    update: {},
    create: {
      role: Role.Editor,
      name: "Editor Konten",
      email: "editor@bapenda.jambiprov.go.id",
      passwordHash: passwordHash,
      phone: "081234567892",
      gender: "Perempuan",
      isActive: true,
    },
  });

  const ketuaUptd = await prisma.user.upsert({
    where: { email: "ketua.uptd1@bapenda.jambiprov.go.id" },
    update: {},
    create: {
      role: Role.Ketua_Uptd,
      uptdId: uptd1.id,
      name: "Ketua UPTD Kota Jambi",
      email: "ketua.uptd1@bapenda.jambiprov.go.id",
      passwordHash: passwordHash,
      phone: "081234567893",
      gender: "Laki-laki",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin.uptd1@bapenda.jambiprov.go.id" },
    update: {},
    create: {
      role: Role.Admin_Uptd,
      uptdId: uptd1.id,
      name: "Admin UPTD Kota Jambi",
      email: "admin.uptd1@bapenda.jambiprov.go.id",
      passwordHash: passwordHash,
      phone: "081234567894",
      gender: "Perempuan",
      isActive: true,
    },
  });

  // Seed News Categories
  const categories = [
    { name: "Pengumuman", slug: "pengumuman" },
    { name: "Berita", slug: "berita" },
    { name: "Kegiatan", slug: "kegiatan" },
    { name: "Inovasi", slug: "inovasi" },
    { name: "Layanan", slug: "layanan" },
  ];

  const createdCategories: Record<string, number> = {};
  for (const cat of categories) {
    const created = await prisma.newsCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }

  // Seed FAQ Categories
  const faqCategories = [
    { name: "PKB (Pajak Kendaraan Bermotor)", slug: "pkb" },
    { name: "BBNKB (Bea Balik Nama Kendaraan)", slug: "bbnkb" },
    { name: "E-Samsat", slug: "e-samsat" },
    { name: "Umum", slug: "umum" },
  ];

  const createdFaqCategories: Record<string, number> = {};
  for (const cat of faqCategories) {
    const created = await prisma.faqCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdFaqCategories[cat.slug] = created.id;
  }

  // Seed Pages
  const pages = [
    {
      title: "Sejarah",
      slug: "sejarah",
      content: `<h2>Sejarah Badan Pendapatan Daerah Provinsi Jambi</h2>
<p>Badan Pendapatan Daerah (BAPENDA) Provinsi Jambi merupakan perangkat daerah yang menangani urusan pemerintahan bidang keuangan khususnya pengelolaan pendapatan daerah.</p>
<p>Dibentuk berdasarkan Peraturan Daerah Provinsi Jambi, BAPENDA bertugas untuk menghimpun, mengelola, dan mengoptimalkan penerimaan pajak daerah guna mendukung pembangunan daerah.</p>`,
      seoTitle: "Sejarah BAPENDA Provinsi Jambi",
      seoDescription: "Sejarah dan latar belakang Badan Pendapatan Daerah Provinsi Jambi",
      isPublished: true,
    },
    {
      title: "Visi dan Misi",
      slug: "visi-misi",
      content: `<h2>Visi</h2>
<p>"Terwujudnya Pendapatan Daerah yang Optimal untuk Mendukung Pembangunan Provinsi Jambi yang Maju dan Sejahtera"</p>
<h2>Misi</h2>
<ol>
<li>Meningkatkan kualitas pelayanan pajak daerah yang profesional dan berintegritas</li>
<li>Mengoptimalkan penerimaan pendapatan daerah melalui intensifikasi dan ekstensifikasi</li>
<li>Mewujudkan tata kelola pemerintahan yang baik dan bersih</li>
<li>Meningkatkan kompetensi dan kapasitas sumber daya aparatur</li>
<li>Mengembangkan sistem informasi pendapatan daerah yang modern</li>
</ol>`,
      seoTitle: "Visi Misi BAPENDA Provinsi Jambi",
      seoDescription: "Visi dan misi Badan Pendapatan Daerah Provinsi Jambi",
      isPublished: true,
    },
    {
      title: "Tugas Pokok dan Fungsi",
      slug: "tupoksi",
      content: `<h2>Tugas Pokok</h2>
<p>Badan Pendapatan Daerah mempunyai tugas membantu Gubernur melaksanakan urusan pemerintahan yang menjadi kewenangan daerah di bidang pendapatan daerah.</p>
<h2>Fungsi</h2>
<ul>
<li>Perumusan kebijakan di bidang pendapatan daerah</li>
<li>Pelaksanaan kebijakan di bidang pendapatan daerah</li>
<li>Pelaksanaan evaluasi dan pelaporan di bidang pendapatan daerah</li>
<li>Pelaksanaan administrasi badan</li>
<li>Pelaksanaan fungsi lain yang diberikan oleh Gubernur</li>
</ul>`,
      seoTitle: "Tupoksi BAPENDA Provinsi Jambi",
      seoDescription: "Tugas pokok dan fungsi Badan Pendapatan Daerah Provinsi Jambi",
      isPublished: true,
    },
    {
      title: "Struktur Organisasi",
      slug: "struktur-organisasi",
      content: `<h2>Struktur Organisasi</h2>
<p>Badan Pendapatan Daerah Provinsi Jambi dipimpin oleh seorang Kepala Badan yang dibantu oleh:</p>
<ul>
<li>Sekretariat</li>
<li>Bidang Perencanaan Pendapatan</li>
<li>Bidang Pajak Kendaraan Bermotor</li>
<li>Bidang Pajak Air dan Pajak Lainnya</li>
<li>Bidang Penagihan dan Keberatan</li>
<li>UPT Samsat (tersebar di seluruh Kabupaten/Kota)</li>
</ul>`,
      seoTitle: "Struktur Organisasi BAPENDA Provinsi Jambi",
      seoDescription: "Struktur organisasi Badan Pendapatan Daerah Provinsi Jambi",
      isPublished: true,
    },
    {
      title: "Pejabat",
      slug: "pejabat",
      content: `<h2>Pejabat BAPENDA Provinsi Jambi</h2>
<table>
<thead><tr><th>Jabatan</th><th>Nama</th></tr></thead>
<tbody>
<tr><td>Kepala Badan</td><td>Dr. H. Amri Effendi, M.Si</td></tr>
<tr><td>Sekretaris</td><td>Hj. Nurhayati, S.E., M.M</td></tr>
<tr><td>Kepala Bidang PKB</td><td>Drs. H. Syahrial, M.Si</td></tr>
<tr><td>Kepala Bidang Pajak Lainnya</td><td>Ir. Hendra Gunawan, M.T</td></tr>
<tr><td>Kepala Bidang Penagihan</td><td>Dra. Hj. Siti Rahmah, M.M</td></tr>
</tbody>
</table>`,
      seoTitle: "Pejabat BAPENDA Provinsi Jambi",
      seoDescription: "Daftar pejabat Badan Pendapatan Daerah Provinsi Jambi",
      isPublished: true,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  // Seed Banners
  const banners = [
    {
      title: "Layanan Pajak Daerah Provinsi Jambi",
      description: "Kami hadir untuk memberikan pelayanan terbaik dalam pengelolaan pajak daerah",
      imageUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/bapenda/banner-1.jpg",
      buttonText: "Pelajari Lebih Lanjut",
      buttonUrl: "/profil/sejarah",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "E-Samsat: Pembayaran Pajak Online",
      description: "Bayar pajak kendaraan bermotor Anda dengan mudah melalui E-Samsat",
      imageUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/bapenda/banner-2.jpg",
      buttonText: "Bayar Sekarang",
      buttonUrl: "https://esamsat.jambiprov.go.id",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Optimalisasi Pendapatan Daerah",
      description: "Bersama membangun Provinsi Jambi yang maju dan sejahtera",
      imageUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/bapenda/banner-3.jpg",
      buttonText: "Lihat Program",
      buttonUrl: "/layanan",
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner }).catch(() => { });
  }

  // Seed Settings
  const settings = [
    { key: "site_name", value: "BAPENDA Provinsi Jambi" },
    { key: "site_description", value: "Website Resmi Badan Pendapatan Daerah Provinsi Jambi" },
    { key: "site_keywords", value: "bapenda, pajak, jambi, samsat, pkb, bbnkb" },
    { key: "contact_address", value: "Jl. Ahmad Yani No. 1, Kota Jambi 36122" },
    { key: "contact_phone", value: "(0741) 60436" },
    { key: "contact_email", value: "info@bapenda.jambiprov.go.id" },
    { key: "contact_fax", value: "(0741) 60436" },
    { key: "social_facebook", value: "https://facebook.com/bapendajambi" },
    { key: "social_twitter", value: "https://twitter.com/bapendajambi" },
    { key: "social_instagram", value: "https://instagram.com/bapendajambi" },
    { key: "social_youtube", value: "https://youtube.com/bapendajambi" },
    { key: "office_hours", value: "Senin - Jumat: 08.00 - 16.00 WIB" },
    { key: "google_analytics_id", value: "" },
    { key: "footer_text", value: "© 2024 BAPENDA Provinsi Jambi. Hak Cipta Dilindungi." },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Seed Demo News
  const newsItems = [
    {
      title: "BAPENDA Jambi Luncurkan Program E-Samsat untuk Kemudahan Masyarakat",
      excerpt: "Program E-Samsat yang baru diluncurkan memudahkan masyarakat membayar pajak kendaraan bermotor secara online.",
      content: `<p>Badan Pendapatan Daerah (BAPENDA) Provinsi Jambi resmi meluncurkan program E-Samsat yang memungkinkan masyarakat membayar pajak kendaraan bermotor secara online.</p>
<p>Program ini merupakan bagian dari upaya digitalisasi layanan publik yang dilakukan BAPENDA untuk meningkatkan kenyamanan dan efisiensi pelayanan pajak daerah.</p>
<p>Dengan E-Samsat, wajib pajak tidak perlu lagi mengantri panjang di kantor Samsat. Cukup dengan smartphone, pembayaran PKB dapat dilakukan kapan saja dan di mana saja.</p>`,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2024-01-15"),
    },
    {
      title: "Realisasi PAD Provinsi Jambi Triwulan III Melampaui Target",
      excerpt: "Realisasi Pendapatan Asli Daerah Provinsi Jambi triwulan III 2024 berhasil melampaui target yang telah ditetapkan.",
      content: `<p>Badan Pendapatan Daerah (BAPENDA) Provinsi Jambi berhasil mencatat realisasi Pendapatan Asli Daerah (PAD) pada triwulan III tahun 2024 yang melampaui target yang telah ditetapkan.</p>
<p>Total realisasi PAD mencapai 85% dari target tahunan, meningkat signifikan dibandingkan periode yang sama tahun lalu.</p>
<p>Kepala BAPENDA menyampaikan bahwa pencapaian ini merupakan hasil dari berbagai program intensifikasi pajak yang telah dilaksanakan sepanjang tahun.</p>`,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2024-10-20"),
    },
    {
      title: "Sosialisasi Pajak Kendaraan Bermotor di Kabupaten Merangin",
      excerpt: "BAPENDA Jambi mengadakan sosialisasi pajak kendaraan bermotor untuk meningkatkan kesadaran wajib pajak di Kabupaten Merangin.",
      content: `<p>Tim BAPENDA Provinsi Jambi melakukan sosialisasi Pajak Kendaraan Bermotor (PKB) di Kabupaten Merangin sebagai bagian dari program edukasi wajib pajak.</p>
<p>Kegiatan ini dihadiri oleh ratusan masyarakat dan bertujuan untuk meningkatkan kesadaran dan kepatuhan wajib pajak dalam memenuhi kewajiban perpajakan mereka.</p>`,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2024-11-05"),
    },
  ];

  for (const item of newsItems) {
    const slug = slugify(item.title, { lower: true, strict: true });
    await prisma.news.upsert({
      where: { slug },
      update: {},
      create: {
        ...item,
        slug,
        categoryId: createdCategories["berita"] ?? Object.values(createdCategories)[0],
        authorId: editor.id,
        thumbnailUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/news-default.jpg",
        seoTitle: item.title,
        seoDescription: item.excerpt,
      },
    });
  }

  // Seed Demo FAQs
  const faqs = [
    {
      question: "Apa itu Pajak Kendaraan Bermotor (PKB)?",
      answer: "Pajak Kendaraan Bermotor (PKB) adalah pajak atas kepemilikan dan/atau penguasaan kendaraan bermotor. PKB merupakan salah satu pajak daerah yang dikelola oleh BAPENDA Provinsi Jambi.",
      categorySlug: "pkb",
      sortOrder: 1,
    },
    {
      question: "Bagaimana cara membayar PKB melalui E-Samsat?",
      answer: "Untuk membayar PKB melalui E-Samsat: 1) Kunjungi website E-Samsat atau unduh aplikasinya. 2) Masukkan nomor polisi kendaraan Anda. 3) Periksa data kendaraan dan jumlah pajak. 4) Pilih metode pembayaran. 5) Lakukan pembayaran. 6) Simpan bukti pembayaran.",
      categorySlug: "e-samsat",
      sortOrder: 1,
    },
    {
      question: "Apa yang dimaksud dengan BBNKB?",
      answer: "Bea Balik Nama Kendaraan Bermotor (BBNKB) adalah pajak atas penyerahan hak milik kendaraan bermotor sebagai akibat perjanjian dua pihak atau perbuatan sepihak atau keadaan yang terjadi karena jual beli, tukar menukar, hibah, warisan, atau pemasukan ke dalam badan usaha.",
      categorySlug: "bbnkb",
      sortOrder: 1,
    },
    {
      question: "Dimana saya bisa membayar pajak kendaraan?",
      answer: "Pajak kendaraan dapat dibayar di: 1) Kantor Samsat terdekat. 2) Samsat Keliling yang beroperasi di berbagai lokasi. 3) Layanan E-Samsat secara online. 4) Bank-bank yang telah bekerja sama dengan BAPENDA.",
      categorySlug: "umum",
      sortOrder: 1,
    },
    {
      question: "Apa dokumen yang diperlukan untuk balik nama kendaraan?",
      answer: "Dokumen yang diperlukan: 1) KTP asli pemilik baru beserta fotokopi. 2) BPKB asli beserta fotokopi. 3) STNK asli beserta fotokopi. 4) Kuitansi pembelian bermaterai. 5) Hasil cek fisik kendaraan.",
      categorySlug: "bbnkb",
      sortOrder: 2,
    },
  ];

  for (const faq of faqs) {
    const categoryId = createdFaqCategories[faq.categorySlug];
    if (!categoryId) continue;
    await prisma.faq.create({
      data: {
        categoryId,
        authorId: editor.id,
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
        isPublished: true,
      },
    }).catch(() => { });
  }

  // Seed Demo Gallery
  const gallery = await prisma.gallery.create({
    data: {
      authorId: editor.id,
      title: "Kegiatan Sosialisasi PKB 2024",
      description: "Dokumentasi kegiatan sosialisasi Pajak Kendaraan Bermotor tahun 2024",
      coverImage: "https://ik.imagekit.io/o7kpef481o/bapenda/gallery-cover.jpg",
      status: ContentStatus.PUBLISHED,
    },
  });

  await prisma.galleryItem.createMany({
    data: [
      {
        galleryId: gallery.id,
        mediaType: MediaType.IMAGE,
        fileUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/gallery-1.jpg",
        title: "Pembukaan Sosialisasi",
        sortOrder: 1,
      },
      {
        galleryId: gallery.id,
        mediaType: MediaType.IMAGE,
        fileUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/gallery-2.jpg",
        title: "Penyampaian Materi",
        sortOrder: 2,
      },
      {
        galleryId: gallery.id,
        mediaType: MediaType.IMAGE,
        fileUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/gallery-3.jpg",
        title: "Sesi Tanya Jawab",
        sortOrder: 3,
      },
    ],
  });

  // Seed Regulations
  await prisma.regulation.createMany({
    data: [
      {
        title: "Perda No. 8 Tahun 2010 tentang Pajak Daerah",
        description: "Peraturan Daerah Provinsi Jambi tentang Pajak Daerah",
        fileUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/perda-8-2010.pdf",
        publishedAt: new Date("2010-01-01"),
      },
      {
        title: "Pergub No. 12 Tahun 2024 tentang Tarif PKB",
        description: "Peraturan Gubernur tentang Tarif Pajak Kendaraan Bermotor",
        fileUrl: "https://ik.imagekit.io/o7kpef481o/bapenda/pergub-12-2024.pdf",
        publishedAt: new Date("2024-01-15"),
      },
    ],
  }).catch(() => { });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
