## Dasha Site Reliability Monitor - integration with Better Uptime 

Use this source code to construct your own AI app which will notify you of incidents on your site and let you acknowledge and resolve the incident right on the call. 

### Why use Dasha for Site Reliability  
* Not only do you get notified, you are able to resolve the issue on the call 
* Handle incidents while away from your desk 
* Handle incidents quicker. By integrating Dasha with your Kubernetes clusters, etc., you will have access to latest statuses just by asking Dasha. 

## Get this app set up

### The premise of the app

You will find two .js files in the repository. __helloworld.js__ is a super-simple Express server. You run it locally on your machine and use a tunneling tool (I used Ngrok) to give it a web address. This is the "website" your monitoring service (I used Better Uptime) will monitor. The second __index.js__ runs a webhook listener. It also runs locally and I used Ngrok to tunnel it to a web address. I set Better Uptime up to send a webhook up to my specified address whenever the website it monitors goes down. When the webhook hits __index.js__ a Dasha conversational AI app is activated and a call goes out to the specified phone number. As the conversation (__main.dsl__) progresses, external functions are called upon in __index.js__. Some of these reach out to external services on Better Uptime to acknowledge or resolve the incident. 

A variety of digressions help move the conversation along: acknowledge, resolve, ignore, status (get status of vital services), wait, repeat. 

At the end of the conversation, an email is sent out with the transcription of the conversation to the address you specify. A copy of the transcript is saved in the __/transcripts/__ folder created by the app. 

#### __Notes/important:__

* I used Better Uptime for this application for reliability monitoring. The feature to use webhooks is a paid feature. You can use any other site reliability service. 
* You will need to modify the .env file to specify sensitive data - email addresses, passwords, tokens. 
* I set up simplified login for my test Gmail account. If you do not modify security settings, your attempt to login using sendMail will fail with the code in this app. 


### Get Dasha activated 
You’ll need the latest Node.js, NPM and VSCode. Open VSCode and in terminal run the following commands, one after another.

```hash
code --install-extension dasha-ai.dashastudio
npm i -g “@dasha.ai/cli@latest”
dasha account login
dasha account info
```

This installs Dasha Studio extension, Dasha CLI, registers your account, and returns your activated API key.

Now let's get a copy of the application source code and install it: 
```hash
git clone https://github.com/dasha-samples/site-reliability-monitor-handler
cd site-reliability-monitor-handler
npm install
```

Now, run the two servers: 
```hash
node index.js
node helloworld.js
```

Now, connect a tunnelling service to your localhost ports. (I used Ngrok). 

Finally, go into your monitoring service (I used Better Uptime) and do two things. 1) set it up to monitor the domain name given to you by the tunneling service for __helloworld.js__ 2) Set it up to send a webhook out to the domain name + /hook which tunnels to your __index.js__ (e.g.: https://somedomain.ngrok.io/hook) 

Modify .env to account for all sensitive variables used in __index.js__. 

Now, kill the __helloworld.js__ server. Your monitoring system should send a webhook out to the address you specified and a Dasha conversation will launch. 


PS I will write up a detailed tutorial in the coming days and link to it here. 

