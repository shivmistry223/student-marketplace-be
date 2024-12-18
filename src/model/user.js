const mongoose = require("mongoose");
const validator = require("validator");
const Product = require("../model/product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Password can not contain password");
      }
    },
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
    trim: true,
  },
  termNo: {
    type: Number,
    required: true,
  },
});

// userSchema.virtual("products", {
//   ref: "Product",
//   localField: "_id",
//   foreignField: "productOwner",
// });

// userSchema.methods.getAuthToken = async function () {
//   const user = this;

//   const token = jwt.sign({ _id: user._id.toString() }, "fsdmfall2024");

//   user.tokens = user.tokens.concat({ token });
//   await user.save();

//   return token;
// };

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  //   delete userObject.tokens;
  //   delete userObject.avatar;

  return userObject;
};

userSchema.statics.findByCredentials = async (userName, password) => {
  const user = await User.findOne({ userName });

  if (!user) {
    throw new Error("User Not Found");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid Password");
  }

  return user;
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

// when user is deleted then all corresponding task should be deleted

userSchema.pre("deleteOne", { document: true }, async function (next) {
  const user = this;
  await Product.deleteMany({ owner: user._id });

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
