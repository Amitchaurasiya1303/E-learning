const secure = require('../controller/Securities/secure')
const tokens = require('../controller/Securities/tokens')
const Admin = require('../models/AdminModel');
const util = require('util');
const jwt = require('jsonwebtoken');
const Course = require('../models/CourseModel');
const InstructorModel = require('../models/InstructorModel');
const Student = require('../models/StudentModel');
const Classes = require('../models/ClassModel');
const { request } = require('http');
const EnrolledStudents = require('./../models/EnrolledStudentModel')
const Feedback = require('./../models/FeedbackModel')
const Payment = require('./../models/PaymentModel');
const instructor = require('../models/InstructorModel');




// //==================== Admin Registration ===================
// exports.AdminRegister = async (request, response) => {
//     if (request.method == 'GET') {
//         response.render('admin/register');
//     }
//     else if (request.method == 'POST') {
//         const newAdmin = await Admin.create(request.body);
//         response.status(202).json({
//             status: 'Success',
//             data: {
//                 Admin: newAdmin
//             }
//         })
//     }
// }

//==================== Admin Login Using JWT ===================
exports.AdminLogin = async (request, response) => {
    if (request.method == 'GET') {
        response.render('admin/login', { message: request.flash('error') });
    }
    else if (request.method == 'POST') {
        const username = request.body.user_name;
        const password = request.body.password;
        const admin = await Admin.findOne({ user_name: username });
        if (!admin) {

            request.flash('error', 'Both Fields Are Required!');
            return response.redirect('/eLearning/api/v1/admin/login');
        }
        else {
            const isMatched = secure.comparePasswords(password, admin.password);
            if (!isMatched) {
                request.flash('error', 'Wrong Credentials!');
                return response.redirect('/eLearning/api/v1/student/login');
            } else {
                const token = tokens.getToken(admin._id);
                //console.log(token)
                response.cookie('jwt', token, {
                    maxAge: process.env.LOGIN_EXPIRES_IN,
                    httpOnly: true,
                    secure: process.env.ENVIOURMENT === 'development' ? false : true
                })
                response.redirect('dashboard');
            }
        }
    }
}

//==================== Admin Dashboard ===================
exports.AdminDashboard = async (request, response) => {
    const students = await Student.find();
    const instructors = await InstructorModel.find();

    
    let TotalInstructor = instructors.length;
    let TotalStudent = students.length;



    const studentStats = await Student.aggregate([{
        $group: {
            _id: '$gender',
            count: { $sum: 1 }
        },
    }])

    const courseStats = await Course.aggregate([{
        $group: {
            _id: '$course_language',
            count: { $sum: 1 }
        },
    }])
    

    let maleStudents = 0;
    let femaleStudents = 0
    
    studentStats.forEach((std)=>{
        if(std._id=='male'){
            maleStudents = std.count;
        }else{
            femaleStudents = std.count;
        }
    })

    let hindiCourses = 0;
    let englishCourses = 0;
    
    courseStats.forEach((crs)=>{
        if(crs._id=='Hindi'){
            hindiCourses = crs.count;
        }else{
            englishCourses = crs.count;
        }
    })
    
    response.render('admin/dashboard', {  maleStudents, femaleStudents,hindiCourses,englishCourses,instructors,TotalInstructor, TotalStudent, courseStats,students, studentStats });
}

//==================== Admin LogOut ===================
exports.AdminLogOut = (request, response) => {
    response.cookie('jwt', '', { maxAge: 1 });
    response.redirect('../index');
}

//==================== Check Admin is Login Or Not ===================
exports.protectAdmin = async (request, response, next) => {
    //Read the token and check if it is exist
    const token = request.cookies.jwt;

    // console.log(token)
    if (!token) {
        response.send("Token is Invalid");
        // return response.redirect('/eLearning/api/v1/admin/login');
    }

    //Validate the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

    //find the user if it is still exist 
    const admin = await Admin.findById(decodedToken.id);
    // console.log(decodedToken.id)

    if (!admin) {
        const Error = "User Does Not Exist";
        return next(Error);
    }

    //if the user changedb the password after the token was issued
    const isPasswordChanged = await admin.isPasswordChanged(decodedToken.iat);

    if (isPasswordChanged) {
        const Error = "Password Has Been Changed Recently Please Login Again"
        return next(Error);
    }

    //Allow the user to acces the route
    request.admin = admin;
    next();
}

