const router = require('express').Router()

router.get('/', (req, res) => {
  'use strict'
  res.ok(JSON.parse('[{' +
    '      "id": "//讨论item的id",' +
    '      "imgurl": "",' +
    '      "imgalt":"//头像替代文字，一般为发起者用户",' +
    '      "node": "//讨论所在版块",' +
    '      "title":"//讨论的标题",' +
    '      "timestamp": "//讨论发起的时间戳1518599888",' +
    '      "sponsor":"//讨论发起者",' +
    '      "terminator":"//最后回复的用户"' +
    '    },' +
    '    {' +
    '        "id": "1",' +
    '        "imgurl": "",' +
    '        "imgalt":"sakura",' +
    '        "node": "no",' +
    '        "title":"泰迪熊的体重是多少？",' +
    '        "timestamp": "1518599888",' +
    '        "sponsor":"sakura",' +
    '        "terminator":"泰迪熊"' +
    '    },' +
    '    {' +
    '        "id": "2",' +
    '        "imgurl": "",' +
    '        "imgalt":"sakura",' +
    '        "node": "no",' +
    '        "title":"泰迪熊的身高是多少？",' +
    '        "timestamp": "1518599888",' +
    '        "sponsor":"sakura",' +
    '        "terminator":"泰迪熊"' +
    '    }' +
    '  ]'
  ))
})

module.exports = router
