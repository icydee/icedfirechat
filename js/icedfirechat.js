
jQuery.icedfirechat = function() {

  var data = {};
  var sel = jQuery('#icedfirechat');
  var sel_content;

  function debug(log, status) {
    if (console && console.log) {
      if (status) {
        console.log(log, status);
      } else {
        console.log(log);
      }
    }
  }

  function update_users() {
    var html = '';
    if (data.chat_person) {
      for (var k in data.chat_person) {
        html = html + "<p>"+data.chat_person[k].name+"</p>";
      }
    } else {
      html = "<p>No-one is currently registered!</p>";
    }
    jQuery('#icedfirechat .ifc_users').html(html);
  }

  return {
    init : function( options ) {
      data = options;
      data.fire_ref = new Firebase(data.url);
      data.fire_ref.auth(data.token, function(error) {
        if(error) {
          debug("login failed", error);
        } else {
          debug("login success");
        }
      });
      if ( !data.chat_person) {
        data.chat_person = {};
      }
      jQuery("#icedfirechat").dialog({
        dialogClass : "no-close",
        closeOnEscape : false,
        height : 300,
        width : 400,
        title : "Iced Fire Chat"
      });
      var chat_headers = 
        "<div class='ifc_headers'>"+
        "  <h3>Users</h3><div class='ifc_users'>Users status</div>"+
        "  <h3>Chat Rooms</h3><div class='ifc_chat_rooms'>Chat rooms go here</div>";
      sel.html(chat_headers);
      sel_content = jQuery('#icedfirechat .ifc_headers');
      sel_content.accordion({ active : 1, collapsible: true, heightStyle : "fill" });
      sel.on('dialogresize', function( event, ui ) {
        sel_content.accordion('refresh');
      });
      
      var fire_person_ref = data.fire_ref.child('person');
      fire_person_ref.on('child_added', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          data.chat_person['ID:'+child.id] = child;
          debug("person "+child.id+" added!");
          update_users();
        }
      });
      fire_person_ref.on('child_changed', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          data.chat_person['ID:'+child.id] = child;
          debug("person "+child.id+" changed!");
          update_users();
        }
      });
    },
    log_in : function () {
      var fire_person_ref = data.fire_ref.child('person');
      var person = {
        name        : data.user.empire_name,
        id          : data.user.empire_id,
        on_line     : 0,
        last_seen   : new Date().getTime()
      };
      fire_person_ref.child(data.user.empire_id).onDisconnect().set(person);
      person.on_line = 1;
      fire_person_ref.child(data.user.empire_id).set(person);
    },
    log_out : function () {
      var fire_person_ref = data.fire_ref.child('person/'+data.user.empire_id);
      fire_person_ref.child('on_line').set(0);
    },
    all_online_status : function () {
      if (data.chat_person) {
        for (var k in data.chat_person) {
          debug("key :"+k);
        }
      } else {
        debug('There are currently *no* people registered');
      }
    }
  };
};

