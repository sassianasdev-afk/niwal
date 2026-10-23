import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { assets } from '../assets/admin_assets/assets'
import { useNavigate } from 'react-router-dom'

const CategoryList = ({ token }) => {

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDelete, setLoadingDelete] = useState(null)
  const navigate = useNavigate()

  const fetchList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUrl + '/api/category/list')
      if (response.data.success) {
        setList(response.data.categories)
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

  const removeCategory = async (id) => {
    setLoadingDelete(id)
    try {
      const response = await axios.post(backendUrl + '/api/category/remove', { id }, { headers: { token } })
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

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      {list.length !== 0 && (
        <>
          <h3 className='text-xl font-semibold mb-4'>Liste des catégories</h3>
          <p className='mb-4 text-gray-400'>Gérer les catégories du menu</p>
        </>
      )}

      <div className='flex flex-col gap-2'>
        {list.length !== 0 && (
          <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
            <b>Image</b>
            <b>Nom</b>
            <b>Slug</b>
            <b className='text-center'>Action</b>
          </div>
        )}

        {loading ? (
          Array(8).fill(0).map((_, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <div className='w-12 h-12 bg-gray-200 rounded' />
              <div className='h-4 bg-gray-200 rounded w-3/4' />
              <div className='h-4 bg-gray-200 rounded w-1/2' />
              <div className='h-4 bg-gray-200 rounded' />
            </div>
          ))
        ) : list.length === 0 ? (
          <div className='text-center py-20 border-2 border-gray-200 rounded-lg'>
            <img src={assets.cloth_icon} alt="" className='w-20 mx-auto mb-4 opacity-50' />
            <p className='text-gray-500 text-lg'>Aucune catégorie trouvée</p>
          </div>
        ) : (
          list.slice().reverse().map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <div className='relative'>
                <img
                  className='w-12 h-12 object-cover rounded-lg'
                  src={item.image || ''}
                  alt={item.name}
                />
              </div>
              <p className='font-medium'>{item.name}</p>
              <p className='text-sm text-gray-500'>{item.slug}</p>
              <div className='text-center'>
                <span
                  onClick={() => navigate(`/category/update/${item._id}`)}
                  className='cursor-pointer text-blue-600 text-sm underline mr-2'
                >
                  Modifier
                </span>
                <p
                  onClick={() => removeCategory(item._id)}
                  className='cursor-pointer text-lg text-red-500 hover:text-red-700 font-bold'
                >
                  {loadingDelete === item._id ? 'SUPPRESSION…' : '×'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default CategoryList
