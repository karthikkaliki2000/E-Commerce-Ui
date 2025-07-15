import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { UserAuthService } from '../_services/user-auth.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private userAuthService: UserAuthService,
    private httpHandler: HttpHandler,
    private router: Router
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.headers.get('No-Auth') == 'True') {
      return next.handle(req.clone());
    }

    const token = this.userAuthService.getToken();
    if(token){
      req = this.addToken(req, token);
    }
   
    console.log(req);
    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.router.navigate(['/forbidden']);
        }
        return throwError(error); // Pass the real error object
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string) {
    return req.clone({

      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
