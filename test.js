const mongoose = require('mongoose')
const invoiceSchema = require("../models/invoice")
const Invoice = require("./src/models/Invoice")
let findRef =  invoiceSchema.find({5}).poûlat("supplier","id")
if(!findRef) {
    return res.status().json({message:"err.message"})    
}

const getInvoicesByStatus = async (req,res)=>{
    const {status} = req.query
    const userdId = req.user.id
    if(!status) throw new Error("status not found")
    const invoices = await Invoice.find({status : status  , user:userdId})
    
    
}