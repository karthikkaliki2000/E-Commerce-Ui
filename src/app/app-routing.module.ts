import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { AuthGuard } from './_auth/auth.guard';
import { AddNewProductComponent } from './add-new-product/add-new-product.component';
import { ShowProductDetailsComponent } from './show-product-details/show-product-details.component';
import { ProductResolverService } from './_services/product-resolver.service';
import { OllamaChatComponent } from './ollama-chat/ollama-chat.component';
import { ProductDetailsComponent } from './product-details/product-details.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['ROLE_ADMIN'],
    },
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['ROLE_USER'],
    },
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: 'addProduct',
    component: AddNewProductComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] },
    resolve: {
      product: ProductResolverService,
    },
  },
  {
    path: 'showProductDetails',
    component: ShowProductDetailsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] },
  },
  {
    path: 'productViewDetails',
    component: ProductDetailsComponent,
    resolve: {
      product: ProductResolverService,
    },
    
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
