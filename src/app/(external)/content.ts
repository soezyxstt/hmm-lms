/**
 * External landing copy and asset paths. Images live under /public/external/images/ — add files to match.
 */

export const manifesto = {
  /** Three-beat punch line (IG-style) */
  punch: "Presisi. Karya. Dampak.",
  support:
    "Pionir di kelas, di himpunan, di Indonesia — untuk keilmuan, masyarakat, dan bangsa.",
} as const;

export const visi = {
  heading: "Visi HMM",
  lead: "Pionir masa depan lewat karya & keprofesian.",
  tldr: "Dua jalur: inkubator karya (keteknikmesinan) + inkubator keprofesian (karir & soft skill).",
} as const;

export const inkubatorKarya = {
  title: "Inkubator karya & keprofesian",
  karya: {
    subtitle: "Inkubator karya",
    lead: "Kajian, lomba, karya masyarakat — keilmuan yang hidup.",
    body: "HMM ITB menjadi wadah yang mengembangkan pemahaman dan keterampilan anggotanya dalam bidang ke-karya-an, yaitu karya keteknikmesinan (kajian isu, perlombaan, dan karya untuk masyarakat). Tujuannya: anggota lebih memahami keilmuannya sendiri dan menerapkannya di masyarakat dan masa depan.",
  },
  keprofesian: {
    subtitle: "Inkubator keprofesian",
    lead: "Karir terpersonalisasi, relevan, siap industri.",
    body: "HMM ITB menjadi wadah yang mengembangkan pemahaman dan keterampilan anggotanya dalam bidang karir — mencakup soft skill yang sesuai tujuan karir masing-masing secara terpersonalisasi, sehingga anggota memiliki kemampuan yang dibutuhkan dan dapat diterima di perusahaan yang diinginkan.",
  },
} as const;

export const setelahItu = {
  title: "Pionir masa depan",
  body: "Setelah anggota memiliki pemahaman yang mendalam terhadap keilmuan keteknikmesinannya, serta tujuan karir, soft skill yang sesuai, dan mampu mencapai karir yang diinginkan, anggota disebut pionir masa depan: orang-orang yang pertama kali siap memecahkan masalah di masa depan—baik di perkuliahan, himpunan, maupun pekerjaan.",
} as const;

export type EditorialPillar = "Study" | "Society" | "Solidarity";

export type EditorialSpot = {
  id: string;
  imageSrc: string;
  tag: EditorialPillar;
  caption: string;
  href?: string;
  /** Layout: one tile is `feature` (2×2 on large screens) */
  bento: "feature" | "default";
};

/** Foreground bento: mixed sizes; images as story tiles (paths under /public/) */
export const editorialSpots: ReadonlyArray<EditorialSpot> = [
  {
    id: "lab-momentum",
    imageSrc: "/external/images/inddes.jpg",
    tag: "Study",
    caption: "Fokus di lab, siap lomba nasional",
    bento: "feature",
  },
  {
    id: "kawan-dan-aksi",
    imageSrc: "/external/images/wisok.jpg",
    tag: "Society",
    caption: "Dampak nyata, bareng warga",
    bento: "default",
  },
  {
    id: "karya-desain",
    imageSrc: "/external/images/inddes.jpg",
    tag: "Study",
    caption: "Dari sketsa ke produk",
    bento: "default",
  },
  {
    id: "jalin-luar",
    /* Campus / visit story; use kunjungan.jpg in public when available (see other editorial assets) */
    imageSrc: "/external/images/about-hero.png",
    tag: "Society",
    caption: "Jejak kunjungan & kolaborasi",
    bento: "default",
  },
  {
    id: "satu-irama",
    imageSrc: "/external/images/salam_satu_bakul.jpg",
    tag: "Solidarity",
    caption: "Kekuatan satu badan, satu tujuan",
    bento: "default",
  },
] as const;

export type MisiItem = {
  cardTitle: string;
  oneLiner: string;
  summary: string;
  body: string;
};

