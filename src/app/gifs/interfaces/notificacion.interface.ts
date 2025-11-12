import { Expediente } from './expediente.interface';
import { AmparosPJ } from './amparos.interface';
import { PartesExpediente } from './partes-expediente.interface';
import { DocumentosNotificacion } from './documentos-notificacion.interface';
import { CatTipoAsunto } from './cat-tipo-asunto.interface';

export interface Notificacion {
  idNotificacion: number;
  fechaEnvio: Date;
  organoImpartidorJusticia: number;
  tipoMedioNotificacion: string;
  idExpediente: number;
  idTipoAsunto: number;

  // Relations
  expediente?: Expediente;
  amparosPJ?: AmparosPJ[];
  partesExpediente?: PartesExpediente[];
  documentosNotificacion?: DocumentosNotificacion[];
  tipoAsunto?: CatTipoAsunto;
}
