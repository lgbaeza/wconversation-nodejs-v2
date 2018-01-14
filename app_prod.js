//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

var express = require('express');
var cfenv = require('cfenv');

var watson = require('watson-developer-cloud');
var bodyParser = require('body-parser');

var wconv_version_date = '2017-04-21';
var wconv_api_version = 'v1';
var wconv_workspaceId = 'reemplazar-con-ID-workspace-watson-conversation';
var wconv_username = 'reemplazar-con-usuario-watson-conversation';
var wconv_password =  'reeamplazar-con-contraseña-watson-conversation';

var wconv_workspaceId = '1ff19091-d4bf-40f2-adc1-b0c315964b5b';
var wconv_username = '72372ac0-3e54-4966-a9f3-080dddccaa35';
var wconv_password =  'qjmT1OCJ23S5';

var app = express();
var appEnv = cfenv.getAppEnv();
var session = require('express-session');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.set('trust proxy', 1) // trust first proxy 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.get('/chat', function (req, res) {
    res.sendFile(__dirname + '/public/chatv2.html');
});

app.get('/initiliaze', function(req, res){
  
  var conversation = watson.conversation({
    username: wconv_username,
    password: wconv_password,
    version: wconv_api_version,
    version_date: wconv_version_date
  });

  conversation.message({
    workspace_id: wconv_workspaceId,
    input: {'text': ''}
  },  function(err, response) {
      session.context = response.context;
      
      var msgOut = "";
      var additionalText = "";
      var name = "IBM Watson", avatar = "post", cssClass = "watson";
      for(var i=0; i<response.output.text.length; i++)
      {
        msgOut += "<section class=\"post\">";
        msgOut += "<header class=\"post-header-watson\">";
        msgOut += "<img width=\"48\" height=\"48\" alt=\"img\" class=\"" + avatar + "-avatar-w\" src=\"images/avatar-" + cssClass + ".png\">";
        msgOut += "<h2 class=\"post-title-" + cssClass +  "\">@" + name + "</h2>";
        msgOut += "</header>";
        msgOut += "<div class=\"post-description-" + cssClass + "\">";
        msgOut += response.output.text[i];
        msgOut += additionalText;
        msgOut += "</div>";
        msgOut += "</section>";
      }

      res.send(msgOut)
  });

});

app.get('/sendMessage', function (req, res) {
  
  var message = req.query.message;
  var saved_context = session.context;
  var username = req.query.username;
  var conversation = watson.conversation({
    username: wconv_username,
    password: wconv_password,
    version: wconv_api_version,
    version_date: wconv_version_date
  });

  /*var parameters = {
    'text': message,
    'features':{
      'emotions': true
    }
  };*/
  
  //Call Watson Tone Analyzer Service
  //var tone = new watson.ToneAnalyzerV3();

  conversation.message({
    workspace_id: wconv_workspaceId,
    input: {'text': message},
    context: saved_context
  },  function(err, response) {
      session.context = response.context;

      /*var strMap = "";
      if(response.context.flag_ubicacion !== undefined)
      {
        var search = response.context.oficina;
        var google_api_key = "AIzaSyBbEUwx7EtSzL-Ssyz6QmRFBcowWIXtU-0";
        var lat_lng = "19.4326,-99.1332";
        
        strMap = "<br> <iframe " +
          "width=\"100%\" " +
          "height=\"250\" " +
          "frameborder=\"0\" style=\"border:0\" " +
          "src=\"https://www.google.com/maps/embed/v1/search?key=" + google_api_key +
          "&q=" + search + "\" allowfullscreen>" +
          "</iframe>";
          delete response.context.flag_ubicacion;
          delete response.context.oficina;
      }*/
      var name = username, avatar = "pre", cssClass = "user";
      var msgOut = "";
      msgOut += "<section class=\"post\">";
      msgOut += "<header class=\"post-header-watson\">";
      msgOut += "<img width=\"48\" height=\"48\" alt=\"img\" class=\"" + avatar + "-avatar-w\" src=\"images/avatar-" + cssClass + ".png\">";
      msgOut += "<h2 class=\"post-title-" + cssClass +  "\">@" + name + "</h2>";
      msgOut += "</header>";
      msgOut += "<div class=\"post-description-" + cssClass + "\">";
      msgOut += message;
      msgOut += "</div>";
      msgOut += "</section>";

      var additionalText = "";
      name = "IBM Watson", avatar = "post", cssClass = "watson";
      for(var i=0; i<response.output.text.length; i++)
      {
        msgOut += "<section class=\"post\">";
        msgOut += "<header class=\"post-header-watson\">";
        msgOut += "<img width=\"48\" height=\"48\" alt=\"img\" class=\"" + avatar + "-avatar-w\" src=\"images/avatar-" + cssClass + ".png\">";
        msgOut += "<h2 class=\"post-title-" + cssClass +  "\">@" + name + "</h2>";
        msgOut += "</header>";
        msgOut += "<div class=\"post-description-" + cssClass + "\">";
        msgOut += response.output.text[i];
        msgOut += additionalText;
        msgOut += "</div>";
        msgOut += "</section>";
      }

      res.send(msgOut)
  });

});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});

function compare(a,b) {
  if (a.score < b.score)
    return -1;
  if (a.score > b.score)
    return 1;
  return 0;
}
