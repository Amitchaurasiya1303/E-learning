const Course = require('../models/CourseModel');
const Contact = require('../models/ContactModel')
var nodemailer = require('nodemailer');


//==================== Get Home Page ===================
exports.getHomePage = async (request, response) => {
  try {
    const course = await Course.find();
    student = request.student;
    response.render('index', { course, student });
  }
  catch (error) {
    console.log(error)
  }
}

//==================== Get About Page ===================
exports.getAboutPage = (request, response) => {
  student = request.student;
  response.render('about', { student });
}

//==================== get Contact Page ===================
exports.getContactPage = async (request, response) => {
  if (request.method == 'GET') {
    student = request.student;
    const successMessage = request.flash('success');
    const errorMessage = request.flash('error');
    response.render('contact', { successMessage, errorMessage, student });
  } else if (request.method == 'POST') {
    try {
      const res = await Contact.create(request.body);
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.WebEmail,
          pass: process.env.APP_PASS,
        }
      });

      var mailOptions = {
        from: process.env.WebEmail,
        to: request.body.con_email,
        subject: 'Welcome to ELeaernig!',
        html: `<html lang="en">

            <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to ELeaernig!</title>
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
                <h1>Dear ${request.body.con_name},</h1>
                <p><b>Welcome to ELeaernig!</b> We are thrilled to have you join our learning community. Thank you for reaching out to us.</p>
                <p>At ELeaernig Platform, we are committed to providing you with the best learning experience possible. Whether you are looking to improve your skills, explore new topics, or enhance your career, we have a wide range of courses to meet your needs.</p>
                
                <br><p>If you have any questions or need assistance, please feel free to contact our customer support team at <a href="tel:+12513060647">12513060647</a> or <a href="mailto:ELearning.nic.in@">ELearning.nic.in@</a>. Our dedicated team is here to help you every step of the way.</p>
                <p>We look forward to helping you achieve your learning goals.</p>
                <p><b>Best regards,</b><br>Elearning Community<br>Elearning</p>
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
    } catch (error) {
      request.flash('error', 'Validation error: ' + error.message);
      response.redirect('/eLearning/api/v1/contact');
    }
  }
}