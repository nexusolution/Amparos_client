import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuOption {
  label: string;
  sublabel: string;
  route: string;
  icon: string;
  isLogout?: boolean;
  group?: string;
}

@Component({
   selector: 'gifs-side-menu-options',
   templateUrl: './side-menu-options.component.html',
 })
 export class SideMenuOptionsComponent {
   constructor(
     private router: Router,
     private authService: AuthService
   ) {}

   get menuOption(): MenuOption[] {
     const currentUser = this.authService.getCurrentUser();
     const isOperator = currentUser?.perfil?.nombre?.toLowerCase() === 'operador';

     return [
     // Dashboard section
     {
       icon: 'fa-solid fa-chart-line',
       label: 'Dashboard',
       sublabel: 'Panel de control',
       route: '/dashboard/home',
       group: 'dashboard'
     },
     // Casos section
     {
       icon: 'fa-solid fa-folder-open',
       label: 'Expedientes',
       sublabel: 'Gestión de expedientes',
       route: '/dashboard/expedientes',
       group: 'casos'
     },
     {
       icon: 'fa-solid fa-shield-halved',
       label: 'Amparos',
       sublabel: 'Gestión de amparos',
       route: '/dashboard/amparos',
       group: 'casos'
     },
     // Gestión section
     {
       icon: 'fa-solid fa-bell',
       label: 'Notificaciones',
       sublabel: 'Notificaciones del sistema',
       route: '/dashboard/notificacion',
       group: 'gestion'
     },
     {
       icon: 'fa-solid fa-file-signature',
       label: 'Promociones',
       sublabel: 'Gestión de promociones',
       route: '/dashboard/promociones',
       group: 'gestion'
     },
     {
       icon: 'fa-solid fa-users',
       label: 'Partes Expediente',
       sublabel: 'Gestión de partes',
       route: '/dashboard/partes',
       group: 'gestion'
     },
     {
       icon: 'fa-solid fa-pen-nib',
       label: 'Firma de Documentos',
       sublabel: 'Firma electrónica',
       route: '/dashboard/firma-documentos',
       group: 'gestion'
     },
     // Administración section
     {
       icon: 'fa-solid fa-user',
       label: 'Usuario',
       sublabel: 'Mi perfil',
       route: '/dashboard/usuario',
       group: 'admin'
     },
     {
       icon: 'fa-solid fa-users-cog',
       label: 'Administración de usuarios',
       sublabel: 'Gestión de usuarios',
       route: '/dashboard/usuario-admin',
       group: 'admin'
     },
     {
       icon: 'fa-solid fa-sign-out-alt',
       label: 'Cerrar Sesión',
       sublabel: '',
       route: '',
       isLogout: true
     }
     ].filter(option => {
       // Remove "Administración de usuarios" for Operator users
       if (isOperator && option.label === 'Administración de usuarios') {
         return false;
       }
       return true;
     });
   }

   onMenuClick(item: MenuOption) {
     if (item.isLogout) {
       this.logout();
     }
   }

   private logout() {
     // Use AuthService for consistent logout behavior
     this.authService.logout();
   }

   trackByRoute(index: number, item: MenuOption): string {
     return item.route;
   }
}
