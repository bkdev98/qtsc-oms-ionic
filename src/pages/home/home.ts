import { Component } from '@angular/core';
import { NavController, Platform, Nav } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Storage } from '@ionic/storage';

import { AppServices } from '../../app/app.service';
import { ThongbaoPage } from '../thongbao/thongbao';
import { Auth } from '../../service/auth.service';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
  data = [];
  notifications: any[] = [];

  constructor(public navCtrl: NavController,
              private localNotifications: LocalNotifications,
              public platform: Platform,
              public service: AppServices,
              public nav: Nav,
              public auth: Auth,
              public storage: Storage) {

    this.pushNotification()

    // this.localNotifications.schedule({
    // 	text: 'Delayed ILocalNotification',
    // 	at: new Date(new Date().getTime() + 3600),
    // 	led: 'FF0000',
    // 	sound: null
    // });
  }

  pushNotification() {
    this.service.get('Notification/GetNotfication')
      .subscribe(data => {
        let that = this;
        let i = 0;
        data.forEach((item) => {
          let obj = {
            title: 'OMS notification!',
            text: item.Notification,
            at: new Date(new Date().getTime() + 3600 * i),
            led: 'FF0000',
            sound: null
          };
          that.notifications.push(obj)
          i += 1;
        });
        if (this.platform.is('cordova')) {

          // Cancel any existing notifications
          this.localNotifications.cancelAll().then(() => {

            // Schedule the new notifications
            this.localNotifications.schedule(this.notifications);
            this.localNotifications.on('click', () => {
              this.nav.setRoot(ThongbaoPage);
            });
            this.notifications = [];
          });
        }
      })
  }

  //to let notifications work on ios 10
  ionViewDidLoad() {
  }
}
