import MobileNavbar from "@/components/MobileNavbar";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar />
      <div className="flex size-full flex-col">
        <div className="root-layout">
          <Image src="/icons/Milo.png" alt="Logo" width={50} height={50} />
          <div>
            <MobileNavbar />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
} 
