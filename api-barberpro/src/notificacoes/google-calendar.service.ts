import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private auth: InstanceType<typeof google.auth.JWT>;
  private calendar: ReturnType<typeof google.calendar>;

  constructor() {
    this.auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async criarEventoAgenda(dados: {
    barbeiroEmail: string;
    clienteEmail: string;
    servicoNome: string;
    servicoDescricao?: string;
    servicoPreco: number;
    data: string;
    horaInicio: string;
    horaFim: string;
    barbeiroNome: string;
    clienteNome: string;
  }) {
    const evento = {
      summary: `${dados.servicoNome} - ${dados.clienteNome} × ${dados.barbeiroNome}`,
      description: `Serviço: ${dados.servicoNome}\nPreço: R$ ${dados.servicoPreco}\nCliente: ${dados.clienteNome}\nBarbeiro: ${dados.barbeiroNome}`,
      start: {
        dateTime: `${dados.data}T${dados.horaInicio}`,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: `${dados.data}T${dados.horaFim}`,
        timeZone: 'America/Sao_Paulo',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: evento,
    });

    return response.data;
  }
}
