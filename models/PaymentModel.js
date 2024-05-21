const mongoose =require('mongoose');

const Payment = new mongoose.Schema({
    c_id:{
        type:mongoose.Schema.ObjectId
    },
    s_id:{
        type:mongoose.Schema.ObjectId
    },
    transaction_amount:{
        type:String,
        required:true
    },
    transaction_ID:{
        type:String,
        required:true
    },
    transaction_date: {
        type: Date,
        default: Date.now
    }
})

const PaymentModel= mongoose.model('PaymnetDetails',Payment);
module.exports = PaymentModel;
