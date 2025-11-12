import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormUtils } from '../../../utils/form-utils';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}
  formUtils = FormUtils;

  loginForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { usuario, password } = this.loginForm.value;

    const loginData: LoginRequest = {
      usuario: usuario,
      clave: password
    };

    this.authService.login(loginData)
      .subscribe({
        next: (response) => {
          // Success is handled by the AuthService (navigation, storage)
          this.isLoading = false;
          this.toastr.success(
            'Bienvenido al Sistema de Amparos',
            'Inicio de Sesión Exitoso'
          );
        },
        error: (error: HttpErrorResponse) => {
          // Handle login error using the service's error message helper
          this.isLoading = false;
          this.errorMessage = this.authService.getAuthErrorMessage(error);
          this.toastr.error(
            this.errorMessage,
            'Error de Autenticación'
          );
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.formUtils.isValidField(this.loginForm, fieldName) || false;
  }

  getFieldError(fieldName: string): string {
    return this.formUtils.getFieldError(this.loginForm, fieldName) || '';
  }
}
