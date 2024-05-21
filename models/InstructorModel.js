const mongoose = require('mongoose');
const { bcryptPassword } = require('../controller/Securities/secure');


const Instructor = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Gender Must Be Define']
    },
    instructor_pic:{
        type:String,
    },
    dob:{
        type: Date,
        default: Date.now
    },
    qualification:{
      type:String,
      type: [String]
    },
    email_id:{
        type:String,
        required:true,
    },
    contact_no:{
        type:Number,
        required:true,
    },
    aadhar_no:{
     type:Number,
     required:true,
    },
    password:{
     type: String
    },
    state:{
     type:String,
    },
    city:{
        type:String,
    },
    zip:{
        type:String,
    },
    
})

Instructor.pre('save', async function(){
  const date = this.dob.getDate();
  let month = this.dob.getMonth()+1;

  if(month < 9){
    month = '0'+month;
  }

  const year = this.dob.getFullYear();

  const pass =""+date+''+month+''+year; 
  const encryptedPassword = await bcryptPassword(pass);
  this.password = encryptedPassword;
  console.log(pass)
  console.log(typeof(pass))
})


Instructor.methods.isPasswordChanged = async function (JWtTimeStamp) {
    if (this.passwordChangedAt) {
        const passwordChangedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWtTimeStamp < passwordChangedTimeStamp;
    }
    return false;
}

const instructor = mongoose.model('instructor',Instructor);
module.exports = instructor;
