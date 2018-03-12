const fs = require('fs')
const request = require('request-promise');
const cheerio = require('cheerio');
const work = require('./works.js')


var urls = [];
var contents = [];

request('https://www.jstatsoft.org/issue/view/v081', (err, resp, body) =>{
	let prom = Promise.resolve(false);

	//request linkleri topladığı yer.
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
	//work.js parse işlemini gerçekleştirdiği yer.
	//await kullanılabilmesi için async fonksiyon olması gerekir.
	
