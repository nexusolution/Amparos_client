import { Perfil } from './auth.interface';

export interface User {
 idUsuario: number | string; // Can be encrypted string or number
 organoImpartidorJusticia: number;
 nombre: string;
 apPaterno: string;
 apMaterno: string;
 usuario: string;
 correo: string;
 telefono: string;
 extension: string;
 estado: string;
 idPerfil: number;
 perfil: Perfil;
 juzgado: Juzgado;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  message: string;
}

export interface CreateUserRequest {
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  usuario: string;
  correo: string;
  clave: string;
  telefono: string;
  extension: string;
  estado: string;
  idPerfil: number;
  organoImpartidorJusticia: number;
  eliminado: boolean;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface Juzgado {
  idJuzgadoPJHGO: number;
  clave: string;
  nombre: string;
  tipoJuicio: string;
  idDistrito: number;
  organoImpartidorJusticia: number;
  correo: string;
  eliminado: boolean;
}

export interface JuzgadosResponse {
  success: boolean;
  data: Juzgado[];
  message: string;
}

export interface DeactivateResponse {
  success: boolean;
  message: string;
}
