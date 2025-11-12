import { Notificacion } from './notificacion.interface';
import { CatClasificacionArchivo } from './cat-clasificacion-archivo.interface';

export interface DocumentosNotificacion {
  idDocumentoNotificacion: number;
  nombre: string;
  extension: string;
  longitud: string;
  firmado: boolean;
  fechaFirmado: Date;
  hashDocumentoOriginal: string;
  idNotificacion: number;
  idClasificacionArchivo: number;
  ruta: string;
  fileBase64: string;
  pkcs7Base64: string;

  // Relations
  notificacion?: Notificacion;
  clasificacionArchivo?: CatClasificacionArchivo;
}
