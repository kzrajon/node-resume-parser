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



app.use(cors());
app.use(bodyParser.json({limit:'1000mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'1000mb',extended: true}));
app.use(cookieParser());
app.use(helmet());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles : true,
    tempFileDir : '/tmp/',
    preserveExtension: true
}));


app.post('/upload',function(req,res,next){
	
	var accessToken = req.query.access_token?req.query.access_token:null;
	var IP = req.query.ip?req.query.ip:null;
	
	var resumeFile = req.files.resume ;
	var ext = resumeFile.name.substr(resumeFile.name.length-3);
      
        var filename = uuid4()+ext;
	resumeFile.mv(path.resolve(__dirname+'/resume',filename), function(err) {
	    if (err){
	      return res.status(500).json(err);
	    
	   }
    
    const resume = new resumeParser(path.resolve(__dirname+'/resume',filename));

	resume.parseToJSON()
			.then(data => {
				if(accessToken){
					return service.saveResume(data,accessToken)
						.then((r)=>{
							return res.status(r.status).json({notification:"Your password already E-mail to you. Please fillup your resume."});
						})
						.catch(e=>e);
				}
				else{
					return service.userRegister(data.parts.email)
						.then((rr)=>{
							if(rr.status == 201){
								return service.userLogin(data.parts.email,IP)
								 .then((rrr)=>{
									let accessToken = rrr.data.access_token;
									 return service.saveResume(data,rrr.data.access_token)
										.then((r)=>{
											return res.status(r.status).json({access_token:accessToken,notification:"Your password already E-mail to you. Please fillup your resume."});
										})
										.catch((e)=>{
											return res.status(e.response.status).send(e.response.data);
											
										});
								 })
								 .catch(ee=>{
									return res.status(ee.response.status).send(ee.response.data);
								 });
							}
						})
						.catch((er)=>{
							return res.status(er.response.status).json("You are already registrared User. please sign in and upload your resume again.");
						});
				}
				
			})
			.catch(error => {
				return res.status(500).json("Resume can not parsable");
			});
		
  });
});


app.get('/',function(req,res,next){
	return res.status(200).json("Please upload your resume in '/upload' URI with POST request.");
});

app.listen(PORT,()=>{
	console.log("server start at "+PORT);
});
