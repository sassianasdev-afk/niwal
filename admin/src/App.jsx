import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import { useState } from 'react'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react'
import Update from './pages/Update'
import { NotificationProvider } from './context/NotificationContext'
import CategoryAdd from './pages/CategoryAdd'
import CategoryList from './pages/CategoryList'
import CategoryUpdate from './pages/CategoryUpdate'
import TableAdd from './pages/TableAdd'
import TableList from './pages/TableList'

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = 'MAD :'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token)

    const timer = setInterval(() => {
      try {
        if (token) {
          const { exp } = JSON.parse(atob(token.split('.')[1]))
          if (Date.now() > exp * 1000) {
            localStorage.removeItem('token')
            setToken('')
          }
        }
      } catch { }
    }, 3000)
    return () => clearInterval(timer)
  }, [token])


  return (
    <NotificationProvider token={token}>
      <div className='bg-gray-50 min-h-screen'>
        <ToastContainer />
        {
          token === ""
            ? <Login setToken={setToken} />
            :
            <>
              <Navbar setToken={setToken} token={token} />
              <hr />
              <div className='flex w-full'>
                <Sidebar token={token} />
              <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
                <Routes>
                  <Route path='/add' element={<Add token={token} />} />
                  <Route path='/list' element={<List token={token} />} />
                  <Route path='/orders' element={<Orders token={token} />} />
                  <Route path='/update/:id' element={<Update token={token} />} />
                  <Route path='/category/add' element={<CategoryAdd token={token} />} />
                  <Route path='/category/list' element={<CategoryList token={token} />} />
                  <Route path='/category/update/:id' element={<CategoryUpdate token={token} />} />
                  <Route path='/table/add' element={<TableAdd token={token} />} />
                  <Route path='/table/list' element={<TableList token={token} />} />
                </Routes>
              </div>
            </div>
          </>

      }
    </div>
    </NotificationProvider>
  )
}

export default App
