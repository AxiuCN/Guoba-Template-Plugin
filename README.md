# Guoba-Template-Plugin / 锅巴配置规范模板

TRSS-Yunzai v3 的锅巴（guoba-plugin）配置规范模板，开源（GPL-3.0）。不提供实际业务功能，而是作为标准范例，供其它自研插件接入锅巴 Web 后台时参考复制。

## 特性

- 覆盖锅巴**全部自定义组件**：`GSelectGroup`（群聊选择器）、`GSelectFriend`、`GTags`、`GSubForm`、`GButtons`、`GColorPicker`、`EasyCron`
- **两种配置写入模式**：标量字段走 defSet 模板替换（注释完整保留）；数组/子表字段直接 YAML 读写
- 完整的三层配置结构（defSet / config.yaml.example / config.yaml）
- 示例功能 `#模板配置` 验证「锅巴保存 → 运行时读取」闭环

## 安装

在 Yunzai 根目录执行：

```bash
git clone --depth=1 https://github.com/AxiuCN/Guoba-Template-Plugin.git ./plugins/Guoba-Template-Plugin/
pnpm install --filter=Guoba-Template-Plugin
```

## 使用

- `#模板配置` — 回复当前主配置与列表配置（调试用）
- 锅巴后台 → 锅巴模板插件，可视化配置全部字段

## 目录结构

```
Guoba-Template-Plugin/
├── index.js                     # 入口：复制 .example → config.yaml + 动态加载 apps/
├── guoba.support.js             # 锅巴入口（委托到 guoba/index.js）
├── guoba/
│   ├── index.js                 # supportGuoba()：pluginInfo + configInfo（TEMPLATE_VARS 模板替换）
│   ├── basic.js                 # 基础组件 schema（Switch/Input/InputNumber/InputTextArea/EasyCron/GColorPicker）
│   ├── select.js                # 选择类组件 schema（GSelectGroup/GSelectFriend/GTags）
│   └── advanced.js              # 高级组件 schema（GSubForm/GButtons）
├── components/config.js         # getPluginConfig()/getListConfig() 兜底读取
├── apps/template.js             # 示例功能
├── defSet/config.yaml           # 主配置模板（${变量} 占位符）
└── config/
    ├── config.yaml.example      # 主配置参考（入库）
    ├── list_config.yaml.example # 列表配置参考（入库）
    ├── config.yaml              # 运行时（git-ignored）
    └── list_config.yaml         # 运行时列表配置（git-ignored）
```

## 配置

### 方式一：锅巴后台（推荐）

锅巴后台 → 锅巴模板插件，可视化配置。保存时：

- 标量字段 → 读 `defSet/config.yaml` 模板，替换 `${变量}` 后写 `config/config.yaml`（注释完整保留）
- 数组/子表字段（群聊/好友/关键词/子表项）→ 直接写 `config/list_config.yaml`

### 方式二：手动编辑

- 主配置：复制 `config/config.yaml.example` → `config/config.yaml`
- 列表配置：复制 `config/list_config.yaml.example` → `config/list_config.yaml`

## 作为模板创建新插件

1. 复制本目录，重命名为 `YourPlugin-Plugin`
2. 修改 `guoba/index.js` 的 `pluginInfo.name`（必须与目录名一致）与 `TEMPLATE_VARS`
3. 按需改写 `guoba/*.js` schema 与 `defSet/config.yaml`（需与 `config/config.yaml.example` 结构严格一致）
4. 更新 `package.json` 与 `CLAUDE.md`

## 开源协议

[GPL-3.0](./LICENSE)

## 交流与讨论

如有问题，请加入 QQ 群 **965272093** 交流反馈。
