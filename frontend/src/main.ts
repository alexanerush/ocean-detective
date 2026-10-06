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
        <h2>Marine debris analysis</h2>

        <div class="analysis-placeholder">
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

      <div class="metrics-grid">
        <div class="metric">
          <span>DIMENSIONS</span>
          <strong id="dimensionsMetric">—</strong>
        </div>

        <div class="metric">
          <span>SPECTRAL BANDS</span>
          <strong id="bandsMetric">—</strong>
        </div>

        <div class="metric">
          <span>COORDINATE SYSTEM</span>
          <strong id="crsMetric">—</strong>
        </div>

        <div class="metric">
          <span>DEBRIS PIXELS</span>
          <strong id="debrisMetric">—</strong>
        </div>

        <div class="metric">
          <span>PROCESSING TIME</span>
          <strong id="processingTime">—</strong>
        </div>
      </div>

      <div class="comparison-section">
        <div class="comparison-heading">
          <div>
            <span class="step">INTERACTIVE COMPARISON</span>
            <h3>RGB / Marine debris overlay</h3>
          </div>

          <span id="comparisonValue">
            50% overlay
          </span>
        </div>

        <div class="comparison-viewer">
          <img
            id="comparisonRgb"
            class="comparison-base"
            alt="Original RGB satellite image"
          />

          <div
            id="overlayLayer"
            class="comparison-overlay"
          >
            <img
              id="comparisonOverlay"
              alt="Marine debris ground-truth overlay"
            />
          </div>
        </div>

        <div class="comparison-controls">
          <span>RGB</span>

          <input
            id="comparisonSlider"
            type="range"
            min="0"
            max="100"
            value="50"
          />

          <span>OVERLAY</span>
        </div>
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
              id="confidenceMaskImage"
              alt="MARIDA confidence mask"
            />
          </div>

          <span>CONFIDENCE MASK</span>
          <strong>Annotation confidence levels</strong>
        </article>

        <article class="result-card">
          <div class="result-image">
            <img
              id="overlayImage"
              alt="Marine debris ground-truth overlay"
            />
          </div>

          <span>DEBRIS OVERLAY</span>
          <strong>Ground-truth marine debris pixels</strong>
        </article>
      </div>

      <section class="statistics-section">
        <div class="statistics-header">
          <div>
            <span class="step">DATA STATISTICS</span>
            <h3>Annotation distribution</h3>
          </div>

          <span class="statistics-badge">
            LIVE DATA
          </span>
        </div>

        <div class="statistics-grid">

          <article class="statistics-card">
            <div class="statistics-card-header">
              <div>
                <span class="statistics-label">
                  CLASS DISTRIBUTION
                </span>

                <strong>
                  Ground-truth classes
                </strong>
              </div>

              <span
                class="statistics-count"
                id="classCount"
              >
                —
              </span>
            </div>

            <div
              class="distribution-list"
              id="classDistribution"
            ></div>
          </article>

          <article class="statistics-card">
            <div class="statistics-card-header">
              <div>
                <span class="statistics-label">
                  CONFIDENCE DISTRIBUTION
                </span>

                <strong>
                  Annotation confidence
                </strong>
              </div>

              <span
                class="statistics-count"
                id="confidenceCount"
              >
                —
              </span>
            </div>

            <div
              class="distribution-list"
              id="confidenceDistribution"
            ></div>
          </article>

        </div>
      </section>

      <div class="analysis-log">
        <div class="log-header">
          <div>
            <span class="step">PROCESS LOG</span>
            <h3>Analysis pipeline</h3>
          </div>

          <span class="log-status">
            COMPLETE
          </span>
        </div>

        <div class="log-lines">
          <div>
            <span class="log-check">✓</span>
            GeoTIFF source loaded
          </div>

          <div>
            <span class="log-check">✓</span>
            <span id="logBands">
              Spectral bands detected
            </span>
          </div>

          <div>
            <span class="log-check">✓</span>
            <span id="logCrs">
              Coordinate system validated
            </span>
          </div>

          <div>
            <span class="log-check">✓</span>
            MARIDA class mask processed
          </div>

          <div>
            <span class="log-check">✓</span>
            Confidence mask inspected
          </div>

          <div>
            <span class="log-check">✓</span>
            <span id="logDebris">
              Marine debris ground-truth pixels located
            </span>
          </div>

          <div>
            <span class="log-check">✓</span>
            Visualization layers generated
          </div>
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
        <strong>Ground-truth Inspection</strong>
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
// TYPES
// -------------------------

