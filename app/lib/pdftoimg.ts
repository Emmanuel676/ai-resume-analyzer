export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  console.log('Loading PDF.js library...');
  
  loadPromise = import("pdfjs-dist")
    .then((lib) => {
      console.log('PDF.js imported, version:', lib.version);
      lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      console.log('Worker source set to:', lib.GlobalWorkerOptions.workerSrc);
      pdfjsLib = lib;
      isLoading = false;
      return lib;
    })
    .catch((err) => {
      console.error('Failed to load PDF.js:', err);
      isLoading = false;
      throw err;
    });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    console.log('Step 1: Loading PDF.js library...');
    const lib = await loadPdfJs();
    console.log('Step 2: PDF.js loaded successfully');

    console.log('Step 3: Reading file as array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Step 4: Array buffer created, size:', arrayBuffer.byteLength);

    console.log('Step 5: Getting PDF document...');
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    console.log('Step 6: PDF document loaded, pages:', pdf.numPages);

    console.log('Step 7: Getting first page...');
    const page = await pdf.getPage(1);
    console.log('Step 8: Page loaded successfully');

    const viewport = page.getViewport({ scale: 4 });
    console.log('Step 9: Viewport created:', viewport.width, 'x', viewport.height);
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    console.log('Step 10: Rendering page...');
    await page.render({ canvasContext: context, viewport }).promise;
    console.log('Step 11: Page rendered successfully');

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Step 12: Blob created, size:', blob.size);
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            console.log('Step 13: Image file created successfully');
            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            console.error('Step 12 FAILED: Blob creation failed');
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    console.error('PDF CONVERSION ERROR:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Error details:', errorMessage);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${errorMessage}`,
    };
  }
}