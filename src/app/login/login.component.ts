import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = "";
  password = "";

  user: Observable<firebase.User>;
  constructor(private firebaseAuth: AngularFireAuth, private router: ActivatedRoute) {
    this.email = window.localStorage.getItem("userEmail");
    this.router.queryParams.subscribe((data) => {
      if (data.oobCode) {
        this.firebaseAuth.applyActionCode(data.oobCode)
          .then(function (result) {
            alert("Verifyication happend" + ",Successful!")
          })
          .catch(function (error) {
            alert(error.message)
          });
      }
    })
  }

  ngOnInit(): void {
  }
  login() {
    this.firebaseAuth
      .signInWithEmailAndPassword(this.email, this.password)
      .then((value: any) => {
        if (value.user.emailVerified == true) {
          this.firebaseAuth.currentUser.then((user: any) => {
            user.getIdToken().then(token => {
              window.localStorage.setItem("token", token);
              alert("Login Successful!")
              window.localStorage.setItem("isLogin", "true");
              window.localStorage.setItem("userEmail", this.email);
              window.location.href = "/search"
            })
          })
        } else {
          if (confirm("EMail not verified!\nDo you want to send email again?")) {
            this.firebaseAuth.currentUser.then(user => {
              user.sendEmailVerification();
            }).then(() => {
              alert("Send Successful!")
            })
              .catch(e => {
                alert(e.message)
              })
          }
        }
      })
      .catch(err => {
        alert(err.message)
      })
  }
}
