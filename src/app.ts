import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { globalError } from "./middleware/globalError";
import { notFound } from "./middleware/notFound";
import { authRouter } from "./module/auth/auth.route";

const app: Application = express();
const allowedOrigins = [
  "http://localhost:3000",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// app.post("/api/payments/confirm", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});

app.use("/api/v1/auth", authRouter);

app.use(globalError);
app.use(notFound);

export default app;
