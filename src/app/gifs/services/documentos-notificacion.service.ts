import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentosNotificacion } from '../interfaces/documentos-notificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentosNotificacionService {
  private apiUrl = 'http://localhost:3000/api/documentos-notificacion';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(documento: Partial<DocumentosNotificacion>): Observable<any> {
    return this.http.post<any>(this.apiUrl, documento);
  }

  update(id: number, documento: Partial<DocumentosNotificacion>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, documento);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Additional methods based on backend routes

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getStatisticsByNotificacion(idNotificacion: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/notificacion/${idNotificacion}`);
  }

  verifyHash(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify-hash/${id}`);
  }

  getByNotificacion(idNotificacion: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notificacion/${idNotificacion}`);
  }

  getByClasificacion(idClasificacionArchivo: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clasificacion/${idClasificacionArchivo}`);
  }

  getSigned(isSigned: boolean): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/signed/${isSigned}`);
  }

  // Electronic signature
  firmarDocumento(signatureData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/firmar`, signatureData);
  }
}
