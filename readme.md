Node-Ooyala
===========

Small Node project for the Ooyala player

run npm install to add all dependencies

in the app.js add your secret, api and player ID's

<pre>
var secret = "SECRET HERE";
var api = "API HERE";
var player = "PLAYER HERE";
</pre>
and in the views/channel.jade file add your Content ID for your Channel
<pre>
var video = OO.Player.create('playerContainer', 'CHANNEL CONTENT ID', {

