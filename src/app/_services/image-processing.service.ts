import { Injectable } from '@angular/core';
import { Product } from '../_model/product.model';
import { FileHandle } from '../_model/file-handle.model';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class ImageProcessingService {
  constructor(private sanitizer: DomSanitizer) {}

  public createImages(product: Product): Product {
    const images: any[] = Array.isArray(product.productImages)
      ? product.productImages
      : [];
    const imagesToFileHandles: FileHandle[] = [];

    images.forEach((image: any) => {
      if (
        !image ||
        typeof image.picBytes !== 'string' ||
        typeof image.name !== 'string' ||
        typeof image.type !== 'string'
      ) {
        console.warn('Skipping invalid image object:', image);
        return;
      }

      try {
        const imageBlob = this.DataURItoBlob(image.picBytes, image.type);
        const imageFile = new File([imageBlob], image.name, {
          type: image.type,
        });
        const imageUrl = this.sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(imageFile)
        );
        imagesToFileHandles.push({ file: imageFile, url: imageUrl });
      } catch (error) {
        console.error('Failed to process image:', error, image);
      }
    });

    product.productImages = imagesToFileHandles;
    return product;
  }

  public DataURItoBlob(picBytes: string, imageType: string): Blob {
    if (typeof picBytes !== 'string') {
      console.error('picBytes is invalid or undefined:', picBytes);
      return new Blob();
    }

    try {
      const sanitized = picBytes
        .replace(/\s/g, '')
        .replace(/[^A-Za-z0-9+/=]/g, '');
      const paddedBase64 = sanitized.padEnd(
        sanitized.length + ((4 - (sanitized.length % 4)) % 4),
        '='
      );
      const byteString = window.atob(paddedBase64);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      return new Blob([uint8Array], { type: imageType });
    } catch (error) {
      console.error(
        'Base64 decoding failed for image:',
        error,
        'Input (truncated):',
        picBytes.slice(0, 40)
      );
      return new Blob();
    }
  }
}
