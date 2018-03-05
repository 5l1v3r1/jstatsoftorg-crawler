const fs = require('fs')
const request = require('request-promise');
const cheerio = require('cheerio');

urls = [];
 
request('https://www.jstatsoft.org/issue/view/v081', function (err, resp, body) {

				if(!err && resp.statusCode == 200) {
				var $ = cheerio.load(body); 

				$('.tocTitle a', '#content').each(function () { 
					urls.push($(this).attr('href'));

					});

				console.log(urls)	
		}	
 }); 


