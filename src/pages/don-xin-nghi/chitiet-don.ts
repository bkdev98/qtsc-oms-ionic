import { Component } from '@angular/core';
import { AppServices } from '../../app/app.service';
import { Auth } from '../../service/auth.service';
import { NavController, NavParams, LoadingController, AlertController, MenuController, ToastController } from 'ionic-angular';

@Component({
  selector: 'chi-tiet-don',
  templateUrl: 'chitiet-don.html'
})
export class ChiTietDonPage{
  chitiet: Object = {};
  view = 'noidung';
  cv: Object = {};

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public service: AppServices,
    public loadingCtr: LoadingController,
    public alertCtrl: AlertController,
    public menu: MenuController,
    public toastCtrl: ToastController,
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
      Id: item.id,
      Status: ';2;'
    }
    this.service.post('NghiPhep/PostDuyetNghiPhep', obj, {params: {'MSNV': this.auth.id_nhanvien}})
    .subscribe(data => {
      this.presentToast('Duyệt thành công')
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
      Id: item.id,
      Status: ';4;'
    }
    this.service.post('NghiPhep/PostDuyetNghiPhep', obj, {params: {'MSNV': this.auth.id_nhanvien}})
    .subscribe(data => {
      this.presentToast('Hủy thành công')
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

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
    this.navCtrl.pop()
  }
}
