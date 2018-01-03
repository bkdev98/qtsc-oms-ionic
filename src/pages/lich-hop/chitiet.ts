import {Component, ViewChild} from '@angular/core';
import { AppServices } from '../../app/app.service';
import { CallNumber } from '@ionic-native/call-number';
import {
  NavController, NavParams, LoadingController, AlertController, MenuController, ToastController,
  App, Content
} from 'ionic-angular';
import { DetailMessagePage } from '../message/detail-message';
import {SocketClientService} from "../../app/socketio/client";
import {Auth} from "../../service/auth.service";
import * as moment from 'moment';

@Component({
  selector: 'chi-tiet',
  templateUrl: 'chitiet.html',

})
export class ChiTietPage {
  @ViewChild(Content) content:Content;
  chitiet: any = {};
  view = 'thongtin';
  id: string;
  msnv: string;
  list_chat: Array<any> =[];
  count: number = 0;
  ioTokens:Array<any> = [];
  list_msnv:Array<any> = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public service: AppServices,
    public loadingCtr: LoadingController, private callNumber: CallNumber,
    public alertCtrl: AlertController,
    public menu: MenuController,
    public toastCtrl: ToastController,
    public chat: SocketClientService,
    public auth: Auth,
  ) {
    this.menu.swipeEnable(false);
  }

  ionViewDidEnter() {
    let that = this;
    this.chat.connect();
    this.id = this.navParams.get('id');
    this.msnv = this.navParams.get('msnv');
    this.getChiTietLichHop();

    let data = { roomId: this.id};
    this.chat.joinRoom(data);
    this.getMessages();


    //join to room

    // get list meeting chat
    this.chat.Socket().on('get list meeting chat', function (data) {
      if(data)
        that.list_chat = data.data;
        // that.scrollToBottom();
        // that.count = data.data.length;
        // that.scroll(data.data.length);
    });

    //after send message
    this.chat.Socket().on('meeting chat', function (data) {
      console.log(data);
      that.list_chat.push(data);
      // that.scrollToBottom();
      let text = document.getElementById('input_message'+that.service.user_info['MSNV']);
      if(text) {
        text.innerText = "";
      }
    });

    //after found user io token
    this.chat.Socket().on('find io token by msnv', function (data) {
      if (data && data.token){
        that.ioTokens.push(data.token);
      }
      console.log(that.ioTokens);
    })

  }

  ionViewWillLeave(){
    this.chat.clientDisconnect();
  }

  getChiTietLichHop(){
    let that = this;
    this.presentToast('Đang tải...');
    this.service.get('LichHop/GetChiTietLichHop', {id: this.id, params: {'MSNV': this.msnv}})
      .subscribe(data => {
          console.log(data);
          this.chitiet = data;
          this.chitiet.ngay = this.chitiet.BatDau;
          this.chitiet.BatDau = moment(this.chitiet.BatDau,'YYYY-MM-DDTHH:mm:ss').local().format('HH:mm')
          this.chitiet.KetThuc = moment(this.chitiet.KetThuc,'YYYY-MM-DDTHH:mm:ss').local().format('HH:mm')
          if(data.NguoiThamDu.length > 0){
            data.NguoiThamDu.forEach(function (item) {
              that.list_msnv.push(item.Msnv);
            })
          }
          this.findUserIoTokens();
        },
        error => {
        });
    //socket chat
  }

  Duyet(item){
    console.log(item);
    let obj = {
      Id: item.Id,
      Status: ';2;'
    };
    this.service.post('LichHop/PostDuyetLichHop', obj, {params: {'MSNV': this.msnv}})
      .subscribe(data => {
          this.presentToast('Duyệt lịch họp thành công.')
          this.getChiTietLichHop();
        },
        error => {
          let alert = this.alertCtrl.create({
            title: 'Lỗi!',
            buttons: ['OK']
          });
          alert.present();
        })
  }

  Huy(item){
    let obj = {
      Id: item.Id,
      Status: ';4;'
    };
    this.service.post('LichHop/PostDuyetLichHop', obj, {params: {'MSNV': this.msnv}})
      .subscribe(data => {
          this.presentToast('Hủy lịch họp thành công.')
          this.getChiTietLichHop();
        },
        error => {
          let alert = this.alertCtrl.create({
            title: 'Lỗi!',
            buttons: ['OK']
          });
          alert.present();
        })
  }

  showAlertError(msg) {
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  callPhone(number) {
    this.callNumber.callNumber(number, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }

  swipeEvent(event){
    if(event.direction == 2){
      if(this.view == 'thongtin'){
        this.view = 'thanhphan'
      } else if(this.view == 'thanhphan'){
        this.view = 'file'
      } else if(this.view == 'file'){
        this.view = 'gopy';
      }
    }
    if(event.direction == 4){
      if(this.view == 'gopy'){
        this.view = 'file';
      } else if(this.view == 'file'){
        this.view = 'thanhphan';
      } else if(this.view == 'thanhphan'){
        this.view = 'thongtin';
      }
    }
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000
    });
    toast.present();
  }

  //socket io
  getMessages(){
    let data = {
      roomId: this.id
    };
    this.chat.event('get list meeting chat', data);
    // this.scrollToBottom();
  }


  findUserIoTokens(){
    let that = this;
    this.list_msnv.splice(this.list_msnv.indexOf(this.service.user_info['MSNV']),1);
    this.list_msnv.forEach(function (value) {
      that.chat.event('find io token by msnv', {msnv: value, roomId: that.id});
    })
  }

  sendMessage(){
    let message = document.getElementById('input_message'+this.service.user_info['MSNV']).textContent;
    let mess = {
      roomId: this.id,
      message: message,
      handle: this.service.user_info['Name'],
      msnv: this.service.user_info['MSNV']
    };
    if(message) {
      this.chat.event('meeting chat', mess);
      this.service.sendNotifications(this.ioTokens,this.chitiet['NoiDung'],message);
    }
  }

  privateChat(user){
    this.navCtrl.push(DetailMessagePage, {user: user})
  }

  scrollToBottom() {
    if(this.content) {
      setTimeout(() => {
        this.content.scrollToBottom();
      });
    }
  }
}
