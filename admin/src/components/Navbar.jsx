import React from 'react'
import { assets } from '../assets/admin_assets/assets'
import NotificationBell from './NotificationBell'

const Navbar = ({ setToken, token }) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <img className='w-[max(10%,80px)]' src={assets.logo} alt="" />
        <div className='flex items-center gap-3'>
          <NotificationBell token={token} />
          <button onClick={()=>setToken('')} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm '>Se déconnecter</button>
        </div>
    </div>
  )
}

export default Navbar