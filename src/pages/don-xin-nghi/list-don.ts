import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, Platform } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AppServices } from '../../app/app.service';
import { ChiTietDonPage } from './chitiet-don';
import { DonXinNghiPage } from './don-xin-nghi';
import { Auth } from '../../service/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'list-don',
  templateUrl: 'list-don.html'
})
export class ListDonPage {
  events_google: Array<any> = []
  current_date = new Date();
  lich_hop: Array<any> = [];
  id_nhanvien = this.auth.id_nhanvien;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private service: AppServices,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public auth: Auth,
    private localNotifications: LocalNotifications,
    public platform: Platform
    ){}
  ionViewDidEnter(){
    this.getDon()
  }

  showAlertError(msg) {
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  getDon(){
    this.lich_hop = [];
    this.showToast();
    this.service.get('NghiPhep/GetDanhSachNghiPhep', {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data =>{
      let that = this
      data.forEach((item) => {
        let obj = {
          id: item.Id,
          name: item.Name,
          ng_duyet: item.NguoiDuyet,
          ng_nghi: item.NguoiNghiPhep,
          lydo: item.LyDoNghi,
          batdau: item.TuNgay,
          ketthuc: item.DenNgay,
          trangthai: item.TrangThai
        }
        if(item.TrangThai == 'Mới khởi tạo' || item.TrangThai ==='Chờ duyệt'){
          obj['color'] = 0
        }
        if(item.TrangThai == 'Đã duyệt'){
          obj['color'] = 2
        }
        if(item.TrangThai == 'từ chối' || item.TrangThai ==='Hủy' || item.TrangThai =='Hoàn tất'){
          obj['color'] = 3
        }
        that.lich_hop.push(obj)
        // if(that.platform.is('cordova')){
        //   that.localNotifications.isPresent(item.ID).then(val => {
        //     if(!val){
        //       let time = moment(item.BatDau).subtract(30, 'm').toDate()
        //       if(moment().isBefore(time)){
        //         that.localNotifications.schedule({
        //           id: item.ID,
        //           title: item.Name,
        //           at: time,
        //           led: 'FF0000'
        //         })
        //       }
        //     }
        //   })
        // }
      })
    },
    error => {
    })
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    // this.navCtrl.push(ListPage, {
      //   item: item
      // });
    }

    detail(item){
      this.navCtrl.push(ChiTietDonPage, {
        cv: item
      });
    }

    gotoCreate(){
      this.navCtrl.push(DonXinNghiPage)
    }

    showToast() {
      const toast = this.toastCtrl.create({
        message: 'Đang tải...',
        duration: 3000,
        position: 'bottom',
      });
      toast.present()
    }
  }
