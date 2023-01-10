#!/usr/bin/env zx

const subUrl = 'https://mysql.download-config-zfd.cyou/link/6M73Utk8Q3YjnThq?sub=3'
// const subUrl = "https://ytsub.top/v2.php?port=15471&password=96e5e5a2"
const STORE_DIR = `./.v2sub/`
const CONFIG_PATH = `/usr/local/etc/v2ray/config.json`
const RESTART_V2RAY_CMD = `sudo systemctl restart v2ray`
const ENCODE_URLS_FILE = `${STORE_DIR}encodeUrls`
const SERVERS_JSON_FILE = `${STORE_DIR}servers.json`
const CONFIG_EXAMPLE_FILE = `${STORE_DIR}config_example.json`
const SUB_LINKS_FILE = `${STORE_DIR}subLinks.json`

main()
async function main(a) {
  const subLinksDirExists = await fs.existsSync(STORE_DIR)
  if (!subLinksDirExists) {
    await $`mkdir ${STORE_DIR}`
  }

  let subCommand = process.argv.splice(3)[0];
  switch (subCommand) {
    case 'ps':
      await showAllServers()
      break;
    case 'u':
      await updateSubscription()
      break;
    case 'ul':
      await updateSubscriptionLink()
      break;
    case 'c':
      await $`vim ${CONFIG_PATH}`
      break;
    case 't':
      await $`curl -x http://127.0.0.1:1087 -v https://www.google.com`
      break;
    case 'help':
      await help()
      break;
    default:
      await help()
      break;
  }
}

async function help() {
  let tip = `
  What do you want to do?
  Subcommands:
    ps    : Show all servers
            --s: Select a server.
    u     : Update your subscription
    ul    : Update your subscription link
            --a: add
            --r: remove
            --ra: remove all
    c     : Show the current config file
    t	  : Test proxy
    help  : Show help
  `
  echo(chalk.gray(tip));
}

async function updateSubscription(i) {
  await $`rm ${SERVERS_JSON_FILE}`
  await showAllServers()
}

async function updateSubscriptionLink(i) {
  if (argv.a) {
    await addSubLink(argv.a)
  }
  if (argv.r) {
    echo(argv.r);
    await removeSubLink(argv.r)
  }
  if (argv.ra) {
    await removeAllSubLink()
  }
}

async function changeV2rayConfigByIndex(i) {
  const servers = await getServersJson()
  if (i < 0 || i >= servers.length) {
    echo(chalk.red('Index out of bounds'))
    throw new Error('Index out of bounds')
  }
  const server = servers[i]
  const confExmaple = await fs.readJson(CONFIG_EXAMPLE_FILE)
  const mainConf = confExmaple.outbounds[0].settings.vnext[0]
  mainConf.address = server.add
  mainConf.port = parseInt(server.port)
  mainConf.users.id = server.id
  mainConf.users.alterId = server.aid
  confExmaple.outbounds[0].settings.vnext[0] = mainConf
  const newConfFileName = `./config/config_${new Date().getTime()}.json`
  await fs.writeJson(newConfFileName, confExmaple)
  await $`sudo cp ./${newConfFileName} ${CONFIG_PATH}`
  await $`${RESTART_V2RAY_CMD}`
}


async function showAllServers() {
  if (argv.s) {
    await changeV2rayConfigByIndex(parseInt(argv.s))
  }

  const servers = await getServersJson()
  const curConfig = await getCurConfig()

  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];
    if (server.add == curConfig.address && server.port == curConfig.port) {
      echo(chalk.green(`* ${i}\t${server.ps} - ${server.remark || ''}`));
    } else {
      echo(`  ${i}\t${server.ps} - ${server.remark || ''}`)
    }
  }
}

async function getServersJson() {
  const serversJsonFileExist = fs.existsSync(SERVERS_JSON_FILE)
  let servers = []
  if (!serversJsonFileExist) {
    const links = await getSubLinks()
    if (links.length <= 0) throw new Error('订阅链接数目小于0!')

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      await $`wget -q -O ${ENCODE_URLS_FILE} ${link}`
      let encodeUrls = await fs.readFileSync(ENCODE_URLS_FILE).toString()
      let urls = encode(encodeUrls.toString()).split('\n').filter(url => !!url);
      servers.push(...urls.map(url => {
        return JSON.parse(encode(url.replace(/^.*:\/\//, "")))
      }))
      await fs.writeJson(SERVERS_JSON_FILE, servers)
      await $`rm ${ENCODE_URLS_FILE}`
    }
  } else {
    servers = await fs.readJson(SERVERS_JSON_FILE)
  }
  return servers
}

async function getSubLinks() {
  const { links } = await fs.readJson(SUB_LINKS_FILE)
  return links
}

async function addSubLink(link) {
  const links = await getSubLinks()
  links.push(link)
  await fs.writeJson(SUB_LINKS_FILE, { "links": links })
}

async function removeSubLink(link) {
  const links = await getSubLinks()
  const idx = links.indexOf(link)
  echo(links);
  if (idx == -1) {
    throw new Error('该订阅链接不存在,' + link)
  }
  links.splice(idx, 1)
  await fs.writeJson(SUB_LINKS_FILE, { "links": links })
}

async function removeAllSubLink(link) {
  await fs.writeJson(SUB_LINKS_FILE, { "links": [] })
}


async function getCurConfig() {
  let { outbounds } = await fs.readJson(CONFIG_PATH)
  return outbounds[0].settings.vnext[0]
}

function encode(encodedStr) {
  const buffer = Buffer.from(encodedStr, 'base64');
  return buffer.toString('utf8');
}
