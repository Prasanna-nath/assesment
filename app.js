import express from "express";
import userRoutes from "./routes/userRouter.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use("/user/api", userRoutes);

app.use(express.json());

app.listen(PORT, () => {
  console.log(`server running on url http://localhost:${PORT}`);
});
