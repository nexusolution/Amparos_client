import { AmparosPJ } from './amparos.interface';
import { DocumentosPromocion } from './documentos-promocion.interface';

export interface Promocion {
  idPromocion: number;
  fechaEnvio: Date;
  idAmparosPJ: number;
  tipoCuaderno: string;

  // Relations
  amparosPJ?: AmparosPJ;
  documentosPromocion?: DocumentosPromocion[];
}
