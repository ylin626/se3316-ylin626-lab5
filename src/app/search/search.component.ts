import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  //http Header
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
  };

  //search by keyword
  keyword = "";

  //find by
  designation = "";
  subject = "";
  days = [{ name: "Mon", value: "M", isChecked: true },
  { name: "Tue", value: "Tu", isChecked: true },
  { name: "Wed", value: "W", isChecked: true },
  { name: "Thu", value: "Th", isChecked: true },
  { name: "Fri", value: "F", isChecked: true }
  ];
  s_time = "";
  e_time = "";
  component = "";
  locationCode = "";

  //data in html
  list = [];

  //judge User Login 
  isLogin = false;

  //addClass
  c_id = "";
  addCdata = {
    class_nbr: "",
    class_section: "",
    facility_ID: "",
    descrlong: "",
    descr: "",
    days: [],
    start_time: "8:00 am",
    end_time: "9:30 am",
    ssr_component: "LEC",
    enrl_stat: "Not Full",
    campus: "Main"
  }
  inputdays = [{ name: "Mon", value: "M", isChecked: true },
  { name: "Tue", value: "Tu", isChecked: true },
  { name: "Wed", value: "W", isChecked: true },
  { name: "Thu", value: "Th", isChecked: true },
  { name: "Fri", value: "F", isChecked: true }
  ];






  constructor(private http: HttpClient, private firebaseAuth: AngularFireAuth) {
    this.getAll();
    if (window.localStorage.getItem("isLogin") == "true") {
      this.isLogin = true;
    } else {
      this.isLogin = false;
    }
  }

  getAll(){
    this.http.get("http://127.0.0.1:3000/visitor/all").subscribe((res: any) => {
      this.list = res.data;
    })
  }

  ngOnInit(): void {

  }
  submit() {
    var dayS = [];
    for (var i = 0; i < this.days.length; i++) {
      if (this.days[i].isChecked) {
        dayS.push(this.days[i].value);
      }
    }
    this.http.post("http://127.0.0.1:3000/visitor/findinfo", {
      "subject": this.subject,
      "designation": this.designation,
      "component": this.component,
      "s_time": this.s_time,
      "e_time": this.e_time,
      "days": dayS,
      "locationCode": this.locationCode
    }, this.httpOptions).subscribe((res: any) => {
      this.list = res.data;
    })
  }
  search() {
    while (this.keyword.indexOf(" ") != -1) {
      this.keyword = this.keyword.replace(" ", "");
    }
    if (this.keyword.length < 4) {
      alert("The key must longer then 4 chars!")
    } else {
      this.http.post("http://127.0.0.1:3000/visitor/findbykeyword", { "keyword": this.keyword }, this.httpOptions).subscribe((res: any) => {
        this.list = res.data;
      })
    }
  }

  getMyCatalog(){
    this.http.post("http://127.0.0.1:3000/user/myCatalog",{"user":window.localStorage.getItem("userEmail")} , this.httpOptions).subscribe((res: any) => {
        this.list=res.data;
      })
  }

  addClass() {
    if (this.addCdata.class_nbr == "" ||
      this.addCdata.class_section == "" ||
      this.addCdata.facility_ID == "") {
      alert("The first three items cannot be empty.")
    } else {
      if (this.addCdata.class_nbr.length < 4) {
        alert("The Class Nbr cannot less than 4 chars.")
      } else {
        var dayS = [];
        for (var i = 0; i < this.inputdays.length; i++) {
          if (this.inputdays[i].isChecked) {
            dayS.push(this.inputdays[i].value);
          }
        }
        this.addCdata.days = dayS;
        this.http.post("http://127.0.0.1:3000/user/addClass", { "id": this.c_id, "data": this.addCdata }, this.httpOptions).subscribe((res: any) => {
          alert(res.text);
          window.location.reload();
        })
      }
    }


  }
  delClass(id,key){
    this.http.post("http://127.0.0.1:3000/user/delClass", { "id": id, "user":window.localStorage.getItem("userEmail"),"key":key }, this.httpOptions).subscribe((res: any) => {
          alert(res.text);
          window.location.reload();
      })
  }


  delCatalog(id){
    this.http.post("http://127.0.0.1:3000/user/delCatalog", { "id": id, "user":window.localStorage.getItem("userEmail") }, this.httpOptions).subscribe((res: any) => {
          alert(res.text);
          window.location.reload();
      })
  }

  isDayHave(day, days) {
    for (var i = 0; i < days.length; i++) {
      if (day == days[i]) {
        return true;
      }
    }
    return false;
  }
  isCreateUser(creatUser) {
    if (creatUser == window.localStorage.getItem("userEmail") && this.isLogin) {
      return true;
    } else {
      return false;
    }
  }
  nowClassID(id) {
    this.c_id = id;
  }

}
