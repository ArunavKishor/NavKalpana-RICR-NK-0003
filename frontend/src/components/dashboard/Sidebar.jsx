import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ChevronRight,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Batch Management", href: "/admin/batches" },
  { icon: GraduationCap, label: "Students", href: "/admin/students" },
  { icon: Users, label: "Teachers", href: "/admin/teachers" },
];

const NavItem = ({ item, isActive, onClick }) => (
  <motion.div
    whileHover={{ x: 4 }}
    transition={{ type: "tween", duration: 0.2 }}
  >
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group",
        isActive
          ? "text-white bg-primary shadow-lg shadow-primary/20"
          : "text-slate-600 hover:text-primary hover:bg-primary/5"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
          isActive
            ? "bg-white/20 rotate-0"
            : "bg-slate-100 group-hover:bg-primary/10 group-hover:rotate-6"
        )}
      >
        <item.icon
          className={cn(
            "w-4 h-4 transition-colors duration-200",
            isActive ? "text-white" : "text-slate-500 group-hover:text-primary"
          )}
        />
      </div>

      <span className="flex-1 tracking-tight">{item.label}</span>

      <ChevronRight
        className={cn(
          "w-4 h-4 transition-all duration-300",
          isActive
            ? "text-white opacity-100 rotate-90"
            : "text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
        )}
      />
    </Link>
  </motion.div>
);

const SidebarContent = ({ location, onNavItemClick }) => (
  <div className="flex flex-col h-full bg-white">
    {/* LOGO SECTION */}
    <div className="h-24 px-8 flex items-center border-b border-slate-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-premium bg-white border border-slate-100">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="leading-tight">
          <p className="font-black text-[#0F4C5C] tracking-tighter text-xl">
            MindRise
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Admin Panel
          </p>
        </div>
      </div>
    </div>

    <ScrollArea className="flex-1 px-4 py-8">
      <div className="space-y-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
          Core Management
        </p>
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

          return (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive}
              onClick={onNavItemClick}
            />
          );
        })}
      </div>
    </ScrollArea>

    <div className="p-4 border-t border-slate-50">
      <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900 tracking-tight">System v2.4</p>
          <p className="text-[10px] font-bold text-slate-400">Premium License</p>
        </div>
      </div>
    </div>
  </div>
);

export const MobileSidebar = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 border-none rounded-r-3xl overflow-hidden shadow-2xl">
        <SidebarContent location={location} onNavItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] fixed left-4 top-4 bg-white border border-slate-100 shadow-premium rounded-[2.5rem] overflow-hidden">
      <SidebarContent location={location} />
    </aside>
  );
};

export default Sidebar;
