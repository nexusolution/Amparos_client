import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentosPromocion } from '../interfaces/documentos-promocion.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentosPromocionService {
  private apiUrl = 'http://localhost:3000/api/documentos-promocion';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(documento: Partial<DocumentosPromocion>): Observable<any> {
    return this.http.post<any>(this.apiUrl, documento);
  }

  update(id: number, documento: Partial<DocumentosPromocion>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, documento);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Additional methods based on backend routes

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getStatisticsByPromocion(idPromocion: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/promocion/${idPromocion}`);
  }

  verifyHash(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify-hash/${id}`);
  }

  getByPromocion(idPromocion: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/promocion/${idPromocion}`);
  }

  getByClasificacion(idClasificacionArchivo: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clasificacion/${idClasificacionArchivo}`);
  }

  getSigned(isSigned: boolean): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/signed/${isSigned}`);
  }
}
