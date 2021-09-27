const dasha = require("@dasha.ai/sdk");
const fs = require("fs");

const express = require( 'express' );
const bodyParser = require("body-parser");
const hook = express();
const PORT = 1919;

const json2html = require('node-json2html');

const axios = require("axios").default;

require('dotenv').config();

hook.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World. Server running on port ' + PORT + '. Listening for incidents on http://1543a913a2c7.ngrok.io As soon as incident is identified, I will initiate a call from Dasha AI to ackgnowledge or address the incident.  ');
})

hook.use(bodyParser.json());
hook.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

function sendemail(transcript)
{
  const nodemailer = require('nodemailer');
require('dotenv').config();

var transporter = nodemailer.createTransport(
    {
    service: 'gmail',
    auth: {
      user: process.env.gmailuser,
      pass: process.env.gmailpw
    }
  });

var mailOptions = 
{
    from: process.env.gmailuser,
    to: process.env.sendto,
    subject: 'Incident conversation transcript',
    html: '<h2>Conversation transcript:</h2><p>' + transcript + '</p>'
};

transporter.sendMail(mailOptions, function(error, info)
{
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
}

// Dasha app function
async function calldasha(incidentId) 
{
  const app = await dasha.deploy("./app");

  app.connectionProvider = async (conv) =>
    conv.input.phone === "chat"
      ? dasha.chat.connect(await dasha.chat.createConsoleChat())
      : dasha.sip.connect(new dasha.sip.Endpoint("default"));
  app.ttsDispatcher = () => "dasha";

  await app.start();

  // external function called out from DSL; used to acknowledge an incident in Betteruptime 
  app.setExternal("acknowledge", (args, conv) => 
  {
    if (incidentId === null)
    return;
    
    const config = {
      headers: { Authorization: "Bearer " + process.env.betteruptimetoken }
    };

    const bodyParameters = { key: "value" };

    axios.post( "https://betteruptime.com/api/v2/incidents/" + incidentId + "/acknowledge", bodyParameters, config)
    .then(console.log)
    .catch(console.log);
  });

      // external function called out from DSL; used to resolve an incident in Betteruptime 
  app.setExternal("resolve", (args, conv) => 
  {  
    if (incidentId === null)
    return;

    const config = {
      headers: { Authorization: "Bearer "+ process.env.betteruptimetoken }
    };

    const bodyParameters = { key: "value" };

    axios.post( "https://betteruptime.com/api/v2/incidents/" + incidentId + "/resolve", bodyParameters, config)
    .then(console.log)
    .catch(console.log);
  });

  app.setExternal("getstatusof", (args, conv) => 
  {
    switch (args.what)
    {
      case "kubernetes":
        return "Kubernetes is up and running";
      case "healthcheck":
        return "Site health checks are not responding";
      case "TLS":
        return "TLS Certificate is active";
    }
  }); 

  // external functions end
  const conv = app.createConversation({ phone: process.env.phone, name: process.env.name });

  if (conv.input.phone !== "chat") conv.on("transcription", console.log);

  const result = await conv.execute();

  console.log(result.output);

  fs.mkdirSync("transcriptions", { recursive: true } ); //create directory to save transcriptions 
  var transcription = JSON.stringify(result.transcription);

  fs.writeFileSync("transcriptions/" + (incidentId??"test") + ".log", transcription ); //save the transcript of the conversation in a file  
  // or you can upload incident transcriptions to your incident management system 
  // or send an email to yourself

  var transcript = json2html.render(transcription, {"<>": "li", "html":[
    {"<>": "span", "text": "${speaker} at ${startTime}: ${text} "}
    ]});
  sendemail(transcript);

  await app.stop();
  app.dispose();
}

// webhook listener begins 
hook.post("/hook", async(req, res) => 
{
  console.log(req.body); // Call your action on the request here
  res.status(200).end(); // Responding is important
  incidentId = req.body.data.id;
  acknowledged = req.body.data.attributes.acknowledged_at;
  resolved = req.body.data.attributes.resolved_at;
  console.log("incidentID: " + incidentId);
  console.log("acknowledged: " + acknowledged);
  console.log("resolved: " + resolved);

  if (acknowledged != null && resolved == null) 
  {
    console.log("Incident " + incidentId + " acknowledged.");
  }
  else if (acknowledged != null && resolved != null)
  {
    console.log("Incident " + incidentId + " resolved.");
  }
  else 
  { 
    console.log("Incident " + incidentId + " created. Expect a call from Dasha.");

    // Dasha app begins 
    await calldasha(incidentId);
  }
});

if (process.argv[2] === "test")
  calldasha(null);
