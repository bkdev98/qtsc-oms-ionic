import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, App, AlertController, Platform } from 'ionic-angular';
import { CalendarComponent } from "ionic2-calendar/calendar";
import { LocalNotifications } from '@ionic-native/local-notifications';
import * as moment from 'moment';

import { ChiTietCVPage } from './chitiet-cv'
import { AppServices } from '../../app/app.service';
import { Auth } from '../../service/auth.service'

@Component({
	selector: 'cv-calendar',
	templateUrl: 'calendar.html'
})
export class CalendarCVPage {
	@ViewChild(CalendarComponent) cvCalendar:CalendarComponent;
	lich_hop;
	title_lich: string = "";
	id_nhanvien = this.auth.id_nhanvien;
	current_date = new Date();
	loader;
	myDate = moment().format();
	is_gotoDate = false;

	isToday:boolean;
	cvcalendar = {
		mode: 'month',
		queryMode: 'local',
		currentDate: new Date(),
		dateFormatter: {
			formatMonthViewDay: function(date:Date) {
				return date.getDate().toString();
			},
			formatMonthViewDayHeader: function(date:Date) {
				var day = date.getDay();
				var nameDay = ['CN', 'HAI', 'BA', 'TƯ', 'NĂM', 'SÁU', 'BẢY'];
				return nameDay[day]
			},
			formatMonthViewTitle: function(date:Date) {
				let month;
				let m = date.getMonth()+1;
				if(m<10){
					month = '0'+m
				} else {
					month = m
				}
				return (month + "-" + date.getFullYear().toString());
			}
		}
	};

	constructor(public navCtrl: NavController,
		private service: AppServices,
		public alertCtrl: AlertController,
		public toastCtrl: ToastController,
		private app: App,
		public auth: Auth,
		private localNotifications: LocalNotifications,
		public platform: Platform,
		) {}

	ionViewDidEnter(){
		this.getCongviec();
	}

	onViewTitleChanged(title) {
		this.title_lich = title;
		console.log(title);
		let month = title.split('-')[0]
		let year = title.split('-')[1]
		this.myDate = moment(month+'-'+year, 'MM-YYYY', 'vi').format()
		// if(this.id_nhanvien != ''){
			// this.getCongviec()
			// 	this.getLichHopThang(this.id_nhanvien, month, year, '0;1;2;3;4;5')
			// }
			// console.log(this.lich_hop);
			// this.updateTitle(title)
		}

		tapIonDate(){
			this.is_gotoDate = true
		}

