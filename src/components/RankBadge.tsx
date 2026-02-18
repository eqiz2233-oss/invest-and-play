import { getRank, getNextRank } from "@/data/ranks";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

interface RankBadgeProps {
  xp: number;
  size?: "sm" | "lg";
}

const RankBadge = ({ xp, size = "sm" }: RankBadgeProps) => {
  const { lang, t } = useLanguage();
  const rank = getRank(xp);
  const next = getNextRank(xp);
  const progress = next ? ((xp - rank.minXP) / (next.minXP - rank.minXP)) * 100 : 100;
  const rankName = lang === "th" ? rank.nameTH : rank.name;

  if (size === "sm") {
    return (
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: rank.color }}
      >
        {rank.emoji} {rankName}
      </span>
    );
  }

  return (
    <motion.div
      className="card-game text-center overflow-hidden"
      style={{ borderColor: rank.color + "40" }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div
        className="absolute inset-0 opacity-5 rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${rank.color}, transparent)` }}
      />
      <span className="text-5xl block mb-2">{rank.emoji}</span>
      <h3 className="font-black text-foreground text-lg">{rankName}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {lang === "th" ? rank.descriptionTH : rank.description}
      </p>
      <div className="mt-4">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: rank.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {next
            ? `${t("rank.xpToNext")}: ${next.minXP - xp} XP → ${lang === "th" ? next.nameTH : next.name}`
            : t("rank.maxRank")}
        </p>
      </div>
    </motion.div>
  );
};

export default RankBadge;
