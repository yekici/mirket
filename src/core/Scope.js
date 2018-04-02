// require:core.Tree

var Scope;
(function () {

    Scope = mi.Scope = mi.class('Scope' , function () {
        this.variables = {};
    } , {

        exists: function (variable) {
            return !!this.variables[variable.name];
        },

        get: function (variable) {
            return this.variables[variable.name];
        },

        set: function (variable , value) {
            this.variables[variable.name] = value;
        }

    });

})();