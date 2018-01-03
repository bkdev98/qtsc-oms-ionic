import { Component } from '@angular/core';
import { NavParams, ViewController} from "ionic-angular"
import {AppServices} from "../../app/app.service";
import {Auth} from "../../service/auth.service";
import {templateJitUrl} from "@angular/compiler";

@Component({
  templateUrl: 'modal.html'
})
export class ModalPage {
  myParam: string;
  users: Array<any> = [];
  temp: Array<any> = [];
  userSelected: Array<any> = [];
  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public service: AppServices,
    public auth: Auth) {
    if(params.get('data')){
      this.userSelected = params.get('data');
    }
  }

  ionViewDidEnter(){
    this.getAllUser();
  }

  dismiss(type?) {
    if(type && type === "cancel") {
      if(this.params.get('data')){
        this.userSelected = this.params.get('data');
      } else {
        this.userSelected = [];
      }
    }
    this.viewCtrl.dismiss(this.userSelected);
  }

  getAllUser(){
    let that = this;
    this.service.get("NhanVien/GetNhanVien?MSNV="+this.auth.id_nhanvien)
      .subscribe(
        data => {
          that.users = data;
          that.temp = data;
          console.log(this.service.user_info['ID_'].toString());
          if(that.params.get('data')){
            data.forEach(function (user) {
              user.checked = false;
              user.disabled = false;
              that.params.get('data').forEach(function (res) {
                if(user.msnv === res.msnv){
                  user.checked = true;
                  user.disabled = true;
                }
              })
            })
          }
        }
      )
  }

  getItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;
    console.log(val);

    // // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      //filter users
      this.users = this.users.filter((item) => {
        return (item.HoVaTen.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.getAllUser();
    }
  }

  updateUserSelected(user){
    if(this.userSelected.indexOf(user)>=0){
      this.userSelected.splice(this.userSelected.indexOf(user),1);
    } else {
      delete user.checked;
      delete user.disabled;
      this.userSelected.push(user);
    }
    console.log(this.userSelected);
  }

}
