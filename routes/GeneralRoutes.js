const GeneralController = require('../controller/GeneralController');
const CourseController = require('../controller/CourseController');
const StudentController = require('../controller/StudentController')
const express = require('express');
const Router = express.Router();

Router.route('/index').get(GeneralController.getHomePage);
Router.route('/category/:category').get(CourseController.getAllCourse);
Router.route('/about').get(GeneralController.getAboutPage);
Router.route('/contact').get(GeneralController.getContactPage).post(GeneralController.getContactPage);;


Router.route('/searchcourse/?').get(CourseController.SearchCourse);
Router.route('/getcourse/?').get(CourseController.getCourse);
Router.route('/getCourseDetails/:id').get(CourseController.getCourseDetails);

module.exports = Router;