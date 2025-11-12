import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {User, UsersListResponse, DeactivateResponse, CreateUserRequest, CreateUserResponse, JuzgadosResponse} from '../interfaces/user.interface';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {
  }

  getUsers(): Observable<User[]> {
    return this.http.get<UsersListResponse>(`${this.apiUrl}/usuarios/organo/current`)
      .pipe(
        map(response => response.data)
      );
  }

  changeUserStatus(userId: number | string, status: string): Observable<DeactivateResponse> {
    return this.http.put<DeactivateResponse>(`${this.apiUrl}/usuarios/${userId}/change/status`, {
      status: status
    });
  }

  createUser(userData: CreateUserRequest, role?: string): Observable<CreateUserResponse> {
    const endpoint = role === 'Operador' ? 'operator' : 'admin';
    return this.http.post<CreateUserResponse>(`${this.apiUrl}/usuarios/${endpoint}`, userData);
  }

  getJuzgados(): Observable<JuzgadosResponse> {
    return this.http.get<JuzgadosResponse>(`${this.apiUrl}/cat-juzgados`);
  }

  updateUser(userId: number | string, userData: CreateUserRequest, role?: string): Observable<CreateUserResponse> {
    const endpoint = role === 'Operador' ? 'operator' : 'admin';
    return this.http.put<CreateUserResponse>(`${this.apiUrl}/usuarios/${endpoint}/${userId}`, userData);
  }

  // Shared service properties for component communication
  private editingUser: any = null;
  private editMode = false;

  setEditingUser(user: any, editMode: boolean = false): void {
    this.editingUser = user;
    this.editMode = editMode;
  }

  getEditingUser(): any {
    return this.editingUser;
  }

  getEditMode(): boolean {
    return this.editMode;
  }

  clearEditingData(): void {
    this.editingUser = null;
    this.editMode = false;
  }
}
