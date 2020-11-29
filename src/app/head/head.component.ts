import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.scss']
})
export class HeadComponent implements OnInit {
  //add catalog
  addCLdata={
    catalog_nbr:"",
    className:"",
    catalog_description:"",
    subject:"ACTURSCI",
    createUser:window.localStorage.getItem("userEmail")
  }

  //http Header
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
  };

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
    this.userName="Visitor";
  }
  addCatalog(){
    if (this.addCLdata.catalog_nbr == "" ||
      this.addCLdata.className == "" ||
      this.addCLdata.catalog_description == "") {
      alert("The first three items cannot be empty.")
    } else {
      if (this.addCLdata.catalog_nbr.length < 4) {
        alert("The Class Nbr cannot less than 4 chars.")
      } else {
        this.http.post("http://127.0.0.1:3000/user/addCatalog",this.addCLdata , this.httpOptions).subscribe((res: any) => {
          alert(res.text);
          window.location.reload();
        })
      }
    }
  }

}
