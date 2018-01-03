import { Component } from '@angular/core';
import { AppServices } from '../../app/app.service';
import { Auth } from '../../service/auth.service';
import { CallNumber } from '@ionic-native/call-number';
import { NavController, NavParams, LoadingController, AlertController, MenuController } from 'ionic-angular';

@Component({
  selector: 'chi-tiet-cv',
  templateUrl: 'chitiet-cv.html'
})
export class ChiTietCVPage{
  chitiet: Object = {};
  view = 'noidung';
  cv: Object = {};

  constructor(public navCtrl: NavController,
  	public navParams: NavParams,
  	public service: AppServices,
    public loadingCtr: LoadingController, private callNumber: CallNumber,
    public alertCtrl: AlertController,
    public menu: MenuController,
    public auth: Auth
    ) {
    this.menu.swipeEnable(false)
  }

  ionViewDidEnter(){
    this.cv = this.navParams.get('cv');
  }

  Duyet(item){
    console.log(item);
    let obj = {
      Id: item.Id,
      Status: ';2;'
    }
    this.service.post('CongViec/PostDuyetCongViec', obj, {params: {'MSNV': this.auth.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Duyệt thành công!',
        buttons: ['OK']
      });
      alert.present();
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
    }
    this.service.post('CongViec/PostDuyetCongViec', obj, {params: {'MSNV': this.auth.id_nhanvien}})
    .subscribe(data => {
      let alert = this.alertCtrl.create({
        title: 'Hủy thành công!',
        buttons: ['OK']
      });
      alert.present();
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

  swipeEvent(event){
    if(event.direction == 2){
      this.view = 'file'
    }
    if(event.direction == 4){
      this.view = 'noidung'
    }
  }
}
