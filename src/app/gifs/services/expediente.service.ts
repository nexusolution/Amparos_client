import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expediente } from '../interfaces/expediente.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {
  private apiUrl = 'http://localhost:3000/api/expedientes';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(expediente: Partial<Expediente>): Observable<any> {
    return this.http.post<any>(this.apiUrl, expediente);
  }

  update(id: number, expediente: Partial<Expediente>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, expediente);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Additional methods based on backend routes

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  searchExpedientes(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search/${searchTerm}`);
  }

  getByExpedienteCJF(expedienteCJF: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cjf/${expedienteCJF}`);
  }

  getByOrgano(idOrganoOrigen: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/organo/${idOrganoOrigen}`);
  }

  getElectronic(isElectronic: boolean): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/electronic/${isElectronic}`);
  }
}
