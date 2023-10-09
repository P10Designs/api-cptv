import axios from "axios"
import { load } from "cheerio"

axios.defaults.headers.common.origin = 'http://fep.es'

async function getMatches(){
  const matches = []
  const {data:html} = await axios.get('http://www.server2.sidgad.es/rfep/rfep_mc_2.php')
  const $ = load(html)
  await new Promise((resolve) => {
    const length = $('.scorer_game').length
    if (length === 0) resolve()
    $('.scorer_game').each((i,v) => {
      const $match = load(v)
      const date = $match('.scorer_bot_left').text().trim().split(' ')
      const time = date[0].split('/')
      const timestamp = new Date(`${time[1]}/${time[0]}/${new Date().getUTCFullYear()} ${date[1]}`)
      matches.push({
        idp: v.attribs.idp,
        local: {
          acronym: $match('.scorer_team_left').text().trim(),
          logo: $match('.scorer_logo_left > img').attr().src
        },
        visitor: {
          acronym: $match('.scorer_team_right').text().trim(),
          logo: $match('.scorer_logo_right > img').attr().src
        },
        league: $match('.scorer_liga').text().trim(),
        period: $match('.scorer_bot_center').text().trim(),
        sede: $match('.scorer_bot_right').text().trim().replace('SEDE ','').replace('…', '').trim(),
        date: timestamp.toISOString(),
        score: {
          local: Number($match('.scorer_score').text().trim().split(':')[0]),
          visitor: Number($match('.scorer_score').text().trim().split(':')[1])
        }
      })
      if (i === (length - 1)) resolve()
    })
  })
  return matches
}

export default getMatches