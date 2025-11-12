import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AmparosPJ } from '../interfaces/amparos.interface';

@Injectable({
  providedIn: 'root'
})
export class AmparosService {
  private apiUrl = 'http://localhost:3000/api/amparos';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(amparo: Partial<AmparosPJ>): Observable<any> {
    return this.http.post<any>(this.apiUrl, amparo);
  }

  update(id: number, amparo: Partial<AmparosPJ>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, amparo);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Additional methods based on backend routes

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  searchAmparos(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search/${searchTerm}`);
  }

  getByExpediente(idExpediente: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  getByNotificacion(idNotificacion: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notificacion/${idNotificacion}`);
  }

  getByNumeroExpedienteDJ(numeroExpedienteDJ: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/numero/${numeroExpedienteDJ}`);
  }

  getByJuzgado(juzgado: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/juzgado/${juzgado}`);
  }

  getElectronic(isElectronic: boolean): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/electronic/${isElectronic}`);
  }
}
