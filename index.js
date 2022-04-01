import express from 'express'
import getMatches from './functions/matches.js'
import {getLeagueData, getLeagueDataIdc, getAllLeagueData} from './functions/leagues.js'

import cors from 'cors'

const app = express()
const port = process.env.PORT || 9030

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

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})