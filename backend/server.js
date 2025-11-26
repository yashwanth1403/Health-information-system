import express from "express";
import cors from "cors";
import searchRoutes from "./routes/search.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/search", searchRoutes);

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
