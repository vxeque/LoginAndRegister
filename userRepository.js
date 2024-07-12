import crypto from "node:crypto";

import DBLocal from "db-local";
import bcrypt from "bcrypt";

const { Schema } = new DBLocal({ path: ".\\db" });

const User = Schema("User", {
  _id: { type: String, require: true },
  username: { type: String, require: true },
  password: { type: String, require: true },
});

export class UserRepository {
  static async create({ username, password }) {
    Validation.username(username);
    Validation.password(password);

    // asegurarse que el username no existe
    const user = await User.findOne({ username });
    if (user) throw new Error("username already exists");

    const id = crypto.randomUUID();

    const hashedPassword = bcrypt.hashSync(password, 4);
    User.create({
      _id: id,
      username,
      password: hashedPassword,
    }).save();

    return id;
  }

  static login({ username, password }) {
    Validation.username(username);
    Validation.password(password);

    const user = User.findOne({ username });
    if (!user) throw new Error("username does not exist");

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) throw new Error("password is valid");

    const { password: _, ...publicUser } = user;

    return publicUser;
  }
}

class Validation {
  static username(username) {
    // validaciones del username
    if (typeof username != "string") {
      throw new Error("username must be a string");
    }

    if (typeof username.length < 3) {
      throw new Error("username must be at least 3 characters long");
    }
  }

  static password(password) {
    if (typeof password != "string") {
      throw new Error("username must be a string");
    }

    if (typeof password.length < 6) {
      throw new Error("username must be at least 3 characters long");
    }
  }
}
