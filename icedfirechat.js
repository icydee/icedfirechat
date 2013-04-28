
jQuery.icedfirechat = function() {

  var data = {};

  return {
    init : function( options ) {
      data = options;
    },
    authenticate : function() {
      alert('authenticate with token ' + data.token);
    }
  };
};

