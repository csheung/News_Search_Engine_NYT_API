import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://api.nytimes.com/svc/search/v2/";
const API_KEY = "hehaaxuZVXDZItzhfG1BiFL5OIYe96TZ";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`https://api.nytimes.com/svc/mostpopular/v2/shared/1/facebook.json?api-key=${API_KEY}`);
    const resultArr = response.data.results;
    
    const range = Math.min(10, resultArr.length);
    res.render("index.ejs", { mostSharedData: resultArr.slice(0, range) });

  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.post("/", async (req, res) => {
  // Retrieve Keywords given
  var keywordArr = req.body.keywords.toLowerCase().split(',');
  var queryURL = API_URL + "articlesearch.json?" + "api-key=" + API_KEY;
  console.log(queryURL);
  console.log(keywordArr);
  
  // Handle query elements one by one
  if (!(keywordArr.length == 1 && !keywordArr[0])) {
    // Add given keywords one by one into the queryURL
    for (const element of keywordArr) {
      let elem = element.replace(" ", "+");
      queryURL += "&q=" + elem;
    }
  }
  
  // Retrieve Start and End Dates given if "Yes/hasDate" is selected
  var hasDate = req.body.date;
  // console.log(hasDate);
  if (hasDate === "hasDate") {
    var startDate = req.body.startDate.replaceAll("-", "");
    var endDate = req.body.endDate.replaceAll("-", "");
    if (startDate && endDate) {
      queryURL += "&begin_date=" + startDate + "&end_date=" + endDate;
    }
  }
  console.log(queryURL);

  try {
    const response = await axios.get(queryURL);
    // console.log(response.data.response.docs);
    const resultArr = response.data.response.docs;

    // Extract specific content type from the data
    const extractedResultArr = [];
    if (req.body.type) {
      resultArr.forEach(element => {
        if (element.type_of_material === req.body.type) {
          extractedResultArr.push(element);
        }
      });
    }

    // Get the view range and render ejs file
    const range = Math.min(10, extractedResultArr.length)
    res.render("index.ejs", { filteredData: extractedResultArr.slice(0, range) });

  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

// Port listening
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

/**
 * ArticleSearch API Links from New York Times
 * https://developer.nytimes.com/docs/articlesearch-product/1/overview
 * https://developer.nytimes.com/docs/articlesearch-product/1/routes/articlesearch.json/get
 * 
 * Most Popular including the link for Most Shared on Facebook
 * https://developer.nytimes.com/docs/most-popular-product/1/overview
 * 
 */