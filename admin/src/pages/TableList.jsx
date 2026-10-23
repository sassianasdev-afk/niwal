import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { assets } from '../assets/admin_assets/assets'
import { useNavigate } from 'react-router-dom'

const TableList = ({ token }) => {

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDelete, setLoadingDelete] = useState(null)
  const navigate = useNavigate()

  const fetchList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUrl + '/api/table/list')
      if (response.data.success) {
        setList(response.data.tables)
      } else {
        toast.error(response.data.message)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      setLoading(false)
    }
  }

  const removeTable = async (id) => {
    setLoadingDelete(id)
    try {
      const response = await axios.post(backendUrl + '/api/table/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoadingDelete(null)
    }
  }

  const downloadQr = async (id, number) => {
    try {
      const response = await axios.get(backendUrl + `/api/table/qr/${id}`, { headers: { token } })
      if (response.data.success) {
        const link = document.createElement('a')
        link.href = response.data.qrCode
        link.download = `table-${number}-qr.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success(`QR Table ${number} téléchargé`)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <div className='mb-6'>
        <h3 className='text-xl font-semibold mb-2'>Liste des tables</h3>
        <p className='mb-4 text-gray-400'>Générer et télécharger les QR codes des tables</p>
      </div>

      <div className='mb-6'>
        <button
          onClick={() => {
            axios.post(backendUrl + '/api/table/generate', {}, { headers: { token } })
              .then(res => {
                if (res.data.success) {
                  toast.success(res.data.message)
                  fetchList()
                } else {
                  toast.error(res.data.message)
                }
              })
              .catch(err => toast.error(err.message))
          }}
          className='w-full py-3 bg-brown-900 text-white font-bold rounded-xl hover:bg-brown-800 transition flex items-center justify-center gap-2'
        >
          🔄 Générer les tables 1-6
        </button>
      </div>

      <div className='flex flex-col gap-2'>
        {list.length !== 0 && (
          <div className='hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
            <b>Numéro</b>
            <b>Statut</b>
            <b>QR Code</b>
            <b>Action</b>
            <b className='text-center'>Download QR</b>
          </div>
        )}

        {loading ? (
          Array(8).fill(0).map((_, index) => (
            <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <div className='h-4 bg-gray-200 rounded' />
              <div className='h-4 bg-gray-200 rounded' />
              <div className='h-4 bg-gray-200 rounded' />
              <div className='h-4 bg-gray-200 rounded' />
              <div className='h-4 bg-gray-200 rounded' />
            </div>
          ))
        ) : list.length === 0 ? (
          <div className='text-center py-20 border-2 border-gray-200 rounded-lg'>
            <img src={assets.cloth_icon} alt="" className='w-20 mx-auto mb-4 opacity-50' />
            <p className='text-gray-500 text-lg'>Aucune table trouvée</p>
            <p className='text-sm text-gray-400 mt-2'>Utilisez "Générer les tables" pour créer les tables 1-6</p>
          </div>
        ) : (
          list.slice().reverse().map((item, index) => (
            <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <div className='font-medium text-brown-900'>Table {item.number}</div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className='text-xs text-gray-500 break-all'>
                {item.qrCode ? 'Généré' : 'Non généré'}
              </div>
              <div className='flex gap-1'>
                {item.isActive ? (
                  <button
                    onClick={() => {
                      axios.post(backendUrl + '/api/table/update/' + item._id, { number: item.number, isActive: false }, { headers: { token } })
                        .then(res => { if (res.data.success) { toast.success('Table désactivée'); fetchList() } })
                    }}
                    className='text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200'
                  >
                    Désactiver
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      axios.post(backendUrl + '/api/table/update/' + item._id, { number: item.number, isActive: true }, { headers: { token } })
                        .then(res => { if (res.data.success) { toast.success('Table activée'); fetchList() } })
                    }}
                    className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200'
                  >
                    Activer
                  </button>
                )}
                <button
                  onClick={() => removeTable(item._id)}
                  className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200'
                >
                  X
                </button>
              </div>
              <button
                onClick={() => downloadQr(item._id, item.number)}
                className='text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200'
              >
                📥 QR
              </button>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default TableList
