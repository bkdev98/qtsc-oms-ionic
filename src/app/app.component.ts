import { Component, ViewChild } from '@angular/core';
import {Nav, App, Platform, MenuController, ToastController, Events, NavController} from 'ionic-angular';
import {Http, Headers} from '@angular/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { LoginPage } from "../pages/login/login";
import { LichHopPage } from '../pages/lich-hop/lich-hop';
import { ThongbaoPage } from '../pages/thongbao/thongbao';
import { CongViecPage } from '../pages/cong-viec/cong-viec';
import { ListDonPage } from '../pages/don-xin-nghi/list-don';
import { ListCTPage } from '../pages/di-cong-tac/list-cong-tac';
import { MessagePage} from "../pages/message/message";
import { DuyetDonPage } from '../pages/don-xin-nghi/duyet-don';
import { LichCaNhanPage } from '../pages/lich-ca-nhan/lich-ca-nhan'
import { Auth } from '../service/auth.service';
import {AppServices} from "./app.service";
import {Push, PushToken} from '@ionic/cloud-angular';


@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  login: boolean;
  rootPage: any;
  hide_duyetdon: boolean = true;
  page1: Array<{title: string, component: any, icon: string}>;
  page2: Array<{title: string, component: any, icon: string}>;
  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public app: App,
    public menuCtrl: MenuController,
    public auth: Auth,
    public toastCtrl: ToastController,
    private storage: Storage,
    private service: AppServices,
    private http: Http,
    public events: Events,
    public push: Push) {
    events.subscribe('menu:duyetdon', (val) => {
      this.menuDuyetDon(val);
    });
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.page1 = [
    // { title: 'Home', component: HomePage, icon: "star" },
    { title: 'Lịch Họp', component: LichHopPage, icon: "calendar" },
    { title: 'Công Việc', component: CongViecPage, icon: "bag" },
    { title: 'Đơn Xin Nghi', component: ListDonPage, icon: "don-nghi-red" },
    { title: 'Duyệt Đơn', component: DuyetDonPage, icon: "don-nghi-red" },
    { title: 'Đi Công Tác', component: ListCTPage, icon: "congtac-red" },
    { title: 'Lịch Cá Nhân', component: LichCaNhanPage, icon: "person" },
    // { title: 'Home' ,component: HomePage },
    // { title: 'List', component: ListPage }
    ];

    this.page2 = [
    { title: 'Tin Nhắn', component: MessagePage, icon: "sms" },
    // { title: 'Thông Báo', component: ThongbaoPage, icon: "nontify" },
    ]

    //connect to socketio
  }

  initializeApp() {
    this.storage.ready().then(() => {
      this.storage.get('MSNV').then(val => {
        if (val) {
          this.rootPage = LichHopPage;
          this.service.getInfo(val);
          this.menuDuyetDon(val);
        } else {
          this.rootPage = LoginPage;
        }
      });
    });
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if(this.platform.is('cordova')) {

        this.service.registerIoToken();

        this.push.rx.notification()
          .subscribe((msg) => {
           // alert(JSON.stringify(msg));
            this.toastMessage(msg.title +': '+msg.text);
          });
      }
    });
  }

  menuDuyetDon(val){
    this.service.get('NghiPhep/GetDanhSachCanDuyet',{params: {'MSNV': val}})
    .subscribe(data =>{
      if(data.length > 0 ){
        this.hide_duyetdon = false;
      }
    })
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }



  showToast(msg) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: 'bottom',
    });
    toast.present()
  }

  toastMessage(msg) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top',
    });
    toast.present()
  }


  logout() {
    let that = this;
    this.menuCtrl.close();
    let obj = {};
    this.storage.get('token').then((res) => {
      obj["Token"] = res;
    });
    this.storage.get('MSNV').then((res) => {
      obj["MSNV"] = res;
    });
    setTimeout(function () {
      that.http.post(that.service.api_url + '/Accounts/Logout', obj, {headers: new Headers({'Content-Type': 'application/json'})}).subscribe(() => {
        that.storage.remove('token');
        that.storage.remove('MSNV');
        that.showToast('Đăng xuất thành công.');
        that.nav.setRoot(LoginPage);
        // window.location.reload();
      }, () => {
        that.showToast('Đăng xuất thất bại.');
      })
    }, 500)
  }

}
