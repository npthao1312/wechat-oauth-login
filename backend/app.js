var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

require('dotenv').config();

// It's best to use your local IP for local testing
const host = 'http://192.168.0.102'

const {Wechat} = require('wechat-jssdk'); // https://github.com/JasonBoy/wechat-jssdk#readme
const wechatConfig = {
  //set your oauth redirect url, defaults to localhost
  "wechatRedirectUrl": `${host}:4000/oauth-callback`,
  //"wechatToken": "wechat_token", //not necessary required
  "appId": process.env.APP_ID,
  "appSecret": process.env.APP_SECRET,
  // card: true, //enable cards
  // payment: true, //enable payment support
  // merchantId: '', //
  // paymentSandBox: true, //dev env
  // paymentKey: '', //API key to gen payment sign
  // paymentCertificatePfx: fs.readFileSync(path.join(process.cwd(), 'cert/apiclient_cert.p12')),
  // //default payment notify url
  // paymentNotifyUrl: `http://your.domain.com/api/wechat/payment/`,
  // //mini program config
  // "miniProgram": {
  //   "appId": "mp_appid",
  //   "appSecret": "mp_app_secret",
  // }
}

const wx = new Wechat(wechatConfig);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Test
app.get('/hello', function(req, res) {
  res.json("Hello, World!");
});

// Generate Signature: provide a api for your browser to get token for the current url
app.get('/get-signature', async (req, res) => {
  const signatureData = await wx.jssdk.getSignature(req.query.url);
  res.json(signatureData);
});

// Send User to WeChat Authentication Link
app.get('/auth-link', function(req, res) {
  res.json(wx.oauth.snsUserInfoUrl);
});

// Get User Information
app.get('/oauth-callback', function (req, res) {
  // Get code and get user info
  wx.oauth.getUserInfo(req.query.code)
          .then(function(userProfile) {
            console.log(userProfile)
            const userInfo = JSON.stringify(userProfile);
            res.redirect(`${host}:3000?user=${encodeURIComponent(userInfo)}`);
          });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;
