import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(__dirname, '..')
const configDir = path.join(pluginRoot, 'config')
const configFile = path.join(configDir, 'config.yaml')
const exampleFile = path.join(configDir, 'config.yaml.example')
const listConfigFile = path.join(configDir, 'list_config.yaml')
const listExampleFile = path.join(configDir, 'list_config.yaml.example')

/**
 * 获取插件主配置（config/config.yaml）
 * 不存在时从 .example 复制（首次启动），.example 也不存在则返回空对象
 * @returns {object} 主配置对象
 */
export function getPluginConfig () {
  if (fs.existsSync(configFile)) {
    try {
      return YAML.parse(fs.readFileSync(configFile, 'utf8')) || {}
    } catch (e) {
      logger?.warn('[GuobaTemplate] 配置文件解析失败，使用默认配置')
      return {}
    }
  }
  if (fs.existsSync(exampleFile)) {
    fs.copyFileSync(exampleFile, configFile)
    logger?.info('[GuobaTemplate] 已从 config.yaml.example 创建配置文件')
    try {
      return YAML.parse(fs.readFileSync(configFile, 'utf8')) || {}
    } catch (e) {
      return {}
    }
  }
  return {}
}

/**
 * 获取列表配置（config/list_config.yaml：groups/friends/keywords/items）
 * 不存在时回退 .example，均不存在则返回空结构
 * @returns {object} 列表配置对象
 */
export function getListConfig () {
  const file = fs.existsSync(listConfigFile) ? listConfigFile : listExampleFile
  if (!fs.existsSync(file)) return { groups: [], friends: [], keywords: [], items: [] }
  try {
    return YAML.parse(fs.readFileSync(file, 'utf8')) || {}
  } catch (e) {
    logger?.warn('[GuobaTemplate] 列表配置解析失败')
    return { groups: [], friends: [], keywords: [], items: [] }
  }
}

export { pluginRoot, configDir, configFile, exampleFile, listConfigFile, listExampleFile }
