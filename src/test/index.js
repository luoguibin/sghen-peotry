import { loginByAccount, createUser } from '@/api'
import Mock from 'mockjs'

// @cparagraph()

function createOneUser(index) {
  const requests = []
  for (let i = 0; i < 10; i++) {
    index++
    requests.push(createUser({
      id: 100000000 + index,
      name: Mock.mock('@cname'),
      pw: '123456'
    }))
  }
  Promise.all(requests).then(results => {
    console.log(results)
    if (index < 10000) {
      createOneUser(index)
    }
  })
}

// setTimeout(() => {
//   console.log('start create user')
//   createOneUser(3648)
// }, 10000)