interface AnalysisData {
  image: {
    width: number;
    height: number;
    bands: number;
    crs: string;
  };

  marine_debris_pixels: number;

  classes: Record<string, number>;
  confidence: Record<string, number>;
}

interface AnalysisResponse {
  status: string;
  message: string;
  analysis: AnalysisData;
  output: string;
}


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

const processingTime =
  document.querySelector<HTMLElement>("#processingTime")!;


// -------------------------
// METRICS
// -------------------------

const dimensionsMetric =
  document.querySelector<HTMLElement>("#dimensionsMetric")!;

const bandsMetric =
  document.querySelector<HTMLElement>("#bandsMetric")!;

const crsMetric =
  document.querySelector<HTMLElement>("#crsMetric")!;

const debrisMetric =
  document.querySelector<HTMLElement>("#debrisMetric")!;


// -------------------------
// STATISTICS
// -------------------------

const classDistribution =
  document.querySelector<HTMLElement>("#classDistribution")!;

const confidenceDistribution =
  document.querySelector<HTMLElement>("#confidenceDistribution")!;

const classCount =
  document.querySelector<HTMLElement>("#classCount")!;

const confidenceCount =
  document.querySelector<HTMLElement>("#confidenceCount")!;


// -------------------------
// LOG
// -------------------------

const logBands =
  document.querySelector<HTMLElement>("#logBands")!;

const logCrs =
  document.querySelector<HTMLElement>("#logCrs")!;

const logDebris =
  document.querySelector<HTMLElement>("#logDebris")!;


// -------------------------
// IMAGES
// -------------------------

const rgbImage =
  document.querySelector<HTMLImageElement>("#rgbImage")!;

const classMaskImage =
  document.querySelector<HTMLImageElement>("#classMaskImage")!;

const confidenceMaskImage =
  document.querySelector<HTMLImageElement>("#confidenceMaskImage")!;

const overlayImage =
  document.querySelector<HTMLImageElement>("#overlayImage")!;


// -------------------------
// COMPARISON
// -------------------------

const comparisonRgb =
  document.querySelector<HTMLImageElement>("#comparisonRgb")!;

const comparisonOverlay =
  document.querySelector<HTMLImageElement>("#comparisonOverlay")!;

const overlayLayer =
  document.querySelector<HTMLElement>("#overlayLayer")!;

const comparisonSlider =
  document.querySelector<HTMLInputElement>("#comparisonSlider")!;

const comparisonValue =
  document.querySelector<HTMLElement>("#comparisonValue")!;


// -------------------------
// HELPERS
// -------------------------

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}


function renderDistribution(
  container: HTMLElement,
  data: Record<string, number>,
  prefix: string
) {
  container.innerHTML = "";

  const entries = Object.entries(data);

  const maximum = Math.max(
    ...entries.map(([, value]) => value)
  );

  entries.forEach(([key, value]) => {
    const row =
      document.createElement("div");

    row.className =
      "distribution-row";

    const percentage =
      maximum > 0
        ? (value / maximum) * 100
        : 0;

    row.innerHTML = `
      <div class="distribution-info">
        <span>${prefix} ${key}</span>
        <strong>${formatNumber(value)}</strong>
      </div>

      <div class="distribution-track">
        <div
          class="distribution-bar"
          style="width: ${percentage}%"
        ></div>
      </div>
    `;

    container.appendChild(row);
  });
}


// -------------------------
// INTERACTIVE COMPARISON
// -------------------------

comparisonSlider.addEventListener("input", () => {
  const value =
    comparisonSlider.value;

  overlayLayer.style.width =
    `${value}%`;

  comparisonValue.textContent =
    `${value}% overlay`;
});


// -------------------------
// SELECT IMAGE
// -------------------------

selectButton.addEventListener("click", () => {
  fileInput.click();
});


fileInput.addEventListener("change", () => {
  const file =
    fileInput.files?.[0];

  if (!file) {
    return;
  }

  const fileSizeMB =
    (file.size / 1024 / 1024)
      .toFixed(2);

  fileTitle.textContent =
    file.name;

  fileInfo.textContent =
    `GeoTIFF · ${fileSizeMB} MB`;

  selectButton.textContent =
    "Change image";

  analysisStatus.textContent =
    "Satellite image ready";

  analysisDescription.textContent =
    "The selected image is ready for MARIDA ground-truth analysis.";

  projectStatus.textContent =
    "Image loaded";

  analyzeButton.textContent =
    "Analyze image";

  analyzeButton.disabled =
    false;

  resultsSection.hidden =
    true;
});


