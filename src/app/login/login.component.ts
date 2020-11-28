import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email="";
  password="";

  user: Observable<firebase.User>;
  constructor(private firebaseAuth: AngularFireAuth){

  }

  ngOnInit(): void {
  }
  login(){
    this.firebaseAuth
    .signInWithEmailAndPassword(this.email,this.password)
    .then(value =>{
      if(value.user.emailVerified==true){
        alert("Login Successful!")
        window.location.href="/search"
      }else{
        alert("EMail not verified!")
      }
    })
    .catch(err =>{
      alert(err.message)
    })
  }
}
