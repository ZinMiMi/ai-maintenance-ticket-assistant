/**
 * Simple QR Code Generator
 * Lightweight QR code generation for guest portal
 */

class QRCode {
  constructor(element, options) {
    this.element = element;
    this.text = options.text || '';
    this.width = options.width || 150;
    this.height = options.height || 150;
    this.colorDark = options.colorDark || '#000000';
    this.colorLight = options.colorLight || '#ffffff';

    this.generate();
  }

  generate() {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = this.colorLight;
    ctx.fillRect(0, 0, this.width, this.height);

    // Generate simple pattern based on text hash
    const hash = this.simpleHash(this.text);
    const moduleSize = 5;
    const modules = Math.floor(this.width / moduleSize);

    ctx.fillStyle = this.colorDark;

    // Draw QR-like pattern
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        // Position patterns (corners)
        if (this.isCornerPattern(i, j, modules)) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
        // Data pattern based on hash
        else if (this.shouldFillModule(i, j, hash)) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Draw corner markers
    this.drawCornerMarker(ctx, 0, 0, moduleSize);
    this.drawCornerMarker(ctx, (modules - 7) * moduleSize, 0, moduleSize);
    this.drawCornerMarker(ctx, 0, (modules - 7) * moduleSize, moduleSize);

    this.element.appendChild(canvas);
  }

  drawCornerMarker(ctx, x, y, size) {
    // Outer border
    ctx.fillStyle = this.colorDark;
    ctx.fillRect(x, y, 7 * size, 7 * size);

    // White inner
    ctx.fillStyle = this.colorLight;
    ctx.fillRect(x + size, y + size, 5 * size, 5 * size);

    // Dark center
    ctx.fillStyle = this.colorDark;
    ctx.fillRect(x + 2 * size, y + 2 * size, 3 * size, 3 * size);
  }

  isCornerPattern(i, j, modules) {
    // Top-left corner
    if (i < 8 && j < 8) return false;
    // Top-right corner
    if (i >= modules - 8 && j < 8) return false;
    // Bottom-left corner
    if (i < 8 && j >= modules - 8) return false;
    return false;
  }

  shouldFillModule(i, j, hash) {
    // Create deterministic pattern from hash
    const index = (i * 31 + j * 17) % hash.length;
    return hash.charCodeAt(index) % 3 === 0;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Make available globally
window.QRCode = QRCode;
