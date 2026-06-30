"use client";

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions'
import Image from 'next/image';


const PlaidLink = ( { user, variant } : PlaidLinkProps ) => {

  const router= useRouter()

  // to set up our token
  const [token, setToken ] = useState<string | null>(null)

  //Fetch token on time, this cannot be async!  
  useEffect(()=>{
    const getLinkToken = async() => {
      const data = await createLinkToken(user);

      setToken(data?.linkToken || null);
    }
    getLinkToken();

  }, [router, user])

  const onSuccess = useCallback<PlaidLinkOnSuccess>( async (public_token: string) => {
    const response = await exchangePublicToken({
      publicToken: public_token,
      user,
    }
    )
    // after the exhange of token we can go to the home page 
    router.push('/');
    router.refresh();

  }, [router, user])

  const configuration: PlaidLinkOptions ={
    token, 
    onSuccess

  }

  const { open, ready } = usePlaidLink(configuration);
  return (
    <>
      {variant === "primary" ? (
        <Button
          onClick={() => open()}
          disabled={!ready}
          className="plaidlink-primary"
        >
          Connect Bank
        </Button>
      ) : variant === "ghost" ? (
        <Button
          onClick={() => open()}
          disabled={!ready}
          variant="ghost"
          className="plaidlink-ghost"
        >
          <Image
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className="text-[16px] font-semibold text-black-2">
            Connect Bank
          </p>
        </Button>
      ) : (
        <Button
          onClick={() => open()}
          disabled={!ready}
          variant="ghost"
          className="plaidlink-sidebar"
        >
          <Image
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className="text-[16px] font-semibold text-black-2">Connect Bank</p>
        </Button>
      )}
    </>
  );
}

export default PlaidLink
