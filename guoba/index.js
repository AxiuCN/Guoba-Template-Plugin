import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import * as basicMod from './basic.js'
import * as selectMod from './select.js'
import * as advancedMod from './advanced.js'
import { getPluginConfig, getListConfig, configDir, configFile, listConfigFile } from '../components/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PLUGIN_DIR = path.join(__dirname, '..')
const DEFSET_CONFIG_PATH = path.join(PLUGIN_DIR, 'defSet', 'config.yaml')

/** 锅巴 field → defSet 模板变量名（主配置，模板替换写入 config.yaml） */
const TEMPLATE_VARS = {
  'basic.enabled': 'basic_enabled',
  'basic.text': 'basic_text',
  'basic.number': 'basic_number',
  'basic.textarea': 'basic_textarea',
  'basic.cron': 'basic_cron',
  'appearance.color': 'appearance_color'
}

/** 列表配置字段（数组/子表，直接 YAML 读写 list_config.yaml） */
const LIST_FIELDS = ['groups', 'friends', 'keywords', 'items']

export function supportGuoba () {
  return {
    pluginInfo: {
      name: 'Guoba-Template-Plugin',
      title: '锅巴模板插件',
      author: '@阿修Axiu',
      authorLink: 'https://github.com/AxiuCN',
      link: 'https://github.com/AxiuCN/Guoba-Template-Plugin',
      isV3: true,
      isV2: false,
      description: '锅巴配置规范模板：展示全部 schema 组件与三层配置结构',
      icon: 'mdi:form-select',
      iconColor: '#1677ff'
    },
    configInfo: {
      schemas: [
        ...basicMod.getSchema(),
        ...selectMod.getSchema(),
        ...advancedMod.getSchema()
      ],

      getConfigData () {
        const mainCfg = getPluginConfig()
        const listCfg = getListConfig()
        return {
          // 主配置（config.yaml，模板替换存储）
          'basic.enabled': mainCfg.basic?.enabled ?? true,
          'basic.text': mainCfg.basic?.text ?? '',
          'basic.number': mainCfg.basic?.number ?? 0,
          'basic.textarea': mainCfg.basic?.textarea ?? '',
          'basic.cron': mainCfg.basic?.cron ?? '0 0 5 * * ? *',
          'appearance.color': mainCfg.appearance?.color ?? '#1677ff',
          // 列表配置（list_config.yaml，YAML 直接读写）
          'groups': listCfg.groups ?? [],
          'friends': listCfg.friends ?? [],
          'keywords': listCfg.keywords ?? [],
          'items': listCfg.items ?? []
        }
      },

      async setConfigData (data, { Result }) {
        try {
          if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true })

          // 主配置：读 defSet 模板 → 替换 ${变量} → 写 config.yaml（注释完整保留）
          let template = fs.readFileSync(DEFSET_CONFIG_PATH, 'utf8')
          for (const [field, varName] of Object.entries(TEMPLATE_VARS)) {
            let value = data[field] ?? ''
            if (Array.isArray(value)) value = value.join(',')
            // 字符串用 JSON.stringify 包裹（YAML 双引号），避免含换行/特殊字符破坏 YAML 结构
            const strValue = typeof value === 'string' ? JSON.stringify(value) : String(value)
            template = template.replace(new RegExp(`\\$\\{${varName}\\}`, 'g'), strValue)
          }
          fs.writeFileSync(configFile, template, 'utf8')

          // 列表配置：直接 YAML 读写（数组/子表结构无法用 ${变量} 占位符表达）
          const listRaw = getListConfig()
          for (const field of LIST_FIELDS) {
            if (data[field] !== undefined) listRaw[field] = data[field]
          }
          fs.writeFileSync(listConfigFile, YAML.stringify(listRaw), 'utf8')

          return Result.ok({}, '保存成功~')
        } catch (err) {
          logger?.error('[GuobaTemplate] 保存配置失败:', err)
          return Result.error(`保存失败：${err.message}`)
        }
      }
    }
  }
}
