require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const URL = require('url')
const DNS = require('dns')

const {link, counter} = require('./model')

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

  DNS.lookup(parsedUrl.hostname, async (error, address, family) => {
    if (!error && parsedUrl.hostname !== null) {
      let update = await counter.findByIdAndUpdate(process.env.COUNTER_ID,{
        $inc:{count: 1}
      })

      let insert = await link.insertMany({
        original_url: parsedUrl.href,
        shorturl: update.count
      }).catch(error => {
        return res.json(error)
      })

      return res.json({
        "original_url": insert[0].original_url,
        "short_url": insert[0].shorturl
      })
    }

    return res.json({ error: 'invalid url' })
  })
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  let shorturl = parseInt(req.params.short_url)
  let data = await link.findOne({
    short_url: req.params.short_url
  })

  if (shorturl === data.shorturl) {
    return res.redirect(data.original_url)
  }

  return res.json({ error: 'invalid url' })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
