import {getIdc, getTeams, getTemp, getPlayers, getClasif} from './constants.js'

export async function getLeagueData(league_name){
  const temp = await getTemp()
  let data = await getIdc(league_name, temp)
  if (data.message === undefined){
    data.teams = await getTeams(data.teamsArray, data.idc)
    data.players = await getPlayers(data.idc)
    data.getClasif = await getClasif(data.idc)
  }
  return data
}
