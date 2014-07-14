(function() {
    /**
     * Extension Config && Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 15000,
        'default_market': 'cryptsy'
    };

    var markets = {
        'cryptsy': {
            url: 'http://json2jsonp.com/?url=http://pubapi.cryptsy.com/api.php?method=singlemarketdata%26marketid=169&callback=cbfunc',
            key: 'return.markets.RDD.lasttradeprice'
        },
        'poloniex': {
            url: 'http://json2jsonp.com/?url=https://poloniex.com/public?command=returnTicker&callback=cbfunc',
            key: 'BTC_REDD.last'
        },
        'mintpal': {
            url: 'http://json2jsonp.com/?url=https://api.mintpal.com/v1/market/stats/RDD/BTC&callback=cbfunc',
            key: 'last_price'
        },
        'bittrex': {
            url: 'http://json2jsonp.com/?url=https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-rdd&callback=cbfunc',
            key: 'Last'
        }
    };

    var config = {};

    var SBT = {

        init: function () {
            this.resetCurrentVals();
            this.startRequesting();
            this.bindEvents();
        },

        resetCurrentVals: function () {
            for (var key in defaultVals) {
                config[key] = localStorage[key] || defaultVals[key];
            }
        },

        bindEvents: function() {
            var self = this;
            chrome.browserAction.onClicked.addListener(function() {
                self.restartRequesting();
            });
        },

        handleSingleRequestResult: function (raw) {
            try {
                var jsonString = '';
                jsonString = this.handleJSONP(raw);

                var res = JSON.parse(jsonString);
                
                this.updateLatestInfo(this.getPriceInfo(res));   
            } catch (e) {
                // exception
            }
        },

        handleJSONP: function (raw) {
            if(config.default_market == 'mintpal') {
            return raw.substring(8, raw.length - 2);
            }
            else if(config.default_market == 'bittrex') {
            return raw.substring(46, raw.length - 3);
            }
            return raw.substring(7, raw.length - 1);
        },

        restartRequesting: function () {
            var self = this;
            window.clearInterval(self.globalIntervalId);
            this.startRequesting();
        },

        ReadyStateChange: function (obj, funcScope, funcName) { 
            return function () { 
                if (obj.readyState == 4 && obj.status == 200) { 
                    funcScope[funcName](obj.responseText); 
                }
            };
        },

        startRequesting: function () {
            var self = this;
            this.handleSingleRequest();
            this.globalIntervalId = window.setInterval(function () {
                self.handleSingleRequest();
                self.resetCurrentVals();
            }, config.refresh_time);
        },

        handleSingleRequest: function () {
            var req = new XMLHttpRequest(),
                url = markets[config.default_market].url;
            req.open("GET", url, true);
            req.onreadystatechange = this.ReadyStateChange(req, this, 'handleSingleRequestResult');
            req.send(null);
        },

        getPriceInfo: function (res) {
            var price = this.getDescendantProp(res, markets[config.default_market].key);
            price = (!price || isNaN(price)) ? 
                    0 : parseFloat(Math.round(price * 100000000));
            return price;
        },

        getDescendantProp: function (res, desc) {
            var arr = desc.split(".");
            while(arr.length && (res = res[arr.shift()]));
            return res;
        },

        updateLatestInfo: function (price) {
            this.updateBadge(price);
        },

        updateBadge: function (price) {
            chrome.browserAction.setBadgeText({
                text: '' + price
            });
        }
    };

    return SBT;

})().init();
