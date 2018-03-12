const express = require('express');
const app = express()
const request = require('request-promise');
const requestNormal = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

var proms = []

for (var i = 0; i < 4; i++) {
	proms.push(request('https://www.jstatsoft.org/issue/archive?issuesPage=' + (i + 1)))
}

Promise.all(proms)
	.then(bodies => {
		var urls = [];

		for (var i = 0; i < bodies.length; i++) {
			var $ = cheerio.load(bodies[i]);

			$('h4 a', '#content').each(function(err, res, body) { //each her biri için bu functionu çalıştır demek
				urls.push($(this).attr('href'));  
			});
				
		}
		return Promise.resolve(urls)
	})
	.then(function(urls) {
		var proms = []

		for(var i = 0; i < urls.length; i++){
			proms.push(request(urls[i]));
		}
			console.log(urls)
		return Promise.all(proms)
	})  
	.then(function(bodies) {
		var urls = {}
		var url

		for (var i = 0; i < bodies.length; i++) {
			var $ = cheerio.load(bodies[i]);

			$('a.file', '#content').each(function() {
				url = $(this).attr('href')
				urls[url] = url
			});
		}

		urls = Object.values(urls)

		return Promise.resolve(urls)
	})
	.then(function(urls) {
		var prom = Promise.resolve()

		for(let k = 0; k < urls.length; k++){
			let url = urls[k]
			let name = "file-"+ k +".pdf"

			prom = prom.then(() => {
				return new Promise(function(res, rej) {
					requestNormal(url)
						.on("response", function() {
							setTimeout(() => res(), 1000)
						})
						.pipe(fs.createWriteStream('pdfs/' + name))
				})
			})
		}

		return prom 
	})
	.catch(error => console.log("ERROR:", error))



