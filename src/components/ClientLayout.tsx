"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLearnPage = pathname.startsWith('/learn');

  return (
    <>
      {isLearnPage && <Sidebar />}
      <div className={isLearnPage ? 'pl-64' : ''}>
        {children}
        {!isLearnPage && <Footer />}
      </div>
    </>
  );
} 