import { getTemp, getPlayers, getLeagueTemp} from './constants.js'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
export async function getAllTempPlayers(){
  const temp = await getTemp()
  let data = await getLeagueTemp(temp)
  let players = []
  for (let i = 0; i< data.length ; i++){
    const league = data[i]
    try {
      const get = await getPlayers(league.idc, temp)
      get.forEach(g => {
        players.push(g)
      })
    } catch (e) {
      console.log('e')
    }
  }
  console.log('playersDone')
  writeFileSync(resolve('./data/players.json'), JSON.stringify(players));
}

function getObjects (obj, key, val) {
  if (val.indexOf('-') !== -1) val = val.split('-')[0].trim()
  let objects = []
  for (const i in obj) {
    if (typeof obj[i] === 'object') {
      objects = objects.concat(getObjects(obj[i], key, val))
    } else if ((i === key && obj[i] === val) || (i === key && val === '')) { //
      objects.push(obj)
    } else if (obj[i] === val && key === '') {
      if (objects.lastIndexOf(obj) === -1) {
        objects.push(obj)
      }
    }
  }
  return objects
}