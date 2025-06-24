import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';
import { FileHandle } from './_model/file-handle.model';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[appDrag]',
})
export class DragDirective {
  @Output() files: EventEmitter<FileHandle> = new EventEmitter();

  @HostBinding('style.background')
  private background = '#eee';

  constructor(private sanitizer: DomSanitizer) {}

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#eee';
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#eee';

    const droppedFile = event.dataTransfer?.files?.[0];
    if (droppedFile) {
      const fileHandle: FileHandle = {
        file: droppedFile,
        url: this.sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(droppedFile)
        ),
      };

      this.files.emit(fileHandle);

      console.log('Dropped file:', fileHandle);
      // Optionally emit this or pass it to your component
    } else {
      console.warn('No file dropped');
    }
  }
}
