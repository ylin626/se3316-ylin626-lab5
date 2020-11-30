import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SearchComponent } from '../search/search.component';
@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.scss']
})
export class HeadComponent implements OnInit {
 

  isLogin = false;
  userName="";
  constructor(private http:HttpClient) {
    this.userName = window.localStorage.getItem("userName")?window.localStorage.getItem("userName"):"Visitor";
    if (window.localStorage.getItem("isLogin") == "true") {
      this.isLogin = true;
    } else {
      this.isLogin = false;
    }
  }

  ngOnInit(): void {
  }
  logout(){
    window.localStorage.removeItem("isLogin");
    window.localStorage.removeItem("userName");
    this.isLogin=false;
    this.userName="Visitor";
  }
  
}
