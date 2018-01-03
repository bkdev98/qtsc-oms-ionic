import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { AppServices } from '../../app/app.service';
import { Auth } from '../../service/auth.service'

@Component({
  selector: 'thongbao',
  templateUrl: 'thongbao.html'
})
export class ThongbaoPage {
	notifications: Array<any> = [];

  constructor(public navCtrl: NavController,
  	public service: AppServices,
  	public loadingCtrl: LoadingController,
    public auth: Auth) {
  }

  ionViewDidLoad() {
  	let loader = this.loadingCtrl.create({
      content: "Đang tải...",
    });
    loader.present()
    this.service.get('Notification/GetNotfication', {params: {'MSNV': this.auth.id_nhanvien}})
    .subscribe(data => {
    	this.notifications = data;
    	loader.dismiss();
    },
    error => {
    	console.log(error);
    	loader.dismiss();
    })
  }
}
