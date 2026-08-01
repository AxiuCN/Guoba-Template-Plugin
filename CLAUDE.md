# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **特殊约定**：本插件的 CLAUDE.md 是**核心交付物**，**必须入库**（git 提交时包含），**不纳入 `.gitignore`**。这与其它插件（忽略 CLAUDE.md）不同。

## 项目概况

Guoba-Template-Plugin 是 **TRSS-Yunzai v3 的锅巴（guoba-plugin）配置规范模板**，开源（GPLv3）。它不提供实际业务功能，而是作为标准范例，供其它自研插件接入锅巴 Web 后台时参考复制。展示：

- 锅巴**全部真实 schema 组件**的用法（含一个示例功能 `#模板配置` 验证「锅巴保存 → 运行时读取」闭环）
- **两种配置写入模式**：模板替换（`config.yaml`）+ 直接 YAML 读写（`list_config.yaml`）
- 锅巴接入模式：`guoba.support.js` 委托 `guoba/index.js` 的 `supportGuoba()`

ESM（`"type": "module"`），GPLv3。

### 文件结构

```
Guoba-Template-Plugin/
├── package.json                 # ESM 声明
├── .gitignore                   # 忽略 config/*.yaml（运行时）、node_modules/
├── index.js                     # 入口：复制 .example → config.yaml + Promise.allSettled 动态 import apps/
├── guoba.support.js             # 锅巴入口：委托到 guoba/index.js 的 supportGuoba()
├── guoba/
│   ├── index.js                 # supportGuoba()：pluginInfo + configInfo（TEMPLATE_VARS 映射 + getConfigData/setConfigData）
│   ├── basic.js                 # 基础组件 schema（Switch/Input/InputNumber/InputTextArea/EasyCron/GColorPicker）
│   ├── select.js                # 选择类 schema（GSelectGroup/GSelectFriend/GTags）
│   └── advanced.js              # 高级组件 schema（GSubForm/GButtons）
├── components/
│   └── config.js                # getPluginConfig()/getListConfig() 兜底读取
├── apps/
│   └── template.js              # 示例功能：#模板配置 命令读取配置并回复
├── defSet/
│   └── config.yaml              # 主配置模板：${变量} 占位符 + 完整注释
└── config/
    ├── config.yaml.example      # 主配置参考默认值（入库）
    ├── list_config.yaml.example # 列表配置参考（入库）
    ├── config.yaml              # 运行时（git-ignored，首次启动从 .example 复制）
    └── list_config.yaml         # 运行时列表配置（git-ignored）
```

### 初始化提示

新 Claude 会话开始时，按以下步骤快速进入工作状态：

1. `git log --oneline -5` — 确认当前分支和最近提交
2. 阅读「锅巴接入规范」「组件清单」「三层配置结构」三个核心章节
3. 锅巴框架源码在 `plugins/guoba-plugin/`，编写 schema 前可查阅实际组件字段
4. **注意**：本插件 CLAUDE.md 入库，改动需随代码一起提交
5. D 盘编辑 → 测试验证 → 还原测试日志 → 用户手动同步到 Y 盘

### 框架全局变量

| 变量 | 说明 |
|------|------|
| `Bot` | Yunzai 实例，`Bot.uin`、`Bot.sendMasterMsg()`、`Bot.sendGroupMsg()`、`Bot.pickGroup()` |
| `logger` | `logger.info` / `logger.warn` / `logger.error` / `logger.mark` |
| `redis` | `redis.get` / `redis.set` / `redis.setEx` / `redis.del` |
| `segment` | `segment.at()` / `segment.image()` / `segment.reply()` |
| `plugin` | 插件基类，`apps/` 下 class 继承此类 |
| `cfg` | 框架配置 Proxy，`cfg.bot` / `cfg.master` / `cfg.getGroup()` |
| `_` (lodash) | `_.merge` / `_.get` / `_.set` / `_.isEqual`（配置合并时使用） |

---

## 锅巴接入规范

### 接入模式

`guoba.support.js` 只做一行委托：

```js
export { supportGuoba } from './guoba/index.js'
```

`supportGuoba()` 返回 `{ pluginInfo, configInfo }`：

