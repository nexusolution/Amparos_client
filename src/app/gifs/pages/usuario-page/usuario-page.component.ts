import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {UserService} from '../../services/user.service';
import {AuthService} from '../../services/auth.service';
import {User} from '../../interfaces/user.interface';
import {ConfirmModalComponent} from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-usuario-page',
  templateUrl: './usuario-page.component.html',
})
export class UsuarioPageComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.toastr.error('No se pudieron cargar los usuarios. Intente nuevamente.', 'Error de Carga');
      }
    });
  }

  toggleUserStatus(userId: number | string): void {
    const user = this.users.find(u => u.idUsuario === userId);
    if (!user) return;

    const newStatus = user.estado === 'A' ? 'deactivate' : 'activate';
    const statusText = user.estado === 'A' ? 'desactivar' : 'activar';
    const actionText = user.estado === 'A' ? 'Desactivar' : 'Activar';
    const userName = `${user.nombre} ${user.apPaterno} ${user.apMaterno}`;

    const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title = `${actionText} Usuario`;
    modalRef.componentInstance.message = `¿Está seguro de que desea ${statusText} al usuario "${userName}"?`;
    modalRef.componentInstance.confirmText = actionText;
    modalRef.componentInstance.confirmButtonClass = user.estado === 'A' ? 'btn-warning-modern' : 'btn-success-modern';
    modalRef.componentInstance.icon = 'warning';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.userService.changeUserStatus(userId, newStatus).subscribe({
            next: (response) => {
              if (response.success) {
                // Update user status in the local array
                const userIndex = this.users.findIndex(u => u.idUsuario === userId);
                if (userIndex !== -1) {
                  this.users[userIndex].estado = newStatus === 'deactivate' ? 'I' : 'A';
                }
                this.toastr.success(
                  `El usuario "${userName}" ha sido ${statusText}do exitosamente`,
                  `Usuario ${actionText}do`
                );
              } else {
                this.toastr.error(
                  response.message || 'Ocurrió un error al procesar la solicitud',
                  `Error al ${actionText}`
                );
              }
            },
            error: (error) => {
              console.error('Error changing user status:', error);
              this.toastr.error(
                'No se pudo cambiar el estado del usuario. Intente nuevamente.',
                'Error de Operación'
              );
            }
          });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  addUser(): void {
    this.userService.setEditingUser(null, false);
    this.router.navigate(['/dashboard/usuario-admin']);
  }

  editUser(user: User): void {
    this.userService.setEditingUser(user, true);
    this.router.navigate(['/dashboard/usuario-admin']);
  }

  get isOperator(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.perfil?.nombre?.toLowerCase() === 'operador';
  }
}
