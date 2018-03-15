const request = require("request-promise");
const fs = require("fs");
const cheerio = require("cheerio");
const work = require("./works.js")
const requestNormal = require("request")

var pages = [];
  for(var i = 0; i < 1; i++) {
  pages.push(request('https://www.jstatsoft.org/issue/archive?issuesPage=' + (i + 1)))
}

let download = async (url, path) => {
  console.log(new Date(), url, path)
  let a = requestNormal(url);
  a.on("response", function() {
    setTimeout(() => Promise.resolve(), 1000)
  })
  .pipe(fs.createWriteStream(path))
  .on('complete', () => Promise.resolve())
  return a
}

var issueUrls = {};
Promise.all(pages)
  .then(pages => {
    var links = [];
    //all links gathered
    for (var i = 0; i < pages.length; i++) {
       var $ = cheerio.load(pages[i])
    
       $('h4 a', '#content').each(function () {
        links.push($(this).attr('href'));
      });
       break;
    }
    return Promise.resolve(links)
  })
  .then(async links => {
    var articleContents = [];
    for(var i = 0; i < links.length; i++) {
      let parsedLinks = links[i].split('/');
      // create dir for this article
      let articleName = parsedLinks.pop();
      let content = await request(links[i]);
      articleContents.push({
        articleName,
        content,
      });
      issueUrls[articleName] = [];
      break;
    }
    return Promise.resolve(articleContents)   

  }).then(articleContents => {
    for(var i = 0; i < articleContents.length; i++) {
      var $ = cheerio.load(articleContents[i].content)
      //1095+ linkleri topladı
      $('.tocTitle a', '#content').each(function () {
        issueUrls[articleContents[i].articleName].push($(this).attr('href'));
      });
    }  
    return Promise.resolve(issueUrls)
  })
  .then(async issueUrls => {
    var contents = []
    for ( let articleName in issueUrls ) {
      let urls = issueUrls[articleName];
      for ( let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let parsedLinks = url.split('/');
        // create dir for this article
        let issueName = parsedLinks.pop();
        let content = await request(url); 
        contents.push({
          articleName,
          issueName,
          content,
        });
      }
    }
    return Promise.resolve(contents)
  })
  .then((contents) => {
    var parsed = []
    for ( let i = 0; i < contents.length; i++) {
      let parse = work(contents[i].content, contents[i].articleName, contents[i].issueName);
      parsed.push(parse);
    }

    return Promise.all(parsed);
  })
  .then((contents) => {
    let downloads = [];
    var prom = false;
    for(var i = 0; i < contents.length; i++){
      let articleName = contents[i].articleName;
      let issueName = contents[i].issueName;
      //makale dizinini oluşturur
      var articleDir = './tmp/' + articleName;

      if (!fs.existsSync(articleDir)){
        fs.mkdirSync(articleDir);
      }
      //makaleye ait bildiri dizinini oluşturur
      articleDir = './tmp/' + articleName + '/' + issueName ; //dir created 
      if (!fs.existsSync(articleDir)){
        fs.mkdirSync(articleDir);
      }
      else if (fs.existsSync(articleDir+'/meta.json')) {
        continue 
      }
      // meta.json dosyasını oluşturur.
      var file = articleDir + '/meta.json';

      fs.writeFileSync(file, JSON.stringify(contents[i], null, 4));

      //paper dosyasını indir
      var paperUrl = contents[i].paper;
      var paperUrlParts =  paperUrl.split("/");
      var fileName = paperUrlParts.pop(); //get the last element

      var filePath = articleDir + "/" + fileName; //pdf download create
      downloads.push(download(paperUrl, filePath));

      //supplements dizinini oluşturur.
      var supplementsDir = articleDir + '/supplements';

      if (!fs.existsSync(supplementsDir)){
        fs.mkdirSync(supplementsDir);
      }
      
      //files in supplements downloaded and created.
      var supplements = contents[i].Supplements;
      for(var j = 0; j < supplements.length; j++){
        var supFileUrl = supplements[j].url;   
        fileName = supplements[j].filename;
        filePath = supplementsDir + "/" +  fileName;
        setTimeout(async () => {
          let file = await download(supFileUrl, filePath)
          downloads.push(file)
        }, 5000);
      }
    }
    return Promise.all(downloads);
  })
  .catch(err=> console.log('err:', err.message))

