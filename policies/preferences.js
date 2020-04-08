const www = require('../bin/www')
const frontDomain = null // 'http://izyplan.com'
const backDomain = null //'http://api.izyplan.com'
const frontPort = '2007'
exports.frontPort = frontPort

module.exports = {
  "sbptech": {
    "name": "SBP-TECH",
    "description": "Superior By Performance",
    "telephone": "+33 1 87 64 29 45",
    "email": "infos@sbp-tech.com",
    "address": "https://www.google.com/maps/place/SBP-TECH/@36.8684036,10.162816,17z/data=!3m1!4b1!4m5!3m4!1s0x12e2cd85f5a31b43:0x23d0c29cf0e8e774!8m2!3d36.8683993!4d10.16501",
    "logo": "<img src='https://yakila.herokuapp.com/logo' alt='SBP TECH'>"
  },
  "signOptions": {
    "issuer": "sbp-tech",
    "subject": "izyplan",
    "audience": "all",
    "expiresIn": "30 days",
    "algorithm": "HS256"
  },
  "emails": {
    "send": false,
    "verificationOnRegister": false,
    "noreply": "aderbala@sbp-tech.com",
    "sysAdmin": "rjlidi@sbp-tech.com",
    "maintainers": "rjlidi@sbp-tech.com, cbelhajali@sbp-tech.com",
    "managers": "hbenhajji@sbp-tech.com"
  },
  "frontBaseUrl": frontDomain || `http://${www.ip}:${frontPort}`,
  "backBaseUrl": backDomain || `http://${www.ip}:${www.port}`,
  "workDayHours": 7,
  "responseTimeAlert": 1300

}
