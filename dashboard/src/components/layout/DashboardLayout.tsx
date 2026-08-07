"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PageContainer from "./PageContainer";
import MobileSidebar from "./MobileSidebar";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavTriggerRef = useRef<HTMLButtonElement>(null);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar
        open={mobileNavOpen}
        onClose={closeMobileNav}
        triggerRef={mobileNavTriggerRef}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          mobileNavOpen={mobileNavOpen}
          onMobileNavOpen={() => setMobileNavOpen(true)}
          mobileNavTriggerRef={mobileNavTriggerRef}
        />

        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}
