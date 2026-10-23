import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/admin_assets/assets'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { notifications, unreadCount, pendingCount: contextPendingCount, playSound } = useNotifications()

  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)

  const activeTab = params.get('tab') || 'all'
  const currentPage = parseInt(params.get('page') || '1')
  const itemsPerPage = 8

  const setActiveTab = (tab) => {
    const newParams = new URLSearchParams(location.search)
    newParams.set('tab', tab)
    newParams.set('page', '1')
    navigate(`${location.pathname}?${newParams.toString()}`)
  }

  const setPage = (page) => {
    const newParams = new URLSearchParams(location.search)
    newParams.set('tab', activeTab)
    newParams.set('page', page.toString())
    navigate(`${location.pathname}?${newParams.toString()}`)
  }

  const pendingCount = orders.filter(order =>
    ['received', 'preparing', 'ready'].includes(order.status)
  ).length

  const tabs = [
    { key: 'all', label: 'Tous' },
    { key: 'pending', label: 'En attente', count: pendingCount },
    { key: 'served', label: 'Servie' },
    { key: 'cancelled', label: 'Annulée' }
  ]

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') {
      return ['received', 'preparing', 'ready'].includes(order.status)
    }
    if (activeTab === 'served') return order.status === 'served'
    if (activeTab === 'cancelled') return order.status === 'cancelled'
    return true
  })

  // Trier par date décroissante : le plus récent (3) en premier, l'ancien (1) à la fin
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const fetchAllOrders = async () => {
    if (!token) {
      setLoading(false)
      setError('Token manquant. Veuillez vous connecter.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })

      if (response.data.success) {
        const newOrders = response.data.orders || []
        setOrders(newOrders)
      } else {
        setError(response.data.message || 'Erreur lors du chargement')
        toast.error(response.data.message || 'Erreur lors du chargement des commandes')
      }

      setLoading(false)

    } catch (error) {
      console.error('Orders fetch error:', error)
      setLoading(false)
      if (error.response && error.response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.')
        toast.error('Session expirée')
      } else {
        setError(error.message || 'Erreur réseau')
        toast.error(error.message || 'Erreur de connexion au serveur')
      }
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token } }
      )

      if (response.data.success) {
        await fetchAllOrders()
        toast.success(response.data.message || 'Statut mis à jour')
      } else {
        toast.error(response.data.message || 'Erreur mise à jour statut')
      }

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Erreur mise à jour statut')
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token, activeTab])

  // Refetch orders when the shared poller detects a new pending order
  useEffect(() => {
    fetchAllOrders()
  }, [contextPendingCount])

  // Play sound when a brand-new pending order notification arrives (no toast)
  useEffect(() => {
    const newest = notifications[0]
    if (!newest || newest.read) return
    if (newest.type === 'new_order') {
      playSound()
    }
  }, [notifications, playSound])

  if (error && !loading) {
    return (
      <div className='text-center py-20 border-2 border-red-200 rounded-lg bg-red-50'>
        <p className='text-red-600 text-lg font-medium'>{error}</p>
        <button
          onClick={fetchAllOrders}
          className='mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className='flex items-center gap-4 mb-6'>
        <h3 className='text-xl font-semibold'>Page des commandes</h3>
        <button
          onClick={fetchAllOrders}
          className='px-4 py-2 bg-brown-900 text-white font-medium rounded hover:bg-brown-800 transition flex items-center gap-2'
        >
          🔄 Refresh Orders
        </button>
        {unreadCount > 0 && (
          <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse'>
            {unreadCount} nouvelle commande{unreadCount > 1 ? 's' : ''} !
          </span>
        )}
      </div>
      {/* Tab Navigation */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors relative ${
              activeTab === tab.key
                ? 'bg-brown-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            {tab.label}
            {tab.count > 0 && (
              <span className="absolute -top-2 -right-2 bg-brown-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {tab.count > 99 ? '+99' : tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div>
        {loading ? (
          // Skeleton Loading State
          Array(5).fill(0).map((_, index) => (
            <div
              key={index}
              className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4'
            >
              <Skeleton circle width={48} height={48} />
              <div className='space-y-2'>
                <Skeleton count={2} height={16} />
                <Skeleton height={18} width="60%" className='mt-3' />
                <Skeleton count={3} height={14} className='mt-2' />
                <Skeleton height={14} width="50%" />
              </div>
              <div className='space-y-2'>
                <Skeleton height={16} width="80%" />
                <Skeleton height={14} width="70%" className='mt-3' />
                <Skeleton height={14} width="60%" />
                <Skeleton height={14} width="75%" />
              </div>
              <Skeleton height={18} width={80} />
              <Skeleton height={40} width="100%" />
            </div>
          ))
        ) : paginatedOrders.length === 0 ? (
          // Empty State
          <div className='text-center py-20 border-2 border-gray-200 rounded-lg'>
            <img src={assets.parcel_icon} alt="" className='w-20 mx-auto mb-4 opacity-50' />
            <p className='text-gray-500 text-lg'>Aucune commande trouvée</p>
          </div>
        ) : (
          // Actual Orders : le plus récent en premier
          paginatedOrders.map((order) => {
            const isPending = ['received', 'preparing', 'ready'].includes(order.status)

            // Extract safe values with fallbacks
            const tableNumber = order.tableNumber ? `Table ${order.tableNumber}` : 'N/A'
            const customerName = order.address?.firstName || order.address?.lastName 
              ? `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() 
              : 'Client Table'
            const customerCity = order.address?.city || '-'
            const customerPhone = order.address?.phone || '-'
            const customerStreet = order.address?.street || '-'
            const paymentStatus = order.payment ? 'Payé' : 'En attente'
            const orderDate = order.date ? new Date(order.date).toLocaleDateString() : '-'

            return (
              <div
                className={`grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 relative rounded-xl bg-white shadow-sm ${isPending ? 'border-amber-500' : 'border-gray-200'}`}
                key={order._id || index}
              >
                <div className='flex items-center gap-2'>
                  <img className='w-10 h-10' src={assets.parcel_icon} alt="" />
                  <span className='font-bold text-brown-900 truncate'>#{order._id}</span>
                </div>

                <div className='flex flex-col gap-1'>
                  <p className='py-0.5 font-medium text-amber-600'>🍽️ {tableNumber}</p>
                  {Array.isArray(order.items) ? order.items.map((item, i) => (
                    <p key={i} className='py-0.5 text-sm'>{item.name} x {item.quantity}</p>
                  )) : <p className='py-0.5 text-gray-500'>Articles non disponibles</p>}
                </div>

                <div className='flex flex-col gap-1 text-sm'>
                  <p className='py-0.5'>{customerName}</p>
                  {customerStreet !== '-' && <p className='py-0.5'>{customerStreet}</p>}
                  {customerCity !== '-' && <p className='py-0.5'>{customerCity}</p>}
                  {customerPhone !== '-' && <p className='py-0.5'>📞 {customerPhone}</p>}
                </div>

                <div className='flex flex-col gap-1 text-sm'>
                  <p className='py-0.5'>Articles : {Array.isArray(order.items) ? order.items.length : 0}</p>
                  <p className='py-0.5'>Méthode : Espèce (COD)</p>
                  <p className='py-0.5'>{paymentStatus}</p>
                  <p className='py-0.5'>{orderDate}</p>
                </div>

                <p className='text-sm sm:text-[15px] font-bold text-brown-900'>{currency} {order.amount || 0}</p>

                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status || 'received'}
                  className='p-2 font-semibold border rounded text-sm'
                >
                  <option value="received">Commande reçue</option>
                  <option value="preparing">En préparation</option>
                  <option value="ready">Prête à servir</option>
                  <option value="served">Servie / Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center gap-2 mt-6 mb-6 flex-wrap'>
          <button
            onClick={() => setPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className='w-10 h-10 text-sm bg-brown-900 text-white active:bg-brown-800 disabled:opacity-50 rounded flex items-center justify-center'>
            {'<'}
          </button>

          {(() => {
            const pages = []
            const maxButtons = 2
            let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
            let endPage = startPage + maxButtons - 1

            if (endPage > totalPages) {
              endPage = totalPages
              startPage = Math.max(1, endPage - maxButtons + 1)
            }

            if (startPage > 1) {
              pages.push(
                <button key={1} onClick={() => setPage(1)}
                  className={`w-10 h-10 text-sm ${currentPage === 1 ? 'bg-brown-900 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded flex items-center justify-center`}>
                  1
                </button>
              )
              if (startPage > 2) pages.push(<span key="start-ellipsis" className="px-2 py-2 text-gray-500">...</span>)
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-10 h-10 text-sm ${currentPage === i ? 'bg-brown-900 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded flex items-center justify-center`}>
                  {i}
                </button>
              )
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-2 py-2 text-gray-500">...</span>)
              pages.push(
                <button key={totalPages} onClick={() => setPage(totalPages)}
                  className={`w-10 h-10 text-sm ${currentPage === totalPages ? 'bg-brown-900 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded flex items-center justify-center`}>
                  {totalPages}
                </button>
              )
            }

            return pages
          })()}

          <button
            onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className='w-10 h-10 text-sm bg-brown-900 text-white active:bg-brown-800 disabled:opacity-50 rounded flex items-center justify-center'>
            {'>'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Orders
