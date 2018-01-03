import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AppServices } from '../../app/app.service';
import { ChiTietPage } from './chitiet';
import { Auth } from '../../service/auth.service'

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListLHPage{
  events_google: Array<any> = []
  current_date = new Date();
  lich_hop: Array<any> = [];
  id_nhanvien = this.auth.id_nhanvien;

  constructor(public navCtrl: NavController,
   public navParams: NavParams,
   private service: AppServices,
   public alertCtrl: AlertController,
   public auth: Auth,
   public toastCtrl: ToastController
   ){}

  ionViewDidEnter() {
    this.getLichHopThang(this.id_nhanvien, this.current_date.getMonth()+1, this.current_date.getFullYear(), "0;1;2;3;4;5")
  }

  showAlertError(msg) {
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  getLichHopThang(id, month, year, flag){
    this.lich_hop = [];
    this.showToast();
    this.service.get('LichHop/GetLichHop', {params: {'MSNV': id,'month1': month, 'year1': year, flag: flag}})
    .subscribe(data =>{
      let that = this;
      if(data){
        data.forEach(function(item){
        let obj = {
          title: item.Name,
          id: item.ID,
          location: item.DiaDiem,
          startTime: new Date(item.BatDau),
          endTime: new Date(item.KetThuc),
          chutri: item.ChuTri,
          trangthai: item.TrangThai,
          role: item.Role
        };
        that.lich_hop.push(obj)
      })
      }
    },
    error => {
    })
  }

  detail(item){
    this.navCtrl.push(ChiTietPage, {
      id: item.id,
      msnv: this.id_nhanvien
    });
  }

  agree(item){
    let obj = {
      Id: item.id,
      Status: ';2;'
    }
    console.log(item);
    this.service.post('LichHop/PostDuyetLichHop', obj, {params: {'MSNV': this.auth.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Duyệt thành công!',
        buttons: ['OK']
      });
      alert.present();
      this.getLichHopThang(this.id_nhanvien, 4, this.current_date.getFullYear(), "0;1;2;3;4;5")
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
    this.service.post('LichHop/PostDuyetLichHop', obj, {params: {'MSNV': this.auth.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Hủy thành công!',
        buttons: ['OK']
      });
      alert.present();
      this.getLichHopThang(this.id_nhanvien, 4, this.current_date.getFullYear(), "0;1;2;3;4;5")
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
    toast.present();
  }
}
