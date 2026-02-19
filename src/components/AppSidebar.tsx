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
import { Play, Scroll, Calendar, User } from "lucide-react";

const navItems = [
  { id: "play", icon: Play, route: "/plan", labelKey: "nav.play" },
  { id: "quests", icon: Scroll, route: "/dashboard", labelKey: "nav.quests" },
  { id: "calendar", icon: Calendar, route: "/dashboard?tab=calendar", labelKey: "nav.calendar" },
  { id: "profile", icon: User, route: "/profile", labelKey: "nav.profile" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { xp } = useGame();

  const isActive = (route: string) => {
    if (route.includes("?")) {
      return location.pathname + location.search === route;
    }
    return location.pathname === route || location.pathname.startsWith(route + "/");
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.route)}
                    tooltip={t(item.labelKey)}
                    size="lg"
                  >
                    <NavLink
                      to={item.route}
                      className="gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent"
                      activeClassName="bg-primary/10 text-primary font-bold"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <span className="text-sm font-bold">{t(item.labelKey)}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
