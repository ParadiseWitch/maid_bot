export const getRandomIp = (): string => {
  const range = [
    [607649792, 608174079], // 36.56.0.0-36.63.255.255
    [1038614528, 1039007743], // 61.232.0.0-61.237.255.255
    [1783627776, 1784676351], // 106.80.0.0-106.95.255.255
    [2035023872, 2035154943], // 121.76.0.0-121.77.255.255
    [2078801920, 2079064063], // 123.232.0.0-123.235.255.255
    [-1950089216, -1948778497], // 139.196.0.0-139.215.255.255
    [-1425539072, -1425014785], // 171.8.0.0-171.15.255.255
    [-1236271104, -1235419137], // 182.80.0.0-182.92.255.255
    [-770113536, -768606209], // 210.25.0.0-210.47.255.255
    [-569376768, -564133889] // 222.16.0.0-222.95.255.255
  ]
  const index = randomNextInt(10)
  return num2ip(
    range[index][0] + randomNextInt(range[index][1] - range[index][0])
  )
}

const num2ip = (ip: number): string => {
  let b0 = (ip >> 24) & 0xff
  let b1 = (ip >> 16) & 0xff
  let b2 = (ip >> 8) & 0xff
  let b3 = ip & 0xff
  return `${b0}.${b1}.${b2}.${b3}`
}

const randomNextInt = (n: number) => {
  return Math.floor(Math.random() * n)
}

export const getRandomEmail = () => {
  const suffixs = [
    '@qq.com',
    '@gmail.com',
    '@hotmail.com',
    '@outlook.com',
    '@163.com',
    '@126.com',
    '@189.cn',
    '@139.com',
    '@aliyun.com',
    '@sina.cn',
    '@sina.com',
    '@sina.com.cn',
    '@live.com',
    '@msn.com',
    '@yeah.net',
    '@foxmail.com'
  ]
  const prefix =
    Math.random()
      .toString(36)
      .substring(2, 6) +
    Math.random()
      .toString(36)
      .substring(2, 6)
  return prefix + suffixs[Math.floor(Math.random() * suffixs.length)]
}
