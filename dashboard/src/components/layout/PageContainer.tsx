import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-8">{children}</main>
  );
}
