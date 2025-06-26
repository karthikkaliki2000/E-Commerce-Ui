import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-open-router-chat',
  templateUrl: './open-router-chat.component.html',
  styleUrls: ['./open-router-chat.component.css']
})
export class OpenRouterChatComponent implements OnInit, AfterViewInit {
  message = '';
  response = '';
  loading = false;
  chatHistory: { text: string, isUser: boolean, time: Date | string, bot?: string | SafeHtml, streaming?: boolean, error?: boolean }[] = [];
  @ViewChild('bottomOfChat') bottomOfChat!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef;
  streamingBotMessage: string = '';
  streamingTimeout: any;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadHistory();
  }

  ngAfterViewInit() {
    this.focusInput();
  }

  // Utility to clean bot/user text from XSS and SafeValue warnings
  cleanChatText(text: string): string {
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
    const stored = localStorage.getItem('openRouterChatHistory');
    if (stored) {
      try {
        this.chatHistory = JSON.parse(stored).map((msg: any) => {
          const cleanText = this.cleanChatText(msg.text);
          let botCleaned = msg.bot;
          if (botCleaned && typeof botCleaned === 'string') {
            botCleaned = this.cleanChatText(botCleaned);
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
      text: this.cleanChatText(msg.text),
      isUser: msg.isUser,
      time: msg.time,
      bot: typeof msg.bot === 'string' ? this.cleanChatText(msg.bot) : (msg.bot ? '' + msg.bot : undefined),
      streaming: msg.streaming,
      error: msg.error
    }));
    localStorage.setItem('openRouterChatHistory', JSON.stringify(toStore));
  }

  getConciseAnswer(text: string): string {
    return this.cleanChatText(text);
  }

  askOpenRouter() {
    if (!this.message.trim() || this.loading) return;
    const userMsg = this.message;
    const now = new Date();
    this.chatHistory.push({ text: userMsg, isUser: true, time: now });
    this.saveChatHistory();
    this.loading = true;
    this.response = '';
    this.message = '';
    setTimeout(() => this.scrollToBottom(), 0);
    this.focusInput();
    const apiUrl = 'http://localhost:9090/api/openrouter/ask';
    const params = { message: userMsg };
    this.http.get(apiUrl, {
      params,
      responseType: 'text'
    }).subscribe({
      next: res => {
        let cleaned = (res as string).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        const concise = this.getConciseAnswer(cleaned);
        this.startStreamingBotMessage(concise);
      },
      error: err => {
        this.chatHistory.push({ text: 'Error: ' + err.message, isUser: false, time: new Date(), error: true });
        this.saveChatHistory();
        this.response = 'Error: ' + err.message;
        this.loading = false;
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
        this.streamingTimeout = setTimeout(streamNext, 15);
      } else {
        streamingMsg.streaming = false;
        streamingMsg.text = fullText;
        streamingMsg.bot = this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(fullText));
        this.saveChatHistory();
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 0);
        this.focusInput();
      }
    };
    streamNext();
  }

  clearHistory() {
    this.chatHistory = [];
    localStorage.removeItem('openRouterChatHistory');
  }

  markdownToHtml(md: string): string {
    let html = this.cleanChatText(md)
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
      this.askOpenRouter();
    }
  }
}
