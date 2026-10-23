import validator from "validator";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

//route for user login
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "L'utilisateur n'existe pas" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Identifiants invalides" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// route for user register
const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // check user already exist or not

        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.json({ success: false, message:  "L'utilisateur existe déjà" })

        }

        // validating email format & strong password

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Veuillez entrer un email valide" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Veuillez entrer un mot de passe sécurisé" })
        }

        // hashingpassword

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// route for admin login
const adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body

        const isEmail = await ( email === process.env.ADMIN_EMAIL)

        if (isEmail) {

            const isMatch = await (password === process.env.ADMIN_PASSWORD)

            if (isMatch) {
                const token = jwt.sign(
                    { key: process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD },
                    process.env.JWT_SECRET,
                    {
                        expiresIn : '20m',
                        algorithm: 'HS256'
                    }
                );
                

                return res.json({ success: true, token });
            }
        }

        res.json({ success: false, message: "Identifiants invalides" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}


export { loginUser, registerUser, adminLogin }