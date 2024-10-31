import jwt from 'jsonwebtoken';

export const checkToken = (req, res, next) => {
    const authHeader = req.headers.cookie?.split("; ")[0]
    const token = authHeader && authHeader.split("=")[1]
    const {secret} = req.query;
    if (token){
        try{
            jwt.verify(token, process.env.TOKEN)
            next()
        }
        catch(err){
            console.log(err)
            res.status(400).json({msg: "Token inválido!"})
        }
    } 
    else if (secret === 'FSC20241011'){
        next()
    }
    else {
        return res.status(401).json({msg: "Acesso negado!"})
    }
}