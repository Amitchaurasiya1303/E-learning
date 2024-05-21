const Instructors = require('./../models/InstructorModel');
const tokens = require('../controller/Securities/tokens')
const secure = require('./Securities/secure');
const { response } = require('../app');
const util = require('util');
const jwt = require('jsonwebtoken');
const Courses = require('./../models/CourseModel');
const Student = require('../models/StudentModel');
const EnrolledStudents = require('../models/EnrolledStudentModel')
const Classes = require('../models/ClassModel')
const Course = require('../models/CourseModel')
const Payment = require('../models/PaymentModel');
const { ConversationContextImpl } = require('twilio/lib/rest/conversations/v1/conversation');
const multer = require('multer')

//========================================Login API For Instructor========================================
exports.login = async (request, response) => {
    if (request.method == 'GET') {
        let student = request.student;
        response.render('instructor/login', { message: request.flash('error'), student })
    } else if (request.method == 'POST') {
        try {
            const email_id = request.body.email_id;
            const password = request.body.password;
            const Instructor = await Instructors.findOne({ email_id: email_id });
            if (!Instructor) {
                request.flash('error', 'Email and password does not match!');
                return response.redirect('/eLearning/api/v1/instructor/login');
            }
            else {
                const isMatched = secure.comparePasswords(password, Instructor.password);
                if (!isMatched) {
                    request.flash('error', 'Email and password does not match!');
                    return response.redirect('/eLearning/api/v1/instructor/login');
                } else {
                    const token = tokens.getToken(Instructor._id);
                    response.cookie('jwt', token, {
                        maxAge: process.env.LOGIN_EXPIRES_IN,
                        httpOnly: true,
                        secure: process.env.ENVIOURMENT === 'development' ? false : true
                    })
                    response.redirect('dashboard');
                }
            }
        } catch (error) {
            request.flash('error', 'Validation error: ' + 'Wrong Credentials!');
            return response.redirect('/eLearning/api/v1/instructor/login');
        }


    }
}

//========================================Protect Routes API For Instructor========================================
exports.protectInstructors = async (request, response, next) => {

    const token = request.cookies.jwt;

    if (!token) {
        return response.redirect('/eLearning/api/v1/instructor/login');
    }

    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

    const instructor = await Instructors.findById(decodedToken.id);

    if (!instructor) {
        const Error = "User Does Not Exist";
        return next(Error);
    }

    const isPasswordChanged = await instructor.isPasswordChanged(decodedToken.iat);

    if (isPasswordChanged) {
        const Error = "Password Has Been Changed Recently Please Login Again"
        return next(Error);
    }

    request.instructor = instructor;
    next();
}


