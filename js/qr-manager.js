/**
 * QuizFlow Pro - QR Code & Join Code Engine
 * Powers real-time room creation, QR generation, camera scanning, and instant cross-device joining.
 */

class QRManager {
  constructor() {
    this.storage = window.storageManager;
    this.sound = window.soundManager;
    this.stream = null;
    this.isScanning = false;
    this.facingMode = 'environment'; // 'environment' (back camera) or 'user' (front camera)
    this.scanRafId = null;
    this.activeRoom = null;
  }

  /* -------------------------------------------------------------
     Code Generation & Helpers
     ------------------------------------------------------------- */
  generateCode(prefix = 'QZ') {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like 0, O, 1, I
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${randomPart}`;
  }

  /**
   * Builds a complete, shareable join URL encoding session parameters
   */
  createJoinURL(roomData) {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = new URL(baseUrl);
    url.searchParams.set('join', roomData.code);

    if (roomData.category) url.searchParams.set('cat', roomData.category);
    if (roomData.difficulty) url.searchParams.set('diff', roomData.difficulty);
    if (roomData.count) url.searchParams.set('count', roomData.count.toString());
    if (roomData.title) url.searchParams.set('title', roomData.title);

    // If it's a custom quiz, encode questions into base64 payload so remote phones can load it seamlessly
    if (roomData.customQuestions && roomData.customQuestions.length > 0) {
      try {
        const minimal = roomData.customQuestions.map(q => ({
          q: q.question,
          o: q.options,
          c: q.correctIndex,
          e: q.explanation || ''
        }));
        const jsonStr = JSON.stringify(minimal);
        const encoded = btoa(encodeURIComponent(jsonStr));
        url.searchParams.set('cq', encoded);
      } catch (err) {
        console.warn('Could not compress custom questions into URL', err);
      }
    }

    return url.toString();
  }

  /**
   * Generates a dynamic SVG QR Code string using qrcode-generator
   */
  generateQRSVG(text, cellSize = 6, margin = 2) {
    try {
      if (typeof qrcode !== 'function') {
        throw new Error('QR code generator library not loaded');
      }
      // Type 0 = auto-detect size, Error Correction = 'M' (15% redundancy)
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      return qr.createSvgTag({
        cellSize,
        margin,
        scalable: true
      });
    } catch (err) {
      console.error('Error generating QR SVG:', err);
      return `<div class="qr-error-fallback">Unable to render QR code</div>`;
    }
  }

  /**
   * Generates a Data URL image of the QR Code
   */
  generateQRDataURL(text, cellSize = 8, margin = 3) {
    try {
      if (typeof qrcode !== 'function') return '';
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      return qr.createDataURL(cellSize, margin);
    } catch (err) {
      console.error('Error generating QR DataURL:', err);
      return '';
    }
  }

  /**
   * Downloads a stylish invitation card with QR Code, Quiz Title, and Join Code
   */
  downloadInviteCard(roomData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 640;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative header bar
    const barGrad = ctx.createLinearGradient(0, 0, width, 0);
    barGrad.addColorStop(0, '#2563eb');
    barGrad.addColorStop(1, '#4f46e5');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, width, 14);

    // Brand title
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 28px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QuizFlow PRO', width / 2, 60);

    // Quiz Title
    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#2563eb';
    const displayTitle = roomData.title || 'Live Interactive Challenge';
    ctx.fillText(displayTitle, width / 2, 98);

    // Subtitle
    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${roomData.count || 10} Questions • ${roomData.difficulty || 'All'} Levels • Hosted by ${roomData.hostName || 'Host'}`, width / 2, 126);

