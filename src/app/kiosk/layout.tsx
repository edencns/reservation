import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "키오스크",
    template: "%s | 키오스크",
  },
};

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full-screen, no chrome — designed for touch displays
  return (
    <div className="min-h-dvh bg-slate-900 text-white">
      {children}
    </div>
  );
}
