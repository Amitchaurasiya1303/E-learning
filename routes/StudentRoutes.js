const express = require('express');
const StudentController = require('../controller/StudentController');
const ClassController = require('../controller/ClassController');
const CourseController = require('../controller/CourseController');
const GeneralController = require('../controller/GeneralController');
const Router = express.Router();

//General Routes 
Router.route('/contact').get(StudentController.protectStudent,GeneralController.getContactPage).post(StudentController.protectStudent,GeneralController.getContactPage);
Router.route('/about').get(StudentController.protectStudent,GeneralController.getAboutPage)

//Login // Register // Log Out
Router.route('/register').get(StudentController.StudentRegister).post(StudentController.StudentRegister);
Router.route('/login').get(StudentController.StudentLogin).post(StudentController.StudentLogin);
Router.route('/logout').get(StudentController.protectStudent, StudentController.StudentLogOut);

//After Login
Router.route('/dashboard').get(StudentController.protectStudent, StudentController.StudentDashboard);
Router.route('/allcourses').get(StudentController.protectStudent, StudentController.AllCourses);
Router.route('/coursedetails/:id').get(StudentController.protectStudent, StudentController.CourseDetails);
Router.route('/enrolledcourses').get(StudentController.protectStudent, StudentController.EnrolledCourses);
Router.route('/enrolledcourse/classes/:id').get(StudentController.protectStudent, StudentController.EnrolledCoursesClasses);
Router.route('/searchcourse/?').get(StudentController.protectStudent,StudentController.SearchCourse);
Router.route('/getcourse/?').get(StudentController.protectStudent,StudentController.getCourse);
Router.route('/watch_class/:id/:id').get(StudentController.protectStudent, ClassController.WatchClass);

//Payment Specififc Routes
Router.route('/buyNow/payment/:id').get(StudentController.protectStudent, StudentController.BuyCourse)
Router.route('/createOrder/course/:id').post(StudentController.protectStudent, StudentController.createOrder);
Router.route('/saveFormData').post(StudentController.protectStudent, StudentController.saveFormData);

//Proifile And Update
Router.route('/user_profile').get(StudentController.protectStudent, StudentController.userProfile).post(StudentController.protectStudent, StudentController.userProfile);
Router.route('/update_details').get(StudentController.protectStudent, StudentController.UpdateStudentDetails).post(StudentController.protectStudent, StudentController.UpdateStudentDetails);

//feedback
Router.route('/feedback').get(StudentController.protectStudent, StudentController.GiveFeedback).post(StudentController.protectStudent, StudentController.GiveFeedback);

module.exports = Router;