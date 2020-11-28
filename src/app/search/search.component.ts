import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable  } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  designation="";
  subject="";
  days = [{name:"Mon",value:"m",isChecked:true},
  {name:"Tue",value:"tu",isChecked:true},
  {name:"Wed",value:"w",isChecked:true},
  {name:"Thu",value:"th",isChecked:true},
  {name:"Fri",value:"f",isChecked:true}
];
  s_time="";
  e_time="";
  component="";
  catalognbr="";
  list=[];
  login=true;


  constructor(private http:HttpClient) { 
    this.http.get("http://127.0.0.1:3000/schedule/all").subscribe((res:any)=>{
        console.log(res.data)
        this.list=res.data;
      })
  }

  ngOnInit(): void {
    
  }
  submit(){
    this.http.get("http://127.0.0.1:3000/schedule/all").subscribe((res:any)=>{
      console.log(res.data)
      this.list=res.data;
    })
  }


}
