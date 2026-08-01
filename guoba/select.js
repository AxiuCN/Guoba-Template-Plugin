/** 选择配置 Schema — GSelectGroup / GSelectFriend / GTags */

export function getSchema () {
  return [
    { label: '选择配置', component: 'SOFT_GROUP_BEGIN' },

    {
      field: 'groups',
      label: '生效群聊',
      bottomHelpMessage: '演示 GSelectGroup 组件，多选群，存群号数组',
      component: 'GSelectGroup'
    },
    {
      field: 'friends',
      label: '生效好友',
      bottomHelpMessage: '演示 GSelectFriend 组件，多选好友，存 QQ 数组',
      component: 'GSelectFriend'
    },
    {
      field: 'keywords',
      label: '触发关键词',
      bottomHelpMessage: '演示 GTags 组件，标签列表，存字符串数组',
      component: 'GTags',
      componentProps: { allowAdd: true, allowDel: true }
    }
  ]
}
