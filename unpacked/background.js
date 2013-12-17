(function() {

    /**
     * Extension Config 
     * @type {Object}
     */
    var config = {
        'refresh_time': 15000,
        'markets': {
            'btcchina': 'https://data.btcchina.com/data/ticker',
            'mtgox': 'https://data.mtgox.com/api/2/BTCUSD/money/ticker'
        }
    };

    var SBT = {

        // globalIntervalId: null,

        init: function () {
            this.startRequesting();
            this.bindEvents();
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
                this.updateLatestInfo(res);
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
            }, config.refresh_time);
        },

        handleSingleRequest: function () {
            var req = new XMLHttpRequest(),
                url = config.markets.btcchina;
            
            req.open("GET", url, true);
            req.onreadystatechange = this.ReadyStateChange(req, this, 'handleSingleRequestResult');
            req.send(null);
        },

        updateLatestInfo: function (res) {
            var price = 0;

            if (!isNaN(parseInt(res.ticker.last))) {
                price = res.ticker.last;
            }

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
