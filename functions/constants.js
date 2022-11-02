import axios from "axios"
import { load } from "cheerio"

export async function getTemp(){
  const { data:html } = await axios.get('http://hockeylinea.fep.es')
  const $ = load(html)
 return $('#temp_activa').attr().value
}

export async function getIdc(name, temp){
  const {data:html} = await axios.get('http://www.server2.sidgad.es/rfep/rfep_ls_2.php')
  const $ = load(html)
  let data = {}
  await new Promise((resolve) => {
    const length = $('.temp_'+temp).length
    if (length === 0) resolve()
    $('.temp_'+temp).each(async (i,v) => {
      if (v.attribs.idc_name.trim() === name.trim()){
        const $idc = load(v)
        const idc = Number(v.attribs.id.trim()) 
        const teamsArray = $idc('#teams_array_'+idc).attr().value.trim()
        data.idc = idc
        data.name = v.attribs.idc_name.trim()
        data.logo = v.attribs.logo.trim()
        data.teamsArray = teamsArray
      }
      if(i === (length - 1)) resolve()
    })
  })
  if (data.idc === undefined){
    data.message = 'NOT FOUND ON THIS SEASON'
  }
  return data
}

export async function getLeagueTemp(temp){
  const {data:html} = await axios.get('http://www.server2.sidgad.es/rfep/rfep_ls_2.php')
  const $ = load(html)
  let data = []
  await new Promise((resolve) => {
    const length = $('.temp_'+temp).length
    if (length === 0) resolve()
    $('.temp_'+temp).each(async (i,v) => {
      const $idc = load(v)
      const idc = Number(v.attribs.id.trim())
      const teamsArray = $idc('#teams_array_'+idc).attr().value.trim()
      data.push({
        idc: idc,
        name: v.attribs.idc_name.trim(),
        logo: v.attribs.logo.trim(),
        teamsArray: teamsArray,
      })
      if(i === (length - 1)) resolve()
    })
  })
  if (data.idc === undefined){
    data.message = 'NOT FOUND ON THIS SEASON'
  }
  return data
}


export async function getName(idc, temp){
  const {data:html} = await axios.get('http://www.server2.sidgad.es/rfep/rfep_ls_2.php')
  const $ = load(html)
  let data = {}
  await new Promise((resolve) => {
    const length = $('.temp_'+temp).length
    if (length === 0) resolve()
    $('.temp_'+temp).each(async (i,v) => {
      if (v.attribs.id === idc){
        const $idc = load(v)
        const teamsArray = $idc('#teams_array_'+idc).attr().value.trim()
        data.idc = idc
        data.name = v.attribs.idc_name.trim()
        data.logo = v.attribs.logo.trim()
        data.teamsArray = teamsArray
      }
      if(i === (length - 1)) resolve()
    })
  })
  if (data.idc === undefined){
    data.message = 'NOT FOUND ON THIS SEASON'
  }
  return data
}

export async function getTeams(teamsArray, idc){
  var teams = []
  try {
    const teams_array = 'teams_array=' + teamsArray.replace(/,/gi, "%2C").replace(/;/gi, "%3B");
    const { data: html } = await axios.post('http://www.server2.sidgad.es/competicion_header_creator.php', teams_array);
    const $ = load(html);
    const {data:html2} = await axios.get(`http://www.server2.sidgad.es/rfep/rfep_cal_idc_${idc}_2.php`)
    const $2 = load(html2)
    $('.logo_equipo_menu_container').each(function () {
      const $t = load(this);
      const id = this.attribs.id.replace('id', "")
      const $match = $2(`.${id}`)
      const team = {
        id: Number(id.split('_')[1]),
        acronym: $t('.logo_equipo_menu_nombre').text(),
        logo: $match.length !== 0 ? $2(`.${id} .team_logo`)[$match.attr('class').split(' ').indexOf(id)].attribs.src : '',
        name: $match.length !== 0 ? $2(`.${id} .no_mobile`)[$match.attr('class').split(' ').indexOf(id)].children[0].data : ''
      };
      teams.push(team);
    });
  } catch (error) {
    teams = []
  }
  return teams
}


