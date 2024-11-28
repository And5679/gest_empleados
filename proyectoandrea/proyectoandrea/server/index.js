const express = require("express");
const cors = require("cors");
const empleadosRoutes = require("./routes/empleados.routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/", empleadosRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
