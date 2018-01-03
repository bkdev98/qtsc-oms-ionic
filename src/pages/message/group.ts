import {Component, ViewChild} from '@angular/core';
import {AlertController, Content, NavController, NavParams, ModalController} from 'ionic-angular';
import {AppServices} from "../../app/app.service";
import {SocketClientService} from "../../app/socketio/client";
import {Auth} from "../../service/auth.service";
import {ModalPage} from "./modal";

@Component({
  selector: 'page-group',
  templateUrl: 'group.html'
})
export class GroupPage {
  @ViewChild(Content) content: Content;
  constructor(
    public navCtrl: NavController,
    public service: AppServices,
    public chat: SocketClientService,
    public auth: Auth,
    public alert: AlertController,
    public navParams: NavParams,
    public modal: ModalController) {
    this.getAllUser();
  }
  room_name: string = "Cuộc hội thoại chưa đặt tên";
  users: Array<any> = [];
  userSelected: Array<any> = [];
  isSelected:boolean = false;
  userInGroup: Array<any> = [];
  roomId: string = "";
  group: Object = {};
  list_chat: Array<any> =[];
  ioTokens:Array<any> = [];
  list_msnv:Array<any> = [];
  stringId:string;

  ionViewDidEnter(){
    this.chat.connect();
    let that = this;
    this.group = this.navParams.get('group');
    console.log(this.group);
    if(this.group){
      this.chat.joinRoom({roomId: this.group['_id']});
      this.room_name = this.group['name'];
      this.roomId = this.group['_id'];
      this.userInGroup = this.group['users']|| [];
      this.userInGroup.forEach(function (user) {
        that.list_msnv.push(user.msnv);
      });
      this.getMessageInGroup();
      this.findUserIoTokens();
    }

    // get list meeting chat
    this.chat.Socket().on('add user to group', function (data) {
      console.log(data);
      that.chat.joinRoom({roomId: data._id});
      that.group['roomId']=data._id;
      that.userInGroup = data.users;
      that.roomId = data._id;
      that.isSelected = true;
      console.log(data);
    });

    this.chat.Socket().on('change group name', function (res) {
      console.log(res);
      that.room_name = res.name;
    });

    //after send message
    this.chat.Socket().on('send group chat', function (data) {
      console.log(data);
      that.list_chat.push(data);
      that.scrollToBottom();
      let text = document.getElementById('input_message'+that.service.user_info['ID_']);
      if(text)
        text.innerText = "";
    });

    //after get group message
    this.chat.Socket().on('get group message',function (data) {
      console.log(data);
      if(data)
        that.list_chat = data.data;
      that.scrollToBottom();
    });

    //after found user io token
    this.chat.Socket().on('find io token by msnv', function (data) {
      if (data && data.token){
        that.ioTokens.push(data.token);
      }
      console.log(that.ioTokens);
    })
  }

  getMessageInGroup(){
    this.chat.event('get group message', {roomId: this.group['_id']});
  }

  getAllUser(){
    let that = this;
    this.service.get("NhanVien/GetNhanVien?MSNV="+this.auth.id_nhanvien)
      .subscribe(
        data => {
          console.log(data);
          this.users = data;
        }
      )
  }

  addUserSelected(users){
    let that = this;
    let me = {
      HoVaTen: this.service.user_info["Name"],
      msnv: this.service.user_info["ID_"].toString(),
      username: this.service.user_info["LoginName"]
    };
    users.push(me);
    that.userInGroup = users;
    users.forEach(function (value) {
      that.list_msnv.push(value.msnv);
    });

    this.group = {
      name: this.room_name,
      users : users,
      timestamp: Date.now(),
      data: []
    };
    console.log(this.group);
    that.findUserIoTokens();
    that.chat.event('add user to group', this.group)
  }

  updateUserSelected(users){
    let that = this;
    let msnvs:Array<any> = [];
    that.userInGroup = users;
    users.forEach(function (value) {
      msnvs.push(value.msnv);
    });
    this.list_msnv = msnvs;
    this.chat.joinRoom({roomId: this.roomId});
    let group = {
      roomId: this.roomId,
      name: this.room_name,
      users : users,
      timestamp: Date.now(),
      data: this.group['data'] || []
    };
    console.log(this.group);
    that.findUserIoTokens();
    that.chat.event('update user to group', group)
  }

  changeGroupName(){
    console.log('change group name');
    this.presentPrompt();
  }

  presentPrompt() {
    let that = this;
    const alert = this.alert.create({
      inputs: [
        {
          name: 'name',
          placeholder: 'Group name',
          value: that.room_name
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Change',
          handler: data => {
            console.log(data);
            if(data.name !== "")
            {
              this.group['name'] = data.name;
              this.group['roomId'] = this.roomId;
              console.log(this.group);
              that.chat.event('change group name', this.group);
            }
          }
        }
      ]
    });
    alert.present();
  }

  findUserIoTokens(){
    let that = this;
    this.list_msnv.splice(this.list_msnv.indexOf(this.service.user_info["MSNV"]),1);
    this.list_msnv.forEach(function (value) {
      that.chat.event('find io token by msnv', {msnv: value, roomId: that.roomId});
    })
  }

  sendMessage(){
    let message = document.getElementById('input_message'+this.service.user_info['ID_']).textContent;
    console.log(this.group);
    let mess = [
      {
        name: this.service.user_info['Name'],
        msnv: this.service.user_info['ID_'],
        message: message,
        timestamp: Date.now()
      }
    ];
    this.group['roomId'] = this.roomId;
    this.group['data'] = mess;
    this.group['timestamp'] = Date.now();
    if(message) {
      this.chat.event('send group chat', this.group);
      this.service.sendNotifications(this.ioTokens,this.room_name,message);
    }
  }

  presentContactModal() {
    let that= this;
    let contactModal:any;
    // if(this.group["users"].length > 0){
    //   contactModal = this.modal.create(ModalPage, {data: this.group["users"]});
    // } else {
    contactModal = this.modal.create(ModalPage);
    // }

    contactModal.onDidDismiss(data => {
      if(data){
        that.addUserSelected(data);
      }
      console.log(data);
    });
    contactModal.present();
  }

  updateContactModal(){
    let that= this;
    let contactModal:any;
    contactModal = this.modal.create(ModalPage, {data: this.group["users"]});

    contactModal.onDidDismiss(data => {
      console.log(data);
      if(data){
        that.updateUserSelected(data);
      }
    });
    contactModal.present();
  }

  scrollToBottom() {
    console.log(this.content);
    if (this.content) {
      setTimeout(() => {
        this.content.scrollToBottom();
      }, 500);
    }
  }
}
