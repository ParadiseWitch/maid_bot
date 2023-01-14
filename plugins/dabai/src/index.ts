import { Context } from 'koishi'
import { buy, getV2rayUrl, login, register } from './crawler'
import { getRandomEmail } from './utils/random'

export const name = 'dabai'

export function apply (ctx: Context) {
  ctx.command('dabai <message>').action(async (_, message) => {
    // const urls = await registAndGetSubUrls()
    // return Promise.resolve(urls.join('\n'))
    return Promise.resolve('xxx')
  })
    // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
  ctx.on('message', (session) => {
    if (session.content === '天王盖地虎') {
      session.send('宝塔镇河妖')
    }
  })
}
async function registAndGetSubUrls (): Promise<String[]> {
  const name = 'xxx'
  const pad = 'xxx123456'

  const allV2raySubUrls = []
  for (let i = 0; i < 10; i++) {
    const email = getRandomEmail()
    try {
      await register(email, name, pad, '', '')
      console.log('注册成功');
      const cookie = await login(email, pad, '')
      console.log('登录成功');
      await buy(cookie)
      console.log('激活成功');
      const v2raySubUrl = await getV2rayUrl(cookie)
      console.log('获取订阅连接成功');
      allV2raySubUrls.push(v2raySubUrl)
    } catch (error) {
      console.error(`登录账号${email}时, 发生错误:${error}`)
      continue
    }
  }
  return allV2raySubUrls
}