async function getStudentsByTutor(tutorId) {
    try {
        const courses = await Courses.find({ instructor_id: tutorId }).select('_id');
        const courseIds = courses.map(course => course._id);
        const enrollments = await EnrolledStudents.find({ c_id: { $in: courseIds } })
            .populate({
                path: 's_id',
                model: 'students'
            })
            .populate({
                path: 'c_id',
                model: 'courses'
            });
        const students = enrollments.map(enrollment => {
            return {
                student: enrollment.s_id,
                course: enrollment.c_id
            };
        });
        return students;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

//========================================Get DashBoard Of Instructors========================================
exports.getDashboard = async (request, response) => {
    const instructor_id = request.instructor.id;
    const instructor = await Instructors.findById(instructor_id);
    const courses = await Courses.find({ instructor_id })
    getStudentsByTutor(instructor_id).then(students => {
        response.render('instructor/dashboard', { courses, students, instructor });
    });

}

//========================================What Courses He Launched========================================
exports.LaunchedCourses = async (request, response) => {
    const instructor_id = request.instructor.id;
    const instructor = await Instructors.findById(instructor_id);
    const launchedCourses = await Courses.find({ instructor_id });
    response.render('instructor/LaunchedCourses', { launchedCourses, instructor })
}

//========================================Tansactions Information Related To Instructor Course========================================
exports.InstructorTrans = async (request, response) => {
    try {
        const instructor_ID = request.instructor.id;
        const instructor = await Instructors.findById(instructor_ID);
        let result = await Course.find({ instructor_id: instructor_ID });
        const course_ids = result.map(course => course._id);
        let transactions = await Payment.find({ c_id: { $in: course_ids } });
        response.render('instructor/transactions', { transactions, instructor });
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal Server Error');
    }
}

//========================================Instructor Logout========================================
exports.InstructorLogOut = (request, response) => {
    response.cookie('jwt', '', { maxAge: 1 });
    response.redirect('../index');
}

//========================================Get All Enroll Sgtudnet Related To Instructor Courses========================================
exports.getEnrolledStudent = async (request, response) => {

    const instructor_ID = request.instructor.id;
    const instructor = await Instructors.findById(instructor_ID);

    getStudentsByTutor(instructor_ID).then(students => {
        response.render('instructor/enrolledStudent', { students, instructor });

    });


}


//========================================Watch the Course Class Api========================================
exports.WatchClass = async (request, response) => {

    const classes = await Classes.findById(request.params.id);
    const course_id = classes.c_id;
    const course = await Course.findById({ _id: course_id })
    const allclasses = await Classes.find({ c_id: course_id })

    const instructor_id = request.instructor._id;

    const instructor = await Instructors.findById(instructor_id);

    response.render('instructor/watchclass', { classes, instructor, allclasses, course })
}

let store = multer.diskStorage({
    destination: 'public/backend/Notes&Pdf',
    filename: (request, file, cb) => {
        cb(null, file.originalname); // Use the original filename
    }
});
let uploadnotes = multer({
    storage: store
});

//========================================Manage Classes  By Instructor========================================
// exports.ManageClass = async (request, response) => {
//     try {
//         if (request.method == 'GET') {
//             const instructor_id = request.instructor._id;
//             let c_id = request.params.id;
//             let classDetails = await Classes.findById(c_id);
//             const instructor = await Instructors.findById(instructor_id);
//             const successMessage = request.flash('success');
//             const errorMessage = request.flash('error');
//             response.render('instructor/manageClass&Notes', { successMessage, errorMessage, instructor, classDetails })
//         } else if (request.method === 'POST') {
//             uploadnotes.single('class_notes')(request, response, async (err) => {
//                 if (err) {
//                     console.log(err);
//                     response.status(400).json({
//                         status: 'fail',
//                         message: 'File upload failed'
//                     });
//                 } else {

//                     let c_id = request.params.id;
//                     let classDetail = await Classes.findById({id:c_id});

//                     try {

//                         let c_id = request.params.id;
//                         let notes = request.file.filename;

//                         let updatedcourse = await Classes.findOneAndUpdate({ _id: c_id }, { class_notes: notes },
//                             { new: true });

//                         request.flash('success', "Notes Uploaded SuccessFully");
//                         response.redirect(`/eLearning/api/v1/instructor/${classDetail.c_id}/${classDetail._id}`);
//                     } catch (error) {
//                         request.flash('error', + "Failed!");
//                         response.redirect(`/eLearning/api/v1/instructor/${classDetail.c_id}/${classDetail._id}`);
//                     }
//                 }
//             });
//         }
//     } catch (err) {
//         response.status(500).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

exports.ManageClass = async (request, response) => {
    try {
        if (request.method === 'GET') {
            const instructor_id = request.instructor._id;
            const c_id = request.params.id;
            const classDetails = await Classes.findById(c_id);
            const instructor = await Instructors.findById(instructor_id);
            const successMessage = request.flash('success');
            const errorMessage = request.flash('error');
            response.render('instructor/manageClass&Notes', { successMessage, errorMessage, instructor, classDetails });
        } else if (request.method === 'POST') {
            const c_id = request.params.id;
            const classDetail = await Classes.findById({_id:c_id});
            uploadnotes.single('class_notes')(request, response, async (err) => {
                if (err) {
                    request.flash('error', 'File upload failed');
                    return response.redirect(`/eLearning/api/v1/instructor/manage_class/${classDetail.c_id}/${classDetail._id}`);
                }
               
                try {
                
                    const notes = request.file.filename;

                    const updatedCourse = await Classes.findOneAndUpdate(
                        { _id: c_id },
                        { class_notes: notes },
                        { new: true }
                    );

                    request.flash('success', 'Notes Uploaded Successfully');
                    response.redirect(`/eLearning/api/v1/instructor/manage_class/${classDetail.c_id}/${classDetail._id}`);
                } catch (error) {
                    console.error(error);
                    request.flash('error', 'Failed!');
                    response.redirect(`/eLearning/api/v1/instructor/manage_class/${classDetail.c_id}/${classDetail._id}`);
                }
            });
        }
    } catch (err) {
        console.error(err);
        response.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};



//========================================Manage Courses By Instructors========================================
exports.ManageCourse = async (request, response) => {
    if (request.method == 'GET') {
        const instructor_id = request.instructor._id;
        const instructor = await Instructors.findById(instructor_id);
        let course_id = request.params.id;
        let course = await Course.findById(course_id)
        response.render('instructor/manageCourse', { course, instructor })
    }
}

//========================================Update Profile Picture Of Instructor========================================
let storage = multer.diskStorage({
    destination: 'public/backend/images',
    filename: (request, file, cb) => {
        cb(null, file.originalname); // Use the original filename
    }
});
let upload = multer({
    storage: storage
});

exports.UpdateDetails = async (request, response) => {
    try {
        if (request.method == "GET") {
            const id = request.instructor._id;
            let instructor = await Instructors.findById(id);
            response.render('instructor/profile', { instructor });
        }
        else if (request.method === 'POST') {
            upload.single('instructor_pic')(request, response, async (err) => {
                if (err) {
                    console.log(err);
                    response.status(400).json({
                        status: 'fail',
                        message: 'File upload failed'
                    });
                } else {
                    try {

                        let i_id = request.instructor._id;
                        let profile_pic = request.file.filename;

                        let updatedInstructor = await Instructors.findOneAndUpdate({ _id: i_id }, { instructor_pic: profile_pic },
                            { new: true });

                        response.redirect('update_details');
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