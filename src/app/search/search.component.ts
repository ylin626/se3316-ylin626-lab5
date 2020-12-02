import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { JwtHelperService } from "@auth0/angular-jwt";


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  reviewIsShow = "1";
  review = "";
  //http Header
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
  };
  keyword = "";
  //add catalog
  addCLdata: any = {}

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

  isAdmin = 0;
  userList = [];
  Seluser = "";

  //data in html
  list = [];

  //judge User Login 
  isLogin = false;

  //addClass
  c_id = "";
  addCdata: any = {}
  inputdays = [];

  revise_key = -1;

  init() {
    this.review = "";
    this.addCLdata = {
      catalog_nbr: "",
      className: "",
      catalog_description: "",
      subject: "ACTURSCI",
      createUser: this.jwt.decodeToken(window.localStorage.getItem("token")).user_id,
      createUserName: this.jwt.decodeToken(window.localStorage.getItem("token")).name,
      power: "1"
    }
    this.reviewIsShow = "1";
    //addClass
    this.c_id = "";
    this.addCdata = {
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
    this.inputdays = [{ name: "Mon", value: "M", isChecked: true },
    { name: "Tue", value: "Tu", isChecked: true },
    { name: "Wed", value: "W", isChecked: true },
    { name: "Thu", value: "Th", isChecked: true },
    { name: "Fri", value: "F", isChecked: true }
    ];
  }





  constructor(private http: HttpClient, private firebaseAuth: AngularFireAuth, private jwt: JwtHelperService) {
    if (!(window.localStorage.getItem("token") == "" || window.localStorage.getItem("token") == null || window.localStorage.getItem("token") == undefined)) {
      this.http.post("http://127.0.0.1:3000/visitor/login", { "id": this.jwt.decodeToken(window.localStorage.getItem("token")).user_id }, this.httpOptions).subscribe((res: any) => {
        this.isAdmin = res.data.type;
        this.userList = res.data.userList;
        if (this.userList.length > 0) {
          this.Seluser = this.userList[0].email;
        }
        this.init();
      })
    }


    this.getAll();
    if (window.localStorage.getItem("isLogin") == "true") {
      this.isLogin = true;
    } else {
      this.isLogin = false;
    }
  }

  getAll() {
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
    this.keyword = this.filterHTMLTag(this.keyword);
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

  getMyCatalog() {
    this.http.post("http://127.0.0.1:3000/user/myCatalog", { "user": this.jwt.decodeToken(window.localStorage.getItem("token")).user_id }, this.httpOptions).subscribe((res: any) => {
      this.list = res.data;
    })
  }

  addClass() {
    this.addCdata.class_nbr=this.filterHTMLTag(this.addCdata.class_nbr);
    this.addCdata.class_section=this.filterHTMLTag(this.addCdata.class_section);
    this.addCdata.facility_ID=this.filterHTMLTag(this.addCdata.facility_ID);
    if (this.addCdata.class_nbr == "" ||
      this.addCdata.class_section == "" ||
      this.addCdata.facility_ID == "") {
      alert("The first three items cannot be empty.")
    } else {
      if (this.addCdata.class_nbr.length < 4 || this.addCdata.class_nbr.length > 5) {
        alert("The Class Nbr cannot less than 4 chars and more than 5 chars.")
      } else {
        var dayS = [];
        for (var i = 0; i < this.inputdays.length; i++) {
          if (this.inputdays[i].isChecked) {
            dayS.push(this.inputdays[i].value);
          }
        }
        this.addCdata.days = dayS;
        if (this.revise_key == -1) {
          this.http.post("http://127.0.0.1:3000/user/addClass", { "id": this.c_id, "data": this.addCdata }, this.httpOptions).subscribe((res: any) => {
            alert(res.text);
            window.location.reload();
          })
        } else {
          this.http.post("http://127.0.0.1:3000/user/reviseClass", { "id": this.c_id, "data": this.addCdata, "key": this.revise_key }, this.httpOptions).subscribe((res: any) => {
            alert(res.text);
            window.location.reload();
          })
        }

      }
    }


  }
  delClass(id, key) {
    if (confirm("Are you sure you want to delete this?")) {
      this.http.post("http://127.0.0.1:3000/user/delClass", { "id": id, "user": window.localStorage.getItem("userEmail"), "key": key }, this.httpOptions).subscribe((res: any) => {
        alert(res.text);
        window.location.reload();
      })
    }

  }
  addCatalog() {
    this.addCLdata.catalog_nbr=this.filterHTMLTag(this.addCLdata.catalog_nbr);
    this.addCLdata.className=this.filterHTMLTag(this.addCLdata.className);
    this.addCLdata.catalog_description=this.filterHTMLTag(this.addCLdata.catalog_description);

    if (this.addCLdata.catalog_nbr == "" ||
      this.addCLdata.className == "" ||
      this.addCLdata.catalog_description == "") {
      alert("The first three items cannot be empty.")
    } else {
      if (this.addCLdata.catalog_nbr.length < 4 || this.addCLdata.catalog_nbr.length > 5) {
        alert("The Class Nbr cannot less than 4 chars and more than 5 chars.")
      } else {
        if (this.revise_key == -1) {
          this.http.post("http://127.0.0.1:3000/user/addCatalog", this.addCLdata, this.httpOptions).subscribe((res: any) => {
            alert(res.text);
            window.location.reload();
          })
        } else {
          this.http.post("http://127.0.0.1:3000/user/reviseCatalog", this.addCLdata, this.httpOptions).subscribe((res: any) => {
            alert(res.text);
            window.location.reload();
          })
        }
      }
    }
  }

  sendReview(id) {
    this.review = this.filterHTMLTag(this.review);
    this.http.post("http://127.0.0.1:3000/user/sendView", { user: window.localStorage.getItem("token"), id: id, text: this.review }, this.httpOptions).subscribe((res: any) => {
      this.review = "";
      alert(res.text);
      window.location.reload();
    })

  }

  updateDisplay(id, val, key, i) {
    if (val[i].display != key) {
      val[i].display = key;
      this.http.post("http://127.0.0.1:3000/user/changeViewDisplay", { id: id, data: val }, this.httpOptions).subscribe((res: any) => {
        console.log(res.text);
      })
    }

  }
  delCatalog(id) {
    if (confirm("Are you sure you want to delete this?")) {
      this.http.post("http://127.0.0.1:3000/user/delCatalog", { "id": id, "user": window.localStorage.getItem("userEmail") }, this.httpOptions).subscribe((res: any) => {
        alert(res.text);
        window.location.reload();
      })
    }
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
    if (this.isLogin) {
      if (creatUser == this.jwt.decodeToken(window.localStorage.getItem("token")).user_id && this.isLogin) {
        return true;
      } else {
        return false;
      }
    }
    return false;

  }
  nowClassID(id) {
    this.c_id = id;
  }

  nowRClassID(id, key, val) {
    this.revise_key = key;
    this.c_id = id;
    this.addCdata = { ...val };
    for (var i = 0; i < this.inputdays.length; i++) {
      if (this.isInArr(this.inputdays[i].value, val.days)) {
        this.inputdays[i].isChecked = true;
      } else {
        this.inputdays[i].isChecked = false;
      }
    }
  }
  isInArr(key, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (key == arr[i]) {
        return true;
      }
    }
    return false;

  }
  closeModal() {
    this.init();
    this.revise_key = -1;
  }
  nowRClass(val) {
    this.addCLdata = { ...val };
    this.revise_key = 0;
  }
  isPrivate(val) {
    if (this.isLogin) {
      if (this.jwt.decodeToken(window.localStorage.getItem("token")).user_id == val.createUser) {
        return true;
      } else if (val.power == "0") {
        return false;
      }
      return true;
    } else if (val.power == "0") {

      return false;

    }
    return true;


  }
  addAdmin() {
    if (confirm("Are you sure you want to do this?\nOperation cannot be recalled.")) {
      this.http.post("http://127.0.0.1:3000/admin/addAdmin", { email: this.Seluser }, this.httpOptions).subscribe((res: any) => {
        alert(res.text);
        window.location.reload();
      })
    }
  }
  filterHTMLTag(msg) {
    var msg = msg.replace(/<\/?[^>]*>/g, ''); //remove HTML 
    msg = msg.replace(/^[\.\#]?\w+[^{]+\{[^}]*\}/g, '');//remove css
    msg = msg.replace(/[|]*\n/, '') //remove " "
    msg = msg.replace(/&npsp;/ig, ''); //remove npsp
    return msg;
  }
}
