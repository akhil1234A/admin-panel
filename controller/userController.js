const userSchema = require('../model/userModel');
const bcrypt = require('bcrypt');
const saltround = 10;

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body; 
    const user = await userSchema.findOne({ email });

    if (user) return res.render('user/registration', { message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, saltround);

    const newUser = new userSchema({
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.render('user/login', { message: 'User created successfully' });
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.render('user/registration', { message: 'Something went wrong' });
  }
};

const logout = (req,res)=>{
  req.session.user = null;
  res.redirect('/user/login');
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userSchema.findOne({ email });
    
    if (!user) return res.render('user/login', { message: 'User does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.render('user/login', { message: 'Incorrect password' });
    
    req.session.user = user._id; // Store user ID in session

    // Pass the user object to the template
    res.render('user/home', { user, message: 'Login successful' });
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.render('user/login', { message: 'Something went wrong' });
  }
};


const loadRegister = (req, res) => {
  res.render('user/registration');
};

const loadLogin = (req, res) => {
  res.render('user/login');
};

const loadHome = async (req, res) => {
  try {
    const userId = req.session.user;
    if (!userId) return res.redirect('/user/login');

    const user = await userSchema.findById(userId);
    if (!user) return res.redirect('/user/login');

    res.render('user/home', { user });
  } catch (error) {
    console.log(error);
    res.redirect('/user/login');
  }
};


module.exports = {
  registerUser,
  loadRegister,
  loadLogin,
  login,
  loadHome,
  logout
};
