const assignCourses = require("../modal/assignCourses");
const Instructor = require("../modal/instructors"); // Import the instructor modal or replace it with the actual modal path
const Courses = require("../modal/courses");
const admins = require("./adminSchema");
const bcrypt = require('bcryptjs');
const { mongo } = require("mongoose");
const fs = require("fs");

let adminController = {};

adminController.register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword) {
    return res
      .status(422)
      .json({ message: "Please provide all details", success: false });
  }

  try {
    let checkExistingAdmin = await admins.findOne({ email });
    if (checkExistingAdmin) {
      return res
        .status(500)
        .json({ message: "This email is already exist", success: false });
    }

    let encryptedPassword = await bcrypt.hash(password, 12); 

    admins
      .updateOne(
        { email },
        { $set: { password: encryptedPassword } },
        { upsert: true }
      )
      .then(
        (data) => {
          return res
            .status(200)
            .json({ message: "Admin added successfully", success: true });
        },
        (err) => {
          return res
            .status(500)
            .json({ message: "Internal server error", success: false });
        }
      );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

adminController.dashboard = async (req, res) => {
  const instructors = (await Instructor.find({})).length;
  const courses = (await Courses.find({})).length;

  return res.status(200).json({ instructors: instructors, courses: courses });
};

adminController.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .json({ message: "Please provide email and password", success: false });
  }

  try {
    let existingAdmin = await admins.findOne({ email });
    let instructor = await Instructor.findOne({ email });

    if (existingAdmin) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingAdmin.password
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Invalid password", success: false });
      }

      return res
        .status(200)
        .json({ message: "Login successful", success: true, type: "admin" });
    }
    if (instructor) {
      const isPasswordValid = await bcrypt.compare(
        password,
        instructor.password
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Invalid password", success: false });
      }

      return res.status(200).json({
        message: "Login successful",
        success: true,
        type: "instructor",
        id:instructor._id
      });
    }

    return res.status(500).json({ message: "Not found", success: false });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Get all assigned courses
adminController.getAllAssignCourses = (req, res) => {
  const { instructor } = req.body;
  let data = {};
  if (instructor) {
    data["instructor"] = new mongo.ObjectId(instructor);
  }
  assignCourses
    .find(data)
    .populate("instructor")
    .populate("course")
    .then((data) => {
      return res.status(200).json({ message: "Got all courses", data: data });
    });
};

// Add a new instructor
adminController.addInstructor = (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if the email already exists
    Instructor.findOne({ email }).then(async (existingInstructor) => {
      if (existingInstructor) {
        return res.status(400).json({ message: "Email already exists" });
      }

      let encryptedPassword = await bcrypt.hash(password, 12);

      // Create a new instructor
      const newInstructor = new Instructor({
        email,
        password: encryptedPassword,
        name,
      });

      // Save the instructor to the database
      newInstructor
        .save()
        .then((instructor) => {
          res.status(201).json({
            message: "Instructor added successfully",
            success: true,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
          });
        });
    });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Update an existing instructor by email
adminController.updateInstructor = async (req, res) => {
  const { password, email, instructorId, name } = req.body;

  let data = {
    email,
    name,
  };

  if (password) {
    data["password"] = await bcrypt.hash(password, 12);
  }

  try {
    const updatedInstructor = await Instructor.findByIdAndUpdate(
      instructorId,
      { $set: data },
      { new: true } // Return the updated document
    );

    if (!updatedInstructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({
      message: "Instructor updated successfully",
      data: updatedInstructor,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete an instructor by email
adminController.deleteInstructor = async (req, res) => {
  const { instructorId } = req.body;

  try {
    const deletedInstructor = await Instructor.findByIdAndDelete(instructorId);

    if (!deletedInstructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({
      message: "Instructor deleted successfully",
      data: deletedInstructor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: true,
    });
  }
};

// Get an instructor by email
adminController.getAllInstructors = (req, res) => {
  // Find the instructor by email
  Instructor.find()
    .then((instructors) => {
      res
        .status(200)
        .json({ message: "Got instructor by email", data: instructors });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    });
};

adminController.addCourse = (req, res) => {
  const { name, level, description } = req.body;
  if (!name || !level || !description) {
    return res
      .status(422)
      .json({ message: "Please provide all details", success: false });
  }
  try {
    Courses.updateOne(
      { name },
      {
        $set: {
          level,
          description,
          image: process.env.filePath + req.file.path,
        },
      },
      { upsert: true }
    ).then(
      (data) => {
        return res
          .status(200)
          .json({ message: "Added Successfully", success: true });
      },
      (err) => {
        return res
          .status(500)
          .json({ message: "Internal server error", success: false });
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal server error", success: false });
  }
};

adminController.updateCourse = async (req, res) => {
  const { courseId, name, level, description } = req.body;

  if (!courseId || !name || !level || !description) {
    return res
      .status(422)
      .json({ message: "Please provide all details", success: false });
  }

  try {
    let data = {
      name,
      level,
      description,
    };

    if (req.file) {
      let existingCourse = await Courses.findById(courseId);

      if (!existingCourse) {
        return res
          .status(404)
          .json({ message: "Course not found", success: false });
      }

      // Delete existing image file
      if (existingCourse.image) {
        let existingImagePath = existingCourse.image.replace(
          process.env.filePath,
          ""
        );
        if (fs.existsSync(existingImagePath)) {
          fs.unlinkSync(existingImagePath);
        }
      }

      data.image = process.env.filePath + req.file.path;
    }

    // Use findOneAndUpdate instead of updateOne
    await Courses.findOneAndUpdate(
      { _id: new mongo.ObjectId(courseId) },
      {
        $set: data,
      }
    );

    return res
      .status(200)
      .json({ message: "Updated Successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Delete a course by ID
adminController.deleteCourse = (req, res) => {
  const { courseId } = req.body;

  Courses.findByIdAndDelete(courseId)
    .then((course) => {
      res
        .status(200)
        .json({ message: "Course deleted successfully", data: course });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    });
};

// Get all courses
adminController.getAllCourses = async (req, res) => {
  try {
    Courses.find({}).then((data) => {
      res.status(200).json({
        message: "Got courses",
        data: data,
      });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

adminController.assignCourseToInstructor = async (req, res) => {
  const { instructor, course, date, batch } = req.body;

  try {
    // Check if the instructor has a course on the given date
    const existingCourseOnDate = await assignCourses.findOne({
      instructor: new mongo.ObjectId(instructor),
      date,
    });

    if (existingCourseOnDate) {
      return res
        .status(400)
        .json({ message: "Instructor already has a course on the given date" });
    }

    // Check if the instructor exists
    const instruct = await Instructor.findById(instructor);
    if (!instruct) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Check if the course exists
    const courses = await Courses.findById(course);
    if (!courses) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Assign the course to the instructor on the given date
    const newAssignCourse = new assignCourses({
      instructor,
      course,
      date,
      batch,
    });

    const savedAssignCourse = await newAssignCourse.save();
    res.status(201).json({
      message: "Course assigned to instructor successfully",
      data: savedAssignCourse,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = adminController;
