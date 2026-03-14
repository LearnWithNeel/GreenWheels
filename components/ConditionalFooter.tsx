
"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Pages where footer should NOT show
const NO_FOOTER_PATHS = [
  "/dashboard",
  "/dealer/dashboard",
  "/dealer/profile",
  "/admin",
  "/login",
  "/register",
  "/dealer/register",
  "/retrofit",
  "/orders",
];

export default function ConditionalFooter() {
  const pathname = usePathname();

  const hide = NO_FOOTER_PATHS.some(path =>
    pathname.startsWith(path)
  );

  if (hide) return null;
  return <Footer />;
}