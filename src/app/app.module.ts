import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { AuthInterceptor } from './gifs/services/auth.interceptor';
import { LoginComponent } from './gifs/pages/login-page/login.component';
import { DashboardPageComponent } from './gifs/pages/dashboard-page/dashboard-page.component';
import { DashboardHomePageComponent } from './gifs/pages/dashboard-home-page/dashboard-home-page.component';
import { UsuarioPageComponent } from './gifs/pages/usuario-page/usuario-page.component';
import { UsuarioAdminPageComponent } from './gifs/pages/usuario-admin-page/usuario-admin-page.component';
import { NotificacionPageComponent } from './gifs/pages/notificacion-page/notificacion-page.component';
import { NotificacionRegistroPageComponent } from './gifs/pages/notificacion-registro-page/notificacion-registro-page.component';
import { ExpedientePageComponent } from './gifs/pages/expediente-page/expediente-page.component';
import { ExpedienteFormPageComponent } from './gifs/pages/expediente-form-page/expediente-form-page.component';
import { AmparosPageComponent } from './gifs/pages/amparos-page/amparos-page.component';
import { AmparosFormPageComponent } from './gifs/pages/amparos-form-page/amparos-form-page.component';
import { PromocionPageComponent } from './gifs/pages/promocion-page/promocion-page.component';
import { PromocionFormPageComponent } from './gifs/pages/promocion-form-page/promocion-form-page.component';
import { PartesExpedientePageComponent } from './gifs/pages/partes-expediente-page/partes-expediente-page.component';
import { PartesExpedienteFormPageComponent } from './gifs/pages/partes-expediente-form-page/partes-expediente-form-page.component';
import { SideMenuComponent } from './gifs/components/side-menu/side-menu.component';
import { SideMenuHeaderComponent } from './gifs/components/side-menu-header/side-menu-header.component';
import { SideMenuOptionsComponent } from './gifs/components/side-menu-options/side-menu-options.component';
import { ConfirmModalComponent } from './gifs/components/confirm-modal/confirm-modal.component';
import { DocumentUploadComponent } from './gifs/components/document-upload/document-upload.component';
import { DocumentListComponent } from './gifs/components/document-list/document-list.component';
import { PdfViewerComponent } from './gifs/components/pdf-viewer/pdf-viewer.component';
import { FirmaDocumentoPageComponent } from './gifs/pages/firma-documento-page/firma-documento-page.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardPageComponent,
    DashboardHomePageComponent,
    UsuarioPageComponent,
    UsuarioAdminPageComponent,
    NotificacionPageComponent,
    NotificacionRegistroPageComponent,
    ExpedientePageComponent,
    ExpedienteFormPageComponent,
    AmparosPageComponent,
    AmparosFormPageComponent,
    PromocionPageComponent,
    PromocionFormPageComponent,
    PartesExpedientePageComponent,
    PartesExpedienteFormPageComponent,
    SideMenuComponent,
    SideMenuHeaderComponent,
    SideMenuOptionsComponent,
    ConfirmModalComponent,
    DocumentUploadComponent,
    DocumentListComponent,
    PdfViewerComponent,
    FirmaDocumentoPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    NgbModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
      tapToDismiss: true,
      enableHtml: true
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