exports.addNewInstructor = async (request, response) => {
    if (request.method == 'GET') {

        const successMessage = request.flash('success');
        const errorMessage = request.flash('error');
        response.render('admin/addInstructor', { successMessage, errorMessage, })
    } else if (request.method == 'POST') {
        const newInstructor = await InstructorModel.create(request.body);
        if (newInstructor) {
            request.flash('success', 'Registration SuccessFull!');
            response.redirect(`/elearning/api/v1/admin/addInstructor`);
        } else {
            request.flash('error', 'registeration Failed!');
            response.redirect(`/elearning/api/v1/instructor/admin/addInstructor`);
        }
    }
}

//Get All Students List
exports.getStudentList = async (request, response) => {

    let AllStudents = await Student.find();

    let str = "" + request.query.name;


    if (request.query.name) {
        AllStudents = AllStudents.filter((obj) => {
            first_name = obj.first_name.toLowerCase();
            return first_name.includes(str.toLowerCase());
        });
    }


    response.render('admin/studentlist', { AllStudents });

}

//Get Enrolled Students List
exports.getEnrolledStudentList = async (request, response) => {

    const enrolledStd = await EnrolledStudents.aggregate([
        {
            $lookup: {
                from: 'students',
                localField: 's_id',
                foreignField: '_id',
                as: 'enrolled_students'
            }
        },
        {
            $lookup: {
                from: 'courses',
                localField: 'c_id',
                foreignField: '_id',
                as: 'course_details'
            }
        }
    ]);



    // console.log(enrolledStd[0].enrolled_students)
    // console.log(enrolledStd[0].course_details)
    response.render('admin/enrolledstudentlist', { enrolledStd })
}

//Get All Instructors List
exports.getInstructorList = async (request, response) => {
    let AllInstructors = await InstructorModel.find();

    let str = "" + request.query.name;


    if (request.query.name) {
        AllInstructors = AllInstructors.filter((obj) => {
            let name = obj.name.toLowerCase();
            return name.includes(str.toLowerCase());
        });
    }

    response.render('admin/instructorlist', { AllInstructors })
}

//Get All Courses
exports.getCourseList = async (request, response) => {
    let AllCourse = await Course.find();

    let str = "" + request.query.title;

    if (request.query.title) {
        AllCourse = AllCourse.filter((obj) => {
            let title = obj.course_title.toLowerCase();
            return title.includes(str.toLowerCase());
        });
    }

    response.render('admin/courselist', { AllCourse })
}

//Get All Classes Of Courses
exports.getClassesList = async (request, response) => {
    const AllClasses = await Classes.find();
    response.render('admin/instructorlist', { AllClasses })
}

//GetWebFeedback

exports.getFeeds = async (request, response) => {
    const allFeed = await Feedback.aggregate([{
        $lookup: {
            from: 'students',
            localField: 's_id',
            foreignField: '_id',
            as: 'feeddetails'
        }
    }
    ]);


    response.render('admin/webfeedback', { allFeed })

}

exports.transDeatils = async (request, response) => {
    let paymentDetails = await Payment.aggregate([{
        $lookup: {
            from: 'students',
            localField: 's_id',
            foreignField: '_id',
            as: 'enrolled_students'
        }
    },
    {
        $lookup: {
            from: 'courses',
            localField: 'c_id',
            foreignField: '_id',
            as: 'course_details'
        }
    }])


    let str = "" + request.query.transaction_id;

    if (request.query.transaction_id) {
        paymentDetails = paymentDetails.filter((obj) => {
            transaction_id = obj.transaction_ID;
            return transaction_id.includes(str);
        });
    }

    response.render('admin/paymentDetails', { paymentDetails });
}