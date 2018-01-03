import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, Platform } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import * as moment from 'moment';
import { AppServices } from '../../app/app.service';
import { ChiTietCTPage } from './chitiet-congtac';
import { Auth } from '../../service/auth.service'

@Component({
  selector: 'list-congtac',
  templateUrl: 'list-cong-tac.html'
})
export class ListCTPage{
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
    public platform: Platform,
    ){}

  ionViewDidEnter(){
    this.getDon();
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
    this.service.get('CongTac/GetDuyetCongTac', {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data =>{
      let that = this
      data.forEach((item) => {
        let obj = {
          id: item.Id,
          name: item.Name,
          nhansu: item.NhanSu,
          ng_duyet: item.NguoiDuyet,
          mucdich: item.MucDich,
          batdau: item.TuNgay,
          ketthuc: item.DenNgay,
          phuongtien: item.LoaiPhuongTien,
          hanhtrinh: item.HanhTrinh,
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
        that.lich_hop.push(obj);
        if(that.platform.is('cordova')){
          that.localNotifications.isPresent(item.Id).then(val => {
            if(!val){
              let time = moment(item.TuNgay).subtract(30, 'm').toDate()
              if(moment().isBefore(time)){
                that.localNotifications.schedule({
                  id: item.Id,
                  title: item.Name,
                  at: time,
                  led: 'FF0000'
                })
              }
            }
          })
        }
      })
    },
    error => {
      console.log(error);
    })
  }

  detail(item){
    this.navCtrl.push(ChiTietCTPage, {
      cv: item
    });
  }

  agree(item){
    let obj = {
      Id: item.id,
      Status: ';2;'
    }
    this.service.post('CongTac/PostDuyetCongTac', obj, {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Duyệt thành công!',
        buttons: ['OK']
      });
      alert.present();
      this.getDon()
    },
    error => {
      let alert = this.alertCtrl.create({
        title: 'Lỗi!',
        buttons: ['OK']
      });
      alert.present();
    })
  }

  delete(item){
    let obj = {
      Id: item.id,
      Status: ';4;'
    }
    this.service.post('CongTac/PostDuyetCongTac', obj, {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Hủy thành công!',
        buttons: ['OK']
      });
      alert.present();
      this.getDon()
    },
    error => {
      let alert = this.alertCtrl.create({
        title: 'Lỗi!',
        buttons: ['OK']
      });
      alert.present();
    })
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
