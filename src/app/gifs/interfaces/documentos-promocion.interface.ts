import { Promocion } from './promocion.interface';
import { CatClasificacionArchivo } from './cat-clasificacion-archivo.interface';

export interface DocumentosPromocion {
  idDocumentoPromocion: number;
  nombre: string;
  extension: string;
  longitud: string;
  firmado: boolean;
  fechaFirmado: Date;
  hashDocumentoOriginal: string;
  idPromocion: number;
  idClasificacionArchivo: number;
  ruta: string;
  fileBase64: string;
  pkcs7Base64: string;

  // Relations
  promocion?: Promocion;
  clasificacionArchivo?: CatClasificacionArchivo;
}
