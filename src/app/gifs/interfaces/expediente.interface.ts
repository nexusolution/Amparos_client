import { AmparosPJ } from './amparos.interface';
import { Notificacion } from './notificacion.interface';

export interface Expediente {
  idExpediente: number;
  expedienteCJF: string;
  tipoDocumento: number;
  tipoSubNivel: number;
  tipoMateria: number;
  idOrganoOrigen: number;
  origen: string;
  expedienteElectronico: boolean;
  UHEE: string;

  // Relations
  amparosPJ?: AmparosPJ[];
  notificacion?: Notificacion;
}
