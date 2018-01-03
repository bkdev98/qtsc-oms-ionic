import { Injectable } from '@angular/core';

declare var io: any;

@Injectable()
export class SocketClientService {
  public socket_url = "https://omsmobile.qtsc.com.vn:4000";
  //public socket_url = "http://120.72.85.132:4000";
  // socket_url = "http://localhost:4000";
  public socket;
  constructor(){}

  connect(){
    this.socket = io.connect(this.socket_url, {reconnection:false});
    console.log('socket connected...');
  }

  joinRoom(data){
    console.log('joined to room '+ data.roomId);
    this.socket.emit('room', data);
  }

  Socket(){
    return this.socket;
  }

  event(event, data){
    this.socket.emit(event, data);
  }

  clientDisconnect(){
    this.socket.emit('client disconnect');
    console.log('socket disconnected...');

  }

}
