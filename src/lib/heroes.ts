export const HEROES = [
  "Viper Ning",
  "Temulch",
  "Matari",
  "Tarka Ji",
  "Tsuchimikado Kurumi",
  "Tianhai",
  "Yoto Hime",
  "Valda Cui",
  "Yueshan",
  "Wuchen",
  "Justina Gu",
  "Takeda Nobutada",
  "Ziping Yin",
  "Feria Shen",
  "Akos Hu",
  "Zai",
  "Tessa",
  "Hadi Ismail",
  "Shayol Wei",
  "Lyam Liu",
  "Kylin Zhang",
  "Cyra",
  "Lannie",
  "Inor Wan",
  "Xunhuan Li",
  "Zenda Wu",
  "Tara Gan",
] as const;

export type Hero = (typeof HEROES)[number];

export function heroToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

const HERO_ICON_SLUG: Record<string, string> = {
  "Tsuchimikado Kurumi": "kurumi",
  "Takeda Nobutada": "takeda",
  "Hadi Ismail": "hadi",
  "Kylin Zhang": "kylin",
};

export function heroToIconPath(name: string): string {
  const slug = HERO_ICON_SLUG[name] || heroToSlug(name);
  return `${import.meta.env.BASE_URL}heroes/${slug}.png`;
}

export const HERO_COLORS: Record<string, string> = {
  "Viper Ning": "#8B0000",
  Temulch: "#3A6B35",
  Matari: "#6B2FA0",
  "Tarka Ji": "#CC5500",
  "Tsuchimikado Kurumi": "#D4648A",
  Tianhai: "#4A6B8A",
  "Yoto Hime": "#CC2233",
  "Valda Cui": "#2E5A8A",
  Yueshan: "#8A6B2A",
  Wuchen: "#5A4A8A",
  "Justina Gu": "#6B8A9A",
  "Takeda Nobutada": "#8A2A3A",
  "Ziping Yin": "#3A8A5A",
  "Feria Shen": "#AA4A5A",
  "Akos Hu": "#8A6A3A",
  Zai: "#AA3A6A",
  Tessa: "#4A8A8A",
  "Hadi Ismail": "#6A3A3A",
  "Shayol Wei": "#3A5A8A",
  "Lyam Liu": "#5A8A3A",
  "Kylin Zhang": "#7A4A6A",
  Cyra: "#AA5A2A",
  Lannie: "#AA6AAA",
  "Inor Wan": "#3A8A6A",
  "Xunhuan Li": "#4A3A7A",
  "Zenda Wu": "#6A4A2A",
  "Tara Gan": "#8A3A6A",
};