```js
export function supportGuoba () {
  return {
    pluginInfo: {
      name: 'Guoba-Template-Plugin',   // 必须与目录名一致
      title: '锅巴模板插件',
      isV3: true,
      isV2: false,
      // icon/iconColor/author/link 等可选
    },
    configInfo: {
      schemas: [ ...basicMod.getSchema(), ...selectMod.getSchema(), ...advancedMod.getSchema() ],
      getConfigData () { /* 返回扁平 field 对象 */ },
      async setConfigData (data, { Result }) { /* 返回 Result.ok({}, msg) 或 Result.error(msg) */ }
    }
  }
}
```

### 数据流

```
锅巴 Web 打开插件页 → getConfigData() → getPluginConfig() + getListConfig() → 扁平 field 对象 → 表单填充
锅巴保存 → setConfigData(data) →
  主配置：读 defSet/config.yaml → 按 TEMPLATE_VARS 替换 ${变量} → 写 config/config.yaml（注释完整保留）
  列表配置：LIST_FIELDS 字段 → YAML.stringify → 写 config/list_config.yaml
Bot 运行 → apps/*.js → getPluginConfig()/getListConfig() → 读运行时配置
```

### 关键规则

- **field 用点分隔路径**（如 `basic.text`），对应配置对象嵌套层级
- **defSet 模板变量用下划线**（如 `${basic_text}`），`TEMPLATE_VARS` 中手动映射
- **数组/子表字段**（GSelectGroup/GTags/GSubForm 等）走 `list_config.yaml` 直接 YAML 读写，**不用**模板占位符
- **字符串替换用 `JSON.stringify(value)`**（YAML 双引号），避免含换行/特殊字符破坏 YAML；数字/布尔用 `String(value)`
- 替换正则为 `/\$\{(\w+)\}/g`，`setConfigData` 返回值用锅巴注入的 `Result`

---

## 锅巴组件清单（实际存在）

schema 通用字段：`field`（点分隔路径）、`label`、`helpMessage`/`bottomHelpMessage`（帮助文字）、`component`（组件名）、`componentProps`（传给组件的 props）、`required`（必填校验）。

### 布局类

| 组件 | 用途 | 示例 |
|------|------|------|
| `SOFT_GROUP_BEGIN` | 分组开始，`label` 为组名，无需标记结束 | `{ label: '基础配置', component: 'SOFT_GROUP_BEGIN' }` |
| `Divider` | 分割线 | `{ label: '定时与外观', component: 'Divider' }` |

### 基础输入类（vben/antdv 组件，文档见 doc.vvbin.cn / antdv）

| 组件 | 用途 | 示例 |
|------|------|------|
| `Switch` | 布尔开关 | `{ field:'basic.enabled', label:'启用功能', component:'Switch' }` |
| `Input` | 单行文本 | `{ field:'basic.text', label:'单行文本', component:'Input', required:true, componentProps:{ placeholder:'请输入' } }` |
| `InputNumber` | 数字 | `{ field:'basic.number', label:'数字', component:'InputNumber', componentProps:{ min:0, max:100 } }` |
| `InputTextArea` | 多行文本 | `{ field:'basic.textarea', label:'多行文本', component:'InputTextArea' }` |
| `EasyCron` | cron 表达式（锅巴自定义） | `{ field:'basic.cron', label:'定时 Cron', component:'EasyCron' }` |

### 锅巴自定义组件（7 个）

| 组件 | 用途 | 存储 |
|------|------|------|
| `GTags` | 标签列表 | 字符串数组，`componentProps:{ allowAdd:true, allowDel:true }` |
| `GSelectGroup` | 群选择器 | 群号数组 |
| `GSelectFriend` | 好友选择器 | QQ 数组 |
| `GColorPicker` | 颜色选择 | hex/rgb/rgba 字符串 |
| `GSubForm` | 子表（数组/对象嵌套） | `componentProps:{ multiple:true, schemas:[子 schema 数组] }` |
| `GButtons` | 动作按钮（不存值） | 点击 POST `/plugin/do/{name}/action`，args 中 `#{field}` 替换为表单值，需配套后端 action |

