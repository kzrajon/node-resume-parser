/**

       resume parser helper service
*/

const axios = require('axios');
const qs = require('qs');
const service = {};
const GATEWAY_URL = '';
const BIODATA_URL = '';
const USER_REGISTER_URL = '';
const USER_LOGIN_URL = '';

var username = password = d = null ;
	
var Biodata = {
	
	full_name:"",
	contact_email:"",
	address:"",
	city:"",
	zip_post_code:"",
	country_id:"",
	nationality:"",
	date_of_birth:"",
	gender:"",
	identity_number:"",
	mobile_number:"",
	another_mobile_number:"",
	objectives:"",
	photo:"",
	career_description:"",
	cover_letter:"",
	notice_period:''
};
service.biodata = function(data){
	let r = data.parts;
	Biodata.full_name = r.name?r.name:null;
	Biodata.contact_email = r.email?r.email:null;
	Biodata.address = r.address?r.address:null;
	Biodata.city = r.city?r.city:null;
	Biodata.zip_post_code = r.zip?r.zip:null;
	Biodata.country_id = '';
	Biodata.nationality = r.nationality?r.nationality:null;
	Biodata.date_of_birth = r.date_of_birth?r.date_of_birth:null;
	Biodata.gender = r.gender?r.gender:null;
	Biodata.identity_number = r.nid_passport?r.nid_passport:null;
	Biodata.mobile_number = r.phone?r.phone:null;
	Biodata.another_mobile_number = r.phone?r.phone:null;
	Biodata.objectives = r.objective?r.objective:null;
	Biodata.photo = '';
	Biodata.career_description = r.carrer_description?r.carrer_description:null;
	Biodata.cover_letter = '';
	Biodata.notice_period = '';
	
};
service.saveResume = function(data,accessToken){
  this.biodata(data);
  return  axios.post(BIODATA_URL,
	   
	   Biodata
   ,
   {headers:{'Authorization':"Bearer "+accessToken, "content-type":"application/json"}}
   )
	.then((r)=>{
		return r;
	})
	.catch(e=>e);

};

service.userRegister = function(email){

	while(true){
		username = email.split("@")[0]+Math.floor(Math.random()*1000000);
		password = email.split("@")[0]+Math.floor(Math.random()*1000000);
		return  axios.post(USER_REGISTER_URL,
		 {"username":username,"email":email,"password":password,"registration_from_resume_parser":true},
			 { headers:{"content-type":"application/json"}}
	    )
		.then((r)=>{
			return r ;
		})
		.catch((e)=>{
			if(e.response.status == 409){
				//console.log("error",e.response.data);
				//d = JSON.parse(e.response.data);
				if(e.response.data.email){
					throw e;
				}
			}
			
		});
	}
	
};
service.userLogin = function(email,ip){
	return  axios.post(USER_LOGIN_URL+"?ip="+ip,{
           email:email,password:password
	   },
	   {headers:{"content-type":"application/json"}}
	   )
		.then((r)=>{
			return r;
		})
		.catch(e=>e);
};
module.exports = service ;
