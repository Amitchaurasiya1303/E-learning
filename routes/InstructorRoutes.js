const express = require('express');
const Router = express.Router()
const InstructorController = require('../controller/InstructorConrtoller')
const CourseController = require('../controller/CourseController')
const ClassController = require('../controller/ClassController')

Router.route('/login').get(InstructorController.login).post(InstructorController.login);
Router.route('/dashboard').get(InstructorController.protectInstructors,InstructorController.getDashboard);
Router.route('/students_list').get(InstructorController.protectInstructors,InstructorController.getEnrolledStudent);
Router.route('/launched_courses').get(InstructorController.protectInstructors, InstructorController.LaunchedCourses);
Router.route('/addnewcourse').get(InstructorController.protectInstructors, CourseController.AddNewCourse).post(InstructorController.protectInstructors, CourseController.AddNewCourse);
Router.route('/manageCourse/:id').get(InstructorController.protectInstructors,InstructorController.ManageCourse);
Router.route('/showclasses/:id').get(InstructorController.protectInstructors, ClassController.ShowClasses);
Router.route('/watch_class/:id/:id').get(InstructorController.protectInstructors,InstructorController.WatchClass);
Router.route('/manage_class/:id/:id').get(InstructorController.protectInstructors,InstructorController.ManageClass).post(InstructorController.protectInstructors,InstructorController.ManageClass);
Router.route('/addnewclass/:id').get(InstructorController.protectInstructors, ClassController.AddClassForm).post(InstructorController.protectInstructors, ClassController.AddClassForm);
Router.route('/transaction_details').get(InstructorController.protectInstructors,InstructorController.InstructorTrans);
Router.route('/update_details').get(InstructorController.protectInstructors,InstructorController.UpdateDetails).post(InstructorController.protectInstructors,InstructorController.UpdateDetails);
Router.route('/logout').get(InstructorController.protectInstructors, InstructorController.InstructorLogOut);



module.exports = Router;