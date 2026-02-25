import { Star, Flame, Sparkles } from "lucide-react";
import { useGame } from "@/context/GameContext";
import LanguageToggle from "@/components/LanguageToggle";
import RankBadge from "@/components/RankBadge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const AppTopBar = () => {
  const { xp, streak } = useGame();

  return (
    <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
        </div>
        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <motion.div
            className="xp-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {xp}
          </motion.div>
          <motion.div
            className="streak-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flame className="w-3.5 h-3.5" />
            {streak}
          </motion.div>
          <RankBadge xp={xp} />
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;
