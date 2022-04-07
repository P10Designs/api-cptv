import express from 'express'
import getMatches from './functions/matches.js'
import {getLeagueData, getLeagueDataIdc, getAllLeagueData, getLeagueSmall} from './functions/leagues.js'
import {resolve} from 'path'

import cors from 'cors'
import { getAllTempPlayers } from './functions/players.js'

const app = express()
const port = process.env.PORT || 9030
app.use(express.json());


app.use(cors())

app.get('/match', async (req, res) => {
  try {
    res.status(200).json(await getMatches())
  } catch (error) {
    res.status(500).json({error})
  }
})

app.get('/league', async (req, res) => {
  try {
    res.status(200).json(await getAllLeagueData())
  } catch (error) {
    res.status(500).json({error})
  }
})

app.get('/league/:league_name', async (req, res) => {
  const {league_name} = req.params
  try {
    res.status(200).json(await getLeagueData(league_name))
  } catch (error) {
    res.status(500).json({error})
  }
})

app.get('/league/small/:league_name', async (req, res) => {
  const {league_name} = req.params
  try {
    res.status(200).json(await getLeagueSmall(league_name))
  } catch (error) {
    res.status(500).json({error})
  }
})

app.get('/league/idc/:idc', async (req, res) => {
  const { idc } = req.params
  try {
    res.status(200).json(await getLeagueDataIdc(idc))
  } catch (error) {
    res.status(500).json({error})
  }
})

app.get('/', (req, res) => {
  res.json({
    routes:[
      '/match',
      '/league/:league_name'
    ]
  })
})

app.get('/players', async (req, res) => {
  try {
    res.status(200).sendFile(resolve('./data/players.json'))
  } catch (error) {
    console.log(error)
    res.set('Cache-control', 'public, max-age=1800').status(500).json({error})
  }
})

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})

let idp = 0
let players = []

app.post('/app/select/:idp', async (req, res) => {
  idp = req.params.idp
  res.status(200).send(idp)
  players = []
})

app.get('/app/select', async (req, res) => {
  res.status(200).json(idp)
})
app.get('/app/players', async (req, res) => {
  res.status(200).json(players)
})

app.post('/app/players', async (req, res) => {
  players = req.body
  res.status(200).json(players)
})


getAllTempPlayers()
setInterval(() => {
  getAllTempPlayers()
}, 86400000)