import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import React from 'react'

const Home = () => {
  const loggedIn: User = {
    $id: 'mock-user',
    email: 'Joelsari19@gmail.com',
    userId: 'mock-user-id',
    dwollaCustomerUrl: '',
    dwollaCustomerId: '',
    firstName: 'Joel',
    lastName: 'Sari',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    dateOfBirth: '',
    ssn: '',
  };

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
      sharableId: 'checking-share-001',
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
      sharableId: 'savings-share-001',
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
      sharableId: 'credit-share-001',
    },
  ];

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access your dashboard to view your account details and manage your finances."
          />
          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1250.34}
          />
        </header>

      </div>
      <RightSidebar user={loggedIn} transactions={[]} banks={banks}/>
      
    </section>
  )
}

export default Home
