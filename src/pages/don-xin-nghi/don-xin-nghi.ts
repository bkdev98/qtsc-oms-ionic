import { Component } from '@angular/core';
import { NavController, Platform, Nav, ToastController } from 'ionic-angular';
import { AppServices } from '../../app/app.service';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Auth } from '../../service/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'don-xin-nghi',
  templateUrl: 'don-xin-nghi.html'
})
export class DonXinNghiPage {
  don_xin_nghi = {
    TuNgay: moment().format('YYYY-MM-DD'),
    DenNgay: moment().format('YYYY-MM-DD')
  };
  token: string;
  min_tu_ngay;
  min_den_ngay;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public service: AppServices,
    public toastCtrl: ToastController,
    public nav: Nav,
    public auth: Auth,
    public http: Http,
    public storage: Storage) {
    this.storage.get('token').then((val) => {
      this.token = val;
    });
    this.min_tu_ngay  = moment().format("YYYY-MM-DD");
    this.min_den_ngay = moment().format("YYYY-MM-DD");
  }

  taoDon(){
    this.don_xin_nghi['NguoiNghiPhep'] = this.service.user_info['Name'];
    this.http.post('http://api001.hisoft.vn/api/NghiPhep/PostTaoNghiPhep?MSNV='+this.auth.id_nhanvien, this.don_xin_nghi,
      {headers: new Headers({'Content-Type' : 'application/json', 'long-key': this.token})})
      .subscribe(data => {
          if(data){
            this.presentToast('Tạo đơn thành công.')
            setTimeout(() => this.navCtrl.pop(), 1000)
          } else {
            this.presentToast('Tạo đơn không thành công.')
          }
        },
        error => {
          this.presentToast('Tạo đơn thất bại.')
        })
  }

  changeTuNgay(){
    this.min_den_ngay = this.don_xin_nghi['TuNgay']
    this.don_xin_nghi['DenNgay'] = this.min_den_ngay
  };

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}
