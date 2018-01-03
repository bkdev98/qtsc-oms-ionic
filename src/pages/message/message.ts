import { Component } from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import { DetailMessagePage } from "./detail-message"
import {AppServices} from "../../app/app.service";
import {SocketClientService} from "../../app/socketio/client";
import {GroupPage} from "./group";

@Component({
  selector: 'page-message',
  templateUrl: 'message.html'
})
export class MessagePage {

  searchQuery: string = '';
  items: Array<any> = [];
  groups: Array<any> = [];

  constructor(
    public navCtrl: NavController,
    public service: AppServices,
    public chat: SocketClientService,
    public alert: AlertController) {  }

  ionViewDidEnter(){
    this.chat.connect();
    let that = this;
    this.getUserChats();

    //after get message
    this.chat.Socket().on('get list user chat', function (data) {
      that.items = data;
    });

    //after get group
    this.chat.Socket().on('get list group', function (data) {
      that.groups = data;
      console.log(data);
    });

    //after remove single
    this.chat.Socket().on('remove private chat', function (data) {
      console.log(data);
      that.items.forEach(function (item, index) {
        if(item.roomId=== data.roomId){
          that.items.splice(index,1);
        }
      })
    })

    //after remove group
    this.chat.Socket().on('remove group chat', function (data) {
      console.log(data);
      that.groups.forEach(function (item, index) {
        if(item._id=== data._id){
          that.groups.splice(index,1);
        }
      })
    })
  }

  ionViewWillLeave(){
    this.chat.clientDisconnect();
  }

  getItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;
    console.log(val);

    // // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      //filter users
      this.items = this.items.filter((item) => {
        return (item.data.user1.name.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.data.user2.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
        // console.log(item);
      });
      // filter groups
      this.groups = this.groups.filter((group) => {
        return (group.name.toLowerCase().indexOf(val.toLowerCase()) > -1 );
      });
    } else {
      this.getUserChats();
    }
  }

  viewMessage(user){
    console.log(user);
    let userView: any;
    if(user.data.user1.msnv === this.service.user_info['ID_']){
      userView = {
        Msnv: user.data.user2.msnv,
        HoVaTen: user.data.user2.name,
      };
    } else {
      userView = {
        Msnv: user.data.user1.msnv,
        HoVaTen: user.data.user1.name,
      };
    }
    this.navCtrl.push(DetailMessagePage, {user: userView})
    // console.log(userView);
  }

  viewGroupMessage(group){
    console.log(group);
    this.navCtrl.push(GroupPage, {group:group})
  }

  getUserChats(){
    let data = {
      msnv: this.service.user_info['ID_'].toString(),
    };
    //get list user chat
    this.chat.event("get list user chat", data);
    //get list group chat
    this.chat.event('get list group', data);
  }

  createGroup(){
    this.navCtrl.push(GroupPage);
  }

  removeItem(item, type){
    let alert = this.alert.create({
      title: 'Warning',
      message: 'Bạn có muốn xóa cuộc trò truyện này không?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Xóa',
          handler: () => {
            if(type==='single'){
              this.chat.event('remove private chat', item);
            }
            if(type==='group'){
              this.chat.event('remove group chat', item);
            }
          }
        }
      ]
    });

    alert.present();
  }

  presentConfirm() {

  }

}
