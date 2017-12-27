
function _getTemplate (msgType) {
  switch (msgType) {
    case 'propsuport': return `
      Ahoj {{name}}, navrh {{title}} ziskal dostatecnou podporu.
      Koukni na nej na {{url}}.`
    case 'newvoting': return `
      Ahoj {{name}}, mame tu nove hlasovani - {{title}} na {{url}}.`
  }
}

const subjects = {
  'propsuport': 'oznameni - dostatecna podpora',
  'newvoting': 'oznameni - nove hlasovani'
}

module.exports = (sendMail, notification, recipients) => {
  return new Promise((resolve, reject) => {
    const template = _getTemplate(notification.evt)
    const promises = recipients.map(i => {
      const url = `${process.env.CLIENTAPP_URL}/proposals/${notification.objid}`
      const body = template
        .replace('{{name}}', i.name)
        .replace('{{title}}', notification.title)
        .replace('{{url}}', url)
      return sendMail({
        from: process.env.ROBOT_EMAIL,
        to: [i.email],
        subject: subjects[notification.evt],
        text: body
      })
    })
    Promise.all(promises).then(results => {
      resolve(results)
    })
  })
}
