import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, LOCALE_ID } from '@angular/core';
import { HttpModule} from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { CallNumber } from '@ionic-native/call-number';
import { GooglePlus } from '@ionic-native/google-plus';
import { IonicStorageModule } from '@ionic/storage';
import { SocketClientService} from "./socketio/client";

import { NgCalendarModule  } from 'ionic2-calendar';
import { MyApp } from './app.component';
import { AppServices } from './app.service';
import { Auth } from '../service/auth.service';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { LichHopPage } from '../pages/lich-hop/lich-hop';
import { CalendarPage } from '../pages/lich-hop/calendar';
import { ListLHPage } from '../pages/lich-hop/list'
import { ChiTietPage } from '../pages/lich-hop/chitiet';
import { ThongbaoPage } from '../pages/thongbao/thongbao';
import { CongViecPage } from '../pages/cong-viec/cong-viec';
import { CalendarCVPage } from '../pages/cong-viec/cv-calendar';
import { ListCVPage } from '../pages/cong-viec/cv-list';
import { ChiTietCVPage } from '../pages/cong-viec/chitiet-cv';
import { DonXinNghiPage } from '../pages/don-xin-nghi/don-xin-nghi';
import { DuyetDonPage } from '../pages/don-xin-nghi/duyet-don';
import { ListDonPage } from '../pages/don-xin-nghi/list-don';
import { ChiTietDonPage } from '../pages/don-xin-nghi/chitiet-don';
import { ListCTPage } from '../pages/di-cong-tac/list-cong-tac';
import { ChiTietCTPage } from '../pages/di-cong-tac/chitiet-congtac';
import { LichCaNhanPage } from '../pages/lich-ca-nhan/lich-ca-nhan';
import { ChiTietLCNPage } from '../pages/lich-ca-nhan/chitiet-lcn';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {MessagePage} from "../pages/message/message";
import {DetailMessagePage} from "../pages/message/detail-message";
import {CaiDatPage} from "../pages/cai-dat/cai-dat";
import {GroupPage} from "../pages/message/group";
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import {ModalPage} from "../pages/message/modal";


const cloudSettings: CloudSettings = {
  'core': {
    'app_id': 'f47e8eb4'
  },
  'push': {
    'sender_id': '753622093714',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LichHopPage,
    ListLHPage,
    CalendarPage,
    ChiTietPage,
    ThongbaoPage,
    CongViecPage,
    CalendarCVPage,
    ListCVPage,
    ChiTietCVPage,
    DonXinNghiPage,
    DuyetDonPage,
    ListDonPage,
    ChiTietDonPage,
    ListCTPage,
    ChiTietCTPage,
    MessagePage,
    DetailMessagePage,
    LoginPage,
    LichCaNhanPage,
    ChiTietLCNPage,
    CaiDatPage,
    GroupPage,
    ModalPage
  ],
  imports: [
    BrowserModule,
    NgCalendarModule,
    HttpModule,
    IonicModule.forRoot(MyApp,

      {tabsPlacement: 'top',
        tabsHideOnSubPages: true}
    ),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LichHopPage,
    CalendarPage,
    ListLHPage,
    ChiTietPage,
    ThongbaoPage,
    CongViecPage,
    CalendarCVPage,
    ListCVPage,
    ChiTietCVPage,
    DonXinNghiPage,
    DuyetDonPage,
    ListDonPage,
    ChiTietDonPage,
    ListCTPage,
    ChiTietCTPage,
    MessagePage,
    DetailMessagePage,
    LoginPage,
    LichCaNhanPage,
    ChiTietLCNPage,
    CaiDatPage,
    GroupPage,
    ModalPage
  ],
  providers: [
    AppServices,
    Auth,
    StatusBar,
    SplashScreen,
    CallNumber,
    GooglePlus,
    LocalNotifications,
    SocketClientService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: LOCALE_ID, useValue: 'vi-VN' }
  ]
})
export class AppModule {}
