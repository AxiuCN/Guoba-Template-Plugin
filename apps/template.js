import { getPluginConfig, getListConfig } from '../components/config.js'

/**
 * 示例功能：演示从 components/config.js 读取锅巴保存的运行时配置
 * 数据流：锅巴 Web 保存 → config.yaml / list_config.yaml → getPluginConfig()/getListConfig()
 */
export default class template extends plugin {
  constructor () {
    super({
      name: '模板功能',
      dsc: '锅巴配置规范模板示例功能',
      event: 'message',
      priority: 5000,
      rule: [{
        reg: '^#模板配置',
        fnc: 'templateConfig'
      }]
    })
  }

  /** #模板配置 — 回复当前主配置与列表配置（调试用） */
  async templateConfig (e) {
    if (!getPluginConfig()?.basic?.enabled) {
      e.reply('功能已关闭（basic.enabled = false）')
      return true
    }
    const cfg = getPluginConfig()
    const list = getListConfig()
    e.reply(`【主配置】\n${JSON.stringify(cfg)}\n\n【列表配置】\n${JSON.stringify(list)}`)
    return true
  }
}
