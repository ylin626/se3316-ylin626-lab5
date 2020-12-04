import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SearchComponent } from './search/search.component';
import { AboutComponent } from './about/about.component';


const routes: Routes = [
  {path:"login",
  component: LoginComponent
  },
  {path:"about",
  component: AboutComponent
  },
  {path:"register",
  component: RegisterComponent
  },
  {path:"search",
  component: SearchComponent
  },
  {path:"**",
  component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
