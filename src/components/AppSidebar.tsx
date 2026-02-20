import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/context/LanguageContext";
import { useGame } from "@/context/GameContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Play, Scroll, Calendar, User, ChevronDown, ChevronRight,
  FolderOpen, Plus, Trash2, Edit2, BarChart2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { xp, plans, activePlanId, switchPlan, deletePlan } = useGame();

  const [plansOpen, setPlansOpen] = useState(true);
  const [yourPlansOpen, setYourPlansOpen] = useState(true);

  const isActive = (route: string) =>
    location.pathname === route || location.pathname.startsWith(route + "/");

  const handleDeletePlan = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    if (window.confirm(lang === "th" ? "ลบแผนนี้?" : "Delete this plan?")) {
      deletePlan(planId);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xl">💰</span>
          </div>
          {!collapsed && (
            <span className="font-black text-lg text-sidebar-foreground">FinGame</span>
          )}
        </button>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>

              {/* ▶ Start / Play */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/plan")}
                  tooltip={lang === "th" ? "เริ่ม / เล่น" : "Start / Play"}
                  size="lg"
                >
                  <NavLink
                    to="/plan"
                    className="gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent"
                    activeClassName="bg-primary/10 text-primary font-bold"
                  >
                    <Play className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-bold">{lang === "th" ? "เริ่ม / เล่น" : "Start / Play"}</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 📂 Plans (collapsible) */}
              {!collapsed && (
                <SidebarMenuItem>
                  <button
                    onClick={() => setPlansOpen(o => !o)}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent text-sidebar-foreground"
                  >
                    <FolderOpen className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-bold flex-1 text-left">{lang === "th" ? "แผน" : "Plans"}</span>
                    {plansOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </SidebarMenuItem>
              )}

              {/* Plans dropdown content */}
              <AnimatePresence>
                {(!collapsed && plansOpen) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {/* Your Plans sub-section */}
                    <div className="pl-4">
                      <button
                        onClick={() => setYourPlansOpen(o => !o)}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-sidebar-accent text-sidebar-foreground/70"
                      >
                        <span className="text-xs font-bold flex-1 text-left">{lang === "th" ? "📁 แผนของคุณ" : "📁 Your Plans"}</span>
                        {yourPlansOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </button>

                      <AnimatePresence>
                        {yourPlansOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden pl-2"
                          >
                            {plans.length === 0 ? (
                              <p className="text-xs text-muted-foreground px-3 py-2">
                                {lang === "th" ? "ยังไม่มีแผน" : "No plans yet"}
                              </p>
                            ) : (
                              plans.map(plan => (
                                <div
                                  key={plan.id}
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer group transition-colors ${
                                    plan.id === activePlanId
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-sidebar-accent text-sidebar-foreground/70"
                                  }`}
                                  onClick={() => { switchPlan(plan.id); navigate("/plan"); }}
                                >
                                  <span className="text-sm">{plan.emoji}</span>
                                  <span className="text-xs font-bold flex-1 truncate">{plan.name}</span>
                                  <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive"
                                    onClick={(e) => handleDeletePlan(e, plan.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))
                            )}

                            {/* Create Plan */}
                            <button
                              onClick={() => navigate("/plan")}
                              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-primary transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              <span className="text-xs font-bold">{lang === "th" ? "สร้างแผนใหม่" : "Create Plan"}</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Quests */}
                      <NavLink
                        to="/quests"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-sidebar-accent text-sidebar-foreground/70"
                        activeClassName="bg-primary/10 text-primary font-bold"
                      >
                        <Scroll className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold">{lang === "th" ? "📜 เควส" : "📜 Quests"}</span>
                      </NavLink>

                      {/* Calendar */}
                      <NavLink
                        to="/calendar"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-sidebar-accent text-sidebar-foreground/70"
                        activeClassName="bg-primary/10 text-primary font-bold"
                      >
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold">{lang === "th" ? "📅 ปฏิทิน" : "📅 Calendar"}</span>
                      </NavLink>

                      {/* Summary */}
                      <NavLink
                        to="/snapshot"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-sidebar-accent text-sidebar-foreground/70"
                        activeClassName="bg-primary/10 text-primary font-bold"
                      >
                        <BarChart2 className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold">{lang === "th" ? "📊 สรุป" : "📊 Summary"}</span>
                      </NavLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed icons for Plans sub-items */}
              {collapsed && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/quests")} tooltip={t("nav.quests")} size="lg">
                      <NavLink to="/quests" className="gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent" activeClassName="bg-primary/10 text-primary font-bold">
                        <Scroll className="h-5 w-5 shrink-0" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/calendar")} tooltip={t("nav.calendar")} size="lg">
                      <NavLink to="/calendar" className="gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent" activeClassName="bg-primary/10 text-primary font-bold">
                        <Calendar className="h-5 w-5 shrink-0" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/snapshot")} tooltip={lang === "th" ? "สรุป" : "Summary"} size="lg">
                      <NavLink to="/snapshot" className="gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent" activeClassName="bg-primary/10 text-primary font-bold">
                        <BarChart2 className="h-5 w-5 shrink-0" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* 👤 Profile */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/profile")} tooltip={t("nav.profile")} size="lg">
                  <NavLink
                    to="/profile"
                    className="gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent"
                    activeClassName="bg-primary/10 text-primary font-bold"
                  >
                    <User className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-bold">{t("nav.profile")}</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="card-game p-3 text-center bg-primary/5 border-primary/20">
            <p className="text-xs font-bold text-muted-foreground">{t("nav.totalXp")}</p>
            <p className="text-lg font-black text-primary">{xp} XP</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
