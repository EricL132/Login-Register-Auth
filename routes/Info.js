const router = require('express').Router();
const jwt = require('jsonwebtoken')
var fetch = require('node-fetch');
const refreshModel = require('../model/refreshtoken')

router.post('/reftoken', async (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken === null) return res.status(401).send('No token was sent')
    const userRefresh = await refreshModel.findOne({ token: refreshToken })
    if (userRefresh) {
        
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) res.status(403).send({accessToken:''})
            const accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN, { expiresIn: '15s' })
            return res.status(200).send({ accessToken: accessToken })
        })
    } else {
        return res.status(403).send({accessToken:''})
    }
})


router.get('/checkaccess', authenticationToken, async (req, res) => {

    return res.status(200).header('token',req.accessToken.accessToken).send({token:req.accessToken.accessToken})

})

function authenticationToken(req, res, next) {
    const authHeader = req.headers['auth-token']
    if (authHeader === null) return res.status(401).send('Invalid auth token')
   
    jwt.verify(authHeader, process.env.ACCESS_TOKEN, async (err, user) => {
        if (err) {
            
            if (req.cookies.jwt) {
                const newRefreshRes = await fetch('http://localhost:8000/auth/reftoken', { method: 'POST',headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ token: req.cookies.jwt }) })
                const accessToken = await newRefreshRes.json()
                req.accessToken = accessToken;
                if(req.accessToken.accessToken != ''){
                    next()
                }else{
                    return res.status(405).send('Logged out in info')
                }
                
            }else{
                return res.status(405).send('Logged out in info')
            }
            
        }
        req.accessToken = {accessToken:req.headers['auth-token']}
        next()
    })
}
module.exports = router


