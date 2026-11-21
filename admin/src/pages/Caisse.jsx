import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`

const getDayKey = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDay = (dayKey) => {
  const [year, month, day] = dayKey.split('-')
  return `${day}/${month}/${year}`
}

const Caisse = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false)
      toast.error('Token manquant. Veuillez vous connecter.')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })

      if (response.data.success) {
        setOrders(response.data.orders || [])
      } else {
        toast.error(response.data.message || 'Erreur lors du chargement des commandes')
      }
    } catch (error) {
      console.error('Caisse fetch error:', error)
      toast.error(error.message || 'Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [token])

  // Build one row per day
  const dailyMap = new Map()

  orders.forEach((order) => {
    if (!order.date) return

    const dayKey = getDayKey(order.date)
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, { dayKey, total: 0, caisse: 0, cancelled: 0, count: 0 })
    }

    const day = dailyMap.get(dayKey)
    const amount = Number(order.amount || 0)

    if (order.status === 'cancelled') {
      day.cancelled += amount
    } else {
      day.total += amount
      day.count += 1
      if (order.status === 'served') {
        day.caisse += amount
      }
    }
  })

  // Cumulative "caisse" (money collected up to each day)
  const daysAscending = [...dailyMap.values()].sort((a, b) => a.dayKey.localeCompare(b.dayKey))
  let runningCaisse = 0
  daysAscending.forEach((day) => {
    runningCaisse += day.caisse
    day.cumulativeCaisse = runningCaisse
  })

  const days = [...daysAscending].reverse()

  const totalAllDays = days.reduce((sum, day) => sum + day.total, 0)
  const cancelledAllDays = days.reduce((sum, day) => sum + day.cancelled, 0)
  const caisseTotale = runningCaisse

  const todayKey = getDayKey(Date.now())
  const today = dailyMap.get(todayKey) || { total: 0, cancelled: 0, count: 0 }

  return (
    <div>
      <div className='flex items-center gap-4 mb-6'>
        <h3 className='text-xl font-semibold'>La caisse</h3>
        <button
          onClick={fetchOrders}
          className='px-4 py-2 bg-brown-900 text-white font-medium rounded hover:bg-brown-800 transition'
        >
          🔄 Refresh
        </button>
      </div>

      <p className='text-sm text-gray-500 mb-4'>
        Total = commandes non annulées du jour · Caisse = encaissé cumulé (commandes servies)
      </p>

      {/* Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white border-2 border-green-200 rounded-xl p-5 shadow-sm'>
          <p className='text-sm text-gray-500'>💰 Caisse totale</p>
          <p className='text-3xl font-bold text-green-700 mt-1'>{formatMoney(caisseTotale)}</p>
          <p className='text-xs text-gray-500 mt-1'>Total encaissé (commandes servies)</p>
        </div>

        <div className='bg-white border-2 border-amber-200 rounded-xl p-5 shadow-sm'>
          <p className='text-sm text-gray-500'>📅 Total aujourd'hui</p>
          <p className='text-3xl font-bold text-brown-900 mt-1'>{formatMoney(today.total)}</p>
          <p className='text-xs text-gray-500 mt-1'>
            {today.count} commande{today.count > 1 ? 's' : ''} non annulée{today.count > 1 ? 's' : ''}
          </p>
        </div>

        <div className='bg-white border-2 border-red-200 rounded-xl p-5 shadow-sm'>
          <p className='text-sm text-gray-500'>❌ Annulé aujourd'hui</p>
          <p className='text-3xl font-bold text-red-600 mt-1'>{formatMoney(today.cancelled)}</p>
          <p className='text-xs text-gray-500 mt-1'>Total des commandes annulées</p>
        </div>
      </div>

      {/* Daily history */}
      <div className='bg-white border-2 border-gray-200 rounded-xl overflow-hidden'>
        {loading ? (
          <div className='p-10 text-center text-gray-500'>Chargement...</div>
        ) : days.length === 0 ? (
          <div className='p-10 text-center text-gray-500'>Aucune commande pour le moment</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-brown-900 text-white'>
                <tr>
                  <th className='text-left px-4 py-3 font-semibold'>Date</th>
                  <th className='text-right px-4 py-3 font-semibold'>Total</th>
                  <th className='text-right px-4 py-3 font-semibold'>Caisse</th>
                  <th className='text-right px-4 py-3 font-semibold'>Annulée</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day.dayKey} className='border-b border-gray-100 hover:bg-amber-50'>
                    <td className='px-4 py-3 font-medium text-gray-800'>{formatDay(day.dayKey)}</td>
                    <td className='px-4 py-3 text-right'>{formatMoney(day.total)}</td>
                    <td className='px-4 py-3 text-right font-semibold text-green-700'>
                      {formatMoney(day.cumulativeCaisse)}
                    </td>
                    <td className='px-4 py-3 text-right text-red-600'>{formatMoney(day.cancelled)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className='bg-amber-50 font-bold text-gray-800'>
                <tr>
                  <td className='px-4 py-3'>Total général</td>
                  <td className='px-4 py-3 text-right'>{formatMoney(totalAllDays)}</td>
                  <td className='px-4 py-3 text-right text-green-700'>{formatMoney(caisseTotale)}</td>
                  <td className='px-4 py-3 text-right text-red-600'>{formatMoney(cancelledAllDays)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Caisse
