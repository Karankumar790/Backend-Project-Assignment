import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeLecture, searchCourse, togglePublishCourse } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
import { deleteCourse } from "../controllers/course.controller.js";  // Import the deleteCourse controller

const router = express.Router();

// Route to create a new course
router.route("/").post(isAuthenticated, createCourse);

// Route to search courses
router.route("/search").get(isAuthenticated, searchCourse);

// Route to get all published courses
router.route("/published-courses").get(getPublishedCourse);

// Route to delete a course by its ID
router.delete("/:courseId", isAuthenticated, deleteCourse);  // Add authentication check before deletion

// Route to get all courses of the creator
router.route("/").get(isAuthenticated, getCreatorCourses);

// Route to edit a course by its ID (uploading thumbnail if needed)
router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail"), editCourse);

// Route to get a course by its ID
router.route("/:courseId").get(isAuthenticated, getCourseById);

// Route to create a new lecture for a course
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);

// Route to get all lectures for a course
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);

// Route to edit a specific lecture
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);

// Route to delete a specific lecture by lecture ID
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);

// Route to get a specific lecture by lecture ID
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);

// Route to toggle publish status of a course
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

export default router;
