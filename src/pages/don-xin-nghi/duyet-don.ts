import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { AppServices } from '../../app/app.service';
import { ChiTietDonPage } from './chitiet-don';
import { DonXinNghiPage } from './don-xin-nghi';
import { Auth } from '../../service/auth.service'

@Component({
  selector: 'duyet-don',
  templateUrl: 'duyet-don.html'
})
export class DuyetDonPage {
  events_google: Array<any> = [];
  current_date = new Date();
  lich_hop: Array<any> = [];
  id_nhanvien = this.auth.id_nhanvien;

  constructor(public navCtrl: NavController,
   public navParams: NavParams,
   private service: AppServices,
   public alertCtrl: AlertController,
   public loadingCtrl: LoadingController,
   public toastCtrl: ToastController,
   public auth: Auth
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
    let loader = this.loadingCtrl.create({
      content: "Đang tải...",
    });
    loader.present();
    this.service.get('NghiPhep/GetDanhSachCanDuyet',{params: {'MSNV': this.id_nhanvien}})
    .subscribe(data =>{
      let that = this;
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
      })
        loader.dismiss()
    },
    error => {
      console.log(error);
      loader.dismiss()
    })
  }

  detail(item){
    this.navCtrl.push(ChiTietDonPage, {
      cv: item
    });
  }

  agree(item){
    let obj = {
      Id: item.id,
      Status: ';2;'
    }
    console.log(item);
    this.service.post('NghiPhep/PostDuyetNghiPhep', obj, {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data => {
      this.presentToast('Duyệt thành công')
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
    this.service.post('NghiPhep/PostDuyetNghiPhep', obj, {params: {'MSNV': this.id_nhanvien}})
    .subscribe(data => {
      this.presentToast('Hủy thành công')
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

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}
