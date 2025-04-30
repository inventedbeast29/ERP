const express=require('express');
const serveStatic = require('serve-static');
const path=require('path');
const app=express();
app.use(express.static(path.join(__dirname)));
const nodemailer=require('nodemailer')
const mysql=require('mysql2');
const { createConnection } = require('net');
const { Console, error } = require('console');
const bcrypt=require("bcrypt");
const jwt =require("jsonwebtoken");
const cookieparser=require("cookie-parser");
app.use(cookieparser())
const authenticateRoutes = require('./authenticateRoutes');
const methodoverride=require('method-override');
const { default: Swal } = require('sweetalert2');
// Set EJS as view engine]
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // If needed

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(methodoverride('_method'));

app.get("/",(req,res)=>{
    res.render("signup");
})



// Use your real email and app password here
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kishanrai18739@gmail.com',
    pass: 'rzko ryfw pzmz uzac' // NOT your regular Gmail password
  }
});


const db=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"Kishan@123",
  database:"ERP"
})
db.connect((err)=>{
  if(err)  {console.log("Error connecting to database",err)}
  else{
    console.log("Connected to database Successfully")
  }
})


app.post("/",(req,res)=>{
const data=req.body;
const{name,email,password,phone}=data
console.log("data from frontend is",data);
    

//Connecting DB to store Registered Users

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        // Store hash in your password DB.
        console.log("Hashed Password is",hash)

const sql="INSERT INTO users (name,email,password,phone)VALUES(?,?,?,?)"
 db.query(sql,[name,email,hash,phone],(err,result)=>{
     if(err){
      console.log("Error querying to DB",err)
      return res.send("Duplicate Email,Go back and enter new mail")
      }
     else{
         console.log("Query Successfull");
       //res.render("signup",{error:'success'})
    
async function main() {
  // send mail with defined transport object
  
  const info = await transporter.sendMail({
    from: '"User Management Tool" <kishanrai18739@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Login Details✔", // Subject line
  text: `Hi ${name},\n\nThanks for registering!\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n \nRole:Admin \n\nPlease keep this safe.`  
})
console.log("Message sent to",email);
}
main()

    //Sending role information to login page and rendering
    const query2="Select distinct role from users";
    db.query(query2,(err,urole)=>{
      if(err){
        console.log(err)
        return res.status(500)
      }
      console.log(urole)
      res.render("login",{urole})
      })
   
  }})})})})




app.get("/login",(req,res)=>{
  const query="select distinct role from users";
  db.query(query,[],(err,urole)=>{
    if(err){
      console.log("error",err)
    }
      res.render("login",{urole})
  })
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query1 = "SELECT * FROM users WHERE email = ?";
  
  db.query(query1, [email], async (err, result) => {
    if (err) {
      console.log("Error fetching from DB", err);
      return res.status(500).send("Server Error");
    }

    if (result.length === 0) {
      return res.status(400).send("Invalid Credentials");
    }
      const inputrole=req.body.role

       const user = result[0];

      if(user.role!==inputrole || inputrole===0){
          return res.send("Invalid Credentials");
      }
      else{

    bcrypt.compare(password, user.password, (err, isPassMatch) => {
      if (err) {
        console.log("Error comparing passwords", err);
        return res.status(500).send("Server Error");
      }

      if (!isPassMatch) {
        return res.status(400).send("Invalid Credentials");
      }

      // Generate token
      const token = jwt.sign({ email,role:user.role}, "Secret");

      // Set the cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // Render the main page
      res.render("main"); // you can pass user data to your template if needed
        });
      }
  })
  });



app.get("/main",authenticateRoutes,(req,res)=>{
  res.render("main");
})

// app.get("/employee",authenticateRoutes,((req,res)=>{
//   const query="Select * from users"
//   db.query(query,(err,result)=>{
//     if(err){
//       console.log("error fetching users",err)
//       return res.status(500).send("No user found")
//     }
//     console.log("Registered users",result);
//   res.render("employee",{users:result});
//   })
// }))

// JSON API endpoint
    
app.get("/api/employee", authenticateRoutes, (req, res) => {
  const query="Select * from users"
  db.query(query, (err, users) => {
    if (err) {
      console.log("error fetching users", err);
      return res.status(500).json({ error: "No users found" })}
  
     res.json(users);
     // Send JSON, not render
    })})
  


app.get("/employee", authenticateRoutes, (req, res) => {
  res.render("employee"); // No users passed — table will be filled by JS
});


