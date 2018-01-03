import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, Nav } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ThongbaoPage } from '../thongbao/thongbao'
import { ListLHPage } from './list';
import { CalendarPage } from './calendar'
import { AppServices } from '../../app/app.service'

@Component({
	selector: 'lich-hop',
	templateUrl: 'lich-hop.html'
})
export class LichHopPage {
	notifications = [];

	tab1Root = CalendarPage;
	tab2Root = ListLHPage;
	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		public service: AppServices,
		private localNotifications: LocalNotifications,
		public platform: Platform,
		public nav: Nav) {
	}
}