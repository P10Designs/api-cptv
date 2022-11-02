import {getIdc, getTeams, getTemp, getPlayers, getClasif, getName, getLeagueTemp} from './constants.js'

export async function getLeagueData(league_name){
  const temp = await getTemp()
  let data = await getIdc(league_name, temp)
  if (data.message === undefined){
    data.teams = await getTeams(data.teamsArray, data.idc)
    // data.players = await getPlayers(data.idc, temp)
    data.getClasif = await getClasif(data.idc)
  }
  return data
}


export async function getLeagueDataIdc(idc){
  const temp = await getTemp()
  let data = await getName(idc, temp)
  if (data.message === undefined){
    data.teams = await getTeams(data.teamsArray, data.idc)
    // data.players = await getPlayers(data.idc, temp)
    data.getClasif = await getClasif(data.idc)
  }
  return data
}


export async function getAllLeagueData(){
  const temp = await getTemp()
  let data = await getLeagueTemp(temp)
  for (let i = 0; i < data.length; i++ ){
    const d = data[i]
    if (d.message === undefined){
      d.teams = await getTeams(d.teamsArray, d.idc)
    }
  }
  return data
}