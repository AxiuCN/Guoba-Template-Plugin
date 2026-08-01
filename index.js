import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

logger?.info('----Guoba-Template-Plugin----')
logger?.info('Guoba-Template-Plugin 初始化中...')

// ---- 配置初始化：首次启动从 .example 复制到 config.yaml ----
const configDir = path.join(__dirname, 'config')
const configFile = path.join(configDir, 'config.yaml')
const exampleFile = path.join(configDir, 'config.yaml.example')

if (!fs.existsSync(configFile) && fs.existsSync(exampleFile)) {
  fs.copyFileSync(exampleFile, configFile)
  logger?.info('[GuobaTemplate] 已从 config.yaml.example 创建配置文件')
}

// ---- 动态加载 apps/ 下所有功能（单个加载失败不影响整体） ----
const appsDir = path.join(__dirname, 'apps')
const files = fs.readdirSync(appsDir).filter(f => f.endsWith('.js'))
const ret = await Promise.allSettled(files.map(file => import(`./apps/${file}`)))

const apps = {}
for (const [i, file] of files.entries()) {
  const name = file.replace('.js', '')
  if (ret[i].status !== 'fulfilled') {
    logger?.error(`[GuobaTemplate] 载入插件错误：${name}`)
    logger?.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

logger?.info('Guoba-Template-Plugin 载入成功')
logger?.info('----Guoba-Template-Plugin----')

export { apps }
