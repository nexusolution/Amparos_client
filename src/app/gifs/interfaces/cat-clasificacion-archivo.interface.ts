import { DocumentosPromocion } from './documentos-promocion.interface';
import { DocumentosNotificacion } from './documentos-notificacion.interface';

export interface CatClasificacionArchivo {
  idClasificacionArchivo: number;
  nombre: string;
  eliminado: boolean;

  // Relations
  documentosPromocion?: DocumentosPromocion[];
  documentosNotificacion?: DocumentosNotificacion[];
}
