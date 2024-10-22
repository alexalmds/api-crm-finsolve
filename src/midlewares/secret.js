export const secret = (req, res, next) => {
    const {secret} = req.query;
    console.log(req.query)
    if (secret){
        if (secret === 'FSC20241011'){
            next()
        }
        else {
            return res.status(401).send({message: "Secret is invalid!"})
        }
    }
    else {
        return res.status(401).send({message: "You don't have permission to aceed this"})
    }
}