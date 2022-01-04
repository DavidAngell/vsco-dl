# VSCO Downloader
An npm package for downloading media from VSCO gallery

Installation
-----
```
npm install vsco-dl
```
Requires
-----
  * request
  * cheerio
  * adm-zip

Usage
-----

### Adding To Project
``` javascript
const vscoSession = require('vsco-dl')();
```

### Download Entire Gallery
``` javascript
const username = "david"
const limit = 1000 //optional (how many photos/videos it will download)
const filePath = "./yeet/lmao" //optional (default: "./temp/[randomID]")
vscoSession.getMedia(username, limit)
	.catch(err => console.log(err))
	.then(media => media.map(e => "https://" + e)) //vsco urls are stored without the "https://", hence this
	.then(mediaURLS => vscoSession.downloadAll(mediaURLS, filePath))
```

### Download And Zip Entire Gallery
``` javascript
const username = "david"
const limit = 1000 //optional (how many photos/videos it will download)
const filePath = "./yeet/lmao" //optional (default: "./temp/[randomID]")
vscoSession.getMedia(username, limit)
	.catch(err => console.log(err))
	.then(media => media.map(e => "https://" + e)) //vsco urls are stored without the "https://", hence this
	.then(mediaURLS => vscoSession.downloadAndZipAll(mediaURLS, filePath))
```