    // QR Code Container Box
    const boxSize = 340;
    const boxX = (width - boxSize) / 2;
    const boxY = 150;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 16);
    ctx.fill();
    ctx.stroke();

    // Draw QR Code Image
    const joinUrl = this.createJoinURL(roomData);
    const qrDataUrl = this.generateQRDataURL(joinUrl, 8, 2);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, boxX + 18, boxY + 18, boxSize - 36, boxSize - 36);

      // Join Code Banner
      const bannerY = 515;
      ctx.fillStyle = '#eff6ff';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, bannerY, boxSize, 72, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('ROOM JOIN CODE', width / 2, bannerY + 24);

      ctx.font = '800 32px "JetBrains Mono", monospace';
      ctx.fillStyle = '#2563eb';
      ctx.fillText(roomData.code, width / 2, bannerY + 58);

      // Footer Instructions
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('Scan with smartphone camera or enter code at app', width / 2, 625);

      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      const shortUrl = window.location.host || 'quizflow-pro';
      ctx.fillText(`Join at: ${shortUrl}`, width / 2, 650);

      // Trigger download
      const link = document.createElement('a');
      link.download = `QuizFlow_${roomData.code}_Invite.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = qrDataUrl;
  }

  /* -------------------------------------------------------------
     Camera Scanner Engine (HTML5 getUserMedia + jsQR)
     ------------------------------------------------------------- */
  /**
   * Starts camera streaming and continuous QR decoding
   */
  async startCamera(videoEl, canvasEl, onDetected, onError) {
    if (this.isScanning) {
      this.stopCamera();
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onError) onError(new Error('Camera access is not supported by this browser environment.'));
      return false;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = this.stream;
      videoEl.setAttribute('playsinline', true); // Critical for iOS Safari
      await videoEl.play();

      this.isScanning = true;
      const ctx = canvasEl.getContext('2d', { willReadFrequently: true });

      const scanLoop = () => {
        if (!this.isScanning) return;

        if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
          canvasEl.width = videoEl.videoWidth;
          canvasEl.height = videoEl.videoHeight;
          ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

          const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);

          if (typeof jsQR === 'function') {
            const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (qrResult && qrResult.data) {
              const scannedText = qrResult.data.trim();
              if (scannedText) {
                // Play audio cue
                if (this.sound) this.sound.playScanSuccess();
                this.stopCamera();
                if (onDetected) onDetected(scannedText);
                return;
              }
            }
          }
        }

        this.scanRafId = requestAnimationFrame(scanLoop);
      };

      this.scanRafId = requestAnimationFrame(scanLoop);
      return true;
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      this.stopCamera();
      if (onError) onError(err);
      return false;
    }
  }

  /**
   * Stops video stream and animation frame loops
   */
  stopCamera(videoEl = null) {
    this.isScanning = false;
    if (this.scanRafId) {
      cancelAnimationFrame(this.scanRafId);
      this.scanRafId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      this.stream = null;
    }

    if (videoEl) {
      videoEl.srcObject = null;
    }
  }

  /**
   * Switches camera facing mode (e.g. front vs rear camera)
   */
  async switchCamera(videoEl, canvasEl, onDetected, onError) {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    return await this.startCamera(videoEl, canvasEl, onDetected, onError);
  }

  /**
   * Scans a static uploaded image file for QR Code
   */
  scanImageFile(file, onDetected, onError) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (typeof jsQR === 'function') {
            const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (qrResult && qrResult.data) {
              if (this.sound) this.sound.playScanSuccess();
              if (onDetected) onDetected(qrResult.data.trim());
            } else {
              if (onError) onError(new Error('No clear QR code detected in this image. Try another photo.'));
            }
          } else {
            if (onError) onError(new Error('QR Decoder library is unavailable.'));
          }
        } catch (err) {
          if (onError) onError(err);
        }
      };
      img.onerror = () => {
        if (onError) onError(new Error('Failed to load image file.'));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* -------------------------------------------------------------
     Parsing & Resolving Rooms from Code or URL
     ------------------------------------------------------------- */
  /**
   * Parses arbitrary user input (URL, QR code string, or plain code)
   */
  parseInput(input) {
    if (!input) return null;
    const trimmed = input.trim();

    // Check if input is a URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('?')) {
      try {
        const url = new URL(trimmed, window.location.origin);
        const code = url.searchParams.get('join') || url.searchParams.get('code') || '';
        const cat = url.searchParams.get('cat') || '';
        const diff = url.searchParams.get('diff') || '';
        const count = parseInt(url.searchParams.get('count'), 10) || 10;
        const title = decodeURIComponent(url.searchParams.get('title') || '');
        const cqEncoded = url.searchParams.get('cq') || '';

        let customQuestions = null;
        if (cqEncoded) {
          try {
            const jsonStr = decodeURIComponent(atob(cqEncoded));
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed)) {
              customQuestions = parsed.map((item, idx) => ({
                id: `cq_${idx}`,
                category: 'custom',
                difficulty: 'medium',
                question: item.q,
                options: item.o,
                correctIndex: item.c,
                explanation: item.e || ''
              }));
            }
          } catch (e) {
            console.warn('Failed to parse embedded custom questions from URL', e);
          }
        }

        return {
          code: code ? code.toUpperCase() : 'QZ-JOIN',
          category: cat || 'all',
          difficulty: diff || 'all',
          count,
          title: title || 'Shared Challenge',
          customQuestions
        };
      } catch (err) {
        console.warn('URL parsing failed, falling back to raw code string', err);
      }
    }

    // Direct plain code format
    const cleanCode = trimmed.replace(/[^A-Za-z0-9\-_]/g, '').toUpperCase();
    return {
      code: cleanCode
    };
  }

  /**
   * Resolves a room record from storage or generates one on-the-fly from known patterns
   */
  resolveRoom(parsed, availableCategories = []) {
    if (!parsed || !parsed.code) return null;
    const code = parsed.code.toUpperCase();

    // 1. Check storage for existing room
    const savedRoom = this.storage.getRoom(code);
    if (savedRoom) {
      return savedRoom;
    }

    // 2. If parsed has URL params (category, customQuestions, etc.)
    if (parsed.category || parsed.customQuestions) {
      const title = parsed.title || this.getCategoryName(parsed.category, availableCategories);
      const newRoom = {
        code,
        title,
        category: parsed.category || 'all',
        difficulty: parsed.difficulty || 'all',
        count: parsed.count || 10,
        hostName: 'Host Player',
        customQuestions: parsed.customQuestions || null,
        createdAt: Date.now()
      };
      this.storage.saveRoom(newRoom);
      return newRoom;
    }

    // 3. Fallback resolution based on code prefixes (e.g. WEB-101, TECH-202, etc.)
    let category = 'all';
    let difficulty = 'all';
    let title = 'Live Assessment Room';

    if (code.includes('WEB')) {
      category = 'web_dev';
      title = 'Web Dev & JavaScript Sprint';
    } else if (code.includes('TECH') || code.includes('SCI')) {
      category = 'science_tech';
      title = 'Science & Technology Quest';
    } else if (code.includes('GEO') || code.includes('HIST')) {
      category = 'geography_history';
      title = 'Geography & World History';
    } else if (code.includes('POP') || code.includes('ENT')) {
      category = 'pop_culture';
      title = 'Pop Culture & Trivia';
    } else if (code.includes('GEN')) {
      category = 'general_knowledge';
      title = 'General Knowledge Challenge';
    }

    const dynamicRoom = {
      code,
      title,
      category,
      difficulty,
      count: 10,
      hostName: 'Quiz Host',
      createdAt: Date.now()
    };
    this.storage.saveRoom(dynamicRoom);
    return dynamicRoom;
  }

  getCategoryName(catId, availableCategories = []) {
    if (catId === 'all') return 'All Categories Mixed Gauntlet';
    const found = availableCategories.find(c => c.id === catId);
    return found ? found.name : 'Custom Topic';
  }
}

window.qrManager = new QRManager();
