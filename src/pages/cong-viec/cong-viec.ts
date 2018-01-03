import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, Nav } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ThongbaoPage } from '../thongbao/thongbao'
import { ListCVPage } from './cv-list';
import { CalendarCVPage } from './cv-calendar'
import { AppServices } from '../../app/app.service'

@Component({
	selector: 'congviec',
	templateUrl: 'cong-viec.html'
})
export class CongViecPage {
	notifications = [];

	tab1Root = CalendarCVPage;
	tab2Root = ListCVPage;
	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		public service: AppServices,
		private localNotifications: LocalNotifications,
		public platform: Platform,
		public nav: Nav) {
	}
}