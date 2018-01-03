import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AppServices } from '../../app/app.service';
import { ChiTietCVPage } from './chitiet-cv';
import { Auth } from '../../service/auth.service'

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListCVPage{
  events_google: Array<any> = []
  current_date = new Date();
  lich_hop: Array<any> = [];
  id_nhanvien = this.auth.id_nhanvien;

  constructor(public navCtrl: NavController,
   public navParams: NavParams,
   private service: AppServices,
   public alertCtrl: AlertController,
   public toastCtrl: ToastController,
   public auth: Auth
   ){}

  ionViewDidEnter(){
    this.getCongviec();
  }

  showAlertError(msg) {
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  getCongviec(){
    this.lich_hop = [];
    this.showToast();
    this.service.get('CongViec/GetCongViec', {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data =>{
      let that = this
      data.forEach((item) => {
        let obj = {
              title: item.CongViec,
              noidung: item.NoiDungCongViec,
              ng_dexuat: item.NguoiDeXuat,
              ng_duyet: item.NguoiDuyet,
              ng_trachnhiem: item.NguoiTrachNhiem,
              role: item.Role,
              duyet: item.isDuyet,
              giahan: item.isGiaHan,
              xinhuy: item.isXinHuy,
              danhgia: item.isDanhGia,
              yc_giahan: item.isYeuCauGiaHan,
              yc_xinhuy: item.isYeuCauXinHuy,
              yc_danhgia: item.isYeuCauDanhGia,
              batdau: item.NgayBatDau,
              ketthuc: item.HanHoanThanh,
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
      })
      this.lich_hop.reverse();
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
    this.navCtrl.push(ChiTietCVPage, {
      cv: item
    });
  }

  agree(item){
    let obj = {
      Id: item.id,
      Status: ';2;'
    }
    console.log(item);
    this.service.post('CongViec/PostDuyetCongViec', obj, {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Duyệt thành công!',
        buttons: ['OK']
      });
      alert.present();
      this.getCongviec()
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
    this.service.post('CongViec/PostDuyetCongViec', obj, {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Hủy thành công!',
        buttons: ['OK']
      });
      alert.present();
      this.getCongviec()
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
