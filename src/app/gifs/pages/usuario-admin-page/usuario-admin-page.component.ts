import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {FormUtils} from '../../../utils/form-utils';
import {UserService} from '../../services/user.service';
import {CreateUserRequest, Juzgado, JuzgadosResponse} from '../../interfaces/user.interface';

@Component({
  selector: 'app-usuario-admin-page',
  templateUrl: './usuario-admin-page.component.html',
})
export class UsuarioAdminPageComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}
  formUtils = FormUtils;

  juzgados: Juzgado[] = [];
  editMode = false;
  editingUser: any = null;


  myForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apPaterno: ['', [Validators.required, Validators.minLength(3)]],
    apMaterno: ['', [Validators.required, Validators.minLength(3)]],
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    clave: [''],
    telefono: ['', [Validators.required, Validators.minLength(10)]],
    extension: ['', [Validators.required]],
    estado: ['A', [Validators.required]],
    role: ['', [Validators.required]],
    idPerfil: [1, [Validators.required, Validators.min(1)]],
    organoImpartidorJusticia: ['', [Validators.required, Validators.min(1)]],
    eliminado: [false],
  });

  ngOnInit(): void {
    this.loadJuzgados();
    this.checkNavigationState();
  }

  private checkNavigationState(): void {
    this.editMode = this.userService.getEditMode();
    this.editingUser = this.userService.getEditingUser();

    if (this.editMode && this.editingUser) {
      this.populateFormForEdit();
    }
  }

  private populateFormForEdit(): void {
    if (this.editingUser) {
      // Map the user data to form fields

      this.myForm.patchValue({
        nombre: this.editingUser.nombre,
        apPaterno: this.editingUser.apPaterno,
        apMaterno: this.editingUser.apMaterno,
        usuario: this.editingUser.usuario,
        correo: this.editingUser.correo,
        telefono: this.editingUser.telefono,
        extension: this.editingUser.extension || '',
        estado: this.editingUser.estado,
        role: this.editingUser.perfil.nombre,
        idPerfil: this.editingUser.idPerfil,
        organoImpartidorJusticia: this.editingUser.organoImpartidorJusticia,
        eliminado: this.editingUser.eliminado
      });
    }
  }

  private loadJuzgados(): void {
    this.userService.getJuzgados().subscribe({
      next: (response: JuzgadosResponse) => {
        if (response.success) {
          this.juzgados = response.data;
        } else {
          console.error('Error al cargar juzgados:', response.message);
          this.toastr.error(
            response.message || 'No se pudieron cargar los datos',
            'Error de Carga'
          );
        }
      },
      error: (error) => {
        console.error('Error en la petición de juzgados:', error);
        this.toastr.error(
          'Error al cargar los órganos jurisdiccionales. Intente nuevamente.',
          'Error de Conexión'
        );
      }
    });
  }

  onSave() {
    // Validate form with conditional clave validation
    if (!this.validateForm()) {
      return;
    }

    if (this.editMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private validateForm(): boolean {
    // For new users, clave is required
    if (!this.editMode) {
      const claveControl = this.myForm.get('clave');

      if (!claveControl?.value || claveControl.value.length < 6) {
        this.myForm.markAllAsTouched();
        this.toastr.warning(
          'La contraseña debe tener al menos 6 caracteres',
          'Validación de Formulario'
        );
        return false;
      }
    }

    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this.toastr.warning(
        'Por favor complete todos los campos requeridos correctamente',
        'Validación de Formulario'
      );
      return false;
    }

    return true;
  }

  private createUser(): void {
    const userData: CreateUserRequest = this.myForm.value;
    const selectedRole = this.myForm.get('role')?.value;

    // Ensure clave is provided for new users
    if (!userData.clave) {
      this.toastr.warning(
        'La contraseña es requerida para crear un nuevo usuario',
        'Campo Requerido'
      );
      return;
    }

    this.userService.createUser(userData, selectedRole).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(
            `El usuario "${userData.nombre} ${userData.apPaterno}" ha sido creado exitosamente`,
            'Usuario Creado',
            { timeOut: 4000 }
          );
          this.resetForm();
          setTimeout(() => {
            this.router.navigate(['/dashboard/usuario']);
          }, 1500);
        } else {
          console.error('Error al crear usuario:', response.message);
          this.toastr.error(
            response.message || 'Ocurrió un error al crear el usuario',
            'Error al Crear'
          );
        }
      },
      error: (error) => {
        console.error('Error en la petición:', error);
        this.toastr.error(
          'Error al crear usuario. Verifique los datos e intente nuevamente.',
          'Error de Operación'
        );
      }
    });
  }

  private updateUser(): void {
    if (!this.editingUser?.idUsuario) {
      console.error('Cannot update user: No user ID available');
      this.toastr.error(
        'No se pudo identificar el usuario a actualizar',
        'Error de Identificación'
      );
      return;
    }

    const formData = this.myForm.value;
    const userName = `${formData.nombre} ${formData.apPaterno}`;

    // Remove clave if it's empty (user doesn't want to change password)
    const userData: CreateUserRequest = {
      ...formData,
      clave: formData.clave && formData.clave.trim() !== '' ? formData.clave : undefined,
      role: undefined
    };

    const selectedRole = this.myForm.get('role')?.value;
    const userId = this.editingUser.idUsuario;

    this.userService.updateUser(userId, userData, selectedRole).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(
            `El usuario "${userName}" ha sido actualizado exitosamente`,
            'Usuario Actualizado',
            { timeOut: 4000 }
          );
          this.userService.clearEditingData();
          setTimeout(() => {
            this.router.navigate(['/dashboard/usuario']);
          }, 1500);
        } else {
          console.error('Error al actualizar usuario:', response.message);
          this.toastr.error(
            response.message || 'Ocurrió un error al actualizar el usuario',
            'Error al Actualizar'
          );
        }
      },
      error: (error) => {
        console.error('Error en la petición de actualización:', error);
        this.toastr.error(
          'Error al actualizar usuario. Verifique los datos e intente nuevamente.',
          'Error de Operación'
        );
      }
    });
  }

  private resetForm(): void {
    this.myForm.reset({
      nombre: '',
      apPaterno: '',
      apMaterno: '',
      usuario: '',
      correo: '',
      clave: '',
      telefono: '',
      extension: '',
      estado: 'A',
      role: '',
      idPerfil: '',
      organoImpartidorJusticia: '',
      eliminado: false,
    });
  }

  onCancel(): void {
    if (this.editMode) {
      this.userService.clearEditingData();
      this.router.navigate(['/dashboard/usuario']);
    } else {
      this.resetForm();
    }
  }

  ngOnDestroy(): void {
    // Clean up shared service data when component is destroyed
    this.userService.clearEditingData();

    // Reset form to clean state
    this.resetForm();
  }
}
