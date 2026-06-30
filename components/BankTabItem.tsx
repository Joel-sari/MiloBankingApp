"use client";

import { cn, formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";

const BankTabItem = ({ account, appwriteItemId }: BankTabItemProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isActive = appwriteItemId === account?.appwriteItemId;

  const bankUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: account?.appwriteItemId,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.prefetch(bankUrl);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [bankUrl, router]);

  const handleBankChange = () => {
    if (isActive) return;

    startTransition(() => {
      router.push(bankUrl, { scroll: false });
    });
  };

  const prefetchBank = () => {
    router.prefetch(bankUrl);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleBankChange}
      onMouseEnter={prefetchBank}
      onFocus={prefetchBank}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleBankChange();
        }
      }}
      className={cn(`banktab-item`, {
        "text-milo-cyan": isActive,
      })}
    >
      <p
        className={cn(`text-14 line-clamp-1 flex-1 font-semibold text-gray-500 transition-colors`, {
          "text-milo-cyan": isActive,
        })}
      >
        {account.name}
      </p>
      {isPending ? (
        <span className="inline-flex size-4 shrink-0 animate-spin rounded-full border-2 border-milo-cyan/30 border-t-milo-cyan" />
      ) : (
        <span
          className={cn(
            "hidden rounded-full border border-milo-line bg-milo-midnight/50 px-2.5 py-1 text-12 font-semibold capitalize text-gray-500 sm:inline-flex",
            {
              "border-milo-cyan/40 bg-milo-cyan/10 text-milo-cyan": isActive,
            },
          )}
        >
          {account.subtype}
        </span>
      )}
    </div>
  );
};

export default BankTabItem;
