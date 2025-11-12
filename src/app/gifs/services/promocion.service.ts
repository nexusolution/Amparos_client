import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promocion } from '../interfaces/promocion.interface';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  private apiUrl = 'http://localhost:3000/api/promociones';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(promocion: Partial<Promocion>): Observable<any> {
    return this.http.post<any>(this.apiUrl, promocion);
  }

  update(id: number, promocion: Partial<Promocion>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, promocion);
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

  getByAmparo(idAmparosPJ: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/amparo/${idAmparosPJ}`);
  }

  getByTipoCuaderno(tipoCuaderno: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tipo-cuaderno/${tipoCuaderno}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/date-range/${startDate}/${endDate}`);
  }
}
