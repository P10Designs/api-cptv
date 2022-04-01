import {getIdc, getTeams, getTemp, getPlayers, getClasif, getName} from './constants.js'

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


export async function getLeagueDataIdc(idc){
  const temp = await getTemp()
  let data = await getName(idc, temp)
  if (data.message === undefined){
    data.teams = await getTeams(data.teamsArray, data.idc)
    data.players = await getPlayers(data.idc)
    data.getClasif = await getClasif(data.idc)
  }
  return data
}