app.post("/logout",(req,res)=>{
  res.clearCookie("token")

//To pass the role data from db to frontend role dropdown menu
  const query = "SELECT DISTINCT role FROM users";
  db.query(query, [], (err, urole) => {
    if (err) {
      console.error("Error fetching roles on logout:", err);
      return res.send("Error loading login page");
    }

    // Render login page with the roles data
    res.render("login", { urole });
  })

})

app.get("/adduser",authenticateRoutes,(req,res)=>{
  res.render("userform");
})

//Deleteing user using post method since forms doesnt support delete method

app.post("/deleteuser/:id", (req, res) => {
  const query = "DELETE FROM users WHERE id=?";
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.log("Unable to delete user", err);
      return res.status(500).send("Unable to delete user");
    }
    
    // After deletion, redirect back to the same page
    res.render("employee");  // Redirecting to the employee list page
  });
});



app.post("/adduser",(req,res)=>{
  const{name,email,phone,password,role}=req.body
  
bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash(password, salt, function(err, hash) {
      // Store hash in your password DB.
      console.log("Hashed Password is",hash)


  const query="Insert INTO users(name,email,phone,password,role)VALUES(?,?,?,?,?)"
db.query(query,[name,email,phone,hash,role],async(err,result)=>{
if(err){
  console.log("Unable to add Employee",err)
  res.send("Unable to add employee")
}
if(result){
  const{name,email,password,role}=req.body
  
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"User Management Tool" <kishanrai18739@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Login Details✔", // Subject line
    text: `Greetings,\n\nNew User has been added  ${name} !\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\nRole:${role} \n\n Please keep this safe.`  
})
  console.log("Employee added")
  console.log(result)
  
  res.render("employee");
}
})})})})


app.get("/updateuser",authenticateRoutes,(req,res)=>{
  const query="Select * from users"
  db.query(query, (err, users) => {
    if (err) {
      console.log("error fetching users", err);
      return res.status(500).json({ error: "No users found" })}
 console.log("USER DETAILS ARE",users)
  res.render("updateuser",{users});
})})


app.get("/dashboard",authenticateRoutes,(req,res)=>{
    const query="Select * from users"
    db.query(query, (err, user) => {
      if (err) {
        console.log("error fetching users", err);
        return res.status(500).json({ error: "No users found" })}
  res.render("dashboard",{user});
})
})

//...........CUSTOMER FIELD AND UI STARTS HERE.............



// To show employyes in customer dropdown

app.get("/add-customer",authenticateRoutes,(req,res)=>{
  const query="Select * from users"
  db.query(query,(err,employees)=>{
    if(err){console.log("Unable to query users")
    }
  res.render("add-customer",{employees})
  })
})

app.get("/customer_dashboard",authenticateRoutes,(req,res)=>{
  res.render("customer_dashboard");
})


app.post("/add-customer",(req,res)=>{
  const {name,phone,email,address,pan,aadhar,assigned}=req.body
  const query="Insert into customers(name,phone,email,address,pan,aadhar,assigned) values(?,?,?,?,?,?,?)";
  db.query(query,[name,phone,email,address,pan,aadhar,assigned],(err,result)=>{
      if(err){
        console.log("Cannot Insert data into Customers",err)
      }
      if(result){
        
        res.redirect("/customer_dashboard")
      }
  })
})


app.get("/api/customer_dashboard",(req,res)=>{
  
  const query="select * from customers"
  db.query(query,(err,customer)=>{
    
    if(err){
      console.log("Unable to query customers",err)
    }

 res.json(customer)
})})

app.post("/customers_del/:id",(req,res)=>{
  const query="Delete  from customers where id=?"
  db.query(query,[req.params.id],(err,result)=>{
    if(err){console.log("Unable to delete customers",err)
      return res.send("Customer cannot be deleted");
    }
    res.redirect("/customer_dashboard")
  })
})


//PURCHASE REQUEST DETAILS TO BE ADDED.


app.get("/purchase_query",authenticateRoutes,(req,res)=>{
  
  const query1="Select * from customers";
  const query2="select * from users";
  const query3="select distinct application_type from license_type"
  const query4="select distinct form_name from license_type"
  db.query(query1,(err,customer)=>{
    if(err){
      return res.send("Error",err)
    }
  
  db.query(query2,(err,employee)=>{
    if(err){
      console.log(err);
    }
    db.query(query3,(err,apptype)=>{
      if(err){
        console.log(err);
      }
      db.query(query4,(err,formname)=>{
        if(err){console.log(err)}
      
    res.render("purchase_details",{customer,employee,apptype,formname})
  })})})})
})


