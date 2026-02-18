export interface Rank {
  id: string;
  emoji: string;
  name: string;
  nameTH: string;
  minXP: number;
  color: string;
  description: string;
  descriptionTH: string;
}

export const ranks: Rank[] = [
  {
    id: "seedling",
    emoji: "🌱",
    name: "Seedling",
    nameTH: "มือใหม่",
    minXP: 0,
    color: "#16a34a",
    description: "Just started your journey",
    descriptionTH: "เพิ่งเริ่มต้นการเดินทาง",
  },
  {
    id: "consistent",
    emoji: "🔥",
    name: "Consistent Saver",
    nameTH: "นักออมสม่ำเสมอ",
    minXP: 200,
    color: "#ea580c",
    description: "Showing up every week",
    descriptionTH: "มาทุกสัปดาห์ไม่ขาด",
  },
  {
    id: "planner",
    emoji: "📈",
    name: "Smart Planner",
    nameTH: "นักวางแผน",
    minXP: 500,
    color: "#2563eb",
    description: "Your plan is working",
    descriptionTH: "แผนของคุณกำลังได้ผล",
  },
  {
    id: "master",
    emoji: "🏆",
    name: "Financial Master",
    nameTH: "มาสเตอร์การเงิน",
    minXP: 1200,
    color: "#7c3aed",
    description: "Consistently hitting goals",
    descriptionTH: "ถึงเป้าหมายอย่างสม่ำเสมอ",
  },
  {
    id: "legend",
    emoji: "💎",
    name: "Legend",
    nameTH: "ตำนาน",
    minXP: 3000,
    color: "#be185d",
    description: "Achieved your first major goal",
    descriptionTH: "บรรลุเป้าหมายใหญ่แรกแล้ว",
  },
];

export const getRank = (xp: number): Rank =>
  [...ranks].reverse().find((r) => xp >= r.minXP) || ranks[0];

export const getNextRank = (xp: number): Rank | null => {
  const idx = ranks.findIndex((r) => xp < r.minXP);
  return idx >= 0 ? ranks[idx] : null;
};
