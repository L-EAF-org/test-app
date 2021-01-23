
const DateTime = {

  format: function(str) {

    // format: 2021-01-22T15:10:50.933Z

    const s = str.split('T')
    const d = s[0].split('-')
    const t = s[1].match(/^(\d+:\d+)/)
    return t[0] + ' on ' + d[2] + '/' + d[1] + '/' + d[0]
  }
}

export default DateTime
