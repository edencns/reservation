import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "관리자",
    template: "%s | 관리자 | ReserveTicket",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
