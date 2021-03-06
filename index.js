const express = require('express')
const args = require('minimist')(process.argv.slice(2))
const app = express()
const database = require('better-sqlite3')
const morgan = require('morgan')
const fs = require('fs')
const logdb = new database('log.db')
const cors = require('cors')

const port = args.port || 5000
const debug = args.debug || false
const log = args.log || true
const help = args.help

if(help != null) {
  console.log('--port     Set the port number for the server to listen on. Must be an integer between 1 and 65535.\n')
  console.log('--debug    If set to `true`, creates endlpoints /app/log/access/ which returns a JSON access log from the database and /app/error which throws an error with the message "Error test successful." Defaults to `false`.\n')
  console.log('--log      If set to false, no log files are written. Defaults to true. Logs are always written to database.\n')
  console.log('--help     Return this message and exit.')
  process.exit(0)
}

if (log) {
  const accesslog = fs.createWriteStream('access.log', {flags: 'a'})
  app.use(morgan('combined', {stream: accesslog}))
}

app.use(express.static('./public'))
app.use(express.json())
app.use(cors())

if(port < 1 || port > 65535) { port = 5000 }

let stmt = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`)
let row = stmt.get();
if(row == undefined) {
  console.log('Log database is empty. Creating log database...')
  const sqlInit = `CREATE TABLE accesslog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remoteaddr VARCHAR,
    remoteuser VARCHAR,
    time VARCHAR,
    method VARCHAR,
    url VARCHAR,
    protocol VARCHAR,
    httpversion NUMERIC,
    secure VARCHAR,
    status INTEGER,
    referer VARCHAR,
    useragent VARCHAR
  );`
  logdb.exec(sqlInit)
} else {
  console.log('Log database exists.')
}

const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

app.get('/app/', (req, res)  => {
  res.statusCode = 200
  res.statusMessage = 'OK'
  res.writeHead( res.statusCode, {'Content-Type' : 'text/plain'})
  res.end(res.statusCode + ' ' + res.statusMessage)
})

app.get('/app/flips/:number', (req, res) => {
    let flips_raw = coinFlips(req.body.number)
    let flips_data = countFlips(flips_raw)
    res.type('text/json')
    res.status(200).json({"raw": flips_raw, "summary": flips_data})
})

app.get('/app/flip/', (req, res) => {
    res.type('text/json')
    res.status(200).json({"flip": coinFlip()})
})

app.post('/app/flip/coins/', (req, res, next) => {
  let flips = coinFlips(req.body.number)
  let count = countFlips(flips)
  res.status(200).json({"raw" : flips, "summary" : count})
})

app.get('/app/flip/call/:guess(heads|tails)/', (req, res, next) => {
    let guessedFlip = guessFlip(req.params.guess)
    res.type('text/json')
    res.status(200).send(guessedFlip)
})

app.get('/app/log/', (req, res) => {
  res.status(200).send('ok')
})



if (debug) {
  app.get('/app/error', (req, res) => {
    throw new Error('Error test successful')
  })

  app.get('/app/log/access', (req, res, next) => {
    try {
      const sql_access_get = logdb.prepare('SELECT * FROM accesslog').all()
      res.status(200).json(sql_access_get)
    } catch (e) {
      console.error(e)
    }
  })
}

app.use(function(req, res, next){
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    secure: (req.secure) ? 1 : 0,
    status: req.status,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
  }
  const stmt1 = logdb.prepare('INSERT INTO accesslog(remoteaddr, remoteuser, time, method, url, protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  stmt1.run(Object.values(logdata))
  next()
})

app.use(function(req, res) {
  console.log(log)
  res.status(404).send('404 page not found')
})

function coinFlip() {
  let flip_value = Math.floor(Math.random() * 2)
  if(flip_value == 1) 
  {
    return 'heads'
  } else {
    return 'tails'
  }
}

/** Multiple coin flips
 * @param {number} flips 
 * @returns {string[]} results
 */

function coinFlips(flips) {
  let flip_arr = []
  for(let i=0; i < flips; i++) {
    flip_arr.push(coinFlip())
  }
  return flip_arr
}

/** Count multiple flips
 * @param {string[]} array 
 * @returns {{ heads: number, tails: number }}
 */

function countFlips(array) {
  let num_tails = 0
  let num_heads = 0
  for(let i=0; i<array.length; i++) {
    if (array[i] == 'heads') {
      num_heads += 1
    } else {
      num_tails += 1
    }
  }
  if ( num_tails == 0) {
    return{heads: num_heads}
  } else if (num_heads == 0) {
    return{tails: num_tails}
  }
  return {heads: num_heads, tails: num_tails}
}

/** Flip a coin!
 * @param {string} call 
 * @returns {object} 
 */

function flipACoin(call) {
  let flip_value = Math.floor(Math.random() * 2)
  let flip = ''
  if(flip_value == 0) 
  {
    flip = 'heads'
  } else {
    flip = 'tails'
  }
  let result = ''
  if(flip == call) {
    result = 'win'
  } else {
    result = 'lose'
  }
  return {'call': call, 'flip': flip, 'result': result}
}

function guessFlip(call) {
  console.log(call)
  if (call != 'heads' && call != 'tails') {
      return 'Error: incorrect input. \nUsage: node guess-flip --call=[heads|tails]'
  }

  return flipACoin(call)
}

function flip() {
  return coinFlip()
}