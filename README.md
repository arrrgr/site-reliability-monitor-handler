## Dasha Site Reliability Monitor - integration with Better Uptime 

Use this source code to construct your own AI app which will notify you of incidents on your site and let you acknowledge and resolve the incident right on the call. 

### Why use Dasha for Site Reliability  
* Not only do you get notified, you are able to resolve the issue on the call 
* Handle incidents while away from your desk 
* Handle incidents quicker. By integrating Dasha with your Kubernetes clusters, etc., you will have access to latest statuses just by asking Dasha. 

## Get this app set up

### The premise of the app

You will find two .js files in the repository. __helloworld.js__ is a super-simple Express server. You run it locally on your machine and use a tunneling tool (I used Ngrok) to give it a web address. This is the "website" your monitoring service (I used Better Uptime) will monitor. The second __index.js__ runs a webhook listener. It also runs locally and I used Ngrok to tunnel it to a web address. I set Better Uptime up to send a webhook up to my specified address whenever the website it monitors goes down. When the webhook hits __index.js__ a Dasha conversational AI app is activated and a call goes out to the specified phone number. As the conversation (__main.dsl__) progresses, external functioты   зlau monitoring service finds the website is down, you ned to set it 


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



node index.js
n



How to use:
* install [dasha-cli](https://www.npmjs.com/package/@dasha.ai/cli) `npm i -g "@dasha.ai/cli@latest"`
* `dasha app run --sip --input name=<MessageReceiverName> phone=<phoneNumber> message="Message you want to leave"`
* `dasha app run --sip <trunkName>--input name=<MessageReceiverName> phone=<phoneNumber> message="Message you want to leave"` - do a call on a specified trunk
