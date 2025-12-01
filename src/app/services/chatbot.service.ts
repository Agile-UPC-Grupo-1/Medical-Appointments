// src/app/services/chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, MedicalResults } from '../models'; // 🔁 Ajusta la ruta si es necesario

export interface ChatResponse {
  answer: string;
}

export interface ResultsChatRequest {
  appointmentId: number;
  question: string;
  appointment?: Appointment | null;
  results?: MedicalResults[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // Base del endpoint de tu backend
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  /**
   * Envía una consulta sobre los resultados médicos de una cita
   */
  askAboutResults(payload: ResultsChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/api/chat/results`, payload);
  }
}