app.get("/purchase_dashboard",authenticateRoutes,(req,res)=>{
  res.render("purchase_dashboard")})


app.post("/purchase_query",(req,res)=>{
  // I wanted to send to resposne so i can do that by comparing header value
  const isAjax = req.headers['content-type'] === 'application/json';
      
  if(isAjax){
  const {subworkvalue}=req.body
  let query2="Select * from license_type where form_name=?";
  db.query(query2,[subworkvalue],(err,result)=>{
    if(err){console.log(err);}
    if (result.length > 0) {
    
      res.json({ form_details: result[0]?.application_details });
    } else {
      res.json({ form_details: "No details found" });
    }
  });

}
      else{
const {customername,worktype,subwork,querydate,assignedto,quotationno,quotationdate}=req.body;

  const query="Insert into purchase_query(customer_name,work_type,sub_work,query_date,assigned_to,quotation_no,quotation_sent)values(?,?,?,?,?,?,?)"
  db.query(query,[customername,worktype,subwork,querydate,assignedto,quotationno,quotationdate],(err,pquery)=>{
    if(err){
      console.log("Unable to create Purchase",err)
      return res.send("Unable to create purchase");
    }
  
    res.redirect("/purchase_dashboard")
  })}})



app.get("/api/purchase_dashboard",(req,res)=>{
  const query="Select * from purchase_query";
  db.query(query,(err,pquery)=>{
    if(err){console.log("error querying purchase")}
    res.json(pquery)

  })
})

app.post("/purchase/delete/:id",(req,res)=>{
  const query="Delete from purchase_query where id=?";
  db.query(query,[req.params.id],(err,result)=>{
    if(err){
      console.log("Error deleting purchase query");
      return res.send("Unable to delete puchase query",err)
    }
    res.redirect("/purchase_dashboard")
  })
})


//Add License Type details
app.get("/add_license",(req,res)=>{
  res.render("add_license")
})
app.post("/license",(req,res)=>{
  const query="Insert into license_type (application_type,form_name,application_details)values(?,?,?)"
  const{application_type,form_name,application_details}=req.body
  db.query(query,[application_type,form_name,application_details],(err,result)=>{
    if(err){
      console.log("Unable to insert into license table",err)
    }
    res.render("applicationtype_dashboard")
  })
})


app.get("/applicationtype_dashboard",(req,res)=>{
  res.render("applicationtype_dashboard")
})

  //Quotation Module 
  
app.get("/add_quotation",(req,res)=>{
  const query="Select distinct name from customers"
  db.query(query,(err,customers)=>{
    if(err){
      console.log(err)
    }
  const query1="Select distinct form_name from license_type";
  db.query(query1,(err,form_name)=>{
    if(err){console.log(err)}
  
  res.render("add_quotation",{customers,form_name})
})
})
})


app.post("/submit_quotation",(req,res)=>{
  const {customerName,quotationDate,quotationNo,totalQty,grandTotal}=req.body
  console.log(customerName,quotationDate,quotationNo,totalQty,grandTotal);
    const query="Insert into quotation (cust_name,qtn_date,quotation_no,total_qty,total_amt)values(?,?,?,?,?) "

    db.query(query,[customerName,quotationDate,quotationNo,totalQty,grandTotal],(err,result)=>{
      if(err){
        console.log("error inserting quotation details",err)
      }
      else{
        console.log("Quotation added successfully")
      }
    })
    res.redirect("/quotation_dashboard")
})



app.get("/quotation_dashboard",(req,res)=>{
  const query="select * from quotation";
  db.query(query,(err,quotations)=>{
    if(err){console.log(err)}
  
  res.render("quotation_dashboard",{quotations});
})
})

app.post("/delete-quotation/:id",(req,res)=>{
  const query="Delete from quotation where id=?"
  const{id}=req.params
  console.log(id);
  db.query(query,[id],(err,result)=>{
      if(err){
        console.log("Error deleting quotaiton",err);
        return res.send("Cannot delete quotation")
      }
      res.redirect("/quotation_dashboard")
  })
})



app.listen(4444,(err)=>{
if(err){console.log(err.message,"Unable to start server")}
else{
    console.log("Server started at Port 4444")
}
})