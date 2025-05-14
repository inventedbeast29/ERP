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
app.use(cookieparser());
const authenticateRoute=require("./authenticateRoutes")
const methodoverride=require('method-override');
const { default: Swal } = require('sweetalert2');
const { disconnect, prependListener } = require('process');


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
  db.query(query,(err,urole)=>{
    if(err){
      console.log("error",err)
    }
      res.render("login",{urole})
  })
})

app.post("/login",(req, res) => {
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

    app.use(authenticateRoute) //Authentication of users to access the routes

app.get("/main",(req,res)=>{
  res.render("main");
})

// app.get("/employee",((req,res)=>{
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
    
app.get("/api/employee",(req, res) => {
  const query="Select * from users"
  db.query(query, (err, users) => {
    if (err) {
      console.log("error fetching users", err);
      return res.status(500).json({ error: "No users found" })}
  
     res.json(users);
    
    })})
  


app.get("/employee",(req, res) => {
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

app.get("/adduser",(req,res)=>{
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


app.get("/updateuser",(req,res)=>{
  const query="Select * from users"
  db.query(query, (err, users) => {
    if (err) {
      console.log("error fetching users", err);
      return res.status(500).json({ error: "No users found" })}
 console.log("USER DETAILS ARE",users)
  res.render("updateuser",{users});
})})


app.get("/dashboard",(req,res)=>{
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

app.get("/add-customer",(req,res)=>{
  const query="Select * from users"
  db.query(query,(err,employees)=>{
    if(err){console.log("Unable to query users")
    }
  res.render("add-customer",{employees})
  })
})

app.get("/customer_dashboard",(req,res)=>{
  res.render("customer_dashboard");
})


app.post("/add-customer",(req,res)=>{
  const userInfo=req.user.email
  const {name,phone,email,address,pan,aadhar,assigned}=req.body
  const query="Insert into customers(name,phone,email,address,pan,aadhar,assigned,created_by,updated_by,last_updated) values(?,?,?,?,?,?,?,?,?,Now())";
  db.query(query,[name,phone,email,address,pan,aadhar,assigned,userInfo,userInfo],(err,result)=>{
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


app.get("/customers/edit/:id",(req,res)=>{
  const id=req.params.id
  const query="Select*from customers where id=?";
  db.query(query,[id],(err,result)=>{
    if(err){return res.send("error")}
    let customer=result[0];
    res.render("update_customer",{customer})
  })

})
app.post("/customers/update/:id",(req,res)=>{
  const userInfo=req.user.email;
  const id=req.params.id
  const {phone,email,address,pan,aadhar}=req.body;
  const query=  "UPDATE customers   SET  phone = ?, email = ?, address = ?, pan = ?, aadhar = ?, updated_by = ?, last_updated = NOW()  WHERE id = ?"
  db.query(query,[phone,email,address,pan,aadhar,userInfo,id],(err,result)=>{
    if(err){return res.send("cannot update customer",err)}
    res.redirect("/customer_dashboard")
  })
})

app.post("/customers_del/:id",(req,res)=>{
  const query="Delete  from customers where id=?"
  db.query(query,[req.params.id],(err,result)=>{
    if(err){console.log("Unable to delete customers",err)
      return res.send("Customer cannot be deleted");
    }
    res.redirect("/customer_dashboard")
  })
})

app.get("/view/customer/:cust_id",(req,res)=>{
  const id=req.params.cust_id;
  const query="Select * from customers where id=?";
  db.query(query,[id],(err,result)=>{
      if(err){return res.send("Unable to view"),err}
      let customer=result[0];
      console.log(customer)
      res.render("view_customer",{customer})
  })
})

//PURCHASE REQUEST DETAILS TO BE ADDED.


app.get("/purchase_query",(req,res)=>{
  
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



app.post("/purchase_query",(req,res)=>{
  const userInfo=req.user.email;
const {customername,worktype,subwork,remarks,querydate,assignedto,query_sts,queryclose_date}=req.body;
  const query="Insert into purchase_query(customer_name,work_type,sub_work,remarks,query_date,assigned_to,query_sts,queryclose_date,updated_by,last_updated)values(?,?,?,?,?,?,?,?,?,Now())"
  db.query(query,[customername,worktype,subwork,remarks,querydate,assignedto,query_sts,queryclose_date,userInfo],(err,pquery)=>{
    if(err){
      console.log("Unable to create Purchase",err)
      return res.send("Unable to create purchase");
    }
    res.redirect("/purchase_dashboard")
  })})

  app.get("/purchase_dashboard",(req,res)=>{
    const query="Select * from purchase_query"
    db.query(query,(err,pquery)=>{
      if(err){
        return res.send("Error")
      }
      res.render("purchase_dashboard",{pquery})})
    })
  

    app.get("/purchase/edit/:query_id",(req,res)=>{
      const id=req.params.query_id;
      const query="select * from purchase_query where id=?";
      db.query(query,[id],(err,result)=>{
        if(err){return res.send("Error")}
      let pquery=result[0];
      console.log(pquery)
        res.render("purchase_edit",{pquery})
      })
    
    })
  app.post("/purchase_query/update/:query_id",(req,res)=>{
    const userInfo=req.user.email
      const id=req.params.query_id;
      const{query_sts,remarks}=req.body
      const query="UPDATE purchase_query set query_sts=?,remarks=?,updated_by=?,last_updated=Now() where id=? "
      db.query(query,[query_sts,remarks,userInfo,id],(err,result)=>{
        if(err){
          return res.send("Error editing purchase query".err)
        }
        res.redirect("/purchase_dashboard")
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

app.get("/view/purchase/:query_id",(req,res)=>{
  const id=req.params.query_id
  const query="select * from purchase_query where id=? "
  db.query(query,[id],(err,qresult)=>{
    if(err){return res.send("Cannot view Purchase query",err)}
    let result=qresult[0];
    console.log(result)
res.render("purchase_view",{result})
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
      console.log("Unable to insert into license table",err);
      return res.send("unable to add license")
    }
    res.redirect("/applicationtype_dashboard")
  })
})


app.get("/applicationtype_dashboard",(req,res)=>{
  const query="select * from license_type"
  db.query(query,(err,form)=>{
    if(err){console.log(err)
      return res.send("errro");
    }
  

app.post("/license_delete/:id",(req,res)=>{
  const {id}=req.params;
  const query="Delete from license_type where id=?"
  db.query(query,[id],(err,result)=>{
    if(err){
      return res.send("Unable to delete item",err)
    }
    res.redirect("/applicationtype_dashboard")
  })
})



  res.render("applicationtype_dashboard",{form:form})
  })
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
  let userInfo=req.user.email
  const {customerName,gst,quotation_sts,quotationNo,totalTax,totalDiscamt,totalQty,grandTotal,paymentTerms,termsConditions,govtfee,constfee,remarks}=req.body
 
 //console.log(customerName,quotationDate,quotationNo,totalQty,grandTotal,"Paymentterm",paymentTerms,"termsConditions",termsConditions,"remark",remarks);
    const query="Insert into quotation (cust_name,gst,qtn_date,quotation_no,total_qty,totalTax,total_disc,total_amt,quotation_sts,acc_rej_date,updated_by,govtfee,const_fee)values(?,?,Now(),?,?,?,?,?,?,?,?,?,?) "
    const query2 = "INSERT INTO quotation_items (quotation_no, item_desc, quantity, unit_price, discount_amt, tax_amt, total_amt,payment_term,term_condition,notes) VALUES (?, ?, ?, ?, ?, ?,?,?,?, ?)";
   const   {item_desc,quantity,unitPrice,discount,tax,amount}=req.body
  // console.log(item_desc,quantity,unitPrice,discount,tax,amount)
    
    db.query(query,[customerName,gst,quotationNo,totalQty,totalTax,totalDiscamt,grandTotal,quotation_sts,userInfo,govtfee,constfee],(err,result)=>{
      if(err){
        console.log("error inserting quotation details",err)
      }
      else{
        console.log("Quotation added successfully")
        const totalItems = item_desc.length;
        let insertedCount = 0;
         for (let i=0;i<totalItems;i++){
          const desc=item_desc[i];
          const qty=quantity[i];
          const price=unitPrice[i];
          const disc=discount[i];
          const taxAmt=tax[i];
          const amt=amount[i];
        //  console.log(`Inserting Items ${i+1}`,{desc, qty, price, disc, taxAmt, amt })
            db.query(query2,[quotationNo,desc,qty,price,disc,taxAmt,amt,paymentTerms,termsConditions,remarks],(err,result)=>{
              if(err){
                console.log("error",err);
                return res.send("Error inserting items")
              }
              insertedCount++;

              // Only redirect after all items are inserted
              if (insertedCount === totalItems) {
                res.redirect("/quotation_dashboard");
              }
            })
         }
               
      }})
        })



app.get("/quotation_dashboard",(req,res)=>{
  const query="select * from quotation";
  db.query(query,(err,quotations)=>{
    if(err){console.log(err)}
    res.render("quotation_dashboard",{quotations});
    })
})


app.get("/view-quotation/:id",(req,res)=>{
  const id=req.params.id;
  const qNo=req.query.qno
  const query="Select * from quotation where id=?"
 const query2="select * from quotation_items where quotation_no=?"
 const query3="select * from quotation_items where quotation_no=?"
  db.query(query,[id],(err,result)=>{
    if(err){return res.send("Cannot view quotation",err)}
    const qresult=result[0];
    //console.log(qresult);
   
    db.query(query2,[qNo],(err,q2result)=>{
      if(err){return res.send("error",err)}
      const q2ans=q2result[0];
      console.log(q2ans)
      db.query(query3,[qNo],(err,result)=>{
        if(err){return res.send("Error",err)}
        console.log("ITEMS",result)
        res.render("quotation_view",{qresult,q2ans,result})
      })
  })
})
})
app.get("/edit-quotation/:id",(req,res)=>{
  const id=req.params.id;
  const qNo2=req.query.qno
  const query="Select * from quotation where id=?"
 const query2="select * from quotation_items where quotation_no=?"
 const query3="select * from quotation_items where quotation_no=?"
  db.query(query,[id],(err,result)=>{
    if(err){return res.send("Cannot view quotation",err)}
    const qresult=result[0];
    //console.log(qresult);
   
    db.query(query2,[qNo2],(err,q2result)=>{
      if(err){return res.send("error",err)}
      const q2ans=q2result[0];
      db.query(query3,[qNo2],(err,result)=>{
        if(err){return res.send("Error",err)}
        console.log(q2ans)
        res.render("edit_quotation",{qresult,q2ans,result})
})
    })
  })})

  app.post("/edit_quotation",(req,res)=>{
    const {quotation_sts,acc_rej_date,paymentTerms,termsConditions,remarks}=req.body
    
    const qNo=req.query.qno
    const query="Update quotation set quotation_sts=?,acc_rej_date=?,last_updated=Now() where quotation_no=?"
    const query2="Update quotation_items set payment_term=?,term_condition=?,notes=? where quotation_no=?"
    db.query(query,[quotation_sts,acc_rej_date,qNo],(err,result)=>{
      if(err){
        console.log(err);
         return res.send("Error Updating Quotation")}

        db.query(query2,[paymentTerms,termsConditions,remarks,qNo],(err,result)=>{
            if(err){
              console.log(err);
              return res.send("Cannot Update Quotation")}
            res.redirect("/quotation_dashboard")
      })
      
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

app.get("/reminders",(req,res)=>{
  const query="Select * from customers";
  const query2="Select * from quotation";
  db.query(query,(err,result)=>{
    if(err){
      console.log(err)
    }
    db.query(query2,(err,quotation)=>{
      if(err){console.log(err);
        return res.send("Cannot get quotation")
      }
      res.render("reminder",{result,quotation})
    })  
  })
})



  app.post("/send_reminder",(req,res)=>{
    const{customerName,customerEmail,quotationNo,reminderType,message}=req.body
    console.log(customerName,customerEmail,quotationNo,reminderType,message);
    let subject="";
    if(reminderType==="quotation"){
      subject=`Reminder: Quotation Acceptance for ${quotationNo}`
    }
    else if(reminderType==="payment"){
      subject=`Reminder:Payment Due for ${quotationNo}`
    }
    else if(reminderType==="document"){
      subject=`Reminder:Documents Submission Pending`
    }
    else if(reminderType===`queryclosure`){
      subject=`Reminder:Query Closure`
    }

   const mailOptions={
        from: "SY Associates",
        to: customerEmail,
        subject: subject,
        html:` Dear <b>${customerName}</b>,<br><br>${message}<br><br>Regards,<br>SY Associates`
      }

      transporter.sendMail(mailOptions,(err,result)=>{
        if (err) {
          console.log('Error sending email: ', err.toString);
          return res.status(500).send('Error sending email');
        }
          res.json({"status":"mailsent"})
  })
})

  


app.listen(4444,(err)=>{
if(err){console.log(err.message,"Unable to start server")}
else{
    console.log("Server started at Port 4444")
}
})