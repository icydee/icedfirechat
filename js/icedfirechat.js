
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
    jQuery('#icedfirechat #ifc_users').jqGrid({
      datatype : 'clientSide',
      colNames : ['id', 'name','Alliance'],
      colModel : [
        {name : 'id', index : 'id', width: 55, sorttype: 'int'},
        {name : 'name', index : 'name', width: 100},
        {name : 'alliance', index : 'alliance', width: 200}
      ],
      caption : 'List of all Users'
    });
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
        height : 600,
        width : 500,
        title : "Iced Fire Chat"
      });
      var chat_div =
        "<div class='ifc_main'>"+
        "  <table id='ifc_users'></table><div id='ifc_users_pager'></div>"+
        "  <table id='ifc_rooms'></table><div id='ifc_rooms_pager'></div>"+
        "</div>";
      jQuery('#icedfirechat').html(chat_div);



      // 
      // Create and manage list of all users
      //
      jQuery('#ifc_users').jqGrid({
        datatype : 'clientSide',
        colNames : ['name','Alliance','On Line','Last Seen'],
        colModel : [
          {name : 'name', index : 'name', width: 100},
          {name : 'alliance', index : 'alliance', width: 200},
          {name : 'on_line', index : 'on_line', width: 100},
          {name : 'last_seen', index : 'last_seen', width: 200},
        ],
        caption : 'People',
        pager : '#ifc_users_pager',
        rowNum : 5,
        viewrecords : true
      });
      jQuery('#ifc_users').jqGrid('navGrid','#ifc_users_pager',{del:false,add:false,edit:false});

      var fire_person_ref = data.fire_ref.child('person');
      fire_person_ref.on('child_added', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          data.chat_person['ID:'+child.id] = child;
          debug("person "+child.id+" added!");
          jQuery('#ifc_users').addRowData( child.id, {name : child.name, alliance : child.alliance, on_line : child.on_line, last_seen : child.last_seen}, 'last');
        }
      });
      fire_person_ref.on('child_changed', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          data.chat_person['ID:'+child.id] = child;
          debug("person "+child.id+" changed!");
          jQuery('#ifc_users').setRowData( child.id, {name : child.name, alliance : child.alliance, on_line : child.on_line, last_seen : child.last_seen});
        }
      });
      fire_person_ref.on('child_removed', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          data.chat_person['ID:'+child.id] = child;
          jQuery('#ifc_users').delRowData( child.id);
        }
      });

      //
      // Create and manage list of all chat rooms
      //
      jQuery('#ifc_rooms').jqGrid({
        datatype : 'clientSide',
        colNames : ['name','Status','visitors'],
        colModel : [
          {name : 'roomname', index : 'roomname', width: 150},
          {name : 'status', index : 'status', width: 100},
          {name : 'visitors', index : 'visitors', width: 100}
        ],
        caption : 'Chat Rooms',
        pager : '#ifc_rooms_pager',
        rowNum : 5,
        viewrecords : true
      });
      jQuery('#ifc_rooms').jqGrid('navGrid','#ifc_rooms_pager',{del:false,add:false,edit:false});

      var fire_room_ref = data.fire_ref.child('rooms');
      fire_room_ref.on('child_added', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          debug("Room name ["+childSnapshot.name()+"]");
          jQuery('#ifc_rooms').addRowData( childSnapshot.name(), {roomname : child.roomname, status : child.status, visitors : 1}, 'last');
        }
      });
      fire_room_ref.on('child_changed', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          jQuery('#ifc_rooms').setRowData( childSnapshot.name(), {roomname : child.roomname, status : child.status, visitors : 1});
        }
      });
      fire_room_ref.on('child_removed', function(childSnapshot, prevChildName) {
        var child = childSnapshot.val();
        if (child) {
          jQuery('#ifc_rooms').delRowData( childSnapshot.name());
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

