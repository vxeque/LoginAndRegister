import express from "express";
import { UserRepository } from "./userRepository.js";
import { PORT, SECRET_JWT_KEY } from "./config.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.access_token;

  req.session = { user: null };

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.session.user = data;
  } catch {}

  next(); // seguir a la siguiente ruta o middleware
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  // if (!token) return res.render("index");

  const { user } = req.session;

  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", { errorlogin: "" });
});

// Datos de ejemplo (simulación de una base de datos o datos estáticos)
const cars = [
  {
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2020,
    color: "Rojo",
    motor: "1.8L",
    precio: "$25,000",
  },
  {
    marca: "Honda",
    modelo: "Civic",
    anio: 2019,
    color: "Azul",
    motor: "2.0L",
    precio: "$22,500",
  },
  {
    marca: "Ford",
    modelo: "Mustang",
    anio: 2021,
    color: "Negro",
    motor: "5.0L",
    precio: "$40,000",
  },
  {
    marca: "Chevrolet",
    modelo: "Camaro",
    anio: 2018,
    color: "Blanco",
    motor: "6.2L",
    precio: "$38,000",
  },
];

app.post("/start", (req, res) => {
  const { username, password } = req.body;

  try {
    const user = UserRepository.login({ username, password });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_JWT_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("access_token", token, {
      httpOnly: true, // la cookie solo se puede acceder en el servidor
      secure: process.env.NODE_ENV == "production", // la cookie solo se puede acceder en https
      sameSite: "strict", // la cookie se puede acceder desde el mismo dominio
      maxAge: 1000 * 60 * 60, // la cookie solo tiene valides una hora
    });

    // Redirigir explícitamente después de establecer la cookie
    res.redirect(308, "/cars");
    // console.log('hola')
  } catch (error) {
    res.redirect("/protected");
    // res.render("login", { errorlogin: error.message });
    // res.status(401).send(error.message);
  }

  // res.render("login");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    const id = UserRepository.create({ username, password });
    // res.redirect("/login");
    // console.log("id", id);
    res.redirect('/login');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("access_token").json({ message: "logout successful " });

  res.send("login");
});

// protected
app.get("/protected", (req, res) => {
  const { user } = req.session;
  if (!user) return res.status(403).send("Access not authorized");

  res.render("login", { errorlogin: "Error al iniciar sesión" });
  // res.render("errorlogin", { alertMessage: "Access not authorized" });
});

// // Ruta GET para la lista de carros
app.get("/cars", (req, res) => {
  res.render("cars", { cars });
});

app.listen(PORT, () => {
  console.log(`servidor en el puerto ${PORT}`);
});
