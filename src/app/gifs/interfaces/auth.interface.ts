export interface LoginRequest {
  usuario: string;
  clave: string;
}

export interface Perfil {
  idPerfil: number;
  nombre: string;
  eliminado: boolean;
}

export interface User {
  idUsuario: number;
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
}

export interface LoginResponseData {
  user: User;
  token: string;
  expiresIn: string;
}

export interface LoginResponse {
  success: boolean;
  data: LoginResponseData;
  message: string;
}
