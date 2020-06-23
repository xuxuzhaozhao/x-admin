import Cookies from 'js-cookie'

const UserName = 'UserName'
const UserMeta = 'qiye'


export function getUserName() {
  return Cookies.get(UserName)
}

export function setUserName(name) {
  return Cookies.set(UserName, name, {
    expires: 30
  })
}

export function setUserMeta(meta) {
  return Cookies.set(UserMeta, meta)
}

export function getUserMeta() {
  try {
    const data = JSON.parse(Cookies.get(UserMeta))
    return data
  } catch (e) {
    return {}
  }
}

export function removeUserMeta() {
  Cookies.remove(UserName)
  return Cookies.remove(UserMeta)
}