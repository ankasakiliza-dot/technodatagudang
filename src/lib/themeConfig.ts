export interface ThemeOption {
  id: string;
  name: string;
  category: 'light' | 'dark';
  bg: string;
  border: string;
  desc: string;
  badge: 'Terang' | 'Gelap';
  previewGradient?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  // Mode Terang (Anti-Silau & Modern Eye-Care Light Modes)
  {
    id: 'theme-light-eyecare',
    name: 'Mode Terang Anti-Silau (Soft Eye-Care)',
    category: 'light',
    bg: 'bg-[#eef1f5]',
    border: 'border-slate-300',
    desc: 'Latar Doff Redup Lembut, Anti-Silau & Sangat Ramah di Mata',
    badge: 'Terang',
    previewGradient: 'from-[#e2e8f0] via-[#edf2f7] to-[#e2e8f0]'
  },
  {
    id: 'theme-light-warm',
    name: 'Mode Terang Warm Paper (Sepia Nyaman)',
    category: 'light',
    bg: 'bg-[#f5f2eb]',
    border: 'border-amber-300',
    desc: 'Nuansa Kertas Alami Hangat Meredam Radiasi Cahaya Biru',
    badge: 'Terang',
    previewGradient: 'from-[#fef3c7] via-[#f5f0e6] to-[#e7e0d3]'
  },
  {
    id: 'theme-light',
    name: 'Mode Terang Modern Glass (Sky & Slate)',
    category: 'light',
    bg: 'bg-white',
    border: 'border-sky-300',
    desc: 'Latar Gradien Halus Modern & Kartu Kaca Frosted',
    badge: 'Terang',
    previewGradient: 'from-sky-100 via-indigo-50 to-slate-100'
  },
  {
    id: 'theme-light-aurora',
    name: 'Mode Terang Aurora (Mint & Teal Soft)',
    category: 'light',
    bg: 'bg-[#f0fdfa]',
    border: 'border-teal-300',
    desc: 'Nuansa Segar Meneduhkan Gradien Mint & Teal',
    badge: 'Terang',
    previewGradient: 'from-teal-100 via-cyan-50 to-slate-100'
  },
  {
    id: 'theme-light-minimal',
    name: 'Mode Terang Minimalis (Clean Slate)',
    category: 'light',
    bg: 'bg-[#f8fafc]',
    border: 'border-slate-300',
    desc: 'Putih Bersih Standar Kontras Tinggi',
    badge: 'Terang',
    previewGradient: 'from-slate-100 to-white'
  },

  // Mode Gelap (Modern Dark Modes)
  {
    id: 'default',
    name: 'Mode Gelap Cyber Slate',
    category: 'dark',
    bg: 'bg-[#0b0f19]',
    border: 'border-cyan-500',
    desc: 'Nuansa Gelap Biru Cyber Klasik',
    badge: 'Gelap',
    previewGradient: 'from-[#0b0f19] to-[#0f172a]'
  },
  {
    id: 'theme-oled',
    name: 'Mode Gelap OLED (Deep Black)',
    category: 'dark',
    bg: 'bg-black',
    border: 'border-white',
    desc: 'Hitam Pekat Hemat Daya Layar OLED',
    badge: 'Gelap',
    previewGradient: 'from-black to-zinc-950'
  },
  {
    id: 'theme-emerald',
    name: 'Mode Gelap Emerald Night',
    category: 'dark',
    bg: 'bg-[#021a14]',
    border: 'border-emerald-500',
    desc: 'Nuansa Hijau Gelap Elegan',
    badge: 'Gelap',
    previewGradient: 'from-[#021a14] to-[#064e3b]'
  },
  {
    id: 'theme-violet',
    name: 'Mode Gelap Violet Cyber',
    category: 'dark',
    bg: 'bg-[#0d0b1e]',
    border: 'border-purple-500',
    desc: 'Nuansa Ungu Futuristik',
    badge: 'Gelap',
    previewGradient: 'from-[#0d0b1e] to-[#2e1065]'
  }
];

export const isThemeLight = (themeId: string): boolean => {
  return (
    themeId === 'theme-light-eyecare' ||
    themeId === 'theme-light-warm' ||
    themeId === 'theme-light' ||
    themeId === 'theme-light-aurora' ||
    themeId === 'theme-light-minimal'
  );
};
