const host = "https://cdn.owowhatsthis.xyz"

const express = require('express');
const fileUpload = require("express-fileupload")
const app = express();
var path = require('path')
const fs = require("fs");
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook("https://discord.com/api/webhooks/879812965723934781/0Nxo5vZBEte062CdLYHlGQC-hXK3bGoTHZlJlOTLJiD7kmULOfuNVLYVxCZS-Dl8BgB7");

app.use(fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 },
}));
// app.use(express.static('Storage'))

app.get('/', (req,res)=>{
    res.redirect("https://owowhatsthis.xyz/")
})

app.post('/', (req,res)=>{
    var file = req.files.sharexfile;
    var fileName = file.name;
    var ext = path.extname(fileName);
    var auth_key = req.headers["auth_key"] || "none";
    var hide_ip = req.headers["hide_ip"] || "none";
    var prefix = req.headers["prefix"] || "";
    var suffix = req.headers["suffix"] || "";
    

    if(VerifyKey(auth_key))
    {
        // Keys match, let user proceed
        var rngName = `${prefix}${rnd(10)}${suffix}${ext}`;
        file.mv(`${__dirname}/Storage/${rngName}`)
        res.send(`${host}/${rngName}`)

        var title = req.headers["title"] || `${host}/${rngName}`;
        var color = req.headers["color"] || `#FF8DE7`;
        

        var UserJS = JSON.parse(fs.readFileSync(`./database/${auth_key}.json`, {encoding:"ascii"}))
        var Username = UserJS["Name"];
        var DiscordID = UserJS["DiscordID"];

        var imageData = new Object();
        imageData["Uploader"] = Username;
        imageData["Title"] = title
        imageData["Color"] = color
        fs.writeFile(`${__dirname}/Storage/${rngName}.json`, JSON.stringify(imageData), function callback(err){})

        const embed = new MessageBuilder()
        embed.setFooter(`${host}/${rngName}`)
        embed.setTimestamp();
        embed.setColor("#F4ABBA");
        if(hide_ip === "yiff me pwease~")
        {
            embed.setDescription(`Name: **${Username}**\nIP: **[REDACTED]**\nDiscord ID: **${DiscordID}**`)
        }
        else
        {
            embed.setDescription(`Name: **${Username}**\nIP: **${req.ip}**\nDiscord ID: **${DiscordID}**`)
        }
        embed.setImage(`${host}/${rngName}`);
        hook.send(embed);
    }
    else
    {
        res.status(403).send('You are not authorized!')
    }
})

app.get('/:imgId', (req,res)=>{
    var imgId = req.params.imgId;
    var UserAgent = req.headers["user-agent"].toString();
    try
    {
        if(UserAgent.includes("discordapp"))
        {
            var IJS = JSON.parse(fs.readFileSync(`./Storage/${imgId}.json`, {encoding:"ascii"}))
            res.send(`<meta property="og:title" content="${IJS["Title"]}"/>
            <meta property="og:image" content="${host}/Storage/${imgId}"/>
            <meta name="twitter:card" content="summary_large_image">
            <meta property="og:description" content="Uploaded by ${IJS["Uploader"]}"/>
            <meta name="theme-color" content="${IJS["Color"]}">`)
        }
        else
        {
            res.sendFile(`${__dirname}/Storage/${imgId}`)
        }
    }
    catch{
        // stfu favico
    }
})
app.get('/Storage/:img', (req,res)=>{
    res.sendFile(`${__dirname}/Storage/${req.params.img}`)
})
//start app 
const port = process.env.PORT || 3621;

app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);

function VerifyKey(key)
{
    try
    {
        var data = fs.readFileSync(`./database/${key}.json`, {encoding:"ascii"});
        var JS = JSON.parse(data);

        if(JS["Whitelisted"] === true)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    catch
    {
        return false
    }
}

function rnd(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}