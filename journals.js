const fs = require('fs')
const request = require('request-promise');
const cheerio = require('cheerio');
const work = require('./works.js')

var urls = [];
var contents = [];

request('https://www.jstatsoft.org/issue/view/v081', (err, resp, body) =>{
	let prom = Promise.resolve(false);


	if(!err && resp.statusCode == 200) {
		var $ = cheerio.load(body); 

		$('.tocTitle a', '#content').each(function () { 
			urls.push($(this).attr('href'));
		});
		var htmls = [];
		if(urls.length > 0){
			for(let i = 0; i < urls.length; i++){
				let url = urls[i]
				htmls.push(request(url));
			}
		}

	}
	var parsed = [];
	Promise.all(htmls)
		.then(async (contents) => {
			for ( let i = 0; i < contents.length; i++) {
				let content = contents[i];
				let parse = await work(content);
				parsed.push(parse);
			}

			return Promise.all(parsed);
		})
		.then(contents => {
			for ( let i = 0; i< contents.length; i++) {
				console.log(contents[i]);
			}
		})

 }); 

