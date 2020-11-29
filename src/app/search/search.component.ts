import { Component, OnInit } from '@angular/core';
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
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
  };
  keyword = "";
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
  list = [];
  isLogin = false;
  locationCode = "";




  constructor(private http: HttpClient, private firebaseAuth: AngularFireAuth) {
    this.http.get("http://127.0.0.1:3000/visitor/all").subscribe((res: any) => {
      console.log(res.data)
      this.list = res.data;
    })
    if (window.localStorage.getItem("isLogin") == "true") {
      this.isLogin = true;
    } else {
      this.isLogin = false;
    }
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
      console.log("Res:")
      console.log(res)
      this.list = res.data;
    })
  }
  search() {
    if (this.keyword.length < 4) {
      alert("The key must longer then 4 chars!")
    } else {
      this.http.get("http://127.0.0.1:3000/visitor/all").subscribe((res: any) => {
        console.log(res.data)
        this.list = res.data;
      })
    }
  }
  isDayHave(day,days) {
    for (var i = 0; i < days.length; i++) {
      if(day==days[i]){
        return true;
      }
    }
    return false;
  }

}
