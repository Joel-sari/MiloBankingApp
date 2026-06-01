'use client';
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  
  return (
    <section className="sidebar">
      <nav className="flex w-full flex-col gap-4">
        <Link href="/" className="mb-12 flex cursor-pointer items-center gap-2">
          <Image src="/icons/Milo.png" alt="Logo" width={40} height={40} className="size-[24px] max-xl:size-14"/>
          <h1 className="sidebar-logo">Milo</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route ||
            (item.route !== "/" && pathname.startsWith(`${item.route}/`));

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn("sidebar-link", {
                "bg-bank-gradient": isActive,
              })}
            >
              <div className="relative size-6">
                <Image
                  src={item.imgURL}
                  alt={`${item.label} icon`}
                  fill
                  className={cn({ "brightness-[3] invert-0": isActive })}
                />
              </div>
              <p className={cn("text-16 font-semibold text-black-2", { "text-white": isActive })}>
                {item.label}
              </p>
            </Link>
          );
        })}
      </nav>
    </section>
  )
}

export default Sidebar
