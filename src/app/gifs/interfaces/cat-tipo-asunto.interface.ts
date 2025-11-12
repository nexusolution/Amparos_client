import { Notificacion } from './notificacion.interface';

export interface CatTipoAsunto {
  idTipoAsunto: number;
  nombre: string;
  eliminado: boolean;

  // Relations
  notificaciones?: Notificacion[];
}
