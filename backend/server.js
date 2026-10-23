import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import reviewRouter from './routes/reviewRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import tableRouter from './routes/tableRoute.js'
import dns from 'node:dns/promises'
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// app config

const app = express()
const port = process.env.PORT || 4000

connectDB()
connectCloudinary()

// middlewares

app.use(express.json())
app.use(cors())

// api endpoits
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/review', reviewRouter)
app.use('/api/category', categoryRouter)
app.use('/api/table', tableRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=> console.log('Server started on PORT : '+ port))