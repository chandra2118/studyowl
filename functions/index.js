const admin = require("firebase-admin");


var functions = require("firebase-functions");
var firebase = require('firebase');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


var globaluid;
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

var cookieSession = require('firebase-cookie-session');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
	keys: ['asdf'],
	maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


app.get('/', function (req, res) {
	res.render('index')
})
app.get('/signup', function (req, res) {
	res.render('signup')
})
app.get('/signin', function (req, res) {
	res.render('signin')
})
app.post('/createUser', function (req, res) {
	var n = req.body.name,
		p = req.body.pass,
		c = req.body.contact,
		e = req.body.email;
	var obj = {
		name: n,
		password: p,
		phone: c,
		email: e
	}
	userRef = db.collection('user').doc(); //assigns a unique id into userRef
	console.log(userRef.id)
	obj = {
		uid: userRef.id,
		name: n,
		password: p,
		phone: c,
		email: e

	}

	var insertRef = userRef.set(obj);
	res.render('signin.ejs');
})
app.post('/check', function (req, res) {
	var un = req.body.name;
	var pass = req.body.pas;
	console.log(un + "  " + pass)
	req.session.status = 0;
	var userRef = db.collection('user');
	var sin = userRef.where('name', '==', un).where('password', '==', pass).limit(1).get()
		.then(
			function (querySnapshot) {
				if (querySnapshot.empty) {
					console.log('user does not exist');
					res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/signin')
				}
				else {
					querySnapshot.forEach(function (data) {
						req.session.uid = data.id;
						globaluid = data.id;
						console.log(globaluid)
						res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/dashboard')
					})
				}
			})
		.catch(err => {
			console.log(err);
			res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/signin')  // error in get()
		})


})
app.get('/dashboard', function (req, res) {
	var obj = [];
	var profile = [];
	var i = 0;
	course = db.collection('project').get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				obj.push(doc.data());
			})

		})
		.catch(err => {
			console.log(err)
		});
	console.log(obj);
	console.log(globaluid);
	console.log("finding projects done")
	var userRef = db.collection('user').doc(globaluid).get().then(
		function (doc) {
			console.log("inside querySnapshot")
			if (doc.empty) {

				console.log('the data is empty')
			}
			else {
				profile.push(doc.data());


			}
			console.log(profile);
			res.render('homepage.ejs', { res: obj, res1: profile });
		})
		.catch(err => { console.log(err) })
});
app.get('/profile/:a', function (req, res) {
	var userid = req.params.a;
	var userName = req.params.b;
	var o = [];
	var p = [];
	console.log(userid)
	console.log(userName)
	var getuserRef = db.collection('user').where('uid', '==', userid).limit(1).get()
		.then(function (querySnapshot) {
			if (querySnapshot.empty) {
				console.log("user does not exist");
				res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/dashboard')
			}
			else {
				querySnapshot.forEach(function (doc) {
					o.push(doc.data());
				});

				var userCheck = db.collection('users').doc(globaluid).collection('userProj').get()
					.then(snapshot => {
						snapshot.forEach(doc => {
							p.push(doc.data());
						})
						res.render("profile.ejs", { data: o, res1: p })
					})
					.catch(err => {
						console.log(err);
						res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/dashboard')  // error in get()
					})

			}

		})
		.catch(err => {
			console.log(err);
			res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/signin')  // error in get()
		})
})
app.get('/addproject/:var', function (req, res) {
	var userid = req.params.var;
	var o =[];
	var getuserRef = db.collection('user').where('uid', '==', userid).limit(1).get()
		.then(function (querySnapshot) {
			if (querySnapshot.empty) {
				console.log("user does not exist");
				res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/signin')
			}
			else {
				querySnapshot.forEach(function (doc) {
					o.push(doc.data());
					res.render('addproject',{data:o})
				});
			}
		}).catch (err => {
		console.log(err);
		res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/signin')  // error in get()
	})
});
app.post('/createproj/:var', function (req, res) {
	var n = req.body.name,
		p = req.body.feild1,
		c = req.body.feild2,
		d = req.params.var
		var o =[];
	console.log(d)

	var obj = {
		name: n,
		feilds: [p, c],
	
	}
	console.log(globaluid);
	userRef = db.collection('revproj').doc(); //assigns a unique id into userRef
	console.log(userRef.id)
	obj = {
		pid: userRef.id,
		pname: n,
		fields: [p, c],
		uid: d,
		permission : ["true","false","false"]
	}

	var insertRef = userRef.set(obj);

	var getuserRef = db.collection('user').where('uid', '==',d).limit(1).get()
		.then(function (querySnapshot) {
			if (querySnapshot.empty) {
				console.log("user does not exist");
				res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/signin')
			}
			else {
				querySnapshot.forEach(function (doc) {
					o.push(doc.data());
					
				});
				res.render('profile',{data:o})
			}
		}).catch (err => {
		console.log(err);
		res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/signin')  // error in get()
	})
})
app.get('/admin',function(req,res){
	obj =[];
	revproj = db.collection('revproj').get()
	.then(snapshot => {
		snapshot.forEach(doc => {
			obj.push(doc.data());
			
		})
        console.log(obj)
			res.render('admin',{res:obj})
	})
	.catch(err => {
		console.log(err)
		res.render('signin');
	});
})

app.get('/acceptp/:var',function(req,res){
var a = req.params.var;
var o =[];

var getuserRef = db.collection('revproj').where('pid', '==',a).limit(1).get()
		.then(function (querySnapshot) {
			if (querySnapshot.empty) {
				console.log("project does not exist");
				res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/admin')
			}
			else {
				querySnapshot.forEach(function (doc) {
					o.push(doc.data());
					
				});
				console.log(o.uid)
			}
		}).catch (err => {
		console.log(err);
		res.redirect('http://localhost:5000/studyowl-chandra/us-central1/app/admin')  // error in get()
	})
})
exports.app = functions.https.onRequest(app);