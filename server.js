require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const URL = require('url')
const DNS = require('dns')

const {link, counter} = require('./model');
const { is } = require('express/lib/request');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
	useUnifiedTopology: true,
})

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const {url} = req.body
  const parsedUrl = URL.parse(url)

  let counterId = ''
  const isCounterExist = await counter.exists()
  if (!isCounterExist) {
    let createCounter = await counter.create({
      count: 1
    })
    counterId = createCounter._id
    console.log('counter created')
  }

  DNS.lookup(parsedUrl.hostname, async (error, address, family) => {
    if (!error && parsedUrl.hostname !== null) {
      let update = await counter.findByIdAndUpdate(counterId || isCounterExist._id,{
        $inc:{count: 1}
      })

      let insert = await link.insertMany({
        original_url: parsedUrl.href,
        short_url: update.count
      }).catch(error => {
        return res.json('duplicate data')
      })

      return res.json({
        "original_url": insert[0].original_url,
        "short_url": insert[0].short_url
      })
    }

    return res.json({ error: 'invalid url' })
  })
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    let shorturl = parseInt(req.params.short_url)
    let data = await link.findOne({
      short_url: shorturl
    })

    if (!data) {
      return res.json({ error: 'invalid url' })
    }

    return res.redirect(data.original_url)
  } catch (error) {
    res.status(500).send({
      msg:"Error"
    })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
