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
  if (keywordArr.length == 1 && !keywordArr[0]) {
    queryURL += "&q=all";
  } else {
    // Add given keywords one by one into the queryURL
    for (const element of keywordArr) {
      let elem = element.replace(" ", "+");
      queryURL += "&q=" + elem;
    }
  }

  // Add type to the API_URL
  var contentType = req.body.type;
  if (contentType) {
    queryURL += "&type_of_material=" + contentType;
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
    const range = Math.min(10, resultArr.length)
    res.render("index.ejs", { filteredData: resultArr.slice(0, range) });

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
