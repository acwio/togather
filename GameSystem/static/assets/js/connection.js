/**
 * Created by williamcallaghan on 2015-11-11.
 */

// Peer Object
$(document).ready(function() {
    console.log("Specific PeerID: "+$("#my-id").val());
var peer = new Peer($("#my-id").val(), {
    // API Key -- sign up for one with PeerJS
    key: 'x7fwx2kavpy6tj4i',
    // Debug level
    debug: 3,
    // Logging function
    logFunction: function() {
        var copy = Array.prototype.slice.call(arguments).join(' ');
        $('.log').append(copy + '<br>');
    }
});

// There will only ever be one other connected peer.
var connectedPeers = {};

// When connection to the PeerServer is established.
peer.on('open', function(id){
    console.log("PeerID: "+peer.id);

    // We can print some connection successful message or whatever.
});

// When a new data connection is established from a remote peer.
// Await connections from others
peer.on('connection', connect);

// Log error
peer.on('error', function(err) {
  console.log(err);
});

/**
 * Handle a connection object.
 * @param c
 */
function connect(c) {
    /* hide the waiting Dialog */
    waitingDialog.hide();

    /* have they seen the tutorial before? */
    if (localStorage.getItem("Togather.tutorial") === null) {
        /* show the tutorial modal */
        $('#myModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    /* define how data is handled when received */
    c.on('data', function (data) {
        $(".partner-label-container").append('<div class="user-label">'+data +'</div>');
    });

    /* define the behavior for when a user leaves randomly*/
    c.on('close', function () {
        /* show the modal */
        waitingDialog.show();

        /* delete the connection */
        delete connectedPeers[c.peer];
    });
    connectedPeers[c.peer] = 1;

}


    function doNothing(e){
        e.preventDefault();
        e.stopPropagation();
    }

    // Connect to a peer
    // Some logic will have to be here to determine
    // what peer to connect to. Will add this later.
    //$('#connect').click(function() {
        var requestedPeer = $("#peer-id").val();

        if(!connectedPeers[requestedPeer]) {

            // Create a connection
            // We can add metadata as a second argument
            // Where the second argument is a dict.
            console.log("Attempting to connect to: "+ requestedPeer);
            var c = peer.connect(requestedPeer);

            // When connection to Peer Server is established.
            c.on('open', function() {
                connect(c);
            });

            // Error handling
            c.on('error', function(err) {
                // This is temp. We probably want to
                // display something on the screen.
                // We can do stuff for each type of
                // error if needed.
                alert(err);
            });
        }
        connectedPeers[requestedPeer] = 1;
   // });

    // Close a connection.
    $('#close').click(function() {
        eachActiveConnection(function(c) {
            c.close();
        });
    });

    // Send a label.
    $(".label-input").keyup(function(e) {
        /* verify enter key */
        if (e.keyCode == 13) {
            var label = $('.label-input').val();

            /* restrict null / invalid input */
            if(label == "" || label == null) return;

            /* send to the game partner */
            eachActiveConnection(function(c, $c) {
                c.send(label);
            });

            /* append the html */
            $(".label-container").append('<div class="user-label">'+label+'</div>');

            /* reset the input field */
            $('.label-input').val('');
        }
    });

    /**
     * Goes through each active peer and calls FN on its connections.
     * @param fn
     */
    function eachActiveConnection(fn) {
        var checkedIds = {};
            var peerId = $("#peer-id").val();
            if (!checkedIds[peerId]) {
                var conns = peer.connections[peerId];
                for (var i = 0, ii = conns.length; i < ii; i += 1) {
                    var conn = conns[i];
                    fn(conn, $(this));
                }
            }
            checkedIds[peerId] = 1;
    }
});


// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};