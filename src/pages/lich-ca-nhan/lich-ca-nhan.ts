import { Component, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, ToastController, AlertController } from 'ionic-angular';
import { CalendarComponent } from "ionic2-calendar/calendar";
import { GooglePlus } from '@ionic-native/google-plus';
import { Storage } from '@ionic/storage';

import * as moment from 'moment';

import { ChiTietLCNPage } from './chitiet-lcn'
import { AppServices } from '../../app/app.service';

@Component({
	selector: 'lich-ca-nhan',
	templateUrl: 'lich-ca-nhan.html'
})
export class LichCaNhanPage {
	@ViewChild(CalendarComponent) ggCalendar:CalendarComponent;
	events_google: Array<any> = [];
	lich_hop;
	title_lich: string = "";
	current_date = new Date();
	loader;
	ion_Date = moment().format();
	is_gotoDate = false;
	data_gg = {};
	token = '';
	API_GG = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

	isToday:boolean;
	calendar = {
		mode: 'month',
		queryMode: 'local',
		currentDate: new Date(),
		dateFormatter: {
			formatMonthViewDay: function(date:Date) {
				return date.getDate().toString();
			},
			formatMonthViewDayHeader: function(date:Date) {
				let day = date.getDay();
				let nameDay = ['CN', 'HAI', 'BA', 'TƯ', 'NĂM', 'SÁU', 'BẢY'];
				return nameDay[day]
			},
			formatMonthViewTitle: function(date:Date) {
				let month;
        if(date.getMonth()+1<10){
          month = '0'+(date.getMonth()+1)
        } else {
          month = (date.getMonth()+1)
        }
        return (month + "-" + date.getFullYear().toString());
			}
		}
	};

	constructor(public navCtrl: NavController,
		private service: AppServices,
		public alertCtrl: AlertController,
		public toastCtrl: ToastController,
		private googlePlus: GooglePlus,
		private storage: Storage,
		private http: Http) {

	}

	ionViewDidEnter(){
		this.googleLogin();
	}

	googleLogin(){
		this.showToast('Đang tải...');
		this.googlePlus.login({
			'scopes': 'https://www.googleapis.com/auth/calendar.readonly'
		})
		.then(res => {
			this.token = res.accessToken;
			this.data_gg = res;
			this.getList();
		})
		.catch(
			err => console.log(err)
			);
	}

	onViewTitleChanged(title) {
		this.title_lich = title;
		this.ion_Date = moment(title,'MM-YYYY', 'vi').format()
	}

	tapIonDate(){
		this.is_gotoDate = true
	}

	changeData(){
		if(this.is_gotoDate){
			this.calendar.currentDate = new Date(this.ion_Date)
		}
	}

	onEventSelected(event) {
		console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
	}

	onTimeSelected(ev) {
		console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
			(ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
	}

	onCurrentDateChanged(event:Date) {
		let today = new Date();
		today.setHours(0, 0, 0, 0);
		event.setHours(0, 0, 0, 0);
		this.isToday = today.getTime() === event.getTime();
	}

	onRangeChanged(ev) {
		this.is_gotoDate = false;
	}

	markDisabled = (date:Date) => {
		let current = new Date();
		current.setHours(0, 0, 0);
		return date < current;
	};


	getList(){
		let url = `${this.API_GG}?access_token=${this.token}`
		this.http.get(url)
		.map(res => res.json())
		.subscribe(data => {
			this.events_google = [];
			data.items.forEach((item) =>{
				let endtime;
				let starttime;
				if(item.end.dateTime){
					endtime = item.end.dateTime
				} else {
					endtime = item.end.date
				}
				if(item.start.dateTime){
					starttime = item.start.dateTime
				} else {
					starttime = item.start.date
				}
				let obj = {
					endTime: new Date(endtime),
					startTime: new Date(starttime),
					title: item.summary,
					// status: item.status,
					location: item.location,
					description: item.description,
					// detail_link: item.htmlLink,
					// source: 'google'
				};
				this.events_google.push(obj)
			})
		},
		error => {
			console.log(error);
		},
		() => {this.ggCalendar.loadEvents()})
	}


	showAlertError(msg) {
		let alert = this.alertCtrl.create({
			title: 'Error!',
			subTitle: msg,
			buttons: ['OK']
		});
		alert.present();
	}

	selectDate(){
		console.log('oke');
	}

	detail(item){
		this.navCtrl.push(ChiTietLCNPage, {
			cv: item
		});
	}

	// refresh(){
	// 	this.storage.remove('gg')
	// 	this.googleLogin()
	// }

	showToast(msg) {
		const toast = this.toastCtrl.create({
			message: msg,
			duration: 1000,
			position: 'bottom',
		});
		toast.present()
	}
}
