const Classes = require('../models/ClassModel');
const Courses = require('../models/CourseModel');
const Course = require('../models/CourseModel');
const EnrolledStudent = require('../models/EnrolledStudentModel');
const Instructor = require('../models/InstructorModel');
const multer = require('multer');

//========================================= Show Course Related Class To Admin =========================================
exports.ShowClasses = async (request, response) => {
    const course_id = request.params.id;

    if (request.instructor != null) {
        let instructor_id = request.instructor._id;
        let instructor = await Instructor.findById(instructor_id);
        let course = await Courses.findById(course_id);
        let course_classes = await Classes.find({ c_id: course_id });
        response.render('instructor/ShowClasses', { course, course_classes, instructor })
    } else {
        let course = await Courses.findById(course_id);
        let course_classes = await Classes.find({ c_id: course_id });
        response.render('instructor/ShowClasses', { course, course_classes })
    }
}

//========================================= Add Course Class By Instructor =========================================
let storage = multer.diskStorage({
    destination: 'public/backend/classes',
    filename: (request, file, cb) => {
        cb(null, file.originalname)
    }
});
let upload = multer({
    storage: storage
})

exports.AddClassForm = async (request, response) => {
    try {
        const course = await Course.findById(request.params.id);
        if (request.method === 'GET') {
            let instructor_id = request.instructor._id;
            let instructor = await Instructor.findById(instructor_id);
            const successMessage = request.flash('success');
            const errorMessage = request.flash('error');
            response.render('instructor/addClass', { successMessage, errorMessage, course, instructor });
        } else if (request.method === 'POST') {
            upload.single('class_vid')(request, response, async (err) => {
                if (err) {
                    request.flash('error', 'failed');
                    response.redirect(`/elearning/api/v1/instructor/addnewclass/${request.params.id}`);
                } else {
                    try {
                        request.body.class_vid = request.file.filename;
                        request.body.c_id = request.params.id;
                        const newCourse = await Classes.create(request.body);

                        request.flash('success', 'Class Added Successfully');
                        response.redirect(`/elearning/api/v1/instructor/addnewclass/${request.params.id}`);

                    } catch (err) {
                        request.flash('error', err.message);
                        response.redirect(`/elearning/api/v1/instructor/addnewclass/${request.params.id}`);
                    }
                }
            });
        } else {
            request.flash('error', err.message);
            response.redirect(`/elearning/api/v1/instructor/addnewclass/${request.params.id}`);
        }
    } catch (error) {
        request.flash('error', err.message);
        response.redirect(`/elearning/api/v1/instructor/addnewclass/${request.params.id}`);
    }
};

//========================================= Play Class Video =========================================
exports.WatchClass = async (request, response) => {
    const classes = await Classes.findById(request.params.id);
    const course_id = classes.c_id;
    const course = await Course.findById({ _id: course_id })
    const allclasses = await Classes.find({ c_id: course_id })

    const student = request.student;
    response.render('student/watchclass', { classes, student, allclasses, course })
}

