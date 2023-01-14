import got, { OptionsOfTextResponseBody } from 'got'
import { HttpsProxyAgent } from 'hpagent'
import { load } from 'cheerio'

import { getRandomIp } from './utils/random'

export const domain = 'https://www.dabai.in'

export const proxyUrl = 'http://127.0.0.1:1087'

const getCommonGotOpt = (
  opt: OptionsOfTextResponseBody
): OptionsOfTextResponseBody => {
  const commonOpt = {
    method: 'post',
    headers: {
      'x-forwarded-for': getRandomIp()
    },
    agent: {
      https: new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: proxyUrl
      })
    }
  }
  return Object.assign(commonOpt, opt)
}

export const sendEmailCode = async (email: string) => {
  const res = await got(
    `${domain}/auth/send`,
    getCommonGotOpt({ form: { email } })
  )
  return JSON.stringify(JSON.parse(res.body))
}

export const register = async (
  email: string,
  name: string,
  passwd: string,
  code: string,
  emailcode: string
) => {
  const opts = getCommonGotOpt({
    body: JSON.stringify({
      email,
      name,
      passwd,
      repasswd: passwd,
      code: '',
      emailcode: ''
    })
  })

  opts.headers['Content-Type'] = 'application/json'

  const res = await got(`${domain}/auth/register`, opts)

  let body = JSON.parse(res.body)
  if (body['ret'] == 0) {
    throw new Error(body['msg'])
  }
  return body
}

export const login = async (
  email: string,
  passwd: string,
  code: string
): Promise<string> => {
  const opts = getCommonGotOpt({
    body: JSON.stringify({
      email,
      passwd,
      code
    })
  })
  opts.headers['Content-Type'] = 'application/json'

  const res = await got(`${domain}/auth/login`, opts)

  let body = JSON.parse(res.body)
  if (body['ret'] == 0) {
    throw new Error(body['msg'])
  }

  let cookies = res.headers['set-cookie']
  cookies = cookies.map(c => c.split(';')[0])
  return cookies.join(';')
}

export const getCookie = async (url: string, params: any) => {}

export const checkIn = async (cookie: string, email: string) => {
  const opt = getCommonGotOpt({})
  opt.headers['cookie'] = cookie
  const res = await got(`${domain}/user/checkin`, opt)
  return JSON.stringify(JSON.parse(res.body))
}

export const getV2rayUrl = async (cookie: string) => {
  const opt = getCommonGotOpt({})
  opt.headers['cookie'] = cookie
  opt.method = 'get'
  let res = await got(`${domain}/user`, opt)
  const html = res.body
  const $ = load(html)
  const subUrl = $('.btn.btn-pill.btn-v2ray.copy-text')
    .first()
    .attr('data-clipboard-text')
  if (!subUrl) {
    throw new Error('没有找到订阅链接')
  }
  return subUrl
}

export const buy = async (cookie: string) => {
  const opts = getCommonGotOpt({})
  opts.headers['cookie'] = cookie
  opts.form = {
    coupon: '',
    shop: '31',
    autorenew: '0',
    disableothers: '1'
  }

  const res = await got(`${domain}/user/buy`, opts)
  let body = JSON.parse(res.body)
  if (body['ret'] == 0) {
    throw new Error(body['msg'])
  }
  return body
}
