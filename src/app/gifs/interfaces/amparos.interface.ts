import { Expediente } from './expediente.interface';
import { Notificacion } from './notificacion.interface';
import { Promocion } from './promocion.interface';

export interface AmparosPJ {
  idAmparosPJ: number;
  idExpediente: number;
  idNotificacion: number;
  numeroExpedienteDJ: string;
  expedienteElectronico: boolean;
  JUZGADO: string;

  // Relations
  expediente?: Expediente;
  notificacion?: Notificacion;
  promociones?: Promocion[];
}
