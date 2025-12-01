import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ResultsChatRequest } from '../../services/chatbot.service';
import { Appointment, MedicalResults } from '../../models';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-results-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './results-chatbot.component.html',
  styleUrl: './results-chatbot.component.css'
})
export class ResultsChatbotComponent {

  @Input() appointmentId: number | null = null;
  @Input() appointment: Appointment | null = null;
  @Input() results: MedicalResults[] = [];

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = true;

  messages: ChatMessage[] = [
    {
      from: 'bot',
      text: 'Hola 👋. Puedo ayudarte a entender los resultados de tus análisis. ¿Qué deseas saber?',
      timestamp: new Date()
    }
  ];

  currentQuestion = '';
  loading = false;
  error: string | null = null;

  constructor(private chatbotService: ChatbotService) {}

  // 🔽 scroll automático
  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (e) {
      console.warn('Scroll error:', e);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 50);
  }

  toggleOpen(): void {
    console.log('toggleOpen, antes=', this.isOpen);
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.currentQuestion.trim() || !this.appointmentId || this.loading) return;

    const question = this.currentQuestion.trim();

    this.messages.push({
      from: 'user',
      text: question,
      timestamp: new Date()
    });

    this.currentQuestion = '';
    this.loading = true;
    this.error = null;

    this.scrollToBottom();

    const payload: ResultsChatRequest = {
      appointmentId: this.appointmentId,
      question,
      appointment: this.appointment,
      results: this.results
    };

    this.chatbotService.askAboutResults(payload).subscribe({
      next: (response) => {
        this.messages.push({
          from: 'bot',
          text: response.answer,
          timestamp: new Date()
        });

        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        console.error('Error en chatbot:', err);

        this.messages.push({
          from: 'bot',
          text: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor, inténtalo nuevamente.',
          timestamp: new Date()
        });

        this.error = 'Hubo un problema al procesar tu consulta.';
        this.loading = false;

        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }
}
