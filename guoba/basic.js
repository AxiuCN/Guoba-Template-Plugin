/** 基础配置 Schema — Switch / Input / InputNumber / InputTextArea / EasyCron / GColorPicker / Divider */

export function getSchema () {
  return [
    { label: '基础配置', component: 'SOFT_GROUP_BEGIN' },

    {
      field: 'basic.enabled',
      label: '启用功能',
      bottomHelpMessage: '演示 Switch 组件；关闭后 #模板配置 命令不响应',
      component: 'Switch'
    },
    {
      field: 'basic.text',
      label: '单行文本',
      bottomHelpMessage: '演示 Input 组件，required 必填',
      component: 'Input',
      required: true,
      componentProps: { placeholder: '请输入文本' }
    },
    {
      field: 'basic.number',
      label: '数字',
      bottomHelpMessage: '演示 InputNumber 组件（min/max 约束）',
      component: 'InputNumber',
      componentProps: { min: 0, max: 100, placeholder: '0-100' }
    },
    {
      field: 'basic.textarea',
      label: '多行文本',
      bottomHelpMessage: '演示 InputTextArea 组件，每行一条',
      component: 'InputTextArea',
      componentProps: { placeholder: '每行一条' }
    },

    { label: '定时与外观', component: 'Divider' },

    {
      field: 'basic.cron',
      label: '定时 Cron',
      bottomHelpMessage: '演示 EasyCron 组件，Quartz 表达式，默认每天5:00',
      component: 'EasyCron',
      componentProps: { placeholder: '0 0 5 * * ? *' }
    },
    {
      field: 'appearance.color',
      label: '主色',
      bottomHelpMessage: '演示 GColorPicker 组件，返回 hex/rgb/rgba 字符串',
      component: 'GColorPicker'
    }
  ]
}