		changeData(){
			if(this.is_gotoDate){
				this.cvcalendar.currentDate = new Date(this.myDate)
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
			var today = new Date();
			today.setHours(0, 0, 0, 0);
			event.setHours(0, 0, 0, 0);
			this.isToday = today.getTime() === event.getTime();
		}

		onRangeChanged(ev) {
			this.is_gotoDate = false;
		}

		markDisabled = (date:Date) => {
			var current = new Date();
			current.setHours(0, 0, 0);
			return date < current;
		};

		getCongviec(){
			var endTime = new Date(Date.UTC(2014, 4, 9));
			console.log(endTime);
			this.showToast();
			this.lich_hop = [];
			this.service.get('CongViec/GetCongViec', {params: {'MSNV': this.id_nhanvien}})
			.subscribe(data => {
				let that = this
				data.forEach(function(item){
					if(that.platform.is('cordova')){
          that.localNotifications.isPresent(item.Id).then(val => {
            if(!val){
              let time = moment(item.NgayBatDau).subtract(30, 'm').toDate()
              if(moment().isBefore(time)){
                that.localNotifications.schedule({
                  id: item.Id,
                  title: item.CongViec,
                  at: time,
                  led: 'FF0000'
                })
              }
            }
          })
        }
					let delta = moment(item.HanHoanThanh).diff(item.NgayBatDau, 'd')
					if(delta > 0){
						for(let i = 0; i <= delta; i++){
							let obj = {
								title: item.CongViec,
								startTime: new Date(moment(item.NgayBatDau).add(i, 'd').format()),
								endTime: new Date(moment(item.NgayBatDau).hours(23).minutes(59).add(i, 'd').format()),
								noidung: item.NoiDungCongViec,
								ng_dexuat: item.NguoiDeXuat,
								ng_duyet: item.NguoiDuyet,
								ng_trachnhiem: item.NguoiTrachNhiem,
								role: item.Role,
								duyet: item.isDuyet,
								giahan: item.isGiaHan,
								xinhuy: item.isXinHuy,
								danhgia: item.isDanhGia,
								yc_giahan: item.isYeuCauGiaHan,
								yc_xinhuy: item.isYeuCauXinHuy,
								yc_danhgia: item.isYeuCauDanhGia,
								batdau: new Date(item.NgayBatDau),
								ketthuc: new Date(item.HanHoanThanh),
							}
							if(item.TrangThai == 'Mới khởi tạo' || item.TrangThai ==='Chờ duyệt'){
								obj['color'] = 0
							}
							if(item.TrangThai == 'Đã duyệt'){
								obj['color'] = 2
							}
							if(item.TrangThai == 'từ chối' || item.TrangThai ==='Hủy' || item.TrangThai =='Hoàn tất'){
								obj['color'] = 3
							}
							that.lich_hop.push(obj)
						}
					} else {
						let obj = {
							title: item.CongViec,
							startTime: new Date(item.NgayBatDau),
							endTime: new Date(item.HanHoanThanh),
							noidung: item.NoiDungCongViec,
							ng_dexuat: item.NguoiDeXuat,
							ng_duyet: item.NguoiDuyet,
							ng_trachnhiem: item.NguoiTrachNhiem,
							role: item.Role,
							duyet: item.isDuyet,
							giahan: item.isGiaHan,
							xinhuy: item.isXinHuy,
							danhgia: item.isDanhGia,
							yc_giahan: item.isYeuCauGiaHan,
							yc_xinhuy: item.isYeuCauXinHuy,
							yc_danhgia: item.isYeuCauDanhGia,
						}
						if(item.TrangThai == 'Mới khởi tạo' || item.TrangThai ==='Chờ duyệt'){
							obj['color'] = 0
						}
						if(item.TrangThai == 'Đã duyệt'){
							obj['color'] = 2
						}
						if(item.TrangThai == 'từ chối' || item.TrangThai ==='Hủy' || item.TrangThai =='Hoàn tất'){
							obj['color'] = 3
						}
						that.lich_hop.push(obj)
					}
				})
			},
			error => {
			},
			() => {
				this.cvCalendar.loadEvents()
			})
		}

		// getLichHopThang(id, month, year, flag){
			// 	let loader = this.loadingCtr.create({
				//      content: "Đang tải...",
				//    });
				// 	loader.present()
				// 	this.lich_hop = []
				// 	this.service.get('LichHop/GetLichHop', {id: id, params: {'month1': month, 'year1': year, flag: flag}})
				// 	.subscribe(data =>{
					// 		let that = this
					// 		data.forEach(function(item){
						// 			let obj = {
							// 				title: item.Name,
							// 				id: item.ID,
							// 				location: item.DiaDiem,
							// 				startTime: new Date(item.BatDau),
							// 				endTime: new Date(item.KetThuc),
							// 			}
							// 			if(item.TrangThai == 'Mới khởi tạo' || item.TrangThai ==='Chờ duyệt'){
								// 				obj['color'] = 0
								// 			}
								// 			if(item.TrangThai == 'Đã duyệt'){
									// 				obj['color'] = 2
									// 			}
									// 			if(item.TrangThai == 'từ chối' || item.TrangThai ==='Hủy' || item.TrangThai =='Hoàn tất'){
										// 				obj['color'] = 3
										// 			}
										// 			that.lich_hop.push(obj)
										// 		})
										// 		loader.dismiss();
										// 	},
										// 	error => {
											// 		console.log(error);
											// 		loader.dismiss();
											// 	},
											// 	() => {this.myCalendar.loadEvents()})
											// }

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
												this.navCtrl.push(ChiTietCVPage, {
													cv: item
												});
											}

											agree(item){
												let obj = {
													Id: item.id,
													Status: '2'
												}
												this.service.post('CongViec/PostDuyetCongViec', obj, {params: {'MSNV': this.id_nhanvien}})
												.subscribe(data => {
													let alert = this.alertCtrl.create({
														title: 'Duyệt thành công!',
														buttons: ['OK']
													});
													alert.present();
													// this.getLichHopThang(this.id_nhanvien, 4, this.current_date.getFullYear(), "0;1;2;3;4;5")
												},
												error => {
													let alert = this.alertCtrl.create({
														title: 'Lỗi!',
														buttons: ['OK']
													});
													alert.present();
												})
											}

											delete(item){
												let obj = {
													Id: item.id,
													Status: '4'
												}
												this.service.post('CongViec/PostDuyetCongViec', obj, {params: {'MSNV': this.id_nhanvien}})
												.subscribe(data => {
													let alert = this.alertCtrl.create({
														title: 'Hủy thành công!',
														buttons: ['OK']
													});
													alert.present();
													// this.getLichHopThang(this.id_nhanvien, 4, this.current_date.getFullYear(), "0;1;2;3;4;5")
												},
												error => {
													let alert = this.alertCtrl.create({
														title: 'Lỗi!',
														buttons: ['OK']
													});
													alert.present();
												})
											}

											showToast() {
												const toast = this.toastCtrl.create({
													message: 'Đang tải...',
													duration: 1000,
													position: 'bottom',
												});
												toast.present()
											}
										}