export async function getPlayers(idc, temp){
    const players = []
    const { data:html } = await axios.post(`http://www.server2.sidgad.es/rfep/rfep_stats_2_${idc}.php`, 'tipo_stats=plantillas')
    const $ = load(html)

    const data = $('tbody > tr')
    for (let i = 0 ; i < data.length; i++){
      const v = data[i]
      const $row = load(v)
        try{
          const stats = $row('.stats_table')
          if ($row('a').length !== 0){  
            const playerId = Number($row('a').attr().id_player.trim())
            players.push({
              name: $row('a').attr().player_name.trim(),
              id: playerId,
              img: await playerImg(playerId, temp),
              team:{
                id: Number($row('a').attr().team_id.trim()),
                acronym: $row('.texto_gris_10').text().trim(),
                logo: $row('img').attr().src.trim()
              },
              stats: {
                pj: stats[0].children.length === 0 ? 0 : Number(stats[0].children[0].data),
                g: stats[1].children.length === 0 ? 0 : Number(stats[1].children[0].data),
                a: stats[2].children.length === 0 ? 0 : Number(stats[2].children[0].data),
                pim: stats[4].children.length === 0 ? 0 : Number(stats[4].children[0].data),
              }
            })
          }
        }catch (e) {}
    }
    return players
}

export async function getClasif(idc){
  const classif = []
  try {
    const {data:html} = await axios.get(`http://www.server2.sidgad.es/rfep/rfep_clasif_idc_${idc}_2.php`)
    const $ = load(html)
    if($('tbody > tr').length === 0) throw Error
    await new Promise((resolve) => {
      const length = $('tbody > tr').length
      if (length === 0) resolve()
      let table = -1
      let tableName = ''
      $('tbody > tr').each(async (i,v) => {
        const $row = load(v)
        if ($('.tabla_standard').length > 1) {
          if (Number($row('td').first().text().trim()) === 1){
            table += 1
            tableName = $('thead')[table].children[1].children[0].children[4].data.trim()
          }
        }
        const stats = $row('.stats_table > div')
        classif.push({
          more: $('.tabla_standard').length > 1,
          tabla: tableName,
          pos: Number($row('td').first().text().trim()),
          team:{
            acronym: $row('.mobile').text().trim(),
            name:$row('.no_mobile').text().trim() ,
            logo: $row('img').attr().src.trim(),
          },
          stats:{
            pts: Number($row('.stats_table_special').text().trim()),
            bonus: Number(stats[0].children[0].data.trim()),
            pj:Number(stats[1].children[0].data.trim()),
            pg:Number(stats[2].children[0].data.trim()),
            pe:Number(stats[3].children[0].data.trim()),
            pp:Number(stats[4].children[0].data.trim()),
            gf:Number(stats[5].children[0].data.trim()),
            gv:Number(stats[6].children[0].data.trim()),
            gav:Number(stats[7].children[0].data.trim()),
            pen:Number(stats[8].children[0] === undefined ? 0 : stats[8].children[0].data.trim()),

          }
        })
        if (i === (length - 1)) resolve()
      })
    })
  } catch (e) {
    try {
      const {data:html} = await axios.get(`http://www.server2.sidgad.es/rfep/rfep_cal_idc_${idc}_2.php`)
      const $ = load(html)
      await new Promise((resolve) => {
        const length = $('.tabla_standard > tbody > tr').length
        if (length === 0) resolve()
        let table = 1
        $('.tabla_standard > tbody > tr').each(async (i,v) => {
          const $row = load(v)
          if ($('.tabla_standard').length > 1) {            
            if (Number($row('td').first().text().trim()) === 1){
              table += 1
            }
          }
          const stats = $row('.stats_table > div')
          if (stats.length < 1) return
          classif.push({
            more: $('.tabla_standard').length > 1,
            tabla: table,
            pos: Number($row('td').first().text().trim()),
            team:{
              acronym: $row('.mobile').text().trim(),
              name:$row('.no_mobile').text().trim() ,
              logo: $row('img').attr().src.trim(),
            },
            stats:{
              pts: Number($row('.stats_table_special').text().trim()),
              bonus: Number(stats[0].children[0].data.trim()),
              pj:Number(stats[1].children[0].data.trim()),
              pg:Number(stats[2].children[0].data.trim()),
              pe:Number(stats[3].children[0].data.trim()),
              pp:Number(stats[4].children[0].data.trim()),
              gf:Number(stats[5].children[0].data.trim()),
              gv:Number(stats[6].children[0].data.trim()),
              gav:Number(stats[7].children[0].data.trim()),
              pen:Number(stats[8].children[0] === undefined ? 0 : stats[8].children[0].data.trim()),

            }
          })
          if (i === (length - 1)) resolve()
        })
      })
    } catch (e){
      
    }
  }
  if (classif.length === 0) classif.push('NO CLASSIF')
  return classif
}


async function playerImg(playerId, temp){
  try {
    const {data:html} = await axios.post(`http://www.server2.sidgad.es/rfep/rfep_profileseason_2_${temp}.php`, `id_player=${playerId}`)
    const $ = load(html)
    const link = $('.player_profile_picture').attr().style.split('(')[1].split(')')[0].trim()
    return link !== undefined ? link : ''
  }catch(e){
    return ''
  }
}
