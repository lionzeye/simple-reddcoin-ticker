(function() {
    /**
     * Extension Config && Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 15000,
        'default_market': 'mtgox'
    };

    var markets = {
        'mtgox': {
            url: 'https://data.mtgox.com/api/2/BTCUSD/money/ticker',
            key: 'data.last_local.value'
        },
        'bitstamp': {
            url: 'https://www.bitstamp.net/api/ticker/',
            key: 'last'
        },
        'btcchina': {
            url: 'https://data.btcchina.com/data/ticker',
            key: 'ticker.last'
        },
        'okcoin': {
            url: 'https://www.okcoin.com/api/ticker.do',
            key: 'ticker.last'
        },
        'chbtc': {
            url: 'http://api.chbtc.com/data/ticker',
            key: 'ticker.last'
        },
        'fxbtc': {
            url: 'https://data.fxbtc.com/api?op=query_ticker&symbol=btc_cny',
            key: 'ticker.last_rate'
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
                var res = JSON.parse(raw);
                this.updateLatestInfo(this.getPriceInfo(res));
            } catch (e) {
                // exception
            }
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
            }
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
            price = (!price || isNaN(price)) 
                  ? 0
                  : new Number(price).toFixed(0);
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
                text: price
            });
        }
    };

    return SBT;

})().init();
