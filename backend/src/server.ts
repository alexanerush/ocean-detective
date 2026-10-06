import express, { Request, Response } from "express";
import { execFile } from "child_process";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 3000;

const projectRoot = path.resolve(__dirname, "../..");

app.use(cors());
app.use(express.json());

app.use(
  "/results",
  express.static(path.join(projectRoot, "results"))
);

app.get("/", (req: Request, res: Response) => {
  res.json({
    project: "Ocean Detective",
    message: "Backend API is running"
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "ocean-detective-backend"
  });
});

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
    (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);

        return res.status(500).json({
          status: "error",
          message: "Satellite image analysis failed"
        });
      }

      return res.json({
        status: "success",
        message: "Satellite image analysis completed",
        output: stdout
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(
    `Ocean Detective backend is running on http://localhost:${PORT}`
  );
});