import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login ke CMS BAPENDA Provinsi Jambi",
  robots: { index: false },
};

export default function CmsAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-700 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
