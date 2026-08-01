/** 高级配置 Schema — GSubForm / GButtons */

export function getSchema () {
  return [
    { label: '高级配置', component: 'SOFT_GROUP_BEGIN' },

    {
      field: 'items',
      label: '子表项',
      bottomHelpMessage: '演示 GSubForm 组件（multiple 数组，每个元素由子 schemas 组成）',
      component: 'GSubForm',
      componentProps: {
        multiple: true,
        schemas: [
          {
            field: 'name',
            label: '名称',
            component: 'Input',
            required: true,
            componentProps: { placeholder: '请输入名称' }
          },
          {
            field: 'enable',
            label: '启用',
            component: 'Switch'
          }
        ]
      }
    },

    {
      field: 'action',
      label: '动作按钮',
      bottomHelpMessage: '演示 GButtons 组件：点击向后端 POST /plugin/do/Guoba-Template-Plugin/action，args 中 #{field} 会替换为表单值，需在框架支持时配套实现 action',
      component: 'GButtons',
      componentProps: {
        buttons: [
          {
            label: '测试按钮',
            action: 'test',
            args: ['#{basic.text}'],
            type: 'primary'
          }
        ]
      }
    }
  ]
}
