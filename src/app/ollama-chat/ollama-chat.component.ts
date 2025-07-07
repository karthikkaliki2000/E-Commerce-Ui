import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OllamaChatService } from '../_services/ollama-chat.service';

interface OllamaChatHistoryItem {
  text: string;
  isUser: boolean;
  time: Date | string;
  bot?: string | SafeHtml;
  streaming?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-ollama-chat',
  templateUrl: './ollama-chat.component.html',
  styleUrls: ['./ollama-chat.component.css']
})
export class OllamaChatComponent implements OnInit, AfterViewInit {
  message = '';
  response = '';
  loadingOllama = false;
  chatHistory: OllamaChatHistoryItem[] = [];
  @ViewChild('bottomOfChat') bottomOfChat!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef;
  streamingBotMessage: string = '';
  streamingTimeout: any;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private ollamaChatService: OllamaChatService) {}

  ngOnInit() {
    this.loadHistory();
  }

  ngAfterViewInit() {
    this.focusInput();
  }

  private cleanBotText(text: string | undefined): string {
    if (!text) return '';
    return text
      .replace(/SafeValue must use \[property\]=binding: ?/g, '')
      .replace(/\(see https:\/\/g\.co\/ng\/security#xss\)/g, '')
      .replace(/^[\s\.:]+|[\s\.:]+$/g, '')
      .replace(/\[object Object\]/g, '')
      .replace(/undefined/g, '')
      .replace(/SafeValue must use \[property\]=binding:.*?\(see https:\/\/g\.co\/ng\/security#xss\)/g, '')
      .trim();
  }

  loadHistory() {
    const stored = localStorage.getItem('ollamaChatHistory');
    if (stored) {
      try {
        this.chatHistory = JSON.parse(stored).map((msg: any) => {
          const cleanText = this.cleanBotText(msg.text);
          let botCleaned = msg.bot;
          if (botCleaned && typeof botCleaned === 'string') {
            botCleaned = this.cleanBotText(botCleaned);
          }
          return {
            text: cleanText,
            isUser: msg.isUser,
            time: msg.time,
            bot: botCleaned ? this.sanitizer.bypassSecurityTrustHtml(botCleaned) : undefined,
            streaming: msg.streaming,
            error: msg.error
          };
        });
      } catch { this.chatHistory = []; }
    } else {
      this.chatHistory = [];
    }
  }

  saveChatHistory() {
    const toStore = this.chatHistory.map(msg => ({
      text: this.cleanBotText(msg.text),
      isUser: msg.isUser,
      time: msg.time,
      bot: typeof msg.bot === 'string' ? this.cleanBotText(msg.bot) : (msg.bot ? '' + msg.bot : undefined),
      streaming: msg.streaming,
      error: msg.error
    }));
    localStorage.setItem('ollamaChatHistory', JSON.stringify(toStore));
  }

  getConciseAnswer(text: string): string {
    let cleaned = text.replace(/SafeValue must use \[property\]=binding: ?/g, '')
      .replace(/\(see https:\/\/g\.co\/ng\/security#xss\)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[\s\.:]+|[\s\.:]+$/g, '') // Remove leading/trailing whitespace, colons, periods
      .replace(/\[object Object\]/g, '') // Remove accidental object string
      .replace(/undefined/g, '') // Remove accidental undefined
      .trim();
    // Remove any remaining XSS warning
    cleaned = cleaned.replace(/SafeValue must use \[property\]=binding:.*?\(see https:\/\/g\.co\/ng\/security#xss\)/g, '');
    return cleaned;
  }

  askOllama() {
    if (!this.message.trim() || this.loadingOllama) return;
    const userMsg = this.message;
    const now = new Date();
    this.chatHistory.push({ text: userMsg, isUser: true, time: now });
    this.saveChatHistory();
    this.loadingOllama = true;
    this.response = '';
    this.message = '';
    setTimeout(() => this.scrollToBottom(), 0);
    this.focusInput();
    const historyTexts = this.chatHistory.filter(h => h.isUser).map(h => h.text);
    this.ollamaChatService.askOllama(userMsg, historyTexts)
      .subscribe({
        next: res => {
          let cleaned = (res as string).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          const concise = this.getConciseAnswer(cleaned);
          this.startStreamingBotMessage(concise);
        },
        error: err => {
          this.chatHistory.push({ text: 'Error: ' + err.message, isUser: false, time: new Date(), error: true });
          this.saveChatHistory();
          this.response = 'Error: ' + err.message;
          this.loadingOllama = false;
          setTimeout(() => this.scrollToBottom(), 0);
          this.focusInput();
        }
      });
  }

  startStreamingBotMessage(fullText: string) {
    this.streamingBotMessage = '';
    let i = 0;
    const now = new Date();
    const streamingMsg: any = { text: '', isUser: false, time: now, streaming: true };
    this.chatHistory.push(streamingMsg);
    this.saveChatHistory();
    const streamNext = () => {
      if (i < fullText.length) {
        this.streamingBotMessage += fullText[i];
        streamingMsg.text = this.streamingBotMessage;
        streamingMsg.bot = this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(this.streamingBotMessage));
        this.saveChatHistory();
        setTimeout(() => this.scrollToBottom(), 0);
        i++;
        this.streamingTimeout = setTimeout(streamNext, 15); // Typing speed
      } else {
        streamingMsg.streaming = false;
        streamingMsg.text = fullText;
        streamingMsg.bot = this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(fullText));
        this.saveChatHistory();
        this.loadingOllama = false;
        setTimeout(() => this.scrollToBottom(), 0);
        this.focusInput();
      }
    };
    streamNext();
  }

  clearHistory() {
    this.chatHistory = [];
    localStorage.removeItem('ollamaChatHistory');
  }

  markdownToHtml(md: string): string {
    let html = md
      .replace(/SafeValue must use \[property\]=binding: ?/g, '')
      .replace(/\(see https:\/\/g\.co\/ng\/security#xss\)/g, '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- /g, '<br/>• ')
      .replace(/\n/g, '<br/>');
    return html;
  }

  scrollToBottom() {
    if (this.bottomOfChat) {
      this.bottomOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  focusInput() {
    setTimeout(() => {
      if (this.chatInput && this.chatInput.nativeElement) {
        this.chatInput.nativeElement.focus();
      }
    }, 0);
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askOllama();
    }
  }
} 