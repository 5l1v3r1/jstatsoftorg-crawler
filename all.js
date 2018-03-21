const requestPromise     = require("request-promise");
const fs                 = require("fs");
const path               = require("path")
const cheerio            = require("cheerio")
const rimraf             = require("rimraf-promise")
const work               = require("./works.js")
const requestNormal      = require("request")

const DOWNLOAD_DIRECTORY = path.resolve("./files")
const CACHE_FILE         = path.resolve("./cache.json")

const REQUEST_INTERVAL   = 200  // in milliseconds
const TOTAL_ISSUE_PAGES  = 1    // set to 4 for all
const TOTAL_VOLUMES      = 1    // set to null for all
const TOTAL_ARTICLES     = 10   // set to null for all

// Required by function request()
var old = Promise.resolve()

// Empty download directory
var proc = rimraf(DOWNLOAD_DIRECTORY)
  .then(result => fs.mkdirSync(DOWNLOAD_DIRECTORY))

// Check if cache exists. If not, create the cache file.
if ( ! fs.existsSync(CACHE_FILE) ) {
  proc = proc

    // Get all the volumes
    .then(() => {
      var pages = [];

      console.log(`Started to fetch volume urls in ${TOTAL_ISSUE_PAGES} pages`)

      for(var i = 0; i < TOTAL_ISSUE_PAGES; i++) {
        pages.push(request('https://www.jstatsoft.org/issue/archive?issuesPage=' + (i + 1)))
      }

      return Promise.all(pages)
    })

    // Fetch all volume urls
    .then(pages => {
      var links = [], $

      for (var i = 0; i < pages.length; i++) {
        $ = cheerio.load(pages[i])
      
        $('h4 a', '#content').each(function () {
          links.push($(this).attr('href'));
        });
      }

      return Promise.resolve(links)
    })


    // Fetch all volume pages
    .then(async links => {
      var volumes = []
      var total = TOTAL_VOLUMES || links.length

      console.log(`Started to fetch article urls in ${total} volumes`)

      for (var i = 0; i < total; i++) {
        let name = links[i].split('/').pop();
        let content = await request(links[i]);

        // Create and store volume object
        volumes.push({
          name,
          content,
          articles: [],
        });
      }

      return Promise.resolve(volumes)   
    })

    // Fetch all article urls
    .then(volumes => {
      var $, volume, total

      for(let i = 0; i < volumes.length; i++) {
        total = 0

        volume = volumes[i]
        $ = cheerio.load(volumes[i].content)

        // Gather all article urls (approximately 1095+ in all volumes)
        $('.tocTitle a', '#content').each(function() {
          if ( ! TOTAL_ARTICLES || total++ < TOTAL_ARTICLES) {
            volume.articles.push( $(this).attr('href') );
          }
        });

        // Remove unnecessary stuff
        delete volume.content
      }

      return Promise.resolve(volumes)
    })

    // Fetch all article pages
    .then(async volumes => {
      console.log(`Started to fetch articles`)

      for (let i = 0; i < volumes.length; i++) {
        console.log(`  for volume "${volumes[i].name}"`)

        // We can't use .map() here because we are already in an async
        // function and if we create another one await will be assigned
        // to that new async function
        for (let j = 0; j < volumes[i].articles.length; j++) {
          let url = volumes[i].articles[j]
          let name = url.split('/').pop()
          let content = await request(url)
          let data = await work(content)

          volumes[i].articles[j] = { url, name, ...data, volume: volumes[i].name }

          console.log(`    article "${name}" has fetched`)
        }
      }

      fs.writeFileSync(CACHE_FILE, JSON.stringify(volumes))
      console.log("Cache file is created\n")

      return Promise.resolve(volumes)
    })
}


// Continue to create files after cache file is created.
proc

  // Read the cache
  .then(() => Promise.resolve(JSON.parse(fs.readFileSync(CACHE_FILE))))

  // Download all necessary files of the articles
  // and save the created json
  .then(async volumes => {
    console.log("Started to download files and create meta datas")

    for (let i = 0; i < volumes.length; i++) {
      let volume = volumes[i]
      let volDir = DOWNLOAD_DIRECTORY + "/" + volume.name

      console.log(`  for volume "${volume.name}"`)

      // Create volume directory
      fs.mkdirSync(volDir)

      for (let j = 0; j < volume.articles.length; j++) {
        let article = volume.articles[j]
        let dir = volDir + "/" + article.name

        console.log(`    for article "${article.name}"`)

        // Create article directory
        fs.mkdirSync(dir)

        // Create supplements directory for this article
        fs.mkdirSync(dir + "/supplements")

        // Create json file
        fs.writeFileSync(dir + "/meta.json", JSON.stringify(article, null, 4))
        console.log("      meta.json created")

        // Download the actual paper (pdf of the article)
        if (article.paper) {
          await download(article.paper, dir + "/" + article.paper.split("/").pop())
          console.log("      paper downloaded")
        }

        // Download data files, example codes etc... (supplements)
        if (article.supplements.length) {
          for (let k = 0; k < article.supplements.length; k++) {
            let supplement = article.supplements[k]
            await download(supplement.url, dir + "/supplements/" + supplement.filename)
          }

          console.log(`      ${article.supplements.length} supplement file downloaded`)
        }
      }
    }
  })

  .catch(err=> console.log('err:', err.message))


/**
 * Downloads the file from the given url, saves it
 * to given path. Sets a timeout to resolve the promise.
 * @param  {String}  url  URL to download
 * @param  {String}  path Path to save
 * @return {Promise}
 */
function download(url, path) {
  return new Promise((res, rej) => {
    requestNormal(url)
      .on("response", () => setTimeout(() => res(path), REQUEST_INTERVAL))
      .on("error", err => setTimeout(() => rej(err), REQUEST_INTERVAL))
      .pipe(fs.createWriteStream(path))
  })
}

/**
 * Makes a request with "request-promise" package.
 * Queues the requests and sets a timeout for each.
 * @param  {String}  url URL to make the request
 * @return {Promise}
 */
function request(url) {
  var newProm = new Promise((res, rej) => {
    old.then(() => {
      reqProm = requestPromise(url)

      setTimeout(
        () => {
          reqProm.then((...args) => res(...args))
            // Uncomment for debug:
            // .then(() => console.log(url))
            .catch((...args) => rej(...args))
        },
        REQUEST_INTERVAL
      )
    })
  })

  return old = newProm
}
