const { exec } = require('child_process');
const glob = require('glob-promise');
const cheerio = require('cheerio');

var list = [] 

glob('../../Masaüstü/achild/*.pdf') //this one pdfs
	.then(function(list){    
		for(var i =0; i < list.length; i++)
			
		{
			const run = exec('pdf2htmlEX  ' + list[i] , {cwd: '../../Masaüstü/pdf-record'} ) // html save place
			console.log(list[i])
		}

	});

