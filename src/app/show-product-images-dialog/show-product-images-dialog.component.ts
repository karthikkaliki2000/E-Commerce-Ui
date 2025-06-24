import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FileHandle } from '../_model/file-handle.model';

@Component({
  selector: 'app-show-product-images-dialog',
  templateUrl: './show-product-images-dialog.component.html',
  styleUrls: ['./show-product-images-dialog.component.css'],
})
export class ShowProductImagesDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.receiveImages();
    this.onResize({ target: window });
  }

  receiveImages() {
    console.log('------>' + this.data);
  }

  cols: number = 4;

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const width = event.target.innerWidth;
    this.cols = width < 600 ? 1 : width < 960 ? 2 : 4;
  }

  close(): void {
    this.dialog.closeAll();
  }
}
