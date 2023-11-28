const express=require('express')
const router = express.Router();


const fs = require('fs')
const multer = require('multer');
const adminController = require('./adminController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname.replace(" ", "")}`)
    }
})

const upload = multer({ storage })

router.post('/login',adminController.login)
router.post('/register',adminController.register)
router.post('/addCourse',upload.single('image'),adminController.addCourse)
router.post('/updateCourse',upload.single('image'),adminController.updateCourse)
router.post('/getAllCourses',adminController.getAllCourses)
router.post('/deleteCourse',adminController.deleteCourse)
router.post('/addInstructor',adminController.addInstructor)
router.post('/updateInstructor',adminController.updateInstructor)
router.post('/getAllInstructors',adminController.getAllInstructors)
router.post('/deleteInstructor',adminController.deleteInstructor)
router.post('/assignCourseToInstructor',adminController.assignCourseToInstructor)
router.post('/getAllAssignCourses',adminController.getAllAssignCourses)


module.exports=router