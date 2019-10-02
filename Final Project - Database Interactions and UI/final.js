var express = require('express');
var mysql = require('./dbcon.js');


var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3113);


app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table Reset";
      res.render('home',context);
    })
  });
});




app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    context.rowData = rows;
    res.render('home', context);
  });
});




app.get('/insert',function(req,res,next){
  var context = {};
  mysql.pool.query("INSERT INTO workouts SET ?",
	{name: req.query.name, reps: req.query.reps, weight: req.query.weight, date: req.query.date, lbs: req.query.lbs},
    function(err, result){
        if(err){
            next(err);
            return;
        }
	mysql.pool.query('SELECT * FROM workouts WHERE id = ' + result.insertId, function(err, rows, fields){
      	if(err){
        	next(err);
        	return;
      	}
        context.rowData = JSON.stringify(rows);
        res.type("text/plain");
        res.send(context.rowData);
   	});
  });
});




app.get('/edit', function(req, res){
    var context = {};
    mysql.pool.query('SELECT * FROM workouts WHERE id = ' + req.query.editId, function(err, rows, fields){
      	if(err){
        	next(err);
        	return;
        }
        
        if (rows[0].date) {
            var year = rows[0].date.getFullYear();
            var month = rows[0].date.getMonth();
            var day = rows[0].date.getDate();
            //I had to increment the month for some reason so it would appear correctly
            month = month + 1;
            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            var date = year + '-' + month + '-' + day;
                rows[0].date = date;
        }
        
        context.rowData = rows;
        res.render('update', context);
    })
});




app.post('/',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
        [req.body.name || curVals.name, req.body.reps || curVals.reps, req.body.weight || curVals.weight, req.body.date || curVals.date, req.body.lbs || curVals.lbs, req.body.id],
        function(err, result){
            if(err){
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
                if(err){
                    next(err);
                    return;
                }
                context.rowData = rows;
                res.render('home', context);
            });
        });
    }
  });
});




app.get('/delete',function(req,res,next){
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.deleteId], function(err, result){
    if(err){
      next(err);
      return;
    }
    res.send(null);
  });
});




app.use(function(req,res){
res.status(404);
res.render('404');
});




app.use(function(err, req, res, next){
console.error(err.stack);
res.type('plain/text');
res.status(500);
res.render('500');
});




app.listen(app.get('port'), function(){
  console.log('Express started on http://flip1.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});