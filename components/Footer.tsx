"use client";

import { logoutAccount } from '@/lib/actions/user.actions'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Footer = ({ user, type = 'desktop'} : FooterProps) => {

  const router = useRouter();

  const handleLogout = async () => {
    const loggedOut = await logoutAccount();

    if(loggedOut){
      router.push('/sign-in');
  }
}
  return (
    <footer className={type === 'mobile' ? 'footer footer-mobile' : 'footer'}>
      <div className={type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
        <p className="text-xl font-bold text-gray-700">
          {user?.name?.[0] ?? "G"}
        </p>
      </div>
      <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
        <h1 className="text-14 truncate font-semibold text-shadow-gray-600">
          {user?.name ?? "Guest"}
        </h1>
        <p className="text-14 truncate font-normal text-gray-600">
          {user?.email ?? "Not signed in"}
        </p>

      </div>
      <button
        type="button"
        aria-label="Log out"
        className={type === 'mobile' ? 'footer_image-mobile group' : 'footer_image group'}
        onClick={handleLogout}
      >
        <Image
          src="/icons/logout.svg"
          alt=""
          width={24}
          height={24}
          className="footer_logout-icon"
        />
        <span className="footer_logout-tooltip">Log out</span>
      </button>

      
    </footer>
  )
}

export default Footer