> 组件名以 `plugins/guoba-plugin/server/static/assets/` 前端 componentMap 注册表为准。验证：`grep 'componentMap.set("' plugins/guoba-plugin/server/static/assets/index.js`。本清单不含不存在的组件（如 GText/GTable/GUpload 等）。

---

## 三层配置结构

### 两种写入模式

| 配置文件 | 存储内容 | 写入方式 | 是否入库 |
|----------|---------|---------|---------|
| `defSet/config.yaml` | 主配置模板，`${变量}` 占位符 + 完整注释 | 锅巴保存时读此模板替换 | 是 |
| `config/config.yaml.example` | 主配置参考默认值，与 defSet 结构严格一致 | 手动编辑参考；首次启动复制到 config.yaml | 是 |
| `config/config.yaml` | 主配置运行时（标量字段） | 模板替换写入 / 手动编辑 | 否 |
| `config/list_config.yaml.example` | 列表配置参考 | 手动编辑参考 | 是 |
| `config/list_config.yaml` | 列表配置运行时（数组/子表） | 锅巴保存时 YAML.stringify 直接写入 | 否 |

### 关键规则

1. **defSet 与 .example 结构严格一致** — 相同注释、相同字段、相同顺序，唯一区别是值（`${var}` vs 默认值）
2. **模板变量替换法**替代 `YAML.stringify`，确保注释完整保留（仅主配置用）
3. **getPluginConfig 兜底**：config.yaml 不存在时从 `.example` 复制（首次启动）或回退 `.example`
4. **禁止**解析 defSet/config.yaml 过滤 `${变量}` 作兜底——替换占位符为空会生成非法 YAML
5. 数组/子表字段（GTags/GSelectGroup/GSubForm 等）**不走模板替换**，存 `list_config.yaml`

### 示例

`defSet/config.yaml`（模板）与 `config/config.yaml.example`（参考）一一对应：

```yaml
# ===== 基础配置 =====
basic:
  enabled: ${basic_enabled}    # example: true
  text: ${basic_text}          # example: '你好，锅巴'
```

字段映射（`guoba/index.js` 的 `TEMPLATE_VARS`）：

| 锅巴 field（点分隔） | defSet 模板变量（下划线） |
|---------------------|------------------------|
| `basic.enabled` | `${basic_enabled}` |
| `basic.text` | `${basic_text}` |
| `appearance.color` | `${appearance_color}` |

---

## 插件 class API 参考

```js
class MyFeature extends plugin {
  constructor () {
    super({
      name: "功能名称",
      dsc: "功能描述",
      event: "message",
      priority: 5000,
      rule: [{ reg: /^#命令/, fnc: "methodName", permission: "all" }]
    })
  }
}
```

- `e.msg` 消息文本，`e.user_id` 发送者，`e.group_id` 群号（私聊为 undefined）
- `e.reply(msg)` 回复消息，`e.reply(segment.image(file))` 回复图片
- 返回 `true` 阻止低优先级插件继续匹配

---

## 编码约定

1. **ESM** — 全部 `import`/`export`，不使用 `require`
2. **日志标签** — `[GuobaTemplate]` 或 `[GuobaTemplate][模块名]`，使用 `logger?.info` / `logger?.warn` / `logger?.error`
3. **注释** — 每个函数写明功能/输入/输出（JSDoc），注释服务于项目长期理解
4. **锅巴入口委托** — `guoba.support.js` 只 `export { supportGuoba } from './guoba/index.js'`，schema 按类别拆 `guoba/*.js`，每文件导出 `getSchema()`
5. **模板替换** — 字符串用 `JSON.stringify(value)`，数字/布尔用 `String(value)`；数组字段走 `list_config.yaml`
6. **CLAUDE.md 入库** — 本插件 CLAUDE.md 不纳入 `.gitignore`，改动随代码一起提交
7. **不自行发挥** — 只做明确要求的改动

---

## 根目录 CLAUDE.md 补充

项目通用规范（注释、版本号、Git 提交、Y 盘部署）见根目录 `CLAUDE.md`。

## 相关资源

- `/guoba-config` skill — 锅巴配置模板变量替换、三层架构、数据流、schema 组件最佳实践
- `/create-plugin` skill — 在 Yz 项目中创建全新插件，生成目录结构和样板代码
