const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
var flash = require("connect-flash");
const app = express();
// port
const port = process.env.PORT || 5000;

// setting up ejs
app.set('view engine', 'ejs');
// Static Public Folder
app.use(express.static(`${__dirname}/public`));
//using flash
app.use(flash());
//using express session
app.use(require("express-session")({
    secret: "i love node",
    resave: false,
    saveUninitialized: false
}));

app.use(function(req, res, next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//set storage and file name of uploads
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function(req, file, cb){
    cb(null, file.fieldname + path.extname(file.originalname));
  }
});

//upload initialized
const upload = multer({
  storage: storage,
  limits: {fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('uploadedfile');

//checkFileType function
function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype){
    return cb(null, true);
  }else{
    cb('Sorry!!! Only images are allowed to upload.');
  }
}

//index route
app.get('/', (req, res) => {
  res.render('index');
});

//file upload route
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      req.flash("error", err.message+'! Please Try Again.');
      res.redirect('/');
    } else {
      if(req.file == undefined){
        req.flash("error", 'Sorry! No File Selected.');
        res.redirect('/');
      }else{
        res.render('index', {file: `/uploads/${req.file.filename}`, success: 'Great job! Image uploaded successfully.'});
      }
    }
  });
});

//server setup
app.listen(port, () => console.log(`Server started on port ${port}`));
