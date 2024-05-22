const secure = require('../controller/Securities/secure');
const tokens = require('../controller/Securities/tokens');
const Student = require('../models/StudentModel');
const Course = require('../models/CourseModel');
const EnrolledStudent = require('../models/EnrolledStudentModel');
const FeedBack = require('../models/FeedbackModel');
const PaymentMod = require('../models/PaymentModel');
const Classes = require('../models/ClassModel');
const util = require('util');
const jwt = require('jsonwebtoken');
const { request } = require('http');
const { response, render } = require('../app');
const Razorpay = require('razorpay');
const { generate } = require('otp-generator');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
var nodemailer = require('nodemailer');
const multer = require('multer');


//==================== Get Razor Pay Key From Config File =================== 
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});


//==================== Student Registration ===================
exports.StudentRegister = async (request, response) => {
  if (request.method == 'GET') {
    const successMessage = request.flash('success');
    const errorMessage = request.flash('error');
    response.render('student/register', { successMessage, errorMessage });
  } else if (request.method == 'POST') {
    try {
      if (request.body.password === request.body.confirm_password) {
        let student = await Student.create(request.body);
        if (student) {
          request.flash('success', "Registerd SuccessFully"); // Changed from 'error' to 'success'
          response.redirect('/eLearning/api/v1/student/register');

          // Configure the transporter for sending emails
            const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.WebEmail,
              pass: process.env.APP_PASS,
            }
          });

          // Configure the email options
          const mailOptions = {
            from: process.env.WebEmail,
            to: student.email_id,
            subject: 'Welcome To ELearning',
            html: `<html>
            <head>
                <title>Welcome to Our eLearning Platform!</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background-color: #fff;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    p {
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 15px;
                    }
                    .footer {
                        text-align: center;
                        color: #999;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Welcome to Our eLearning Platform!</h1>
                    <p>Dear ${student.first_name+' '+student.last_name},</p>
                    <p>Welcome to ELearning! We are thrilled to have you join our community of eager learners. As you embark on your learning journey with us, we want to ensure you have a seamless and enriching experience.</p>
                    <img src="https://www.freepik.com/free-photo/portrait-stylish-urban-woman-working-laptop-from-outdoor-cafe-sitting-with-documents_72881397.htm#fromView=search&page=3&position=6&uuid=59f3428e-dc79-47e0-b554-3534cb279b85" alt="Welcome Image" style="display: block; margin: 0 auto; max-width: 100%;">
                    <p>Here are a few key details to get you started:</p>
                    <ol>
                        <li><strong>Registration Confirmation:</strong> We have successfully received your registration details. Your username is [Username].</li>
                        <li><strong>Accessing Courses:</strong> You can now browse our wide range of courses and start learning. Log in to your account using your username and the password you created during registration.</li>
                        <li><strong>Your Dashboard:</strong> Once logged in, you will have access to your personalized dashboard. Here, you can track your progress, manage your courses, and access additional resources.</li>
                        <li><strong>Support and Assistance:</strong> For any questions, concerns, or assistance, our support team is here to help. Feel free to reach out to us at [Support Email] or [Support Phone Number].</li>
                        <li><strong>Stay Updated:</strong> Keep an eye on your inbox for important updates, announcements, and special offers.</li>
                        <li><strong>Providing Feedback:</strong> Your feedback is invaluable to us. We are constantly striving to improve our platform and services, so please do not hesitate to share your thoughts with us.</li>
                    </ol>
                    <p>Thank you for choosing ELearning for your learning needs. We are committed to providing you with high-quality education and a rewarding learning experience.</p>
                    <p>Happy learning!</p>
                    <p><strong>Best regards,<br>The ELearning Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </body>
            </html>`
          };

          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending OTP:', error);
              res.status(500).send('Failed to send OTP');
            } else {
              console.log('OTP sent:', info.response);
              res.status(200).send('OTP sent successfully');
            }
          });
        }
      } else {
        if (request.body.password !== request.body.confirm_password) {
          request.flash('error', 'Validation error: ' + "Password And Confirm Password Does Not Matched");
          response.redirect('/eLearning/api/v1/student/register');
        }
      }
    } catch (error) {

      request.flash('error', 'Validation error: ' + error.message);
      response.redirect('/eLearning/api/v1/student/register');

    }
  }
};

