import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';


@Injectable()
export class Auth {
  public id_nhanvien: string;
  constructor(public storage: Storage){
    this.storage.get('MSNV').then((val) => {
      if(val){
        this.id_nhanvien = val;
      }
    })
  }
}
