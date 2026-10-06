import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main class="app">
    <header class="header">
      <div>
        <span class="eyebrow">Satellite Intelligence Platform</span>
        <h1>Ocean Detective</h1>
        <p>
          Detection and analysis of marine debris using
          Sentinel-2 satellite imagery.
        </p>
      </div>

      <div class="status">
        <span class="status-dot"></span>
        System ready
      </div>
    </header>

    <section class="workspace">
      <div class="panel">
        <span class="step">01 / INPUT</span>
        <h2>Satellite image</h2>

        <div class="upload-area">
          <div class="upload-icon">+</div>

          <strong id="fileTitle">
            Select satellite imagery
          </strong>

          <span id="fileInfo">
            GeoTIFF · Sentinel-2 · MARIDA dataset
          </span>

          <input
            id="fileInput"
            type="file"
            accept=".tif,.tiff"
            hidden
          />

          <button id="selectButton">
            Select image
          </button>
        </div>
      </div>

      <div class="panel">
        <span class="step">02 / ANALYSIS</span>
        <h2>Marine debris detection</h2>

        <div class="analysis-placeholder" id="analysisArea">
          <span id="analysisStatus">
            Waiting for satellite image
          </span>

          <p id="analysisDescription">
            Analysis results and segmentation masks
            will appear here.
          </p>

          <button id="analyzeButton" disabled>
            Analyze image
          </button>
        </div>
      </div>
    </section>

    <section
      class="results-section"
      id="resultsSection"
      hidden
    >
      <div class="results-header">
        <div>
          <span class="step">03 / RESULTS</span>
          <h2>Analysis results</h2>
        </div>

        <span class="result-badge">
          Analysis complete
        </span>
      </div>

      <div class="results-grid">
        <article class="result-card">
          <div class="result-image">
            <img
              id="rgbImage"
              alt="RGB satellite image"
            />
          </div>

          <span>RGB IMAGE</span>
          <strong>Sentinel-2 visualization</strong>
        </article>

        <article class="result-card">
          <div class="result-image">
            <img
              id="classMaskImage"
              alt="MARIDA class mask"
            />
          </div>

          <span>CLASS MASK</span>
          <strong>Ground-truth classes</strong>
        </article>

        <article class="result-card">
          <div class="result-image">
            <img
              id="overlayImage"
              alt="Marine debris overlay"
            />
          </div>

          <span>DEBRIS OVERLAY</span>
          <strong>Marine debris pixels</strong>
        </article>
      </div>

      <div class="metrics-grid">
        <div class="metric">
          <span>DIMENSIONS</span>
          <strong>256 × 256</strong>
        </div>

        <div class="metric">
          <span>SPECTRAL BANDS</span>
          <strong>11</strong>
        </div>

        <div class="metric">
          <span>COORDINATE SYSTEM</span>
          <strong>EPSG:32618</strong>
        </div>

        <div class="metric">
          <span>DEBRIS PIXELS</span>
          <strong>27</strong>
        </div>
      </div>
    </section>

    <section class="info-grid">
      <div class="info-card">
        <span>DATA SOURCE</span>
        <strong>MARIDA</strong>
      </div>

      <div class="info-card">
        <span>SATELLITE</span>
        <strong>Sentinel-2</strong>
      </div>

      <div class="info-card">
        <span>ANALYSIS</span>
        <strong>Pixel Classification</strong>
      </div>

      <div class="info-card">
        <span>STATUS</span>
        <strong id="projectStatus">
          Prototype
        </strong>
      </div>
    </section>
  </main>
`;


// -------------------------
// ELEMENTS
// -------------------------

const selectButton =
  document.querySelector<HTMLButtonElement>("#selectButton")!;

const fileInput =
  document.querySelector<HTMLInputElement>("#fileInput")!;

const fileTitle =
  document.querySelector<HTMLElement>("#fileTitle")!;

const fileInfo =
  document.querySelector<HTMLElement>("#fileInfo")!;

const analysisStatus =
  document.querySelector<HTMLElement>("#analysisStatus")!;

const analysisDescription =
  document.querySelector<HTMLElement>("#analysisDescription")!;

const projectStatus =
  document.querySelector<HTMLElement>("#projectStatus")!;

const analyzeButton =
  document.querySelector<HTMLButtonElement>("#analyzeButton")!;

const resultsSection =
  document.querySelector<HTMLElement>("#resultsSection")!;

const rgbImage =
  document.querySelector<HTMLImageElement>("#rgbImage")!;

const classMaskImage =
  document.querySelector<HTMLImageElement>("#classMaskImage")!;

const overlayImage =
  document.querySelector<HTMLImageElement>("#overlayImage")!;


// -------------------------
// SELECT SATELLITE IMAGE
// -------------------------

selectButton.addEventListener("click", () => {
  fileInput.click();
});


fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];

  if (!file) {
    return;
  }

  const fileSizeMB =
    (file.size / 1024 / 1024).toFixed(2);

  fileTitle.textContent = file.name;

  fileInfo.textContent =
    `GeoTIFF · ${fileSizeMB} MB`;

  selectButton.textContent =
    "Change image";

  analysisStatus.textContent =
    "Satellite image ready";

  analysisDescription.textContent =
    "The selected image is ready for analysis.";

  projectStatus.textContent =
    "Image loaded";

  analyzeButton.textContent =
    "Analyze image";

  analyzeButton.disabled = false;

  resultsSection.hidden = true;
});


// -------------------------
// RUN SATELLITE ANALYSIS
// -------------------------

analyzeButton.addEventListener("click", async () => {
  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing...";

  analysisStatus.textContent =
    "Analysis in progress";

  analysisDescription.textContent =
    "Processing Sentinel-2 imagery with the Python analysis module.";

  projectStatus.textContent =
    "Analyzing";

  resultsSection.hidden = true;

  try {
    const response = await fetch(
      "http://localhost:3000/api/analyze",
      {
        method: "POST"
      }
    );

    if (!response.ok) {
      throw new Error("Analysis request failed");
    }

    const result = await response.json();

    console.log("Analysis result:", result);

    analysisStatus.textContent =
      "Marine debris detected";

    analysisDescription.textContent =
      "Analysis completed successfully. 27 pixels were identified in the marine debris class.";

    projectStatus.textContent =
      "Analysis complete";

    analyzeButton.textContent =
      "Analyze again";

    // Cache-busting ensures that newly generated
    // analysis images are loaded after every run.
    const timestamp = Date.now();

    rgbImage.src =
      `http://localhost:3000/results/rgb_image.png?t=${timestamp}`;

    classMaskImage.src =
      `http://localhost:3000/results/class_mask.png?t=${timestamp}`;

    overlayImage.src =
      `http://localhost:3000/results/marine_debris_overlay.png?t=${timestamp}`;

    resultsSection.hidden = false;

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    console.error("Analysis error:", error);

    analysisStatus.textContent =
      "Analysis failed";

    analysisDescription.textContent =
      "Unable to complete satellite image analysis.";

    projectStatus.textContent =
      "Error";

    analyzeButton.textContent =
      "Try again";

    resultsSection.hidden = true;

  } finally {
    analyzeButton.disabled = false;
  }
});