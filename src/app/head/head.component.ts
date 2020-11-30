import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SearchComponent } from '../search/search.component';
import { JwtHelperService } from "@auth0/angular-jwt";
@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.scss']
})
export class HeadComponent implements OnInit {
 

  isLogin = false;
  userName="";
  constructor(private http:HttpClient,private jwt:JwtHelperService) {
    this.userName = this.jwt.decodeToken(window.localStorage.getItem("token")).name?this.jwt.decodeToken(window.localStorage.getItem("token")).name:"Visitor";
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
    window.localStorage.removeItem("token");
    this.isLogin=false;
    this.userName="Visitor";
  }
  
}
