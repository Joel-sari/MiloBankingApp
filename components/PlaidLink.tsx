"use client";

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions'


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
    console.log("[PlaidLink] exchangePublicToken response", response);

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
      { variant === "primary" ? (
        <Button 
          onClick={()=> open()}
          disabled={!ready}
          className="plaidlink-primary"
        >
          Connect Bank
        </Button>
      ): variant === "ghost" ? (
        <Button>
          Connect Bank
        </Button>
      ): (
        <Button>
          Connect Bank
        </Button>
      ) }
    </>
  )
}

export default PlaidLink
