	var express = require('express'),
	app = express();

var mongodb = require('mongodb').MongoClient;
bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const mongo_conn = 'mongodb://localhost/';
var db = '';

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/app.html');
});

app.get('/getusers', function (req, res) {
	db.collection('ab').find({}).toArray(function (err, docs) {
		res.json(docs)
	});
});

app.get('/msg/:username', function (req, res) {
	db.collection('msg').find({ receiver: req.params.username }).toArray(function (err, result) {
		res.send(result);
	});
});

	
app.post('/logindata', function (req, res) {

	db.collection('ab').findOne({ username: req.body.username }, function (err, user) {

		if (user && user.password === req.body.password) {
		
			res.json({ data: user, flg:{"isLogin": true }});
			
		} else {
			console.log("Credentials wrong");
			res.json({ data: "Login invalid" });
		}
	});
});

app.post('/postdata', function (req, res) {
	db.collection('ab').insert(req.body, function (err,user) {
		if (!err) {
			res.send({
				flg: true
			});
			console.log("data save");
		}
	});
});


app.post('/compmsg', function (req, res) {

	db.collection('ab').findOne({ username: req.body.username },

		function (err, user) {
			
			user.username = req.body.username;
			if (!err) {
				db.collection('msg').insert({
					sender: user.username,
					receiver: req.body.email,
					msg: req.body.msg,
					isImpo : false
				}, function (err, docs) {
					res.send(docs);
				
				});

			}
		});
});

app.post('/del', function(req,res){

	db.collection('msg').remove({msg: req.body.msg },function(err,msg){

		 res.send(msg);
	});
})

app.post('/newMsg/:username', function (req, res) {

	db.collection('ab').findOne({ username: req.params.username },

		function (err, user) {
			
			if (!err) {
				db.collection('msg').insert({
					sender: user.username,
					receiver: req.body.sender,
					msg: req.body.nmsg,
					isImpo : false
				}, function (err, docs) {
					res.send({ flg: true });
				});

			}
		});
});

app.post('/impo',function(req,res){
	db.collection('msg').findOne({msg:req.body.msg},function(err,impo){
		if(impo.isImpo==true){
			impo.isImpo = false;
		}
		else{
			impo.isImpo = true;
		}
		
		db.collection('msg').save(impo, function (err) {
			res.send(impo);
		});
	});
});	
app.post('/updateUser', function (req, res) {
	db.collection('ab').findOne({ username: req.body.username },

		function (err, user) {
			user.username = req.body.username;
			user.password = req.body.password;
			user.firstname = req.body.firstname;
			user.location = req.body.location;
			user.email = req.body.email;
			user.phone = req.body.phone
			if (!err) {
				db.collection('ab').save(user, function (err) {
					console.log("save");
				});
				res.send({
					user
				});
					console.log("data update");

			}
		});
});	

mongodb.connect(mongo_conn, function (err, client) {
	if (!err) {
		console.log("connected");
		app.listen(3000, function () {
			console.log('server running');
		});
		db = client.db('marlabs');
	}
	else {
		console.log(err);
	}
});


