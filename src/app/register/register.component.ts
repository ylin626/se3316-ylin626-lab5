import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  email="";
  password="";
  password_c="";
  name="";
  actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: 'http://localhost:4200/'
  }

  user: Observable<firebase.User>;
  constructor(private firebaseAuth: AngularFireAuth){
      this.email="";
      this.password="";
  }

  ngOnInit(): void {
  }
  register(){
    if(this.name==""||this.password==""||this.email==""){
      alert("Please perfect your registration information!");
    }else{
      if(this.password == this.password_c){
        if(this.password.length<6||this.password.length>16){
          alert("The password's length must begin 6 and 16!")
        }else{
          this.firebaseAuth
          .createUserWithEmailAndPassword(this.email,this.password)
          .then(value =>{
            this.firebaseAuth.currentUser.then(user =>{
              user.sendEmailVerification(this.actionCodeSettings);
            }).then( ()=>{
            })
            alert("Register Successful!")
          })
          .catch(err =>{
            alert(err.message)
          })
        }
        
      }else{
        alert("Please confirm your password!")
      }
    }
    
   
  }
}
