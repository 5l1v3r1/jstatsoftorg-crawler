const fs = require("fs");
const request = require("request-promise");
const cheerio = require("cheerio");
 
var json = {
	Downloads:[],
	List:[],

}

request('https://www.jstatsoft.org/index.php/jss/article/view/v081i01', function (err, resp, html) {

	if(!err && resp.statusCode == 200) { /* Error Detected */
		var $ = cheerio.load(html)  /* Html Read */
		console.log(html)
		$('#content a.action').each(function () {
	    	var Download = ($(this).attr('href'))
	    	json.Downloads.push(Download);
	    	
	    	});
		 $('#breadcrumb a.current').each(function () {
			var Url = ($(this).attr('href'))
			json.Url = Url;

			 });
		 $('#breadcrumb a').eq(1).each(function () {
			var volYear = ($(this).text())
			json.volYear = volYear;
			
			 });
		 $('#breadcrumb a').eq(2).each(function () {
		 	var issue = ($(this).text())
		 	json.issue = issue;

		     })
	     $('#content table.data').first().find("tr").eq(0).find("td").eq(1).each(function () {  /* Selected Section Parse */ 
	     	var Authors = ($(this).text()) /* Parse Read */
		     	json.Authors = Authors;  /* Json Create */
		     	
		     }); 
	     $('#content table.data').first().find("tr").eq(1).find("td").eq(1).each(function () {  
	     	var Title = ($(this).text())
		     	json.Title = Title;
		     	
		     }); 
		 $('#content table.data').first().find("tr").eq(2).find("td").eq(1).each(function () {  
		     	var Abstract = ($(this).text())
			     	json.Abstract = Abstract;
			     	
			     	 }); 
			     $('#content table.data').find("b").eq(1).each(function () {
			     	var PageViews = ($(this).text())
			     	json.List.push(PageViews);

			     	});
			     $('#content table.data').find("b").eq(2).each(function () {
			     	var Submitted = ($(this).text())
			     	json.List.push(Submitted);

			     	});
			     $('#content table.data').find("b").eq(3).each(function () {
			     	var Published = ($(this).text())
			     	json.List.push(Published);

			     	});
	     $('#content  a.file').each(function () {
	     	var Pdf_url = ($(this).attr('href'))
	     	json.Pdf_url = Pdf_url;

	     	});
	     $('#content table.data').first().find('tr').eq(5).find("td").eq(1).each(function () {
	     	var Supplements = ($(this).text())
	     	json.Supplements= Supplements;
				
	     	}); 
	     $('#content table.data').first().find('tr').eq(8).find("td").eq(1).each(function () { 
	     	var DOI = ($(this).text()) 
	     	json.DOI = DOI; 

	     	console.log(json)
	     		
	     });  
	}
});  
