import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PageContainer from "./PageContainer";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}
