import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notificacion } from '../interfaces/notificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:3000/api/notificaciones';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(notificacion: Partial<Notificacion>): Observable<any> {
    return this.http.post<any>(this.apiUrl, notificacion);
  }

  update(id: number, notificacion: Partial<Notificacion>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, notificacion);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Additional methods based on backend routes

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getRecent(days?: number): Observable<any> {
    if (days) {
      return this.http.get<any>(`${this.apiUrl}/recent/${days}`);
    }
    return this.http.get<any>(`${this.apiUrl}/recent`);
  }

  getByExpediente(idExpediente: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  getByOrgano(organoImpartidorJusticia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/organo/${organoImpartidorJusticia}`);
  }

  getByTipoAsunto(idTipoAsunto: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tipo-asunto/${idTipoAsunto}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/date-range/${startDate}/${endDate}`);
  }
}
