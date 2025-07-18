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
import { BuyProductComponent } from './buy-product/buy-product.component';
import { BuyProductResolverService } from './_services/buy-product-resolver.service';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { RegisterComponent } from './register/register.component';
import { CartComponent } from './cart/cart.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { AllOrdersComponent } from './all-orders/all-orders.component';

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
    path: 'productViewDetails/:id',
    component: ProductDetailsComponent,
    resolve: {
      product: ProductResolverService,
    },

  },
  {
    path: 'buyProduct',
    component: BuyProductComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_USER'] },
    resolve: {
      productDetails: BuyProductResolverService,
    },
  },
  {
    path: 'orderConfirmation',
    component: OrderConfirmationComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_USER'] },
  
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_USER'] },
  },
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_USER'] } },
  { path: 'order-details/:orderId', component: OrderDetailsComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_USER', 'ROLE_ADMIN'] } },
  { path: 'all-orders', component: AllOrdersComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_ADMIN'] } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
