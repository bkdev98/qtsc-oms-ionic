import {Component, ViewChild} from '@angular/core';
import {Content, NavController, NavParams} from 'ionic-angular';
import {AppServices} from "../../app/app.service";
import {Auth} from "../../service/auth.service";
import {SocketClientService} from "../../app/socketio/client";

@Component({
  selector: 'page-detail-message',
  templateUrl: 'detail-message.html',
})

export class DetailMessagePage {
  @ViewChild(Content) content: Content;

  message: Object = {};
  user: object = {};
  messages: Array<any> = [];
  roomId: string;
  ioToken:string;
  constructor(
    public navCtrl: NavController,
    public  navParams: NavParams,
    public service: AppServices,
    public auth: Auth,
    public chat: SocketClientService) {
  }

  ionViewDidEnter(){
    this.chat.connect();

    this.user = this.navParams.get('user');
    console.log(this.user);
    this.roomId = this.compareString(this.service.user_info['ID_'],this.user['Msnv']);
    console.log(this.roomId);
    let that = this;
    this.getPrivateMessage();
    this.findUserIoToken();
    //join to room
    let data = {roomId: this.roomId, name: this.service.user_info['Name']};
    this.chat.joinRoom(data);
    //received message from server
    this.chat.Socket().on('get private message', function (res) {
      if(res)
        that.messages = res.data;
      that.scrollToBottom();
    });
    //after send message
    this.chat.Socket().on('send private message', function (data) {
      that.messages.push(data.data[0]);
      that.scrollToBottom();
      console.log(data);
      // add new user chat
      let text = document.getElementById('input_message'+that.service.user_info['ID_']);
      if(text)
        text.innerText = "";
    });

    //after found user io token
    this.chat.Socket().on('find io token by msnv', function (data) {
      console.log(data);
      if(data){
        that.ioToken = data.token;
      }
      // alert(JSON.stringify(data))
    })

  }

  ionViewWillLeave(){
    this.chat.clientDisconnect();
  }

  findUserIoToken(){
    this.chat.event('find io token by msnv', {msnv: this.user['Msnv'], roomId: this.roomId})
  }

  getPrivateMessage(){
    let data = {
      roomId: this.roomId,
    };
    console.log(data);
    this.chat.event("get private message", data);
  }

  sendMessage(){
    let message = document.getElementById('input_message'+this.service.user_info['ID_']).textContent;
    let mess = {
      roomId: this.roomId,
      data: [
        {
          msnv: this.service.user_info['ID_'],
          name: this.service.user_info['Name'],
          timestamp: Date.now(),
          message: message
        }
      ]
    };

    let user = {
      roomId: this.roomId,
      data : {
        from: {
          msnv: this.service.user_info['ID_'],
          name: this.service.user_info['Name'],
        },
        to: {
          msnv: this.user['Msnv'],
          name: this.user['HoVaTen']
        },
        message: message,
        timestamp: Date.now()
      }
    };

    if(message){
      this.chat.event('send private message', mess);
      this.chat.event('add new user chat',user);
      this.service.sendNotifications(this.ioToken,this.service.user_info['Name'],message);
    }
  };


  goBack() {
    this.navCtrl.pop();
  }

  compareString(a,b){
    // let c = a.localeCompare(b);
    if(a>b){
      return b+'_'+a;
    }
    return a+'_'+b;
  }

  scrollToBottom() {
    if(this.content) {
      setTimeout(() => {
        this.content.scrollToBottom();
      },500);
    }
  }
}
