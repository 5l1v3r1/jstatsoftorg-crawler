const fs = require("fs");
const cheerio = require("cheerio");
var _ = require("lodash");
 
var work = async (html, articleName, issueName)=>{
	var json = {
        Url: [],
        Paper: [],
        doi:[],
		List:[],
        Supplements:[],
	}

	var $ = cheerio.load(html)  /* Html Read */
    $('#breadcrumb a.current').each((indx, elem) => {
        var Url = _.trim($(elem).attr('href'))
        json.Url.push(Url);
    });

    $('#content  a.file').each((indx, elem) => {
        var paper = ($(elem).attr('href'))
        json.Paper.push(paper);

    });

	$('#breadcrumb a').eq(1).each((indx, elem) => {
		var volYear = _.trim($(elem).text())
		json.volYear = volYear;
		
	});
	$('#breadcrumb a').eq(2).each((indx, elem) => {
	 	var issue = _.trim($(elem).text())
	 	json.issue = issue;

	})
    $('#content table.data').first().find("tr").eq(0).find("td").eq(1).each((indx, elem) => {  /* Selected Section Parse */ 
     	var Authors = _.trim($(elem).text()) /* Parse Read */
	   json.Authors = Authors;  /* Json Create */
	     	
 	}); 
    
    var downTotal = $('#content table.data').first().find("tr").eq(4).find("td").eq(1).text()  
        var re = new RegExp(/(\d)+?(?=\))/);
        downTotal = downTotal.match(re)
         json.downTotal = downTotal[0] * 1;  
            
    
    $('#content table.data').first().find("tr").eq(1).find("td").eq(1).each((indx, elem) => {  
     	var Title = _.trim($(elem).text())
	     	json.Title = Title;
	     	
	}); 
	$('#content table.data').first().find("tr").eq(2).find("td").eq(1).each((indx, elem) => {  
 		var Abstract = _.trim($(elem).text())
     	json.Abstract = Abstract;
     	
    });

		// abstract
    var AbstractInfo = $('#content table.data').first().find("tr").eq(3).text();
        var re = new RegExp(/((\d|-)+?(?=\.))/g);
        var PageViews = AbstractInfo.match(re);
        json.List.push(PageViews);
        var List = {
            PageViews: PageViews[0],
            Submitted: PageViews[1],
            Published: PageViews[2],
        };
        json.List = List; 

    $('#content table.supplementfiles').first().find('tr').each((indx, elem) =>{
        var filePart = $(elem)
        .find("td").eq(0)
     	var supplements = _.trim(filePart.text());
        supplements = supplements.split(":");

        var urlPart = $(elem)
        .find("td").eq(1)

        var urlTag = urlPart.find("a").eq(0)

        var downPart = $(elem)
        .find("td").eq(1)

        var down = _.trim(downPart.text());
        var re = new RegExp(/(\d+);\s(.+)/g);
        var downPart = down.match(re)
        downPart = downPart[0].split(";");     

        var supplements = {
            filename: supplements[0],
            description: supplements[1],
            url: urlTag.attr("href"),
            downloads: downPart[0],
            size: downPart[1],
        }	 
        
        json.Supplements.push(supplements);
    });
    $('#content table.data').first().find('tr').eq(8).find("td").eq(1).each((indx, elem) => { 
     	var code = _.trim($(elem).text()) 
     	json.doi.push(code)

    });
     $('a[id="pub-id::doi"]').each((indx, elem) => {
        var doiUrl = ($(elem).attr('href'))
        json.doi.push(doiUrl);

    });


    // create dir for this paper
    var file = './tmp/' + articleName + '/' + issueName + '/meta.json';

    fs.writeFileSync(file, JSON.stringify(json, null, 4));
    return json;
}

module.exports=work;


 