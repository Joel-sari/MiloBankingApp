import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import RecentTransations from "@/components/RecentTransactions";
import React from 'react'

type AccountsResponse = {
  data: Account[];
  totalBanks: number;
  totalCurrentBalance: number;
};

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[]; page?: string | string[] }>;
}) => {
  const { id, page } = await searchParams;
  const selectedPage = Array.isArray(page) ? page[0] : page;
  const currentPage = Number(selectedPage) || 1;
  const loggedIn =  await getLoggedInUser();
  if (!loggedIn) return null;

  const accounts = await getAccounts(
    { 
      userId: loggedIn.$id
    }
  ) as AccountsResponse | undefined;
  if(!accounts) return null;

  const accountsData = accounts.data;
  const selectedAccountId = Array.isArray(id) ? id[0] : id;
  const appwriteItemId = selectedAccountId || accountsData[0]?.appwriteItemId;

  const account = appwriteItemId
    ? await getAccount({ appwriteItemId })
    : null;

  const banks: Account[] = [
    {
      id: 'checking-001',
      availableBalance: 1250.34,
      currentBalance: 1250.34,
      officialName: 'Milo Everyday Checking',
      mask: '1234',
      institutionId: 'bank-001',
      name: 'Everyday Checking',
      type: 'depository',
      subtype: 'checking',
      appwriteItemId: 'item-001',
      shareableId: 'checking-share-001',
    },
    {
      id: 'savings-001',
      availableBalance: 8420.12,
      currentBalance: 8420.12,
      officialName: 'Milo High Yield Savings',
      mask: '9876',
      institutionId: 'bank-002',
      name: 'High Yield Savings',
      type: 'depository',
      subtype: 'savings',
      appwriteItemId: 'item-002',
      shareableId: 'savings-share-001',
    },
    {
      id: 'credit-001',
      availableBalance: 3200,
      currentBalance: 790.45,
      officialName: 'Milo Rewards Credit',
      mask: '5566',
      institutionId: 'bank-003',
      name: 'Rewards Credit',
      type: 'credit',
      subtype: 'credit card',
      appwriteItemId: 'item-003',
      shareableId: 'credit-share-001',
    },
  ];

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.name || 'Guest'}
            subtext="Access your dashboard to view your account details and manage your finances."
          />
          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>
        <RecentTransations accounts={accountsData} transactions={account?.transactions ?? []} appwriteItemId={appwriteItemId ?? ""} page={currentPage}/>

      </div>
      <RightSidebar user={loggedIn} transactions={account?.transactions ?? []} banks={accountsData}/>
      
    </section>
  )
}

export default Home
