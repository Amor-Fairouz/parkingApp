let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let authentification = require('./policies/authentification') //Middleware
let cors = require('cors');
const log = require('./policies/tools').log
const fs = require('fs');
global.models = require('./models') //loading sequelize models

let app = express();
app.use(cors())

app.use(logger('dev'));
app.use(logger(
  `ip=:remote-addr \n url=:method :url :status \n userAgent=:user-agent  \n responseTime=:response-time`, {
    stream: log.stream
  }));
//app.use(logger('combined', { stream: log.stream }));

app.use(express.json());
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//loading routes
fs.readdir(path.join(__dirname, 'routes'), function(err, files) {
  if (err) {
    return log().error({
      message: err,
      route: '[app]'
    })
  }
  app.use('/', require('./routes/index')); //to make app:port/ works
  //application.use("/public", express.static(path.join(__dirname, 'coops')));

  app.use(authentification.tokenAuth);
  files.forEach(function(file) {
    file = file.substr(0, file.lastIndexOf('.'))
    app.use('/' + file, require('./routes/' + file))
  });
});

module.exports = app;
