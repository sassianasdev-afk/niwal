import React, { useEffect, useState } from 'react'
import { assets } from '../assets/admin_assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useParams, useNavigate } from 'react-router-dom'

const CategoryUpdate = ({ token }) => {

  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState(false)
  const [oldImage, setOldImage] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= FETCH CATEGORY ================= */
  const fetchCategory = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/category/single', { id }, { headers: { token } })
      if (res.data.success) {
        const c = res.data.category
        setName(c.name)
        setSlug(c.slug)
        setOldImage(c.image || '')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchCategory()
  }, [])

  /* ================= UPDATE ================= */
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!name || !slug) {
        toast.error('Veuillez remplir tous les champs')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("name", name)
      formData.append("slug", slug)
      if (image) formData.append("image", image)

      const res = await axios.put(
        backendUrl + `/api/category/update/${id}`,
        formData,
        { headers: { token } }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        navigate('/category/list')
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div className='w-full'>
          <p className='mb-2'>Nom de la catégorie</p>
          <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Ex: Boissons Chaudes' required />
        </div>

        <div className='w-full'>
          <p className='mb-2'>Slug (URL friendly)</p>
          <input onChange={(e) => setSlug(e.target.value)} value={slug} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Ex: boissons-chaudes' required />
        </div>

        <div>
          <p className='mb-2'>Image de la catégorie</p>
          <div className='flex gap-2 items-center'>
            {oldImage && (
              <img className='w-20 h-20 object-cover rounded-lg border border-gray-300' src={oldImage} alt={name} />
            )}
            <label htmlFor="categoryImage">
              <img className='w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg' src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
              <input onChange={(e) => setImage(e.target.files[0])} type="file" id='categoryImage' hidden accept="image/*" />
            </label>
          </div>
          {oldImage && image && (
            <p className='text-xs text-gray-500 mt-1'>La nouvelle image remplacera l’ancienne (l’ancienne sera supprimée de Cloudinary).</p>
          )}
        </div>

        {!loading &&
          <button type='submit' className='w-50 py-3 mt-2 bg-black text-white active:bg-gray-800'>METTRE À JOUR LA CATÉGORIE</button>
        }
        {loading &&
          <button className='w-50 py-3 mt-2 bg-gray-700 text-white'>MISE À JOUR…</button>
        }
      </form>
    </div>
  )
}

export default CategoryUpdate
