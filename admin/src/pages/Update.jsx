import React, { useEffect, useState } from 'react'
import { assets } from '../assets/admin_assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useParams, useNavigate } from 'react-router-dom'

const Update = ({ token }) => {

  const { id } = useParams()
  const navigate = useNavigate()

  const [image, setImage] = useState(false)

  const [oldImages, setOldImages] = useState([])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/list')
      if (response.data.success) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.log(error)
    }
  }

  /* ================= FETCH PRODUCT ================= */
  const fetchProduct = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/product/single', {
        productId: id
      })
      if (res.data.success) {
        const p = res.data.product
        setName(p.name)
        setDescription(p.description)
        setPrice(p.price)
        setCategory(p.category)
        setOldImages(p.image)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [])

  /* ================= UPDATE ================= */
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if(!name || !price || !category) {
        toast.error('Veuillez remplir tous les champs')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)

      image && formData.append("image", image)

      const res = await axios.put(
        backendUrl + `/api/product/update/${id}`,
        formData,
        { headers: { token } }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        navigate('/list')
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
        {/* ================= IMAGE ================= */}
        <div>
          <p className='mb-2'>Téléverser une image
            <p className='text-slate-400'>Taille 4:5</p>
          </p>
          <div className='flex gap-2'>
            <label>
              <img
                className='w-20'
                src={image ? URL.createObjectURL(image) : oldImages[0] || assets.upload_area}
                alt=""
              />
              <input
                type="file"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        {/* ================= NAME ================= */}
        <div className='w-full'>
          <p className='mb-2'>Nom du produit</p>
          <input value={name} onChange={e=>setName(e.target.value)}
            className='w-full max-w-[500px] px-3 py-2' required />
        </div>

        {/* ================= DESC ================= */}
        <div className='w-full'>
          <p className='mb-2'>Description du produit</p>
          <textarea value={description} onChange={e=>setDescription(e.target.value)}
            className='w-full max-w-[500px] px-3 py-2' required />
        </div>

        {/* ================= CATEGORY & PRICE (side by side like Add page) ================= */}
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
          <div>
            <p className='mb-2'>Catégorie</p>
            <select value={category} onChange={e=>setCategory(e.target.value)} className='w-full px-3 py-2 sm:w-[200px]' required>
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <p className='mb-2'>Prix du produit</p>
            <input value={price} onChange={e=>setPrice(e.target.value)}
              className='w-full px-3 py-2 sm:w-[120px]' placeholder='Prix' type="number" required />
          </div>
        </div>

        {/* ================= SUBMIT ================= */}
        {!loading &&
          <button type='submit' className='w-50 py-3 mt-2 bg-black text-white active:bg-gray-800'>
            METTRE À JOUR
          </button>
        }
        {loading &&
          <button className='w-50 py-3 mt-2 bg-gray-700 text-white'>MISE À JOUR…</button>
        }
      </form>
    </div>
  )
}

export default Update
