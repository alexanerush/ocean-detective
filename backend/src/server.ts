import express, { Request, Response } from "express";
import { execFile } from "child_process";
import { readFile } from "fs/promises";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 3000;

const projectRoot = path.resolve(__dirname, "../..");

app.use(cors());
app.use(express.json());


// -------------------------
// STATIC RESULTS
// -------------------------

app.use(
  "/results",
  express.static(path.join(projectRoot, "results"))
);


// -------------------------
// ROOT
// -------------------------

app.get("/", (req: Request, res: Response) => {
  res.json({
    project: "Ocean Detective",
    message: "Backend API is running"
  });
});


// -------------------------
// HEALTH CHECK
// -------------------------

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "ocean-detective-backend"
  });
});


// -------------------------
// RUN SATELLITE ANALYSIS
// -------------------------

app.post("/api/analyze", (req: Request, res: Response) => {
  const scriptPath = path.join(
    projectRoot,
    "ml",
    "scripts",
    "inspect_marida.py"
  );

  execFile(
    "python3",
    [scriptPath],
    { cwd: projectRoot },
    async (error, stdout, stderr) => {
      if (error) {
        console.error("Python analysis error:");
        console.error(stderr);

        return res.status(500).json({
          status: "error",
          message: "Satellite image analysis failed"
        });
      }

      try {
        const analysisPath = path.join(
          projectRoot,
          "results",
          "analysis.json"
        );

        const analysisFile = await readFile(
          analysisPath,
          "utf-8"
        );

        const analysis = JSON.parse(analysisFile);

        return res.json({
          status: "success",
          message: "Satellite image analysis completed",
          analysis,
          output: stdout
        });

      } catch (readError) {
        console.error(
          "Unable to read analysis.json:",
          readError
        );

        return res.status(500).json({
          status: "error",
          message:
            "Analysis completed, but statistics could not be loaded"
        });
      }
    }
  );
});


// -------------------------
// MODEL COMPARISON RESULTS
// -------------------------

app.get(
  "/api/model-comparison",
  async (req: Request, res: Response) => {
    try {
      const resultsPath = path.join(
        projectRoot,
        "results",
        "baseline_rf_results.json"
      );

      const resultsFile = await readFile(
        resultsPath,
        "utf-8"
      );

      const experiment = JSON.parse(resultsFile);

      return res.json({
        status: "success",

        experiment: {
          name: "RGB vs Multispectral Random Forest",
          dataset: "MARIDA",
          split: "validation",
          target_class: "Marine Debris"
        },

        results: experiment,

        visualization:
          "/results/validation_model_comparison.png"
      });

    } catch (error) {
      console.error(
        "Unable to read model comparison results:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Model comparison results could not be loaded"
      });
    }
  }
);


// -------------------------
// START SERVER
// -------------------------

app.listen(PORT, () => {
  console.log(
    `Ocean Detective backend is running on http://localhost:${PORT}`
  );
});