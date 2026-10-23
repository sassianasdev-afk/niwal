import React from 'react'
import { assets } from '../assets/admin_assets/assets'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({token}) => {

  const [image,setImage] = useState(false)

  const [name,setName] = useState("")
  const [description,setDescription] = useState("")
  const [price,setPrice] = useState("")
  const [category,setCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [loading,setLoading] = useState(false)

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

  useEffect(() => {
    fetchCategories()
  }, [])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      if(!name || !price || !category) {
        toast.error('Veuillez remplir tous les champs')
        return
      }
      if(!image) {
        toast.error('Veuillez ajouter une image')
        return
      }

      const formData = new FormData()
      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("category",category)

      image && formData.append("image",image)

      const response = await axios.post(backendUrl+'/api/product/add',formData,{headers:{token}})
      
      if (response.data.success) {
        toast.success(response.data.message)
        setName("")
        setDescription("")
        setPrice("")
        setCategory("")
        setImage(false)
      }else{
        toast.error(response.data.message)
      }
    } 
    catch (error) {
      console.log(error);
      toast.error(error.message)
    } finally{
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Téléverser une image
            <p className='text-slate-400'>Taille 4:5</p>
          </p>
          <div className='flex gap-2 '>
            <label htmlFor="image">
              <img className='w-20' src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
              <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden />
            </label>
          </div>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Nom du produit</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Nom du produit' required />
        </div>

        <div className='w-full'>
          <p className='mb-2'>Description du produit</p>
          <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' placeholder='Description' required />
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
          <div>
            <p className='mb-2'>Catégorie</p>
            <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-3 py-2 sm:w-[200px]' required>
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <p className='mb-2'>Prix du produit</p>
            <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' placeholder='Prix' type="number" required/>
          </div>
        </div>

        {!loading && 
           <button type='submit' className='w-50 py-3 mt-2 bg-black text-white active:bg-gray-800'>AJOUTER LE PRODUIT</button>
        }
        {loading &&
          <button className='w-50 py-3 mt-2 bg-gray-700 text-white'>AJOUT EN COURS...</button> 
        }
      </form>
    </div>
  )
}

export default Add
