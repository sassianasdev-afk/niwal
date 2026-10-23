import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { assets } from '../assets/admin_assets/assets'

const backendUrl = import.meta.env.VITE_BACKEND_URL

const STORAGE_KEY = 'niwal_admin_notifications'
const PENDING_STATUSES = ['received', 'preparing', 'ready']
const POLL_INTERVAL = 5000

const NotificationContext = createContext(null)

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return ctx
}

export const NotificationProvider = ({ children, token }) => {
  const [notifications, setNotifications] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [permission, setPermission] = useState('default')
  const [audioEnabled, setAudioEnabled] = useState(false)

  const audioRef = useRef(null)
  const lastOrderIdsRef = useRef(new Set())
  const isTabFocusedRef = useRef(true)
  const initializedRef = useRef(false)
  const hasRequestedRef = useRef(false)

  // Hydrate persisted notifications from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setNotifications(parsed)
      }
    } catch (e) {
      console.log('Notification hydrate error:', e)
    }
  }, [])

  // Persist notifications on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch (e) {
      console.log('Notification persist error:', e)
    }
  }, [notifications])

  // Load the mp3 audio once
  useEffect(() => {
    try {
      const audio = new Audio(assets.notificationSound)
      audioRef.current = audio
      audio.load()
    } catch (err) {
      console.error('Failed to load notification audio:', err)
    }
  }, [])

  // Sync browser permission state
  useEffect(() => {
    setPermission('Notification' in window ? Notification.permission : 'default')
  }, [])

  // Track tab focus / visibility for desktop notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabFocusedRef.current = !document.hidden
    }
    const handleFocus = () => {
      isTabFocusedRef.current = true
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const requestPermission = async () => {
    if (hasRequestedRef.current) return
    hasRequestedRef.current = true
    if ('Notification' in window && permission === 'default') {
      try {
        const perm = await Notification.requestPermission()
        setPermission(perm)
      } catch (e) {
        console.log('Notification permission error:', e)
      }
    } else if ('Notification' in window) {
      setPermission(permission)
    }
  }

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) return
      const audio = audioRef.current
      audio.currentTime = 0
      const promise = audio.play()
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn('Audio autoplay blocked by browser:', err)
        })
      }
    } catch (e) {
      console.log('Audio play error:', e)
    }
  }, [])

  const showBrowserNotification = (title, body) => {
    if (permission === 'granted' && !isTabFocusedRef.current) {
      try {
        new Notification(title, {
          body,
          icon: assets.logo,
          tag: 'new-order',
          renotify: true,
        })
      } catch (e) {
        console.log('Browser notification error:', e)
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Single shared poller: detects new orders + status changes
  useEffect(() => {
    if (!token) return

    let mounted = true

    const poll = async () => {
      try {
        const response = await axios.post(
          backendUrl + '/api/order/list',
          {},
          { headers: { token } }
        )
        if (!mounted || !response.data.success) return

        const orders = response.data.orders || []

        const pending = orders.filter((o) => PENDING_STATUSES.includes(o.status)).length
        setPendingCount(pending)

        const now = Date.now()
        const currentIds = new Set()
        const newNotifications = []

        orders.forEach((order) => {
          const id = order._id
          currentIds.add(id)

          if (!initializedRef.current) {
            // First load: just record existing orders, do not create notifications
            return
          }

          // New order detected (pending order just placed by client)
          if (!lastOrderIdsRef.current.has(id)) {
            const table = order.tableNumber ? `Table ${order.tableNumber}` : 'Client'
            newNotifications.push({
              id: `notif-${id}-${now}`,
              orderId: id,
              type: 'new_order',
              title: 'Nouvelle commande',
              message: `Nouvelle commande de ${table} (${order.amount || 0} MAD)`,
              read: false,
              createdAt: order.date || now,
            })
            showBrowserNotification(
              '🔔 Nouvelle commande reçue !',
              `Une nouvelle commande est en attente (${pending} commande(s))`
            )
          }
        })

        if (!initializedRef.current) {
          // Mark as initialized after first load
          lastOrderIdsRef.current = currentIds
          initializedRef.current = true
          return
        }

        // Update tracking refs
        lastOrderIdsRef.current = currentIds

        if (newNotifications.length > 0) {
          setNotifications((prev) => [...newNotifications, ...prev])
          playSound()
        }
      } catch (error) {
        console.log('Notification poll error:', error)
      }
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [token, playSound, permission])

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.log('Clear all error:', e)
    }
  }

  const enableAudio = () => {
    setAudioEnabled(true)
    playSound()
  }

  const value = {
    notifications,
    unreadCount,
    pendingCount,
    permission,
    audioEnabled,
    requestPermission,
    playSound,
    markAsRead,
    markAllRead,
    dismiss,
    clearAll,
    enableAudio,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
