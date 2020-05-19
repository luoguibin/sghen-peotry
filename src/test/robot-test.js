var request = require('request')
var Mock = require('mockjs')
const crypto = require('crypto')

const UserStartIDIndex = 100100000
const UserIDCount = 10000
const UserEndIDIndex = UserStartIDIndex + UserIDCount

function md5(data) {
  // 以md5的格式创建一个哈希值
  let hash = crypto.createHash('md5')
  return hash.update(data).digest('base64')
}

function createOneUser(index, isEnd) {
  var options = {
    url: 'https://www.sghen.cn/sapi/v1/user/create',
    qs: {
      id: 123456
    },
    headers: {
      token: 'test'
    },
    form: {
      id: index,
      name: Mock.mock('@cname'),
      pw: '123456',
      code: 'test'
    }
  }

  request.post(options, function(error, response, body) {
    if (error) {
      console.log(error)
    }
    if (response.statusCode === 200) {
      console.log('body: ' + body)
    }
    if (isEnd) {
      setTimeout(() => {
        createUsers(index)
      }, 500)
    }
  })
}

function createUsers(index) {
  if (index > UserEndIDIndex) {
    return
  }
  const max = 100
  const lastIndex = max - 1
  for (let i = 0; i < max; i++) {
    index++
    createOneUser(index, i === lastIndex)
  }
}

function getPeotryComments(typeId, fromId, call) {
  request.get({
    url: 'https://www.sghen.cn/sapi/v1/api/get/peotry/comments',
    qs: {
      id: typeId,
      datas: fromId
    }
  }, function(error, response, body) {
    if (error) {
      console.log(error)
    }
    const data = JSON.parse(body)
    if (response.statusCode === 200 && data.code === 1000) {
      call && call(data.data)
    } else {
      console.log('body: ' + body)
    }
  })
}

function getPoetriesInfos(call) {
  request.get({
    url: 'https://www.sghen.cn/sapi/v1/api/get/peotry/list-id'
  }, function(error, response, body) {
    if (error) {
      console.log(error)
    }
    const data = JSON.parse(body)
    if (response.statusCode === 200 && data.code === 1000) {
      call && call(data.data)
    } else {
      console.log('body: ' + body)
    }
  })
}

// getPoetriesInfos(data => {
//   console.log(data)
// })

function loginUser(id, call) {
  request.post({
    url: 'https://www.sghen.cn/sapi/v1/user/login',
    form: {
      account: id,
      pw: md5('123456'),
      type: 1
    }
  }, function(error, response, body) {
    if (error) {
      console.log(error)
    }
    const data = JSON.parse(body)
    if (response.statusCode === 200 && data.code === 1000) {
      console.log('user login, body: ' + data.data)
      call && call(data.data)
    } else {
      console.log('body: ' + body)
    }
  })
}

function checkBeforeCommentPeotry(peotry, user, toId = -1, content = 'praise') {
  if (toId === -1) {
    if (Math.random() < 0.2 && user.praiseMap[peotry.id]) {
      return
    }
    if (Math.random() < 0) {
      toId = user.id
      content = Math.random() < 0.15 ? Mock.mock('@csentence(1,100)') : Mock.mock('@csentence(1,10)')
    } else {
      getPeotryComments(peotry.id, user.id, data => {
        if (data) {
          const index = data.findIndex(o => o.toId === -1 && o.content === 'praise')
          if (index >= 0) {
            user.praiseMap[peotry.id] = true
            return
          }
        }
        commentPeotry(peotry, user, toId, content)
      })
      return
    }
  } else {
    return
  }
  commentPeotry(peotry, user, toId, content)
}

function commentPeotry(peotry, user, toId, content) {
  request.post({
    url: 'https://www.sghen.cn/sapi/v1/comment/create',
    headers: {
      Authorization: user.token
    },
    form: {
      type: 1,
      typeId: peotry.id,
      content: content,
      fromId: user.id,
      toId: toId
    }
  }, function(error, response, body) {
    if (error) {
      console.log(error)
      return
    }
    if (response.statusCode === 200) {
      console.log('body: ' + body)
      // console.log(response)
      const data = JSON.parse(body)
      if (data.code === 1000 && toId === -1) {
        user.praiseMap[peotry.id] = true
      }
    }
  })
}

let peotries = []
function autoComments() {
  const loginUserMap = {}
  for (let i = 0; i < 10; i++) {
    const peotryIndex = Math.floor(peotries.length * Math.random())
    const peotry = peotries[peotryIndex]
    const userIndex = 100000000 + UserStartIDIndex + Math.floor(UserIDCount * Math.random())
    console.log('user ' + userIndex + ' start to auto comment')
    if (loginUserMap[userIndex]) {
      checkBeforeCommentPeotry(peotry, loginUserMap[userIndex])
    } else {
      loginUser(userIndex, info => {
        info.praiseMap = {}
        loginUserMap[info.id] = info
        checkBeforeCommentPeotry(peotry, info)
      })
    }
  }

  setTimeout(() => {
    autoComments()
  }, 5000)
}

// createUsers(UserStartIDIndex)

getPoetriesInfos(data => {
  const len = data.length
  peotries = data.slice(len - 3)
  autoComments()
})