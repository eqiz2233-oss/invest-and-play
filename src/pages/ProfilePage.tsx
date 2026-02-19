import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import RankBadge from "@/components/RankBadge";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const SummaryBar = ({ label, current, target, pct, color }: { label: string; current: number; target: number; pct: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-muted-foreground font-bold">{label}</span>
      <span className="text-foreground font-bold">{formatMoney(current)} / {formatMoney(target)} ({Math.round(pct)}%)</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8 }} />
    </div>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { xp, streak, monthlyLogs, plans, resetAll } = useGame();

  const monthsActive = monthlyLogs.length;
  const streakMonths = monthlyLogs.filter(l => l.status === "success" || l.status === "adjusted").length;

  const statusConfig: Record<string, { badge: string; color: string; borderColor: string }> = {
    success: { badge: `✅ ${t("history.success")}`, color: "bg-primary/10 text-primary", borderColor: "border-l-[hsl(var(--primary))]" },
    adjusted: { badge: `⚡ ${t("history.adjusted")}`, color: "bg-secondary/10 text-secondary-foreground", borderColor: "border-l-[hsl(var(--secondary))]" },
    trying: { badge: `💪 ${t("history.trying")}`, color: "bg-destructive/10 text-destructive", borderColor: "border-l-[hsl(var(--destructive))]" },
    rollover: { badge: `🔄 ${t("history.rollover")}`, color: "bg-accent/10 text-accent", borderColor: "border-l-[hsl(var(--accent))]" },
  };

  const monthLabels = lang === "th"
    ? ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getMonthName = (key: string) => {
    const [y, m] = key.split("-");
    const monthIdx = parseInt(m) - 1;
    return `${t(`month.${monthIdx}`)} ${y}`;
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Stats card */}
        <div className="card-game text-center">
          <h2 className="font-black text-foreground text-lg">👤 {t("nav.profile")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {monthsActive} {t("history.monthsActive")} | ⭐ {xp} XP
          </p>
        </div>

        {/* Streak */}
        <div className="card-game">
          <h3 className="font-bold text-foreground mb-2">🔥 {streak} {t("history.streak")}</h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`flex-1 h-3 rounded-full ${i < streakMonths ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {monthLabels.map((m, i) => (
              <span key={i} className="text-[8px] text-muted-foreground">{m}</span>
            ))}
          </div>
        </div>

        {/* Rank */}
        <RankBadge xp={xp} size="lg" />

        {/* Plans */}
        {plans.length > 0 && (
          <div className="card-game">
            <h3 className="font-bold text-foreground mb-3">📋 {lang === "th" ? "แผนของคุณ" : "Your Plans"}</h3>
            <div className="space-y-2">
              {plans.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-xl">
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.answers.length} {lang === "th" ? "คำตอบ" : "answers"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly History */}
        {monthlyLogs.length === 0 ? (
          <div className="card-game text-center py-10">
            <span className="text-4xl">🌱</span>
            <h3 className="font-black text-foreground mt-3">{t("history.empty")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("history.emptySub")}</p>
            <motion.button
              className="mt-4 btn-playful bg-primary text-primary-foreground px-6 py-2"
              onClick={() => navigate("/quests")}
              whileHover={{ scale: 1.02 }}
            >
              {t("history.emptyBtn")}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {monthlyLogs.map(log => {
              const cfg = statusConfig[log.status] || statusConfig.trying;
              const savPct = log.targetSavings > 0 ? (log.actualSavings / log.targetSavings) * 100 : 0;
              return (
                <motion.div
                  key={log.monthKey}
                  className={`card-game border-l-4 ${cfg.borderColor}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-foreground">{getMonthName(log.monthKey)}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.color}`}>{cfg.badge}</span>
                  </div>
                  <SummaryBar label={t("cal.save")} current={log.actualSavings} target={log.targetSavings} pct={savPct} color="bg-primary" />
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>⭐ {log.xpEarned} {t("history.xpEarned")}</span>
                    {log.rolloverAmount > 0 && <span>🔄 {formatMoney(log.rolloverAmount)} {t("history.rolloverStatus")}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Reset */}
        <div className="text-center pt-4">
          <button
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => { if (window.confirm(t("dash.resetConfirm"))) resetAll(); }}
          >
            {t("dash.resetProgress")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
