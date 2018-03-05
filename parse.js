const express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');
const glob = require('glob-promise');

var list = []
var blocks = []
var block


glob('../../Masaüstü/achild/file-3.html')
	.then(function(list){  // html file
			
			for(var i = 0; i < list.length; i++)
		{
			
			var read = fs.readFileSync(list[i], "utf8");
			var $ = cheerio.load(read);
					
				$(".ws0").each(function() {
				  if ($(this).is(".ffb")) {

				    // If there is no block, we've just started to a new code block
				    if ( ! block ) {
				      block = { code: "", result: "" }
				    }

				    // Append the code into this block
				    block.code += $(this).text() + "\n"
				  }

				  else if ($(this).is(".ffc")) {
				    if (block) {
				      // Append the result into this block
				      block.result += $(this).text() + "\n"
				    }
				  }

				  else {
				    if (block) {
				      blocks.push(block)
				      block = null
				    }
				  }
				})

				if (block) {
				  blocks.push(block)
				  block = null
				}

			}		
				console.log(blocks)
	});



