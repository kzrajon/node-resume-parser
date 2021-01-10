/*

		resume parser
*/

const express = require('express');
const app = express();
const resumeParser = require('simple-resume-parser');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const service = require('./services');
const PORT = 9000;
const uuid4 = require('uuid4');
const cors = require('cors');
const path = require('path');




app.use(bodyParser.json({limit:'1000mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'1000mb',extended: true}));
app.use(cookieParser());
app.use(helmet());
app.use(fileUpload());
app.use(cors());

app.post('/user-resume',function(req,res,next){
	
	var accessToken = req.query.access_token?req.query.access_token:null;
	var IP = req.query.ip?req.query.ip:null;
	
	var resumeFile = req.files.resume ;
       //console.log(resumeFile);
        var filename = uuid4()+'.pdf';
	resumeFile.mv(path.resolve(__dirname+'/resume',filename), function(err) {
	    if (err){
	      return res.status(500).json(err);
	     console.log("error",err);
	   }
    
    const resume = new resumeParser(path.resolve(__dirname+'/resume',filename));

	resume.parseToJSON()
			.then(data => {
				if(accessToken){
					return service.saveResume(data,accessToken)
						.then((r)=>{
							//console.log("r",r);
							return res.status(r.status).json({notification:"Your password already E-mail to you. Please fillup your resume."});
						})
						.catch(e=>e);
				}
				else{
					return service.userRegister(data.parts.email)
						.then((rr)=>{
							//console.log("after regis",rr);
							if(rr.status == 201){
								return service.userLogin(data.parts.email,IP)
								 .then((rrr)=>{
									 //console.log(rrr);
									let accessToken = rrr.data.access_token;
									 return service.saveResume(data,rrr.data.access_token)
										.then((r)=>{
											//console.log("r",r);
											return res.status(r.status).json({access_token:accessToken,notification:"Your password already E-mail to you. Please fillup your resume."});
										})
										.catch((e)=>{
		//									console.log(e);
											return res.status(e.response.status).send(e.response.data);
											
										});
								 })
								 .catch(ee=>{
			//						 console.log(ee);
											return res.status(ee.response.status).send(ee.response.data);
								 });
							}
						})
						.catch((er)=>{
							return res.status(er.response.status).json("You are already registrared User. please sign in and upload your resume again.");
						});
				}
				//console.log('pdf data ', data);
				//console.log("email",data.parts.email);
				//res.status(200).send(data);
			})
			.catch(error => {
				//console.error(error);
				return res.status(500).json("Resume can not parsable");
			});
			//res.end();
  });
});


app.get('/',function(req,res,next){
	return res.status(200).json("Please upload your resume in '/user-resume' URI with POST request.");
});

app.listen(PORT,()=>{
	console.log("server start at "+PORT);
});
