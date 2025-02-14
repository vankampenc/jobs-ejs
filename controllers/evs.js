const Ev = require('../models/EV')


const getAllEVs = async (req, res) => {
    const evs = await Ev.find({ createdBy: req.user._id }).sort('createdAt')
    res.render("evs", { evs });
}

const editEV = async (req, res) => {
    const id = req.params.id
    const ev = await Ev.findById({ _id: id })
    res.render("ev", { ev })
}

const createEV = async (req, res) => {
    res.render("ev", { ev: null })
}

// req.body.createdBy = req.user.userID
// const ev = await Ev.create(req.body)
// console.log("EV", ev)
// res.status(200).json({ ev })

module.exports = {
    getAllEVs,
    editEV,
    createEV
}