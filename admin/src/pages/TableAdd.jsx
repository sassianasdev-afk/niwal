import React from 'react'
import { assets } from '../assets/admin_assets/assets'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const TableAdd = ({ token }) => {

  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const response = await axios.post(backendUrl + '/api/table/add', { number: Number(number) }, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setNumber('')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Numéro de table</p>
          <input onChange={(e) => setNumber(e.target.value)} value={number} className='w-full max-w-[500px] px-3 py-2' type="number" placeholder='Ex: 1' min="1" required />
        </div>

        <p className='mb-2 text-sm text-gray-500'>
          Le QR code sera généré automatiquement pour: {`${window.location.origin.split(':3000')[0] || 'votre-site'}/table/${number}`}
        </p>

        {!loading &&
          <button type='submit' className='w-50 py-3 mt-2 bg-black text-white active:bg-gray-800'>CRÉER LA TABLE</button>
        }
        {loading &&
          <button className='w-50 py-3 mt-2 bg-gray-700 text-white'>CRÉATION EN COURS...</button>
        }
      </form>
    </div>
  )
}

export default TableAdd
