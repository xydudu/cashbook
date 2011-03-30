KEY_1 = '';
KEY_2 = '';

var 
http = require('http'),
url = require('url'),
express = require('express'),
app = express.createServer(),
total;

// http query
var httpQuery = function($url, $fn){
	var 
    uinfo = url.parse($url),
	client = http.createClient(uinfo.port ? uinfo.port : 80, uinfo.hostname, false),
	uri = uinfo.pathname + (uinfo.search ? uinfo.search : ''),
	req = client.request('POST', uri, {'host': uinfo.hostname});

	req.end();
    req.on('response', function(res){
        res.body = '';
        res.on('data', function(chunk){ res.body += chunk; });
        res.on('end', function(){
            $fn(res.body);
        });
    });
}


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());

app.get('/', function(req, res){
    var getUrl = 'http://query.yahooapis.com/v1/public/yql?q=select%20col0%2C%20col1%2C%20col2%20from%20csv%20where%20url%3D%22http%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fhl%3Den%26hl%3Den%26key%3D'+ KEY_1 +'c%26output%3Dcsv%22&format=json&diagnostics=true&'+ Math.random();
    httpQuery(getUrl, function($data) {
        var rows = JSON.parse($data).query.results.row;
        var last = rows.length > 1 ? rows.slice(-1) : rows,
        total = last.col2 || last[0].col2;
        rows = (rows.length > 1) ? rows : [].concat(rows);  
        res.render('index', {costs: rows, total: total});    
    });
});

app.post('/add', function(req, res){
    var 
    v = req.body.v,
    isTotal = (v.indexOf('+') === 0),
    cost = 0,
    t = 0;
    
    if (isTotal) {
        cost = 0;
        t = +total + +v;
    } else {
        cost = v;
        total = t = total - v;
        if (t < 0) {
            res.send('no');
            return false;
        }
    }

    var saveUrl = 'http://spreadsheets.google.com/formResponse?formkey='+ KEY_2 +'&entry.12.single='+ t +'&entry.10.single='+ cost;
    httpQuery(saveUrl, function($data) {
        res.send(isTotal);
    });
});

app.listen(3000, 'node.local');
