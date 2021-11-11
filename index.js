const request = require('request');
const cheerio = require('cheerio');
const AdmZip = require("adm-zip");
const fs = require("fs");

function vscoSession() {
	const randID = (Math.random() + 1).toString(36).substring(2);
	let dir;
	let bearer;
	
	function getSiteID(username) {
		return new Promise((res, rej) => {
			const options = {
				'method': 'GET',
				'url': `https://vsco.co/${username}/gallery`,
			};

			request(options, (e, response) => {
				if (response.statusCode == "200") { 
					const $ = cheerio.load(response.body);
					bearer = String($.html()).split('"tkn":')[1].split('"')[1];
					//Site Id can be found in the url of al:ios:url
					res($('meta[property="al:ios:url"]').attr('content').split("/")[3]);
				} else {
					rej(e || response.statusCode);
				}
			});
		});
	}

	//Ex options {dir: "./temp/urmom", zip: zip}
	function mapURLsToRequests(arrURLs, options = {}) {
		dir = (options.dir !== undefined) ? options.dir : './temp/' + randID;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

		return arrURLs.map(uri => {
			return new Promise((resolve, reject) => {
				try {
					let filename = uri.split("/").slice(-1)[0];
					request(uri).pipe(fs.createWriteStream(dir + '/' + filename)).on('close', () => {
						if (options.zip) options.zip.addLocalFile(dir + '/' + filename);
						resolve();
					});
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	return {
		zipLocation: dir + `/${randID}.zip`,
		getMedia: (username, limit = 1000) => {
			return new Promise((res, rej) => {
				getSiteID(username)
					.catch(err => rej(err))
					.then(siteID => {
						const options = {
							'method': 'GET',
							'url': `https://vsco.co/api/3.0/medias/profile?site_id=${siteID}&limit=${limit}`,
							'headers': {
								'accept': ' */*',
								'authorization': " " + bearer,
								'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
							}
						};
						
						request(options, (e, response) => {
							if (response.statusCode == "200") { 
								if (e || response.statusCode != "200") throw new Error(e || response.statusCode);
								const media = [];
								JSON.parse(response.body).media.forEach(e => media.push(e.image.responsive_url));
								res(media);
							} else {
								rej(e || response.statusCode);
							}
						});
					})
			});
		},

		downloadAll: (arrayURLs, directory = undefined) => Promise.all(mapURLsToRequests(arrayURLs, { dir: directory })),
		downloadAndZipAll: (arrayURLs, directory = undefined) => {
			return new Promise((res, rej) => {
				const zip = new AdmZip();
				Promise.all(mapURLsToRequests(arrayURLs, { zip: zip, dir: directory }))
					.catch(err => rej(err))
					.then(() => {
						zip.writeZip(dir + `/${randID}.zip`);

						//Delete all dowloaded files in folder other than zip
						arrayURLs
							.map(uri => uri.split("/").slice(-1)[0])
							.forEach(filename => fs.unlinkSync(dir + '/' + filename))

						res(dir + `/${randID}.zip`);
					})
			}) 
		}
	}
}

module.exports = vscoSession;