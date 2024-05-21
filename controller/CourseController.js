const Course = require('../models/CourseModel');
const multer = require('multer');
const Student = require('../models/StudentModel');
const { request } = require('../app');
const Instructor = require('../models/InstructorModel');

//==================== Get All Course ===================
exports.getAllCourse = async (request, response) => {
    try {
        const courses = await Course.find();
        response.render('allcourses', { course: courses });
    } catch (err) {
        response.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}


//==================== Get Course By Category ===================
exports.getCourse = async (request, response) => {
    try {
        const category = request.query.category;

        const course = await Course.find({ course_category: category })
        response.render('allcourses', { course, category });
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
        let str = request.query.title


        let result = courses.filter((obj) => {
            course_title = obj.course_title.toLowerCase();
            return course_title.includes(str.toLowerCase());
        });

        response.render('allcourses', { course: result });
    }
    catch (err) {
        response.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}
//==================== Get Course By ID For Course Details Using Multer For Image ===================
exports.getCourseDetails = async (request, response) => {
    const student = request.student;
    const course = await Course.findById(request.params.id);

    response.render('courseDetail', { course, student });
}

let storage = multer.diskStorage({
    destination: 'public/backend/images',
    filename: (request, file, cb) => {
        cb(null, file.originalname)
    }
});
let upload = multer({
    storage: storage
})

//==================== Add New Course By Admin ===================
exports.AddNewCourse = async (request, response) => {
    if (request.method === 'GET') {
        let instructor_id = request.instructor.id;
        let instructor = await Instructor.findById(instructor_id);
        const successMessage = request.flash('success');
        const errorMessage = request.flash('error');
        response.render('instructor/addNewCourse', { successMessage, errorMessage, instructor });

    } else if (request.method === 'POST') {

        upload.single('course_img')(request, response, async (err) => {
            if (err) {

                request.flash('error', 'failed');
                response.redirect('/elearning/api/v1/instructor/addnewcourse');

            } else {
                try {
                    // Assuming 'image' is the name of the file input field in the form
                    request.body.launched_by = request.instructor._id;
                    request.body.course_img = request.file.filename; // Save file path in the request body
                    const newCourse = await Course.create(request.body);



                    request.flash('success', 'Course Added Successfully');
                    response.redirect('/elearning/api/v1/instructor/addnewcourse');


                } catch (err) {
                    request.flash('error', "Validation Error: " + err.message);
                    response.redirect('/elearning/api/v1/instructor/addnewcourse');
                }
            }
        });
    } else {
        request.flash('error', "Validation Error: " + err.message);
        response.redirect('/elearning/api/v1/instructor/addnewcourse');
    }
};

//==================== Delete Course By Admin ===================
exports.RemoveCourseById = async (request, response) => {
    const id = request.params.id;

    try {
        const deletedCourse = await Course.findByIdAndDelete(id);

        response.status(202).json({
            status: 'Succesfull',
            data: null
        })
    } catch (err) {
        response.status(404).json({
            status: 'fail',
            message: err.message
        })
    }

}

//==================== Update Course Details By Admin ===================
exports.UpdateCourseDetails = async (request, response) => {
    const id = request.params.id;
    try {
        const UpdatedCourse = await Course.findByIdAndUpdate(id, request.body, { new: true, runValidators: true });

        response.status(200).json({
            status: 'Succesfull',
            data: UpdatedCourse
        })
    } catch (err) {
        response.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

//==================== Pagination ===================
exports.pagination = async (request, response) => {
    const page = request.query.page * 1 || 1;
    const limit = request.query.limit * 1 || 10;

    const skip = (page - 1) * limit;
    const courseCount = await Course.countDocuments();

    const totalPages = Math.ceil(courseCount / limit); // Calculate total pages

    if (skip >= courseCount) {
        response.send('Page Not Found');
        return;
    }

    try {
        const courses = await Course.find().skip(skip).limit(limit);
        response.render('allcourses', { course: courses, page, totalPages });
    } catch (err) {
        response.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};

