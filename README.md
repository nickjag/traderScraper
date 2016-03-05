# traderWatch
A node.js web app that tracks and displays price trends of a car.

#### About
The app takes a single search results URL from AutoTrader.com and tracks the average price and sales length of the vehicle you're interested in. 

It uses MongoDB to store the data it obtains weekly. 

#### Initial Setup

**MongoDB**

Create a database. Currently, server.js uses traderdb as the database name.

**server.js**

Modify the server.js file with your:

- MongoDB connection
- Port
- Domain
- Timezone

You can optionally modify the two schedulers if you prefer the app to collect more or less often.

The app will automatically create the db collections needed.

**settings.js**

Optionally modify the /includes/settings.js file to your needs.

### Getting Started

Once you're set up, you'll need to add data using the app.

**Copy an AutoTrader Search Results URL**

Search for a vehicle you're interested in on autotrader.com with the proper filters. Make sure the result set is less than 100 results. Copy the URL.

The app can only handle one search results URL at this time.

**Update Settings**

Paste your AutoTrader search results URL on the app's settings page and click update.

**Scrape Data**

Return to the app's index page and you can initially begin manually scraping the data or wait until the schedulers run.

**How the Scraping Works**

```/scrape``` grabs all the data from your search URL and updates the data collection.

```/process``` goes through the data collection and creates a snapshot. Running process multiple times will create multiple graph points.

It also will move any missing vehicles to the sold collection.

### Notes

A demo of the app can be viewed here on RedHat OpenShift: 

[https://nickjag-traderwatch.rhcloud.com/](https://nickjag-traderwatch.rhcloud.com/)

### Notes

**Dummy Data**

Inside the ```/views/index.handlebars``` file, you can un-comment the dummy data to view the chart as it will function once more data populates over time.

**Futher Enhancements**

Plans for the future include: 

-Add the top and bottom price points of the current snapshot, with a visual distribution of weight.
-Add the number of listings used for each snapshot.
-Add the capability for multiple search URLs.

### Author

[Nick Jagodzinski](http://nickjag.com)

### Licensing
ramenRouter is available under the MIT license.
