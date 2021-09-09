import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import WechatJSSDK from 'wechat-jssdk';

import Login from './components/Login';
import config from './config';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isWeChat: false,
      wxJSSDKerr: null,
      wechatObj: null
    };
  }

  componentWillMount() {
    // Browser Check: You have to open this website in WeChat
    const isWechat = this.isWithinWeChat();
    if(isWechat) {
      this.requestForWeChatParams();
    }
  }

  isWithinWeChat = () => {
    const ua = navigator.userAgent.toLowerCase();
    // is within wechat
    // micromessenger is the keyword that indicates it's within wechat
    if(ua.match(/MicroMessenger/i) == "micromessenger") {
      this.setState({
        isWeChat: true
      });
      return true;
    }
    return false;
  }

  requestForWeChatParams = async () => {
    const url = window.location.href.split('#')[0];

    const YourBackEndUrl = `${config.backendUrl}/get-signature?url=${encodeURIComponent(url)}`

    try {
      const { data } = await axios.get(YourBackEndUrl);

      const config = {
        //below are mandatory options to finish the wechat signature verification
        //the 4 options below should be received like api '/get-signature' above
        'appId': data.appId,
        'nonceStr': data.nonceStr,
        'signature': data.signature,
        'timestamp': data.timestamp,
        //below are optional
        'success': jssdkInstance => { console.log('success', jssdkInstance) },
        'error': (err, jssdkInstance) => { console.log('failed', jssdkInstance) },
        //enable debug mode, same as debug
        'debug': true,
        // Tell WeChat what functionalities you would like to use
        'jsApiList': [
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareWeibo',
          'onMenuShareQZone',
          'startRecord',
          'stopRecord',
          'onVoiceRecordEnd',
          'playVoice',
          'pauseVoice',
          'stopVoice',
          'onVoicePlayEnd',
          'uploadVoice',
          'downloadVoice',
          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'translateVoice',
          'getNetworkType',
          'openLocation',
          'getLocation',
          'hideOptionMenu',
          'showOptionMenu',
          'hideMenuItems',
          'showMenuItems',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem',
          'closeWindow',
          'scanQRCode',
          'chooseWXPay',
          'openProductSpecificView',
          'addCard',
          'chooseCard',
          'openCard'
        ],
        'customUrl': ''
      }
      const wechatObj = new WechatJSSDK(config);

      await wechatObj.initialize();

      this.setState({
        wechatObj,
        loading: false,
      });
    } catch (error) {
      console.log({ error });
      this.setState({
        wxJSSDKerr: error,
        loading: false,
      });
    }
  }

  render() {
    const { wxJSSDKerr, wechatObj, loading, isWeChat } = this.state;
    console.log(wechatObj);
    return (
      <div className="App">
        <header className="App-header">
          WeChat OAuth Demo
        </header>
        {!isWeChat ? <div style={{paddingTop: '40px'}}>Please open in WeChat App.</div> : null}
        {/* WeChat JSSDK successfully initiated */}
        {wechatObj && !loading ?
          <div>
            <div style={{paddingTop: '40px'}}>
              <Login wechatObj={wechatObj} />
            </div>
          </div> :
          <div style={{paddingTop: '40px'}}>
            {wxJSSDKerr ? JSON.stringify(wxJSSDKerr) : null}
          </div>
        }
      </div>
    );
  }
}

export default App;
