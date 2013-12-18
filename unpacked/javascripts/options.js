(function() {
    /**
     * Extension Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 15000,
        'default_market': 'mtgox'
    };

    var OptionsPage = {

        init: function () {
            this.initFormOptions();
            this.bindSaveBtnEvent();
        },

        getCurrentVals: function () {
            var currentVals = {};
            for (var key in defaultVals) {
                currentVals[key] = localStorage[key] || defaultVals[key];
            }
            return currentVals;
        },

        /**
         * Set Values to Form Elements.
         * @return {void} 
         */
        initFormOptions: function () {
            var formVals = this.getCurrentVals();

            for (var key in formVals) {

                var elemInput = $('input[name="' + key + '"]'),
                    elemVal = formVals[key];

                // only got two types of input here, text, radio, maybe more.
                // only dealing with input[type="radio"] here, ignorance of select, checkbox...
                if (elemInput.length > 1) {
                    for (var i = elemInput.length - 1; i >= 0; i--) {
                        var childInput = elemInput[i];
                        if (childInput.value != elemVal) {
                            childInput.removeAttribute('checked');   
                        } else {
                            childInput.checked = 'checked';
                        }
                    }
                } else {
                    elemInput.val(elemVal);
                }
            }
        },

        bindSaveBtnEvent: function () {
            var btnSaveOptions = $('#btnSaveOptions'),
                self = this;

            btnSaveOptions.click(function () {
                self.validateFormOptionsData() && self.handleFormOptionsSubmit();
                alert('Options Saved!');
                return false;
            });
        },

        validateFormOptionsData: function () {
            // validate form data, later on.
            return true;
        },

        handleFormOptionsSubmit: function () {
            var elemForm = $('#formOptions'),
                formData = elemForm.serializeArray();

            for (var i = formData.length - 1; i >= 0; i--) {
                localStorage[formData[i].name] = formData[i].value;
            };
        }
    };

    return OptionsPage;

})().init();
