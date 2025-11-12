import { Routes } from '@angular/router';
import { AuthGuard, OperatorGuard } from './auth/auth.guard';
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
import { FirmaDocumentoPageComponent } from './gifs/pages/firma-documento-page/firma-documento-page.component';

export const routes: Routes = [
{
  path: 'login',
  component: LoginComponent
},
{
  path: '',
  redirectTo: 'login',
  pathMatch: 'full'
},
{
  path : 'dashboard' ,
  component: DashboardPageComponent,
  canActivate: [AuthGuard],

  children:[
      {
        path: 'home',
        component: DashboardHomePageComponent
      },

      {
        path : 'usuario' ,
        component: UsuarioPageComponent
      },

    {
      path: 'usuario-admin',
      component: UsuarioAdminPageComponent,
      canActivate: [OperatorGuard]
    },

      {
        path : 'expedientes' ,
        component: ExpedientePageComponent
      },

      {
        path : 'expedientes/nuevo' ,
        component: ExpedienteFormPageComponent
      },

      {
        path : 'expedientes/editar/:id' ,
        component: ExpedienteFormPageComponent
      },

      {
        path : 'amparos' ,
        component: AmparosPageComponent
      },

      {
        path : 'amparos/nuevo' ,
        component: AmparosFormPageComponent
      },

      {
        path : 'amparos/editar/:id' ,
        component: AmparosFormPageComponent
      },

      {
        path : 'promociones' ,
        component: PromocionPageComponent
      },

      {
        path : 'promociones/nuevo' ,
        component: PromocionFormPageComponent
      },

      {
        path : 'promociones/editar/:id' ,
        component: PromocionFormPageComponent
      },

      {
        path : 'partes' ,
        component: PartesExpedientePageComponent
      },

      {
        path : 'partes/nuevo' ,
        component: PartesExpedienteFormPageComponent
      },

      {
        path : 'partes/editar/:id' ,
        component: PartesExpedienteFormPageComponent
      },

      {
        path : 'notificacion' ,
        component: NotificacionPageComponent
      },

      {
        path : 'notificacion/nuevo' ,
        component: NotificacionRegistroPageComponent
      },

      {
        path : 'notificacion/editar/:id' ,
        component: NotificacionRegistroPageComponent
      },

      {
        path : 'notificacion/ver/:id' ,
        component: NotificacionRegistroPageComponent
      },

      {
        path: 'firma-documentos',
        component: FirmaDocumentoPageComponent,
        canActivate: [OperatorGuard]
      },

      {
        path:'**',
        redirectTo:'home'
      }
    ]
},




{
  path:'**',
  redirectTo: 'dashboard',

}
];
