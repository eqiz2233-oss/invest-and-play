import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import RankBadge from "@/components/RankBadge";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const SummaryBar = ({ label, current, target, pct, color }: { label: string; current: number; target: number; pct: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-muted-foreground font-bold">{label}</span>
      <span className="text-foreground font-black">{formatMoney(current)} / {formatMoney(target)} ({Math.round(pct)}%)</span>
    </div>
    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
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
    success: { badge: `✅ ${t("history.success")}`, color: "bg-primary/10 text-primary", borderColor: "border-l-primary" },
    adjusted: { badge: `⚡ ${t("history.adjusted")}`, color: "bg-secondary/10 text-secondary-foreground", borderColor: "border-l-secondary" },
    trying: { badge: `💪 ${t("history.trying")}`, color: "bg-destructive/10 text-destructive", borderColor: "border-l-destructive" },
    rollover: { badge: `🔄 ${t("history.rollover")}`, color: "bg-accent/10 text-accent", borderColor: "border-l-accent" },
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
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-5">
        {/* Stats card */}
        <motion.div
          className="card-game text-center bg-gradient-to-br from-primary/5 to-accent/5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.span
            className="text-5xl block mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            👤
          </motion.span>
          <h2 className="font-black text-foreground text-xl">{t("nav.profile")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {monthsActive} {t("history.monthsActive")} · <span className="xp-badge text-xs px-2 py-0.5">⭐ {xp} XP</span>
          </p>
        </motion.div>

        {/* Streak */}
        <motion.div
          className="card-game"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-extrabold text-foreground mb-3 flex items-center gap-2">
            <span className="streak-badge text-xs px-3 py-1">🔥 {streak}</span>
            {t("history.streak")}
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`flex-1 h-3.5 rounded-full ${i < streakMonths ? "bg-primary" : "bg-muted"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {monthLabels.map((m, i) => (
              <span key={i} className="text-[7px] text-muted-foreground font-bold">{m}</span>
            ))}
          </div>
        </motion.div>

        {/* Rank */}
        <RankBadge xp={xp} size="lg" />

        {/* Plans */}
        {plans.length > 0 && (
          <motion.div
            className="card-game"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-extrabold text-foreground mb-3">📋 {lang === "th" ? "แผนของคุณ" : "Your Plans"}</h3>
            <div className="space-y-2">
              {plans.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 3 }}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-bold">{p.answers.length} {lang === "th" ? "คำตอบ" : "answers"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Monthly History */}
        {monthlyLogs.length === 0 ? (
          <motion.div
            className="card-game text-center py-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              className="text-5xl block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌱
            </motion.span>
            <h3 className="font-black text-foreground mt-4">{t("history.empty")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("history.emptySub")}</p>
            <motion.button
              className="mt-5 btn-playful bg-primary text-primary-foreground px-6 py-2.5 text-sm font-extrabold"
              onClick={() => navigate("/quests")}
              whileHover={{ scale: 1.02 }}
            >
              {t("history.emptyBtn")}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {monthlyLogs.map((log, li) => {
              const cfg = statusConfig[log.status] || statusConfig.trying;
              const savPct = log.targetSavings > 0 ? (log.actualSavings / log.targetSavings) * 100 : 0;
              return (
                <motion.div
                  key={log.monthKey}
                  className={`card-game border-l-4 ${cfg.borderColor}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: li * 0.08 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-foreground">{getMonthName(log.monthKey)}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${cfg.color}`}>{cfg.badge}</span>
                  </div>
                  <SummaryBar label={t("cal.save")} current={log.actualSavings} target={log.targetSavings} pct={savPct} color="bg-primary" />
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground font-bold">
                    <span>⭐ {log.xpEarned} {t("history.xpEarned")}</span>
                    {log.rolloverAmount > 0 && <span>🔄 {formatMoney(log.rolloverAmount)} {t("history.rolloverStatus")}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Reset */}
        <div className="text-center pt-4 pb-8">
          <button
            className="text-xs text-muted-foreground hover:text-destructive transition-colors font-bold"
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