//==================== Student OTP ===================
// exports.OTPStudentRegister = (request,response)=>{
//   const { email } = req.body;


// }

//==================== Student Login ===================

exports.StudentLogin = async (request, response) => {
  if (request.method == 'GET') {
    response.render('student/login', { message: request.flash('error') });
  }
  else if (request.method == 'POST') {
    try {
      const username = request.body.username;
      const password = request.body.password;

      if (!username && !password) {
        request.flash('error', 'Both Fields Are Required!');
        return response.redirect('/eLearning/api/v1/student/login');;
      }

      const student = await Student.findOne({ user_name: username });


      if (!student) {
        request.flash('error', 'Email and password does not match!');
        return response.redirect('/eLearning/api/v1/student/login');
      }

      const isMatched = await secure.comparePasswords(password, student.password);
      if (!isMatched) {
        request.flash('error', 'Email and password does not match!');
        return response.redirect('/eLearning/api/v1/student/login');
      } else {

        const token = tokens.getToken(student._id);

        response.cookie('jwt', token, {
          maxAge: process.env.LOGIN_EXPIRES_IN,
          httpOnly: true,
          secure: false
        })
        response.redirect('dashboard');
      }
    } catch (error) {
      request.flash('error', 'Validation error: ' + 'Wrong Credentials!');
      return response.redirect('/eLearning/api/v1/student/login');
    }
  }
}


//==================== Protect The Student Is Login Or Not ===================
exports.protectStudent = async (request, response, next) => {
  //Read the token and check if it is exist
  const token = request.cookies.jwt;

  if (!token) {
    response.send("Token is Invalid");
  }

  //Validate the token
  const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

  //find the user if it is still exist 
  const student = await Student.findById(decodedToken.id);

  if (!student) {
    const Error = "User Does Not Exist";
    return next(Error);
  }

  //if the user changedb the password after the token was issued
  const isPasswordChanged = await student.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    const Error = "Password Has Been Changed Recently Please Login Again"
    return next(Error);
  }

  //Allow the user to acces the route
  request.student = student;
  next();

}

//==================== Student Log Out ===================
exports.StudentLogOut = (request, response) => {
  response.cookie('jwt', '', { maxAge: 1 });
  response.redirect('../index');
}

//==================== Student Log Out ===================
exports.StudentDashboard = async (request, response) => {
  try {
    const studentId = request.student;
    const course_details = await EnrolledStudent.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'c_id',
          foreignField: '_id',
          as: 'enrolled_courses'
        }
      }
    ]);

    let course = course_details.filter((course) => {
      if (request.student.id == course.s_id) {
        return course;
      }
    })

    response.render('student/dashboard', {
      student: studentId,
      course: course,
      includeNavbar: true
    });
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
};


exports.userProfile = (request,response) =>{
  try{
    const student =  request.student ;
    response.render('student/student_profile',{student})
  }catch(error){
    response.json({
      status:'fail',
    })
  }
 
}

//==================== Change Profile Picture ===================
let storage = multer.diskStorage({
  destination: 'public/backend/images',
  filename: (request, file, cb) => {
      cb(null, file.originalname); // Use the original filename
  }
});
let upload = multer({
  storage: storage
});

