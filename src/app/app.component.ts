import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: Observable<firebase.User>;
  constructor(private firebaseAuth: AngularFireAuth){

  }
  title = 'se3316-ylin626-lab5';
  email = "";
  password = "";
  name = "";
  register(){
    this.firebaseAuth
    .createUserWithEmailAndPassword(this.email,this.password)
    .then(value =>{
      alert("Register Successful!")
      console.log(value);
    })
    .catch(err =>{
      alert(err.message)
    })
  }
}
