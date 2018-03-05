const fs = require("fs");
const cheerio = require("cheerio");
 
var work = async (html)=>{
	var json = {
		Downloads:[],
		List:[],
	}

	var $ = cheerio.load(html)  /* Html Read */
	
	$('#content a.action').each((indx, elem) => {
    	var Download = ($(elem).attr('href'))
    	json.Downloads.push(Download);
    	
	});
	$('#breadcrumb a.current').each((indx, elem) => {
		var Url = ($(elem).attr('href'))
		json.Url = Url;

	});
	$('#breadcrumb a').eq(1).each((indx, elem) => {
		var volYear = ($(elem).text())
		json.volYear = volYear;
		
	});
	$('#breadcrumb a').eq(2).each((indx, elem) => {
	 	var issue = ($(elem).text())
	 	json.issue = issue;

	})
    $('#content table.data').first().find("tr").eq(0).find("td").eq(1).each((indx, elem) => {  /* Selected Section Parse */ 
     	var Authors = ($(elem).text()) /* Parse Read */
	     	json.Authors = Authors;  /* Json Create */
	     	
 	}); 
    $('#content table.data').first().find("tr").eq(1).find("td").eq(1).each((indx, elem) => {  
     	var Title = ($(elem).text())
	     	json.Title = Title;
	     	
	}); 
	$('#content table.data').first().find("tr").eq(2).find("td").eq(1).each((indx, elem) => {  
 		var Abstract = ($(elem).text())
     	json.Abstract = Abstract;
     	
    });

		// abstract
    $('#content table.data').find("b").eq(1).each((indx, elem) => {
     	var PageViews = ($(elem).text())
     	json.List.push(PageViews);

    });
    $('#content table.data').find("b").eq(2).each((indx, elem) => {
     	var Submitted = ($(elem).text())
     	json.List.push(Submitted);

    });
    $('#content table.data').find("b").eq(3).each((indx, elem) => {
     	var Published = ($(elem).text())
     	json.List.push(Published);

    });

	// file
    $('#content  a.file').each((indx, elem) => {
     	var Pdf_url = ($(elem).attr('href'))
     	json.Pdf_url = Pdf_url;

    });
    $('#content table.data').first().find('tr').eq(5).find("td").eq(1).each((indx, elem) => {
     	var Supplements = ($(elem).text())
     	json.Supplements= Supplements;
			
    }); 
    $('#content table.data').first().find('tr').eq(8).find("td").eq(1).each((indx, elem) => { 
     	var DOI = ($(elem).text()) 
     	json.DOI = DOI; 
    });
    return json;
}

module.exports=work;
