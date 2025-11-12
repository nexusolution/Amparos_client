import { Notificacion } from './notificacion.interface';

export interface PartesExpediente {
  idParte: number;
  nombreCompleto: string;
  caracter: string;
  tipoPersona: string;
  personaJuridica: string;
  idExpediente: number;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  idCaracter: number;
  idTipoPersona: number;

  // Relations
  notificacion?: Notificacion;
}