export const misi: ReadonlyArray<MisiItem> = [
  {
    cardTitle: "Karya teknis",
    oneLiner: "Berkarya teknis, evaluatif, inovatif di bidangmu.",
    summary: "Wadah karya teknis, evaluatif, dan inovatif",
    body: "Membentuk wadah pengembangan kemampuan berkarya anggota secara teknis, evaluatif, dan inovatif di bidang keteknikmesinan.",
  },
  {
    cardTitle: "Pionir pribadi",
    oneLiner: "Berkembang personal — tidak satu cetakan.",
    summary: "Pionir dan personalisasi",
    body: "Mengembangkan anggota HMM ITB menjadi pionir dan sistem perkembangan diri anggota yang terpersonalisasi.",
  },
  {
    cardTitle: "Siap profesi",
    oneLiner: "Kompeten menghadapi industri yang bergerak.",
    summary: "Siap hadapi dunia profesional",
    body: "Mengembangkan kompetensi dan keterampilan anggota untuk siap menghadapi tantangan dunia keprofesian yang dinamis.",
  },
  {
    cardTitle: "Lingkungan sehat",
    oneLiner: "Kebutuhan dasar terpenuhi, tumbuh bareng.",
    summary: "Lingkungan suportif",
    body: "Memastikan pemenuhan kebutuhan dasar anggota di lingkungan yang suportif dalam mendukung perkembangan.",
  },
  {
    cardTitle: "Jaring & bangun",
    oneLiner: "Jembatan ke eksternal yang jelas dan saling harga.",
    summary: "Jembatan eksternal",
    body: "Membangun dan memelihara hubungan baik dengan pihak eksternal sebagai jembatan dalam kolaborasi dan pemenuhan kebutuhan himpunan.",
  },
  {
    cardTitle: "Empati dulu",
    oneLiner: "Karya bermanfaat dimulai dari memahami.",
    summary: "Empati menuju karya",
    body: "Mewadahi pembelajaran empati anggota sebagai langkah awal dalam implementasi karya yang bermanfaat dan tepat guna bagi masyarakat.",
  },
  {
    cardTitle: "Terpampang jelas",
    oneLiner: "Cerita HMM & anggota, terbuka di media.",
    summary: "Exposure organisasi & anggota",
    body: "Mengoptimalisasi penggunaan media sosial dalam upaya peningkatan exposure dari HMM ITB sebagai organisasi keteknikmesinan dan anggotanya.",
  },
  {
    cardTitle: "Tata luhur",
    oneLiner: "Organisasi transparan, terkendali, mandiri.",
    summary: "Organisasi transparan & terkontrol",
    body: "Membangun sistem organisasi yang optimal, transparan, independen, dan terkontrol.",
  },
] as const;

export const heritageTimeline = [
  {
    year: "1946",
    title: "Establishment",
    text: "HMM ITB didirikan pada Desember 1946 sebagai wadah mahasiswa mesin untuk berdaya dan berkarya bagi bangsa.",
  },
  {
    year: "Now",
    title: "Pionir Berkarya",
    text: "HMM ITB terus mengembangkan pendidikan kemahasiswaan, advokasi anggota, dan pengabdian masyarakat yang berdampak.",
  },
] as const;

export const externalImages = {
  /** Full-bleed manifesto / hero */
  hero: "/external/images/hero.png",
  /** Study pillar — split layout (academics / keilmuan) */
  pillarStudy: "/external/images/organogram/Academics and Scholarship.jpg",
  /** Society pillar — full-bleed, left weight */
  pillarSociety: "/external/images/salam_satu_bakul.jpg",
  /** Solidarity pillar */
  pillarSolidarity: "/external/images/wisok.jpg",
  /** Intentional light “studio” chapter */
  heritage: "/external/images/about-hero.png",
  /** Visi / inkubator dark chapter (optional) */
  visiArt: "/external/images/badan_pengurus.jpg",
  /** CTA */
  cta: "/external/images/wisok.jpg",
} as const;

export const externalContact = {
  email: "bccipionirberkarya@gmail.com",
  /** Official socials; update if handles change */
  instagramUrl: "https://www.instagram.com/hmmitb/" as string,
  tiktokUrl: "https://www.tiktok.com/@hmmitb" as string,
  lineUrl: "" as string,
} as const;

export const pillars = [
  {
    key: "study" as const,
    title: "Study",
    kicker: "Keilmuan & karya",
    description:
      "Mendorong tujuan pendidikan lewat karya, ide, dan inovasi teknologi yang relevan.",
    variant: "split" as const,
    imageKey: "pillarStudy" as const,
  },
  {
    key: "society" as const,
    title: "Society",
    kicker: "Masyarakat",
    description:
      "Tanggung jawab sosial dan kontribusi nyata bagi masyarakat dan kemajuan Indonesia.",
    variant: "society" as const,
    imageKey: "pillarSociety" as const,
  },
  {
    key: "solidarity" as const,
    title: "Solidarity",
    kicker: "Kekeluargaan",
    description:
      "Kekeluargaan, keharmonisan, dan kesejahteraan anggota — satu solidaritas.",
    variant: "solidarity" as const,
    imageKey: "pillarSolidarity" as const,
  },
] as const;
