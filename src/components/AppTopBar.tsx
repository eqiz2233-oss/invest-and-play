import { Star, Flame } from "lucide-react";
import { useGame } from "@/context/GameContext";
import LanguageToggle from "@/components/LanguageToggle";
import RankBadge from "@/components/RankBadge";
import { SidebarTrigger } from "@/components/ui/sidebar";

const AppTopBar = () => {
  const { xp, streak } = useGame();

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <div className="xp-badge">
            <Star className="w-3.5 h-3.5" />
            {xp} XP
          </div>
          <div className="streak-badge">
            <Flame className="w-3.5 h-3.5" />
            {streak}
          </div>
          <RankBadge xp={xp} />
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;
