const router = require('express').Router();
const Users = require('../model/User')
const bcrypt = require('bcrypt')
const { registerValidation, loginValidation, passwordValidation } = require('./validations');
const jwt = require('jsonwebtoken')
const refreshModel = require('../model/refreshtoken')
const nodemailer = require('nodemailer')
const verifyModel = require('../model/verifyToken')
const crypto = require('crypto');
const fetch = require('node-fetch');
const resetModel = require('../model/resetpassword')


router.post('/register', async (req, res) => {

    const { error } = registerValidation(req.body);
    if (error) return res.status(404).send({ status: error.details[0].message })

    const reqEmail = (req.body.email).toLowerCase()
    const emailExists = await Users.findOne({ email: reqEmail })

    if (emailExists) {
        return res.status(404).send({ status: 'Email already exists' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    const user = new Users({
        name: req.body.name,
        email: reqEmail,
        password: hashPassword,
    })
    try {
        await user.save()
        var token = new verifyModel({ email: user.email, token: crypto.randomBytes(16).toString('hex') });
        await token.save()

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                user: process.env.gmailUser,
                pass: process.env.gmailPass,
            },
        });

        await transporter.sendMail({
            from: `"Eric" <${process.env.gmailUser}>`,
            to: reqEmail,
            subject: "Verification email from Eric's porfolio",
            text: "Hi,\n" + "Link will expire in 24 hours\nPlease click verfication link below to verify:\n" + `http://${req.headers.host}/user/confirm/?token=${token.token}`, // plain text body
        });


        const resLogin = await fetch('http://localhost:8000/user/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, password: req.body.password, rem: true }) })
        const resRead = await resLogin.json()
        res.cookie("jwt", resRead.refreshToken, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true
        })
        return res.status(200).send({ status: 'created' })
    } catch (err) {
        return res.status(404).send({ status: err })
    }
})


router.get('/info', async (req, res) => {

    const user = await Users.findOne({ email: req.query.email })
    if (user) {
        return res.status(200).send({ name: user.name, verifystatus: user.verified })
    } else {
        return res.status(300).send('User not found')
    }
})


router.post('/logout', async (req, res) => {
    const dbItem = await refreshModel.findOneAndRemove({ token: req.cookies.jwt }, { useFindAndModify: false })
    if (dbItem) {
        return res.status(200).send('logged out')
    } else {
        return res.status(404)
    }
})


router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) {
        return res.status(400).send({ status: error.details[0].message })
    }
    const reqEmail = (req.body.email).toLowerCase()
    const user = await Users.findOne({ email: reqEmail })
    if (!user) {
        return res.status(400).send({ status: "Email doesn't exist" })
    }

    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) {
        return res.status(400).send({ status: 'Invalid password' })
    }

    const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN, { expiresIn: '15s' })
    const refreshToken = jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN)
    const userRefresh = await refreshModel.findOne({ email: reqEmail })
    if (!userRefresh) {
        const refresh = new refreshModel({
            email: reqEmail,
            token: refreshToken
        })
        await refresh.save()
    } else {
        await refreshModel.findOneAndReplace({ email: reqEmail }, { email: reqEmail, token: refreshToken })
    }

    if (req.body.rem) {
        res.cookie("jwt", refreshToken, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true
        })
    } else {
        res.cookie("jwt", refreshToken, {
            httpOnly: true
        })
    }

    return res.header('auth-token', token).send({ accessToken: token, refreshToken: refreshToken })
})


router.post('/resetpasstoken', async (req, res) => {
    const reqEmail = (req.body.email).toLowerCase()
    const user = await Users.findOne({ email: reqEmail })
    if (!user) return res.status(400).send({ status: 'Invalid Email' })
    const userRefresh = await refreshModel.findOne({ email: reqEmail })
    if (userRefresh) await userRefresh.remove()
    const resettokenexist = await resetModel.findOne({ email: reqEmail })
    if (resettokenexist) await resettokenexist.remove()
    var token = new resetModel({ email: user.email, token: crypto.randomBytes(16).toString('hex') });
    await token.save()
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
            user: process.env.gmailUser,
            pass: process.env.gmailPass,
        },
    });

    await transporter.sendMail({
        from: `"Eric" <${process.env.gmailUser}>`,
        to: reqEmail,
        subject: "Verification email from Eric's porfolio",
        text: "Hi,\n" + "Link will expire in 24 hours\nPlease click below to reset password:\n" + `${req.headers.origin}/resetpassword/?token=${token.token}`,
    });
    return res.status(200).send({ status: "Reset password email sent" })

})
router.get('/confirm', async (req, res) => {
    const dbVerify = await verifyModel.findOne({ token: req.query.token }, (err, data) => {
        if (err) return err
        return data;
    })
    if (!dbVerify) return res.status(404).send('Verification key expired')
    await Users.findOneAndUpdate({ email: dbVerify.email }, { verified: true }, { new: true })
    await dbVerify.remove()
    res.status(200).send('Verified')

})

router.get('/checkresettoken', async (req, res) => {
    if (!req.query.token) return res.status(400).send({ status: 'Invalid token' })
    const resettokenexist = await resetModel.findOne({ token: req.query.token })
    if (!resettokenexist) return res.status(400).send({ status: 'Invalid token' })
    return res.status(200).send('doneee')
})

router.post('/resetpass', async (req, res) => {
    const { error } = passwordValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    const validToken = await resetModel.findOne({ token: req.body.token })
    if (!validToken) return res.status(400).send('Invalid token')
    const user = await Users.findOne({ email: validToken.email })
    if (!user) return res.status(400).send('Invalid User')
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    await user.updateOne({ password: hashPassword })
    await validToken.remove()
    return res.status(200).send('Password reset done')
})

module.exports = router


