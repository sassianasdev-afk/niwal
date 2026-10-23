import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { assets } from '../assets/admin_assets/assets'
import { useNavigate } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const List = ({ token }) => {

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDelete,setLoadingDelete] = useState(null)
  const navigate = useNavigate()

  const fetchList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products)
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

  const removeProduct = async (id) => {
    setLoadingDelete(id)
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally{
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
          <h3 className='text-xl font-semibold mb-4'>Liste de tous les produits</h3>
          <p className='mb-4 text-gray-400'>Cliquer sur l'image pour modifier</p>
        </>
      )}
  
      <div className='flex flex-col gap-2'>
        {list.length !== 0 && (
          <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
            <b>Image</b>
            <b>Nom</b>
            <b>Catégorie</b>
            <b>Prix</b>
            <b className='text-center'>Action</b>
          </div>
        )}

        {loading ? (
          Array(8).fill(0).map((_, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <Skeleton width={48} height={58} />
              <Skeleton height={16} />
              <Skeleton height={16} />
              <Skeleton height={16} />
              <Skeleton height={16} />
            </div>
          ))
        ) : list.length === 0 ? (
          <div className='text-center py-20 border-2 border-gray-200 rounded-lg'>
            <img src={assets.cloth_icon} alt="" className='w-20 mx-auto mb-4 opacity-50' />
            <p className='text-gray-500 text-lg'>Aucun produit trouvé</p>
          </div>
        ) : (
          list.slice().reverse().map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <div className='relative'>
                <img
                  onClick={() => navigate(`/update/${item._id}`)}
                  className='w-12 cursor-pointer'
                  src={item.image?.[0] || ''}
                  alt={item.name}
                />
              </div>
              <p className='font-medium'>{item.name}</p>
              <p className='text-sm text-gray-600'>{item.category}</p>
              <p>{currency} {item.price}</p>
              <p
                onClick={() => removeProduct(item._id)}
                className='text-right md:text-center cursor-pointer text-lg'
              >
                {loadingDelete === item._id ? 'SUPPRESSION…' : 'X'}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default List
