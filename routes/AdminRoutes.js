const express = require('express');
const AdminController = require('../controller/AdminController');
const CourseController = require('../controller/CourseController');
const ClassController = require('../controller/ClassController');
const Router = express.Router();

// Router.route('/register').get(AdminController.AdminRegister).post(AdminController.AdminRegister);
Router.route('/login').get(AdminController.AdminLogin).post(AdminController.AdminLogin);
Router.route('/dashboard').get(AdminController.protectAdmin, AdminController.AdminDashboard);
Router.route('/logout').get(AdminController.protectAdmin, AdminController.AdminLogOut);
Router.route('/addInstructor').get(AdminController.protectAdmin,AdminController.addNewInstructor).post(AdminController.protectAdmin,AdminController.addNewInstructor);

Router.route('/watch_class/:id/:id').get(AdminController.protectAdmin, ClassController.WatchClass).post(AdminController.protectAdmin, ClassController.WatchClass);

//All Lists
Router.route('/students_list/?').get(AdminController.protectAdmin, AdminController.getStudentList);
Router.route('/enrolled_students_list').get(AdminController.protectAdmin, AdminController.getEnrolledStudentList);
Router.route('/instructors_list/?').get(AdminController.protectAdmin, AdminController.getInstructorList);
Router.route('/course_list/?').get(AdminController.protectAdmin, AdminController.getCourseList);
Router.route('/web_feedback').get(AdminController.protectAdmin, AdminController.getFeeds);
Router.route('/payment_details/?').get(AdminController.protectAdmin, AdminController.transDeatils);

module.exports = Router;