Simple notification application

How to use:
* install [dasha-cli](https://www.npmjs.com/package/@dasha.ai/cli) `npm i -g "@dasha.ai/cli@latest"`
* `dasha app run --sip --input name=<MessageReceiverName> phone=<phoneNumber> message="Message you want to leave"`
* `dasha app run --sip <trunkName>--input name=<MessageReceiverName> phone=<phoneNumber> message="Message you want to leave"` - do a call on a specified trunk