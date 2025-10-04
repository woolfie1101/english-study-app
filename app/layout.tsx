import { BottomNavigation } from "@/components/BottomNavigation";
import "./globals.css";

export const metadata = {
  title: "English Study App",
  description: "English study review application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="h-screen flex flex-col bg-white max-w-md mx-auto border-x border-gray-200">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
