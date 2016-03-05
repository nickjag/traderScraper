
module.exports = {
	
	validateURL: function(url) {
		
		var validated = false;
		
		var urlRegex= new RegExp(''
			+ /(?:(?:(https?|ftp):)?\/\/)/.source     // protocol
			+ /(?:([^:\n\r]+):([^@\n\r]+)@)?/.source  // user:pass
			+ /(?:(?:www\.)?([^\/\n\r]+))/.source     // domain
			+ /(\/[^?\n\r]+)?/.source                 // request
			+ /(\?[^#\n\r]*)?/.source                 // query
			+ /(#?[^\n\r]*)?/.source                  // anchor
		);
		
		if (urlRegex.test(url)) {
			
			if (url.indexOf('cars-for-sale') > -1) {
				
				validated = true;
			}
		}
		
		return validated;
	},
	sanitizeURL: function(url) {
		
		url = url.replace(/http|\:\/\/|www\.|autotrader\.com\/|\'|\"|\;|\{|\{/gi,'');
		url = 'http://www.autotrader.com/' + url;
		
		// Start at the first record.
		
		if (!(url.indexOf('firstRecord') > -1)) {
			
			if (!(url.indexOf('?') > -1)) {
				
				url += '?firstRecord=0';
			}
			else {
				url += '&firstRecord=0';
			}
		}
		
		// Force 100 Listings per page (only using one page).
		
		if (!(url.indexOf('numRecords') > -1)) {
			
			url += '&numRecords=100';
		}
		else {
			url = url.replace(/(numRecords=)\d+/, 'numRecords=100');
		}
		
		return url;
	},
	validateTotalListings: function(totalListings) {
		
		var output = {};
		
		if (totalListings !== undefined) {
			
			if (!(isNaN(totalListings))) {
				
				if (totalListings > 0) {
					
					if (totalListings <= 100) {
						
						output.result = true;
					}
					else {
						output.result = false;
						output.message = 'Your search URL cannot have over 100 results. Please narrow your search further.';
					}
				}
				else {
					output.result = false;
					output.message = 'Your search contains 0 results.';
				}
			}
			else {
				output.result = false;
				output.message = 'We could not find valid search criteria on the URL provided.';
			}
		}
		else {
			output.result = false;
			output.message = 'We could not find valid search criteria on the URL provided.';
		}
		
		return output;
	},
	cleanNumber: function(num) {
		
		num = num.replace('$','');
		num = num.replace(',','');
		return parseInt(num);
	},
	getDaysListed: function(startDate) {
		
		var todaysDate = Math.floor(Date.now() / 1000);
		var diff = todaysDate - startDate;
		var days = diff / 86400;
		return Math.round(days);
	},
	getActiveNav: function(activePage) {
		
		var pages = {'index': '','settings': '','about': ''};
		
		if (pages.hasOwnProperty(activePage)) {
			pages[activePage] = 'active';
		}
		
		return pages;
	},
	formatMoney: function(amt) {
		
		var formattedAmt = '$' + amt.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		return formattedAmt;
	},
	formatTimestamp: function(timestamp) {
		
		var date = new Date(timestamp * 1000);
		var formattedDate = (date.getMonth() + 1) + '/' + date.getDate(); // + '/' +  date.getFullYear();
		return formattedDate;
	}
};
