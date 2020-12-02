import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  //http Header
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
  };
  email = "";
  password = "";
  password_c = "";
  name = "";
  actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: 'http://localhost:4200/login'
  }

  user: Observable<firebase.User>;
  constructor(private firebaseAuth: AngularFireAuth, private http: HttpClient, private jwt: JwtHelperService) {
    this.email = "";
    this.password = "";
  }

  ngOnInit(): void {
  }
  register() {
    this.name = this.filterHTMLTag(this.name);
    this.email = this.filterHTMLTag(this.email);
    if (this.name == "" || this.password == "" || this.email == "") {
      alert("Please perfect your registration information!");
    } else {
      if (this.password == this.password_c) {
        if (this.password.length < 6 || this.password.length > 16) {
          alert("The password's length must begin 6 and 16!")
        } else {
          this.firebaseAuth
            .createUserWithEmailAndPassword(this.email, this.password)
            .then(value => {
              this.firebaseAuth.currentUser.then(user => {
                user.sendEmailVerification();
                user.updateProfile({ displayName: this.name });
                user.getIdToken().then(token => {
                  this.http.post("http://127.0.0.1:3000/visitor/register", this.jwt.decodeToken(token), this.httpOptions).subscribe((res: any) => {
                    console.log(res.data)
                  })
                  alert("Register Successful!\nPlease check your email to complete the verification~")
                  window.localStorage.setItem("userEmail", this.email)
                  window.location.href = "/login"
                })



              })
                .catch(e => {
                  alert(e.message)
                })
            })
            .catch(err => {
              alert(err.message)
            })
        }

      } else {
        alert("Please confirm your password!")
      }
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
