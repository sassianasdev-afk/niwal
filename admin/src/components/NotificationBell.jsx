import React, { useEffect, useState, useRef } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/admin_assets/assets'

const NotificationBell = ({ token }) => {
  const {
    notifications,
    unreadCount,
    pendingCount,
    permission,
    requestPermission,
    markAllRead,
    dismiss,
    clearAll,
    markAsRead,
    playSound,
  } = useNotifications()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const recent = notifications.slice(0, 10)

  const handleOpen = () => {
    setOpen((prev) => {
      const next = !prev
      if (next && permission === 'default' && !hasRequested) {
        requestPermission()
        setHasRequested(true)
      }
      return next
    })
  }

  const handleNavigateOrders = () => {
    navigate('/orders?tab=pending')
    setOpen(false)
    playSound()
  }

  return (
    <div ref={bellRef} className='relative'>
      <button
        onClick={handleOpen}
        className='relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-700 focus:outline-none'
        aria-label='Notifications'
        title='Notifications'
      >
        <img className='w-5 h-5' src={assets.order_icon} alt='' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse shadow-md border-2 border-white'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col animate-in fade-in slide-in-from-right-2 duration-200'>
          <div className='px-4 py-3 border-b border-gray-100 flex justify-between items-center'>
            <h3 className='font-semibold text-gray-800 text-sm'>Notifications</h3>
            <div className='flex items-center gap-2'>
              {permission === 'denied' && (
                <button
                  onClick={requestPermission}
                  className='text-xs text-brown-600 underline hover:text-brown-800'
                >
                  Autoriser
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className='text-xs text-gray-500 hover:text-brown-900 font-medium'
                >
                  Tout lu
                </button>
              )}
            </div>
          </div>

          <div className='max-h-[60vh] overflow-y-auto'>
            {recent.length === 0 ? (
              <div className='px-4 py-8 text-center text-gray-500 text-sm'>
                Aucune notification
              </div>
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 flex justify-between items-start group cursor-pointer hover:bg-gray-50 transition ${
                    !n.read ? 'bg-amber-50 border-l-2 border-amber-400' : ''
                  }`}
                  onClick={() => {
                    markAsRead(n.id)
                    handleNavigateOrders()
                  }}
                >
                  <div className='flex-1 min-w-0'>
                    <p className={`text-sm ${!n.read ? 'font-bold text-brown-900' : 'text-gray-700'} leading-tight`}>
                      {n.title}
                    </p>
                    <p className='text-xs text-gray-500 mt-1 leading-tight'>{n.message}</p>
                    <p className='text-[10px] text-gray-400 mt-2'>
                      {new Date(n.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className='flex-shrink-0 ml-2'>
                    {!n.read && (
                      <div className='w-2.5 h-2.5 bg-amber-500 rounded-full mt-0.5'></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dismiss(n.id)
                      }}
                      className='ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1'
                      title='Supprimer'
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='px-4 py-3 border-t border-gray-100'>
            <button
              onClick={clearAll}
              className='w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded border border-red-100 text-center'
            >
              Tout supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
