import { PrismaClient, Role, ContentStatus, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed UPTDs
  const uptd1 = await prisma.uptd.upsert({
    where: { code: "UPTD-001" },
    update: {},
    create: {
      code: "UPTD-001",
      name: "UPTD Samsat Kota Jambi",
      address: "Jl. Sultan Thaha No. 1, Kota Jambi",
      phone: "0741-12345",
      email: "samsat.kotajambi@bapenda.jambiprov.go.id",
      headName: "Dr. H. Ahmad Fauzi, M.Si",
      isActive: true,
    },
  });

  const uptd2 = await prisma.uptd.upsert({
    where: { code: "UPTD-002" },
    update: {},
    create: {
      code: "UPTD-002",
      name: "UPTD Samsat Muaro Jambi",
      address: "Jl. Lintas Sumatera, Sengeti",
      phone: "0741-67890",
      email: "samsat.muarojambi@bapenda.jambiprov.go.id",
      headName: "Drs. H. Budiman, M.M",
      isActive: true,
    },
  });

  const uptd3 = await prisma.uptd.upsert({
    where: { code: "UPTD-003" },
    update: {},
    create: {
      code: "UPTD-003",
      name: "UPTD Samsat Batanghari",
      address: "Jl. Depati Purbo, Muara Bulian",
      phone: "0743-21098",
      email: "samsat.batanghari@bapenda.jambiprov.go.id",
      headName: "H. Ridwan Syah, S.E., M.M",
      isActive: true,
    },
  });

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
