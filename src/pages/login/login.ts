import { Component } from "@angular/core";
import { Http, Headers, RequestOptions } from '@angular/http';
import {NavController, ToastController, AlertController, MenuController, Events} from "ionic-angular";
import { Storage } from '@ionic/storage';

import { AppServices } from '../../app/app.service';
import { LichHopPage } from "../lich-hop/lich-hop";
import { FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { Auth } from '../../service/auth.service'
import {SocketClientService} from "../../app/socketio/client";

@Component({
  selector: 'login-page',
  templateUrl: 'login.html',
  styleUrls: ['/login.scss']
})
export class LoginPage {
  loginForm: FormGroup;
  error: string;
  email: AbstractControl;
  password: AbstractControl;
  btn_dis: boolean = false;
  API = "https://omsmobile.qtsc.com.vn/api/Accounts/Login/";
  //API = "http://210.2.92.136:8001/api/Accounts/Login/";
  API2 = "http://120.72.85.132:9069/api/test/Login";
  ioToken:string;
  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public service: AppServices,
    public storage: Storage,
    public toastCtrl: ToastController,
    public http: Http,
    public auth: Auth,
    public events: Events,
    public chat: SocketClientService){
    this.menuCtrl.swipeEnable(false);
    this.loginForm = fb.group({
      Username: ['', Validators.required],
      Password: ['', Validators.required]
    });
    let that = this;
    this.chat.connect();
  }

  signin(form: any) {
      let that = this;
    this.btn_dis = true;
    this.showToast('Đang đăng nhập...');
    let obj = {
      "Username": form.Username,
      "Password": form.Password
    };
    let headers = new Headers({
      'Content-Type': 'application/json'
    });
    let opt = new RequestOptions({ headers: headers });
    this.http.post(this.API, obj).map(res => res.json())
    .subscribe(data => {
      console.log(data);
      this.btn_dis = false;
      if(data["Susscess"]){
        this.storage.set('token', data.Token);
        this.storage.set('MSNV', data.MSNV);
        this.auth.id_nhanvien = data.MSNV;
        setTimeout(() => {
          this.service.setHeaders(data.Token);
          this.events.publish('menu:duyetdon', data.MSNV);

        // this.service.getInfo(data.MSNV);
        this.service.get('NhanVien/GetInformation?MSNV='+data.MSNV)
          .subscribe(res => {
            console.log(res);
            that.service.setHeaders(data.Token);
            that.service.user_info = res;
            that.chat.event('save io token', {
              token: that.service.ioToken, msnv: res.ID_
            });
            that.navCtrl.setRoot(LichHopPage).then(function () {
              that.chat.clientDisconnect();
            })
            // that.app.getRootNav().setRoot(LichHopPage);
            // window.location.reload();
          }, error => {
            console.log(error);
            console.log("loi 111")
          })
        }, 1000)
        console.log("loi 11")
      }
      else {
      console.log("loi 1111")
        this.showToast('Đăng nhập thất bại', 2500);
      }
    }, error => {
      this.btn_dis = false;
      console.log(error)
      this.showToast('Đăng nhập thất bại', 2500);
    })
  }

  showToast(msg, dur=1500) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: dur,
      position: 'bottom',
    });
    toast.present();
  }
}
