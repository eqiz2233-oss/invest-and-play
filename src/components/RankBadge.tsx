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
      <motion.span
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold text-white shadow-md"
        style={{ backgroundColor: rank.color }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {rank.emoji} {rankName}
      </motion.span>
    );
  }

  return (
    <motion.div
      className="card-game text-center overflow-hidden relative"
      style={{ borderColor: rank.color + "40" }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div
        className="absolute inset-0 opacity-[0.04] rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${rank.color}, transparent)` }}
      />
      <motion.span
        className="text-5xl block mb-3"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {rank.emoji}
      </motion.span>
      <h3 className="font-black text-foreground text-lg">{rankName}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {lang === "th" ? rank.descriptionTH : rank.description}
      </p>
      <div className="mt-4">
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: rank.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 font-bold">
          {next
            ? `${t("rank.xpToNext")}: ${next.minXP - xp} XP → ${lang === "th" ? next.nameTH : next.name}`
            : t("rank.maxRank")}
        </p>
      </div>
    </motion.div>
  );
};

export default RankBadge;