//==================== Change Profile Picture ===================
exports.userProfile = async (request,response) =>{
  try{
  if(request.method=='GET'){
    const student_id =  request.student._id ;
    let student = await Student.findById({_id:student_id});
    response.render('student/student_profile',{student})
  }else if (request.method === 'POST') {
    upload.single('profile_pic')(request, response, async (err) => {
        if (err) {
            console.log(err);
            response.status(400).json({
                status: 'fail',
                message: 'File upload failed'
            });
        } else {
            try {

                let s_id = request.student._id;
                let profile_pic = request.file.filename;

                let updatedStudent = await Student.findOneAndUpdate({ _id: s_id }, { profile_pic: profile_pic },
                    { new: true });

                response.redirect('user_profile');
            } catch (err) {
                response.status(500).json({
                    status: 'fail',
                    message: err.message
                });
            }
        }
    });
}
} catch (err) {
response.status(500).json({
    status: 'fail',
    message: err.message
});
}
};
//==================== Update Student Details ===================
exports.UpdateStudentDetails = async (request, response) => {
  if (request.method == 'GET') {
    const student = request.student;
    const errorMessage = request.flash('error');
    const successMessage = request.flash('success')
    response.render('student/UpdateDetails', { errorMessage, successMessage, student })
  }
  else if (request.method == 'POST') {
    try {
      const id = request.student._id;
      // console.log(id)
      const UpdatedStudent = await Student.findByIdAndUpdate({ _id: id }, request.body, { new: true, runValidators: true });

      if (UpdatedStudent) {
        request.flash('success', 'successfully Updated');
        response.redirect('/eLearning/api/v1/student/update_details');
      }
    } catch (err) {
      request.flash('error', "Validation Error: " + err.message);
      response.redirect('/eLearning/api/v1/student/update_details');
    }
  }
}
//==================== Student Enrolled In Course ===================
exports.EnrolledCourses = async (request, response) => {
  try {
    const studentId = request.student;
    const course_details = await EnrolledStudent.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'c_id',
          foreignField: '_id',
          as: 'enrolled_courses'
        }
      }
    ]);

    let course = course_details.filter((course) => {
      if (request.student.id == course.s_id) {
        return course;
      }
    })

    response.render('student/dashboard', {
      student: studentId,
      course: course,
      includeNavbar: true
    });
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
};

// exports.DeleteStudent = (request,response)=>{
  
// }

////==================== Course Classes For Enrolled Course ===================
exports.EnrolledCoursesClasses = async (request, response) => {
  try {
   
    //Try to use look up
    const student = request.student;
    const isEnrolled = await  EnrolledStudent.findOne({s_id:request.student.id , c_id:request.params.id});
    
    if(isEnrolled){

      let course = await Course.findById(request.params.id)
      let classes = await Classes.find(request.id);
      response.render('student/classes', { student, classes, course });

    }
    
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
};

//==================== Show All Courses To Student ===================
exports.AllCourses = async (request, response) => {
  try {
    const student = request.student;
    const course = await Course.find();
    response.render('./allcourses', { student, course });
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
};

//==================== Get Course By Category ===================
exports.getCourse = async (request, response) => {
  try {
    const category = request.query.category;
    let student = request.student;

    const course = await Course.find({ course_category: category })
    response.render('./allcourses', { course, category, student });
  }
  catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message
    })
  }
}

//==================== Search ===================
exports.SearchCourse = async (request, response) => {
  try {
    let courses = await Course.find();
    let student = request.student;
    let str = request.query.title

    let result = courses.filter((obj) => {
      course_title = obj.course_title.toLowerCase();
      return course_title.includes(str.toLowerCase());
    });
    response.render('./allcourses', { student, course: result });
  }
  catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message
    })
  }
}

