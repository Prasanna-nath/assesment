import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class UserController {
  static userRegistretion = async (req, res) => {
    const { name, email, password, password_confrim } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows.length > 0) {
        res.send({ status: "failed", message: "user all ready exists" });
      } else {
        if (name && email && password && password_confrim) {
          if (password === password_confrim) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            await pool.query(
              "INSERT INTO users (name, email, password) VALUES ($1,$2,$3)",
              [name, email, hashPassword]
            );

            const saved_user = await pool.query(
              "SELECT * FROM users WHERE email = $1",
              [email]
            );

            const token = jwt.sign(
              { userId: saved_user.rows[0].id },
              process.env.SERECT_KEY,
              {
                expiresIn: "15d",
              }
            );
            res.send({
              status: "success",
              message: "user register successfully",
              token: token,
            });
          } else {
            res.send({ status: "failed", message: "Password doesnot match" });
          }
        } else {
          res.send({ status: "failed", message: "All fields are require" });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  static userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows.length > 0) {
        const retriveUser = user.rows[0];
        const isMatch = await bcrypt.compare(password, retriveUser.password);

        if (email && password) {
          if (retriveUser.email === email && isMatch) {
            const token = jwt.sign(
              { userId: user.rows[0].id },
              process.env.SERECT_KEY,
              {
                expiresIn: "15d",
              }
            );
            res.send({
              status: "success",
              message: "user login successfully",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "email or password doesnot match",
            });
          }
        } else {
          res.send({ status: "failed", message: "All fields are require" });
        }
      } else {
        res.send({ status: "failed", message: "user all ready exists" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmtion } = req.body;
    //console.log(req.userId);
    const userId = req.user.rows[0].id;
    if (password && password_confirmtion) {
      if (password !== password_confirmtion) {
        res.send({
          status: "failed",
          message: "Password and Confirm Password not match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2;", [
          newHashPassword,
          userId,
        ]);
        res.send({
          status: "success",
          message: "Password changed succesfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  };
}

export default UserController;
