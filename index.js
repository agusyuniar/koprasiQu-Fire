const express   = require('express');
const app       = express();
const bodyParser= require('body-parser');
const cors      = require('cors');
const bearerToken= require('express-bearer-token');

app.use(bodyParser.json())
app.use(cors())
app.use(bearerToken())
app.use(bodyParser.urlencoded({ extended : false }))
app.use(express.static('public'))

var PORT = 2020

app.get('/', (req,res)=>{
    res.status(200).send(`<h1>Welcome to ${PORT}</h1>`)
})

const { userRouter, profileRouter, productRouter, categoryRouter } = require('./router')

app.use('/user',userRouter)
app.use('/profile',profileRouter)
app.use('/product',productRouter)
app.use('/category',categoryRouter)

app.listen(PORT, ()=> console.log(PORT));
