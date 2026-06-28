import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getTransactionCategoryIcon,
  getTransactionCategoryStyle,
} from "@/lib/transaction-category";
import {
  cn,
  formatAmount, 
  formatDateTime,
  getTransactionStatus,
  removeSpecialCharacters,
} from "@/lib/utils";

const formatMethod = (method?: string) => {
  if (!method || method.toLowerCase() === "other") return "Other";

  return method
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const CategoryBadge = ({category}: CategoryBadgeProps)=>{

  const {borderColor, backgroundColor, textColor, chipBackgroundColor } = getTransactionCategoryStyle(category)
  const Icon = getTransactionCategoryIcon(category);

  return (
    <div className={cn('category-badge', borderColor, chipBackgroundColor)}>
      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", backgroundColor)}>
        <Icon className="size-3 text-milo-void" strokeWidth={2.4} />
      </span>
      <p className={cn('truncate text-[12px] font-semibold', textColor)}>
        {category}
      </p>

    </div>
  )

}

const TransactionAvatar = ({
  image,
  name,
  category,
}: {
  image?: string | null;
  name: string;
  category: string;
}) => {
  const { borderColor, chipBackgroundColor, textColor } =
    getTransactionCategoryStyle(category);

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border text-14 font-semibold",
        borderColor,
        chipBackgroundColor,
        textColor,
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        name.charAt(0).toUpperCase() || "$"
      )}
    </div>
  );
};

const TransactionsTable = ( {transactions}: TransactionTableProps ) => {
  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-dashed border-milo-line bg-milo-panel/70 px-5 py-8 text-center shadow-chart">
        <h3 className="text-16 font-semibold text-gray-900">
          No recent transactions
        </h3>
        <p className="mx-auto mt-2 max-w-md text-14 text-gray-600">
          Transactions will appear here once this account has activity.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-milo-line bg-milo-panel/90 shadow-chart">
      <Table className="min-w-[860px]">
      <TableHeader className="bg-milo-card/70">
        <TableRow className="border-milo-line hover:bg-transparent">
          <TableHead className="w-[32%] px-5 py-3 text-12 font-semibold uppercase tracking-normal text-gray-500">
            Transaction
          </TableHead>
          <TableHead className="w-[12%] px-4 py-3 text-right text-12 font-semibold uppercase tracking-normal text-gray-500">
            Amount
          </TableHead>
          <TableHead className="w-[12%] px-4 py-3 text-12 font-semibold uppercase tracking-normal text-gray-500">
            Status
          </TableHead>
          <TableHead className="w-[16%] px-4 py-3 text-12 font-semibold uppercase tracking-normal text-gray-500">
            Date
          </TableHead>
          <TableHead className="w-[10%] px-4 py-3 text-12 font-semibold uppercase tracking-normal text-gray-500 max-md:hidden">
            Method
          </TableHead>
          <TableHead className="w-[18%] px-5 py-3 text-12 font-semibold uppercase tracking-normal text-gray-500 max-md:hidden">
            Category
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t:Transaction)=>{
          const status = getTransactionStatus(new Date(t.date))
          const amount = formatAmount(t.amount)

          const isDebit = t.type === 'debit' || t.amount < 0;
          const isCredit = t.type === 'credit';
          const transactionName = removeSpecialCharacters(t.name);
          const displayAmount = isDebit ? `-${formatAmount(Math.abs(t.amount))}` : amount;
          const category = t.category || "Other";

          return (
            <TableRow
              key={t.id}
              className="border-milo-line/70 bg-transparent transition-colors hover:bg-milo-card/40"
            >
            
              <TableCell className="max-w-[280px] px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <TransactionAvatar
                    image={t.image}
                    name={transactionName}
                    category={category}
                  />
                  <div className="min-w-0">
                    <h1 className="truncate text-14 font-semibold text-gray-900">
                      {transactionName}
                    </h1>
                    <p className="text-12 text-gray-500 md:hidden">
                      {formatDateTime(new Date(t.date)).dateOnly}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "px-4 py-4 text-right text-14 font-semibold",
                  isDebit ? "text-pink-700" : "text-success-700",
                )}
              >
                {displayAmount}

              </TableCell>
              <TableCell className="px-4 py-4">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-1 text-12 font-semibold",
                    status === "Success"
                      ? "border-success-600/40 bg-success-25 text-success-700"
                      : "border-milo-cyan/30 bg-milo-cyan/10 text-milo-cyan",
                  )}
                >
                  {status}
                </span>
              </TableCell>
              <TableCell className="px-4 py-4 text-14 text-gray-600">
                {formatDateTime(new Date(t.date)).dateTime}
              </TableCell>
              <TableCell className="px-4 py-4 text-14 text-gray-600 max-md:hidden">
                {formatMethod(t.paymentChannel)}
              </TableCell>
              <TableCell className="px-5 py-4 max-md:hidden">
                <CategoryBadge category={category} />
              </TableCell>
  
            </TableRow>
          );

        })}
      </TableBody>
    </Table>
    </div>
  );
};

export default TransactionsTable;
