const adminModel = require('../model/adminModel');
const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');

const loadLogin = async (req, res) => {
  res.render('admin/login');
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email });

    if (!admin) return res.render('admin/login', { message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) return res.render('admin/login', { message: 'Incorrect password' });

    req.session.admin = true; 
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.render('admin/login', { message: 'Something went wrong' });
  }
};

const loadDashboard = async (req, res) => {
  try {
    const admin = req.session.admin;
    if (!admin) return res.redirect('/admin/login');

    const users = await userModel.find({}); // Fetch users data
    res.render('admin/dashboard', { users }); // Pass users data to the view
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.render('admin/dashboard', { message: 'Something went wrong' });
  }
};

const editUser = async(req,res)=>{
  try{
    const {email,password,id} = req.body;  
    const hashedPassword = await bcrypt.hash(password,10)
    const user = await userModel.findOneAndUpdate({_id:id},{$set:{email,password:hashedPassword}});
    console.log(user);
    
    res.redirect('/admin/dashboard');
  }catch(error){
    console.log(error);
  }
}


const deleteUser = async(req,res)=>{
  try{
    const {id} = req.params
    await userModel.findOneAndDelete({_id:id});
    res.redirect('/admin/dashboard');
  }catch(error){
    console.log(error);
  }
}

const addUser = async(req,res)=>{
  try{
    const {email,password} = req.body; 
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new userModel({
      email,
      password:hashedPassword
    })
    await newUser.save()
    res.redirect('/admin/dashboard');
  }
  catch(error){
    console.log(error);
  }
}

const logout = async(req,res)=>{
  req.session.admin = null;
  res.redirect('/admin/login');
}

const search = async(req,res)=>{
  try{
    const search = req.query.q;
    const users = await userModel.find({
      email: {$regex:search,$options:'i'}
    })
    res.render('admin/dashboard',{users});
  }
  catch(error){
    console.log(err);
    res.redirect('/admin/dashboard');
  }
}

module.exports = { loadLogin, login, loadDashboard,editUser,deleteUser,addUser,logout,search};
