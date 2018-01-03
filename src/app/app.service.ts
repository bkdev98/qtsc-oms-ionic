import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import {Push, PushToken} from '@ionic/cloud-angular';
import 'rxjs/Rx';

@Injectable()

export class AppServices{
  private opt: any;
  public user_info: any;
  public ioToken:string;
  // API Data
  // api_url = "http://210.2.92.136/api/";
  api_url = "https://omsmobile.qtsc.com.vn/api/";
  //api_url = "http://120.72.85.132:9035/api/";
  token:any;
  private ioNotification_url: string = 'http://api.ionic.io/';
  private authorization:string = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTY1NzRlYS1kMDc3LTQ1MmEtODU2NS03NDQ5NWNmYzVjMDcifQ.BohgBKz4pl4rpKQKawkF2xG3HMscPUuxvlbegCD_3JI';

  constructor(
    // private _cookie: CookieService,
    private _http: Http,
    public storage: Storage,
    public push: Push){
    this.setHeaders();
  }

  async setHeaders(token?) {
    let headers;
    if (token) {
      headers = new Headers({
        'Content-Type': 'application/json',
        'long-key': token,
      })
    } else {
      await this.storage.get('token').then(val => {
        this.token = val;
        if (val) {
          headers = new Headers({
            'Content-Type': 'application/json',
            'long-key': val,
          })
        } else {
          headers = new Headers({
            'Content-Type': 'application/json'
          })
        }
      });
    }
    this.opt = new RequestOptions({headers: headers});
  }

  private processURL(path, options?){
    let url_str = this.api_url + path;

    if(options){
      if(options.id){
        url_str += '/'+ options.id;
      }
      if(options.subpath){
        url_str += '/' + options.subpath;
      }
      if(options.params){
        let count = 1;
        for(let i in options.params){
          if(count === 1){
            url_str += '?' + i + '=' + options.params[i];
          }
          if(count > 1 && count < Object.keys(options.params).length){
            url_str += '&' + i + '=' + options.params[i];
          }
          if(count > 1 && count === Object.keys(options.params).length){
            url_str += '&' + i + '=' + options.params[i];
          }
          count++;
        }
      }
    }
    return url_str
  }

  handleError(error: Response){
    let that = this;
    console.log(error);
    if(error.status === 0 && error.statusText === ''){
      console.log(error);
    }
    if(error.status == 500) {
      console.log(error);
    }
    if(error.status === 502) {
      console.log(error);
    }
    if(error.status == 404) {

      console.log(error);
    }
    if(error.status == 401) {
      // setTimeout(function () {
      //   this.storage.ready().then( () => {
      //     this.storage.clear().then(() => {
      //       window.location.reload(true);
      //     })
      //   })
      // },500)

    }
    return Observable.throw(error );
  }

  get(path, options?: {id?, subpath?, headers?, params?: {}}) : Observable<any>{
    let url = this.processURL(path, options);
    this.setHeaders();
    return this._http.get(url, this.opt)
      .map(res => res.json())
      .catch(this.handleError);
  }

  patch(path, obj, options?: {id?, subpath?, headers?}){
    let data = JSON.stringify(obj);
    let url = this.processURL(path, options);
    this.setHeaders();
    return this._http.patch(url, data, this.opt)
      .map(res => res.json())
      .catch(this.handleError);
  }

  post(path, obj, options?: {id?, subpath?, headers?, params?: {}}){
    let url = this.processURL(path, options);
    this.setHeaders();
    let data = JSON.stringify(obj);
    return this._http.post(url, data, this.opt)
      .map(res => res.json())
      .catch(this.handleError);
  }

  // postSPEC(path, obj, options?: {id?, subpath?, headers?, params?: {}}){
  //   let url = this.processURL(path, options);
  //   this.setHeaders();
  //   let data = JSON.stringify(obj);
  //   return this._http.post(path, data, this.opt)
  //     .map(res => res)
  //     .catch(this.handleError);
  // }

  put(path, obj, options?: {id?, subpath?, headers?}){
    let url = this.processURL(path, options);
    this.setHeaders();
    let data = JSON.stringify(obj);
    return this._http.put(url, data, this.opt)

      .map(res => res.json())
      .catch(this.handleError);
  }

  remove(path, options?: {id?, subpath?, headers?, params?: {}}){
    let url = this.processURL(path, options);
    this.setHeaders();
    return this._http.delete(url, this.opt)
      .map(res => res)
      .catch(this.handleError);
  }

  getInfo(msnv){
    this.storage.get('token').then(val => {
      console.log(val);
      let header = new Headers({'long-key': val, 'Content-Type': 'application/json'});
      this._http.get(this.api_url+'NhanVien/GetInformation?MSNV='+msnv, {headers: header})
        .map(data => data.json())
        .subscribe(data => {
          console.log(data);
          this.user_info = data;
        }, error => {
          console.log(error);
        })
    })
  }

  sendNotifications(token,title, message){
    let that = this;
    let headers = new Headers({'Content-Type': 'application/json','Authorization': that.authorization});
    let optionRequest = new RequestOptions({headers: headers});

    let data = {
      tokens: token,
      profile: 'testpush',
      notification: {
        message: message,
        title: title
      }
    };

    // alert(JSON.stringify(data));

    that._http.post(that.ioNotification_url+'push/notifications', data, optionRequest)
      .map(res => res.json())
      .subscribe(
        data => {
          console.log(data);
        }, error2 => {
          console.log(JSON.stringify(error2))
        }
      )
  }

  registerIoToken(){
    this.push.register().then((t: PushToken) => {
      return this.push.saveToken(t);
    }).then((t: PushToken) => {
      console.log('Token saved:', t.token);
      this.storage.set('DEVICE_TOKEN', t.token);
      this.ioToken = t.token;
    });
  }

}