//==================== Show Course Details By Course Id ===================
exports.CourseDetails = async (request, response) => {
  try {
    const student = request.student;
    const isAlreadyEnrolled = await EnrolledStudent.findOne({ c_id: request.params.id , s_id: request.student.id});

    let isPurchased = false;

    if (isAlreadyEnrolled) {
      isPurchased = true;
    }
    
    

    const course = await Course.findById(request.params.id);
    response.render('student/courseDetail', { student, course, isPurchased });
  } catch (error) {
    // Handle the error
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
}


//==================== Course FeedBack By Stduent ===================
exports.GiveFeedback = async (request, response) => {
  try {
    if (request.method == 'GET') {
      const student = request.student;
      const successMessage = request.flash('success');
      const errorMessage = request.flash('error');
      response.render('student/studentFeedback', { student, successMessage, errorMessage });
    } else if (request.method == 'POST') {
      let feedbackDetails = request.body;
      
      let {id} = request.student;
      let feedbackdetails = { ...feedbackDetails,s_id:id};
      let feedback = await FeedBack.create(feedbackdetails);
      if (feedback) {
        request.flash('success', 'Feedback Successfully Sent!');
        return response.redirect('/eLearning/api/v1/student/feedback');
      }
    }
  } catch (error) {
    console.log(error);
    request.flash('error', 'An error occurred while processing your feedback. Please try again.');
    return response.redirect('/eLearning/api/v1/student/feedback');
  }
};

//==================== Buy Course PAge Where The Pay Button Showing ===================
exports.BuyCourse = async (request, response) => {
  try {
    const courseDetails = await Course.findById(request.params.id);
    const student = request.student;
    response.render('student/paymentDetails', { courseDetails, student })
  }
  catch (error) {
    console.error(error);
  }
}

//==================== Create the order to Purchase the Course ===================
exports.createOrder = async (req, res) => {
  try {
    const amount = req.body.course_fee * 100
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: 'razorUser@gmail.com'
    }
    razorpayInstance.orders.create(options,
      (err, order) => {
        if (!err) {
          res.status(200).send({
            success: true,
            msg: 'Order Created',
            order_id: order.id,
            amount: amount,
            key_id: RAZORPAY_ID_KEY,
            product_name: req.body.c_title,
            contact: req.body.phone_number,
            name: req.body.s_name,
            email: req.body.email_id
          });
        }
        else {
          res.status(400).send({ success: false, msg: 'Something went wrong!' });
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  }
}

//==================== Save The Purchase Details To DataBase ===================
exports.saveFormData = async (request, response) => {
  let s_id = request.student.id;

  
  const { s_name, email_id, phone_number, user_name, course_title, course_id, course_fee, transaction_ID,payment_method } = request.body;
  const paymentData = { transaction_ID,transaction_amount:course_fee,c_id:course_id,s_id:s_id };
  const enrolledStudent = { s_id, c_id: course_id};

  const PaymentDetails = await PaymentMod.create(paymentData);
  // console.log(paymentData)
  if (PaymentDetails != null) {
    const Paysucessfully = await PaymentMod.findOne({transaction_ID:PaymentDetails.transaction_ID})
    const payment_id = Paysucessfully.id;
    const SuccesfullyenrolledIn = await EnrolledStudent.create({...enrolledStudent,payment_id});

    if (SuccesfullyenrolledIn) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.WebEmail,
          pass: process.env.APP_PASS,
        }
      });

      const mailOptions = {
        from: process.env.WebEmail,
        // to: enrolledStudent.email_id,
        subject: `Successfully Enrolled in ${SuccesfullyenrolledIn.course_title}!`,
        html: `<html lang="en">
  
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Successfully Enrolled in Our Course!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
      
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
      
          h1 {
            color: #333333;
          }
      
          p {
            color: #666666;
            margin-bottom: 15px;
          }
      
          a {
            color: #007bff;
            text-decoration: none;
          }
      
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      
      <body>
        <div class="container">
          <h1>Dear ${enrolledStudent.s_name},</h1>
          <p>Congratulations on successfully enrolling in The course of <b> ${SuccesfullyenrolledIn.course_title}</b> at ELeaernig! We are excited to have you as part of our learning community.</p>
          <p>With our wide range of courses, we are confident that you will find the learning experience rewarding and fulfilling. Whether you are looking to enhance your skills, explore new topics, or advance your career, our courses are designed to meet your needs.</p>
          <p>To access your course and start learning, please visit our platform and log in using your credentials. If you have any questions or need assistance, please feel free to contact our customer support team at <a href="tel:+12513060647">12513060647</a> or <a href="mailto:ELearning.nic.in@">ELearning.nic.in@</a>. Our dedicated team is here to help you every step of the way.</p>
          <p>We look forward to helping you achieve your learning goals and wish you the best of luck in your studies.</p>
          <p>Best regards,<br>The Elearning Community<br>Elearning</p>
        </div>
      </body>
      
      </html>`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          request.flash('success', "Mail Succesfully Sent!");
          response.redirect('/eLearning/api/v1/contact');
        }
      });
    }
  }
  response.status(200).send({ success: true, msg: 'Form data saved to database' });
}

//Reset Password
exports.ResetPAssword =(request,response)=>{

}

//Notes And PPT's
exports.getNotesAndPPT = async(request,response) =>
{
  response.render('student/Notes&PPT')
}

//Delete  Account 

exports.DeleteAccount = async(request,response)=>
{
 response.render('student/Notes&PPT')
}
