const axios = require('axios')
const AUTH_URL = process.env.AUTH_URL
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.AUTH_TOKEN}`

exports.groupMembers = (group = null) => {
  const url = group ? `${AUTH_URL}/group/${group}/members` : `${AUTH_URL}/user`
  return axios.get(`${url}?attrs=name,email`).then(res => res.data)
}

exports.userCount = () => {
  return axios.get(`${AUTH_URL}/users?attrs=id`).then(res => res.data.length)
}
