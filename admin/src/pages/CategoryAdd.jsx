import React from 'react'
import { assets } from '../assets/admin_assets/assets'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const CategoryAdd = ({ token }) => {

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("slug", slug)
      if (image) formData.append("image", image)

      const response = await axios.post(backendUrl + '/api/category/add', formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setSlug('')
        setImage(false)
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
          <p className='mb-2'>Nom de la catégorie</p>
          <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Ex: Boissons Chaudes' required />
        </div>

        <div>
          <p className='mb-2'>Slug (URL friendly)</p>
          <input onChange={(e) => setSlug(e.target.value)} value={slug} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Ex: boissons-chaudes' required />
        </div>

        <div>
          <p className='mb-2'>Image de la catégorie</p>
          <div className='flex gap-2'>
            <label htmlFor="categoryImage">
              <img className='w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg' src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
              <input onChange={(e) => setImage(e.target.files[0])} type="file" id='categoryImage' hidden accept="image/*" />
            </label>
          </div>
        </div>

        {!loading &&
          <button type='submit' className='w-50 py-3 mt-2 bg-black text-white active:bg-gray-800'>AJOUTER LA CATÉGORIE</button>
        }
        {loading &&
          <button className='w-50 py-3 mt-2 bg-gray-700 text-white'>AJOUT EN COURS...</button>
        }
      </form>
    </div>
  )
}

export default CategoryAdd
