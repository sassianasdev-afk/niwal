import React from 'react'
import {NavLink} from 'react-router-dom'
import { assets } from '../assets/admin_assets/assets'
import { useNotifications } from '../context/NotificationContext'

const Sidebar = ({ token }) => {
  const { pendingCount, permission, requestPermission } = useNotifications()

  return (
    <div className='w-[18%] min-h-screen border-r-1'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to={'/add'}>
                <img className='w-5 h-5' src={assets.add_icon} alt="" />
                <p className='hidden md:block'>Ajouter des articles</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to={'/list'}>
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block'>Liste des articles</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to={'/category/add'}>
                <img className='w-5 h-5' src={assets.add_icon} alt="" />
                <p className='hidden md:block'>Ajouter catégorie</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to={'/category/list'}>
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block'>Liste catégories</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to={'/table/add'}>
                <img className='w-5 h-5' src={assets.add_icon} alt="" />
                <p className='hidden md:block'>Ajouter table</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to={'/table/list'}>
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block'>Liste tables</p>
            </NavLink>

            <NavLink
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l relative'
              to={'/orders?tab=pending'}
              onClick={requestPermission}
            >
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block'>Commandes</p>
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                    {pendingCount > 99 ? '+99' : pendingCount}
                  </span>
                )}
            </NavLink>

            {permission === 'denied' && (
              <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs'>
                ⚠️ Notifications bloquées par le navigateur
              </div>
            )}
        </div>
    </div>
  )
}

export default Sidebar
