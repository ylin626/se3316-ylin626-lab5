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
 dmca ={
  catalog_nbr:"",
  userEmail:"",
  reviewTime:null,
  linkEmail:""
 }
  //http Header
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
  };

  isLogin = false;
  userName="";
  constructor(private http:HttpClient,private jwt:JwtHelperService) {
    if(window.localStorage.getItem("token")){
      this.userName = this.jwt.decodeToken(window.localStorage.getItem("token")).name
    }else{
      this.userName = "Visitor";
    }
   
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
  closeModal(){
    this.dmca ={
      catalog_nbr:"",
      userEmail:"",
      reviewTime:null,
      linkEmail:""
    
     }
  }
  sendDMCA(){
    this.dmca.catalog_nbr= this.filterHTMLTag(this.dmca.catalog_nbr);
    this.dmca.userEmail= this.filterHTMLTag(this.dmca.userEmail);
    this.dmca.linkEmail= this.filterHTMLTag(this.dmca.linkEmail);
    this.http.post("http://127.0.0.1:3000/visitor/sendDmca", this.dmca, this.httpOptions).subscribe((res: any) => {
        alert(res.text);
      })
  }
  filterHTMLTag(msg) {
    var msg = msg.replace(/<\/?[^>]*>/g, ''); //remove HTML 
    msg = msg.replace(/^[\.\#]?\w+[^{]+\{[^}]*\}/g, '');//remove css
    msg = msg.replace(/[|]*\n/, '') //remove " "
    msg = msg.replace(/&npsp;/ig, ''); //remove npsp
    return msg;
  }
  
}
