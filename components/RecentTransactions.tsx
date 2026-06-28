import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankTabItem from './BankTabItem';
import BankInfo from './BankInfo';
import TransactionsTable from './TransactionsTable';

const RecentTransactions = ({ accounts, transactions =[], appwriteItemId, page=1}: RecentTransactionsProps) => {
  const hasAccounts = accounts.length > 0;

  return (
    <section className="recent-transactions">
      <header className="flex items-center justify-between">
        <h2 className="recent-transactions-label">Recent Transactions</h2>
        {hasAccounts ? (
          <Link
            href={`/transaction-history/?id=${appwriteItemId}`}
            className="view-all-btn"
          >
            View All
          </Link>
        ) : (
          <span className="view-all-btn pointer-events-none opacity-50">
            View All
          </span>
        )}
      </header>
      {!hasAccounts ? (
        <div className="rounded-xl border border-dashed border-milo-line bg-milo-panel/70 px-5 py-8 text-center shadow-chart">
          <h3 className="text-18 font-semibold text-gray-900">
            No connected accounts
          </h3>
          <p className="mx-auto mt-2 max-w-md text-14 text-gray-600">
            Connect a bank account to view recent transactions here.
          </p>
        </div>
      ) : (
      <Tabs defaultValue={appwriteItemId} className="flex w-full flex-col gap-4">
        <TabsList className="recent-transactions-tablist">
          {accounts.map((account: Account)=>(
            <TabsTrigger
              key={account.id}
              value={account.appwriteItemId}
              className="h-auto min-w-0 flex-1 rounded-xl border border-milo-line bg-milo-panel/70 px-0 py-0 transition-all hover:border-milo-cyan/60 hover:bg-milo-card/40 data-active:border-milo-cyan data-active:bg-milo-card/70 data-active:shadow-chart"
            >
              <BankTabItem
                key={account.id}
                account={account}
                appwriteItemId={appwriteItemId}
              
              />
            </TabsTrigger>
            
          ))}
          
        </TabsList>
        {accounts.map((account:Account)=> (
          <TabsContent
            value={account.appwriteItemId}
            key={account.id}
            className="w-full space-y-4"
          > 
          <BankInfo
            account={account}
            appwriteItemId={appwriteItemId}
            type="full"
        
          />
          <TransactionsTable transactions={transactions}/>

          </TabsContent>

        ))}
        
        
      </Tabs>
      )}
    </section>
  );
}

export default RecentTransactions
