import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, ToastController, AlertController, Platform} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {LocalNotifications} from '@ionic-native/local-notifications';
import {CalendarComponent} from "ionic2-calendar/calendar";
import * as moment from 'moment';

import {ChiTietPage} from './chitiet'
import {AppServices} from '../../app/app.service';
import {Auth} from '../../service/auth.service'

@Component({
  selector: 'calendar-page',
  templateUrl: 'calendar.html'
})
export class CalendarPage {
  @ViewChild(CalendarComponent) myCalendar: CalendarComponent;
  lich_hop: Array<any> = [];
  title_lich: string = "";
  current_date = new Date();
  flag = '0;1;2;3;4;5';
  loader;
  ion_Date = moment().format();
  is_gotoDate = false;

  isToday: boolean;
  calendar = {
    mode: 'month',
    queryMode: 'remote',
    currentDate: new Date(),
    dateFormatter: {
      formatMonthViewDay: function (date: Date) {
        return date.getDate().toString();
      },
      formatMonthViewDayHeader: function (date: Date) {
        var day = date.getDay();
        var nameDay = ['CN', 'HAI', 'BA', 'TƯ', 'NĂM', 'SÁU', 'BẢY'];
        return nameDay[day]
      },
      formatMonthViewTitle: function (date: Date) {
        console.log(date);
        let month;
        let that = this;
        if (date.getMonth() + 1 < 10) {
          month = '0' + (date.getMonth() + 1)
        } else {
          month = (date.getMonth() + 1)
        }
        return (month + "-" + date.getFullYear().toString());
      }
    }
  };

  constructor(public navCtrl: NavController,
              private service: AppServices,
              public alertCtrl: AlertController,
              public auth: Auth,
              public storage: Storage,
              public toastCtrl: ToastController,
              private localNotifications: LocalNotifications,
              public platform: Platform,) {
  }

  ionViewDidEnter() {
    // check value title of calendar
    if (this.title_lich == "") {
      let month = this.current_date.getMonth() + 1
      let year = this.current_date.getFullYear()
      this.getLichHopThang(this.auth.id_nhanvien, month, year, this.flag)
    } else {
      let month = this.title_lich.split('-')[0]
      let year = this.title_lich.split('-')[1]
      this.getLichHopThang(this.auth.id_nhanvien, month, year, this.flag)
    }
  }

  onViewTitleChanged(title) {
    this.title_lich = title;
    let month = title.split('-')[0]
    let year = title.split('-')[1]
    this.ion_Date = moment(title, 'MM-YYYY', 'vi').format()
    this.getLichHopThang(this.auth.id_nhanvien, month, year, '0;1;2;3;4;5')
  }


  tapIonDate() {
    this.is_gotoDate = true
  }

  changeData() {
    if (this.is_gotoDate) {
      this.calendar.currentDate = new Date(this.ion_Date)
    }
  }


  onEventSelected(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
    console.log(event);
  }

  onTimeSelected(ev) {
    // console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
    // (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
  }

  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }

  onRangeChanged(ev) {
    this.is_gotoDate = false;
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }

  markDisabled = (date: Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    return date < current;
  };

  getLichHopThang(id, month, year, flag) {
    this.showToast();
    this.lich_hop = new Array<any>();
    // console.log(this.lich_hop);
    let that = this;
    this.service.get('LichHop/GetLichHop', {params: {'MSNV': id, 'month1': month, 'year1': year, flag: flag}})
      .subscribe(data => {
          that.lich_hop = new Array<any>();
          if (data) {
            data.forEach(function (item, index) {
              console.log('index la' + index);
              let obj = {
                title: item.Name,
                id: item.ID,
                location: item.DiaDiem,
                startTime2: moment(item.BatDau,'YYYY-MM-DDTHH:mm:ss').local().format('HH:mm'),
                startTime: new Date(item.BatDau),
                endTime2: moment(item.KetThuc,'YYYY-MM-DDTHH:mm:ss').local().format('HH:mm'),
                endTime: new Date(item.KetThuc),

                role: item.Role
              };
              // alert(new Date(moment(item.BatDau,'YYYY-MM-DDTHH:mm:ss').local().format('YYYY-MM-DD HH:mm')));
              if (item.TrangThai == 'Mới khởi tạo' || item.TrangThai === 'Chưa duyệt') {
                obj['color'] = 0
              }
              if (item.TrangThai == 'Đã duyệt') {
                obj['color'] = 2
              }
              if (item.TrangThai == 'từ chối' || item.TrangThai === 'Hủy' || item.TrangThai == 'Hoàn tất') {
                obj['color'] = 3
              }
              that.lich_hop.push(obj);
              // console.log("lich hop: " + that.lich_hop.length);
              if (that.platform.is('cordova')) {
                that.localNotifications.isPresent(item.ID).then(val => {
                  if (!val) {
                    let time = moment(item.BatDau).subtract(30, 'm').toDate()
                    if (moment().isBefore(time)) {
                      that.localNotifications.schedule({
                        id: item.ID,
                        title: item.Name,
                        at: time,
                        led: 'FF0000'
                      })
                    }
                  }
                })
              }
            });
          }
        },
        error => {
          console.log(error);
        },
        () => {
          this.myCalendar.loadEvents()
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

  selectDate() {
    console.log('oke');
  }

  detail(item) {
    this.navCtrl.push(ChiTietPage, {
      id: item.id, msnv: this.auth.id_nhanvien
    });
  }

  agree(item) {
    let obj = {
      Id: item.id,
      Status: '2'
    }
    this.service.post('LichHop/PostDuyetLichHop', obj, {params: {'MSNV': this.auth.id_nhanvien}})
      .subscribe(data => {
          let alert = this.alertCtrl.create({
            title: 'Duyệt thành công!',
            buttons: ['OK']
          });
          alert.present();
          let month = this.title_lich.split('-')[0]
          let year = this.title_lich.split('-')[1]
          this.getLichHopThang(this.auth.id_nhanvien, month, year, this.flag)
        },
        error => {
          let alert = this.alertCtrl.create({
            title: 'Lỗi!',
            buttons: ['OK']
          });
          alert.present();
        })
  }

  delete(item) {
    let obj = {
      Id: item.id,
      Status: '4'
    }
    this.service.post('LichHop/PostDuyetLichHop', obj, {params: {'MSNV': this.auth.id_nhanvien}})
      .subscribe(data => {
          let alert = this.alertCtrl.create({
            title: 'Hủy thành công!',
            buttons: ['OK']
          });
          alert.present();
          let month = this.title_lich.split('-')[0]
          let year = this.title_lich.split('-')[1]
          this.getLichHopThang(this.auth.id_nhanvien, month, year, this.flag)
        },
        error => {
          let alert = this.alertCtrl.create({
            title: 'Lỗi!',
            buttons: ['OK']
          });
          alert.present();
        })
  }

  refresh() {
    let month = this.title_lich.split('-')[0]
    let year = this.title_lich.split('-')[1]
    let key = month + year;
    this.getLichHopThang(this.auth.id_nhanvien, month, year, this.flag)
  }

  showToast() {
    const toast = this.toastCtrl.create({
      message: 'Đang tải...',
      duration: 1000,
      position: 'bottom',
    });
    toast.present();
  }
}
