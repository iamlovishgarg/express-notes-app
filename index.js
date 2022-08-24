const express = require('express');
const User = require('./models/User');
const Note = require('./models/Note');
const mongoose = require('mongoose');
const cryptoJs = require('crypto-js')
const jsonwebtoken = require('jsonwebtoken');

const app = express()
app.use(express.json());
app.use(express.urlencoded());

AES_SECRET = "this#is#secreat@" 
JWT_SECRET = "this#is#secret@"

const port = 3000

const database = async () => {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect("mongodb://localhost:27017", {
      dbName: 'notesapp'
    })
  }
}

database()

app.get('/signup', (req, res) => {
  res.sendFile('pages/signup.html', { root: __dirname })
})

app.post('/signup', async (req, res) => {

  await User.create({ ...req.body, password: cryptoJs.AES.encrypt(req.body.password, AES_SECRET).toString() })

  // res.redirect("/login") // not working

  res.status(200).json({ success: true })
})


app.get('/login', (req, res) => {
  res.sendFile('pages/login.html', { root: __dirname })
})

app.post('/login', async (req, res) => {

  const { email, password } = req.body

  let user = await User.findOne({ email: email })
  if (!user) {
    res.status(402).json({ success: false, message: "Invalid Credentials" })
    return
  }

  const bytes = cryptoJs.AES.decrypt(user.password, AES_SECRET);
  let decryptedPass = bytes.toString(cryptoJs.enc.Utf8);

  if (decryptedPass == password) {
    var token = jsonwebtoken.sign({ email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "10d"
    });
  } else {
    res.status(200).json({ success: false, token: token, email: user.email, message: 'Wrong Username/Password' })
    return
  }
  
  res.status(200).json({ success: true, token: token, email: user.email, message: 'You are successfully logged in!' })
  
})

app.get('/', (req, res) => {
  res.sendFile('pages/index.html', { root: __dirname })
})

app.post('/', async (req, res) => {
  
  let note = await Note.create(req.body)
  
  res.status(200).json({ success: true, _id: note._id })
})

app.post('/delete', async (req, res) => {
  
  await Note.findByIdAndDelete(req.body.id)
  
  res.status(200).json({ success: true })
})

app.get('/data', async(req, res) => {

  const email = req.query.email

  let data = await Note.find({userEmail: email})
  res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
