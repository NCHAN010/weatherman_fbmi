'use strict';
const express = require('express')
const bodyParser=require('body-parser')
const request =require('request')

const app=express()
/* https://weatherman-bot-fbmi54355.herokuapp.com/ deployed to Heroku
remote: 
remote: Verifying deploy... done.
To https://git.heroku.com/weatherman-bot-fbmi54355.git*/
//set your weatherman fb page access token
const token='EAAoqVcUVHRkBALpcBgasWwccRqQSFtB2EVbEvXP3fO3PIE10TPxnymZAtXuWRmmAZALQJRfNbBN7UGWIs6Lak4Dd7jA7QFWtEd7IC4RLHhcFSnqKWrmhRi3m8OWZCNcZC18PZCuWqpdZCV1fZCNYApk1VZCfjb46Y6eqddPGeOcsBiNMatCOZC6xqcepGS83kbjIXq75GXtQWwQQEKFQCuk6ZA8ZAHV4wT0JZCeU8pRNSsPziwZDZD';
const botServerUrl='https://weatherman-bot509.herokuapp.com/bot';

app.set('port',(process.env.PORT || 5000))

//Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}))

//Process application/json
app.use(bodyParser.json())

app.use(express.static('public'))

//Index route
app.get('/',function(req,res)
{
    res.send('Hello World, I am Weatherman !.')
})

//Spin up the server
app.listen(app.get('port'),function()
{
    console.log('running on port',app.get('port'))
})

app.get('/webhook/', function(req,res)
{
    console.log(JSON.stringify(req.body));
    let messaging_events = req.body.entry[0].messaging
    for (let i=0;i<messaging_events.length;i++)
    {
        let event=req.body.entry[0].messaging[i]
        let spender=event.sender.id
        let recipient=event.recipient.id
        let time=req.body.entry[0].time


        //we call the chatbot here
        if(event.message && event.message.text)
        {
            let text=event.message.text
            //send it to the bot
            request(
                {
                    url: botServerUrl,
                    method:'POST',
                    form:
                    {
                        'userUtterance':text
                    }

                }
                ,function(error, response,body)
                {
                    //response is from the bot
                    if(! eeror & response.statusCode==200)
                    {
                        //Print out the response body
                        body= body.substring(1,body.length-1);
                        body= body.replace(/\\/g,'')
                        let botOut=JSON.parse(body)
                        if(botOut.botUtterance!=null)
                        {
                            sendTextMessage(sender,botOut.botUtterance)
                        }
                        else
                        {
                            sendTextMessage(sender,'Error!')
                        }
                    }
                }

                
                
            );
        }
    }
    res.sendStatus(200)
})

function sendTextMessage(sender,text)
{
    if(text !='null')
    {
        let messageData= {'text':text}
        request(
            {
                url:'https://graph.facebook.com/v2.6/me/messages',
                qs:(access_token:token),
                method:'POST',
                json:
                {
                    recipient:{id:sender},
                    message:messageData,
                }
                

            }
            ,function(error,response,body)
            {
                if(error)
                {
                    console.log('Error sending messages : ',error)
                }
                else if (response.body.error)
                {
                    console.log('Error: ', response.body.error)
                }
            }
        )
    }
}