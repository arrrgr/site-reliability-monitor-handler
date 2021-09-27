context 
{
    input phone: string;
    input name: string;
    
}

// declare external functions here 
external function acknowledge(): string;
external function resolve(): string;
external function getstatusof( what:string? ): string;

start node root
{
    do
    {
        #connectSafe($phone);
        wait *;
    }
    transitions
    {
        hello: goto hello on true;        
    }
}

node hello
{
    do
    {
        #sayText("Hello " + $name + "! This is Dasha calling you regarding your website. There has been an incident. "); 
        #sayText("You can acknowledge or resolve the incident right on the call with me. "); 
        #sayText(" Please note, I will listen and take notes until you mention that you are ready to resolve or acknowledge. ", interruptible:true);
        wait *;
    }
    transitions
    {
    }
}

digression acknowledge
{
    conditions { on #messageHasIntent("acknowledge"); }
    do
    {
        #sayText("Can you please confirm that you want me to acknowledge the incident?");
        wait *;
    } 
    transitions 
    {
        acknowledge: goto acknowledge_2 on #messageHasIntent("yes");
        donotacknowledge: goto waiting on #messageHasIntent("no");
    }
}

node acknowledge_2 //make digression
{
    do
    {
        external acknowledge();
        #sayText("Got it. I have set the status in Better Uptime as acknowledged. The next step is to resolve the incident.");
        #sayText("Would you like me to notify other team members that there is an incident which may affect them? ");
        wait *;
    } 
    transitions
    {
        yes: goto notify on #messageHasIntent("yes");
        no: goto waiting on #messageHasIntent("no");
    }
}

node notify
{
    do
    {
        #sayText("Okay. Team members notified. I will wait for you to let me know when incident is resolved. ");
        wait *;
    }
}

digression resolve
{
    conditions { on #messageHasIntent("resolve"); }
    do
    {
        #sayText("Can you please confirm that you want me to resolve the incident?");
        wait *;
    } 
    transitions 
    {
        resolve: goto resolve_2 on #messageHasIntent("yes");
        donotresolve: goto waiting on #messageHasIntent("no");

    }
}

node resolve_2 
{
    do
    {
        external resolve();
        #sayText("Well done " + $name + "! I have set the status in Better Uptime as resolved. Thank you and take care. Good bye. ");
        exit;
    } 
}

digression ignore
{
    conditions { on #messageHasIntent("ignore"); }
    do
    {
        #sayText("Can you please confirm that you want me to ignore the incident?");
        wait *;
    } 
    transitions 
    {
        ignore: goto ignore_2 on #messageHasIntent("yes");
        donotignore: goto waiting on #messageHasIntent("no");
    }
}

node ignore_2
{
    do
    {
        #sayText("Okay. I will ignore the incident . This one is on you " + $name +". Good bye and good luck! ");
        exit;
    } 
}

node waiting
{
    do
    {
        #sayText("Okay. I will wait for your instructions then. ");
        wait *;
    } 
}

digression journal 
{
    conditions { on true priority -1; }
    do
    {
        return;
    }
}

digression status // get status of vital services 
{
    conditions { on #messageHasIntent("status") && #messageHasData( "statusentity" ); }
    do
    {
        for (var e in #messageGetData("statusentity") )
        { 
            var result = external getstatusof(e.value );
            #sayText( result );
        }
        return;
    }
}

digression @wait
{
    conditions { on #messageHasAnyIntent(digression.@wait.triggers)  priority 900; }
    var triggers = ["wait", "wait_for_another_person"];
    var responses: Phrases[] = ["i_will_wait"];
    do
    {
        for (var item in digression.@wait.responses)
        {
            #say(item, repeatMode: "ignore");
        }
        #waitingMode(duration: 70000);
        return;
    }
    transitions
    {
    }
}

digression repeat
{
    conditions { on #messageHasIntent("repeat"); }
    do
    {
        #repeat();
        return;
    }
} 

digression oops
{
    conditions { on #messageHasIntent("oops"); }
    do
    {
        #sayText("What happened " + $name + "? Did you ue the wrong terminal again?");
        return;
    }
} 