// -------------------------
// RUN ANALYSIS
// -------------------------

analyzeButton.addEventListener(
  "click",
  async () => {

    const startTime =
      performance.now();

    analyzeButton.disabled =
      true;

    analyzeButton.textContent =
      "Analyzing...";

    analysisStatus.textContent =
      "Analysis in progress";

    analysisDescription.textContent =
      "Processing Sentinel-2 imagery and MARIDA annotations with the Python analysis module.";

    projectStatus.textContent =
      "Analyzing";

    resultsSection.hidden =
      true;

    try {

      const response =
        await fetch(
          "http://localhost:3000/api/analyze",
          {
            method: "POST"
          }
        );

      if (!response.ok) {
        throw new Error(
          `Analysis request failed: ${response.status}`
        );
      }

      const result: AnalysisResponse =
        await response.json();

      const analysis =
        result.analysis;

      if (!analysis) {
        throw new Error(
          "Analysis statistics were not returned"
        );
      }


      // -------------------------
      // PROCESSING TIME
      // -------------------------

      const endTime =
        performance.now();

      const elapsedSeconds =
        (
          (endTime - startTime)
          / 1000
        ).toFixed(2);


      // -------------------------
      // METRICS
      // -------------------------

      dimensionsMetric.textContent =
        `${analysis.image.width} × ${analysis.image.height}`;

      bandsMetric.textContent =
        String(
          analysis.image.bands
        );

      crsMetric.textContent =
        analysis.image.crs;

      debrisMetric.textContent =
        formatNumber(
          analysis.marine_debris_pixels
        );

      processingTime.textContent =
        `${elapsedSeconds} s`;


      // -------------------------
      // STATISTICS
      // -------------------------

      classCount.textContent =
        `${Object.keys(analysis.classes).length} classes`;

      confidenceCount.textContent =
        `${Object.keys(analysis.confidence).length} levels`;

      renderDistribution(
        classDistribution,
        analysis.classes,
        "Class"
      );

      renderDistribution(
        confidenceDistribution,
        analysis.confidence,
        "Level"
      );


      // -------------------------
      // PROCESS LOG
      // -------------------------

      logBands.textContent =
        `${analysis.image.bands} spectral bands detected`;

      logCrs.textContent =
        `Coordinate system validated — ${analysis.image.crs}`;

      logDebris.textContent =
        `Marine debris ground-truth class located — ${analysis.marine_debris_pixels} pixels`;


      // -------------------------
      // STATUS
      // -------------------------

      analysisStatus.textContent =
        "Marine debris present in ground truth";

      analysisDescription.textContent =
        `Analysis completed successfully. ${analysis.marine_debris_pixels} pixels belong to the MARIDA marine debris ground-truth class.`;

      projectStatus.textContent =
        "Analysis complete";

      analyzeButton.textContent =
        "Analyze again";


      // -------------------------
      // IMAGES
      // -------------------------

      const timestamp =
        Date.now();

      const rgbUrl =
        `http://localhost:3000/results/rgb_image.png?t=${timestamp}`;

      const classMaskUrl =
        `http://localhost:3000/results/class_mask.png?t=${timestamp}`;

      const confidenceMaskUrl =
        `http://localhost:3000/results/confidence_mask.png?t=${timestamp}`;

      const overlayUrl =
        `http://localhost:3000/results/marine_debris_overlay.png?t=${timestamp}`;

      rgbImage.src =
        rgbUrl;

      classMaskImage.src =
        classMaskUrl;

      confidenceMaskImage.src =
        confidenceMaskUrl;

      overlayImage.src =
        overlayUrl;


      // -------------------------
      // COMPARISON
      // -------------------------

      comparisonRgb.src =
        rgbUrl;

      comparisonOverlay.src =
        overlayUrl;

      comparisonSlider.value =
        "50";

      overlayLayer.style.width =
        "50%";

      comparisonValue.textContent =
        "50% overlay";


      // -------------------------
      // SHOW RESULTS
      // -------------------------

      resultsSection.hidden =
        false;

      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      console.log(
        "Analysis result:",
        result
      );

    } catch (error) {

      console.error(
        "Analysis error:",
        error
      );

      analysisStatus.textContent =
        "Analysis failed";

      analysisDescription.textContent =
        "Unable to complete satellite image analysis.";

      projectStatus.textContent =
        "Error";

      analyzeButton.textContent =
        "Try again";

      resultsSection.hidden =
        true;

    } finally {

      analyzeButton.disabled =
        false;
    }
  }
);