import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PartesExpediente } from '../interfaces/partes-expediente.interface';

@Injectable({
  providedIn: 'root'
})
export class PartesExpedienteService {
  private apiUrl = 'http://localhost:3000/api/partes';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(parte: Partial<PartesExpediente>): Observable<any> {
    return this.http.post<any>(this.apiUrl, parte);
  }

  update(id: number, parte: Partial<PartesExpediente>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, parte);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Additional methods based on backend routes

  getStatisticsByExpediente(idExpediente: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/expediente/${idExpediente}`);
  }

  searchPartes(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search/${searchTerm}`);
  }

  getByExpediente(idExpediente: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  getByCaracter(caracter: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/caracter/${caracter}`);
  }

  getByTipoPersona(tipoPersona: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tipo-persona/${tipoPersona}`);
  }
}
