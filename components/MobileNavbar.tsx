"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
const MobileNavbar = () => {
  const pathname = usePathname();

  return (
    <section className="w-full max-w-[26px]">
      <Sheet>
        <SheetTrigger>
          <Image
            src="/icons/hamburger.svg"
            alt="menu"
            width={30}
            height={30}
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-white ">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-1 px-4"
          >
            <Image
              src="/icons/Milo.png"
              alt="Logo"
              width={34}
              height={34}
              className="size-[24px] max-xl:size-14"
            />
            <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1 ">
              Milo
            </h1>
          </Link>
          <div className="mobilenav-sheet">
            <nav className="flex h-full flex-col gap-6 pt-16 text-white ">
              {sidebarLinks.map((item) => {
                const isActive =
                  pathname === item.route ||
                  (item.route !== "/" &&
                    pathname.startsWith(`${item.route}/`));

                return (
                  <SheetClose
                    key={item.label}
                    render={
                      <Link
                        href={item.route}
                        className={cn("mobilenav-sheet_close w-full", {
                          "bg-bank-gradient": isActive,
                        })}
                      />
                    }
                  >
                    <div className="relative size-6">
                      <Image
                        src={item.imgURL}
                        alt={`${item.label} icon`}
                        width={20}
                        height={20}
                        className={cn({
                          "brightness-[3] invert-0": isActive,
                        })}
                      />
                    </div>
                    <p
                      className={cn("mobilenav-label", {
                        "!text-white": isActive,
                      })}
                    >
                      {item.label}
                    </p>
                  </SheetClose>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNavbar;
