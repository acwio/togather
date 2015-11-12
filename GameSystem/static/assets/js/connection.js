/**
 * Created by williamcallaghan on 2015-11-11.
 */

// Peer Object
var peer = new Peer({
    // API Key -- sign up for one with PeerJS
    key: '',
    // Debug level
    debug: 3,
    // Logging function
    logFunction: function() {
        var copy = Array.prototype.slice.call(arguments).join(' ');
        $('.log').append(copy + '<br>');
    }
});

// List of connected peers
var connectedPeers = {};

// When connection to the PeerServer is established.
peer.on('open', function(id){
    // We can print some connection successful message or whatever.
});

// When a new data connection is established from a remote peer.
// Await connections from others
peer.on('connection', connect);

// Log error
peer.on('error', function(err) {
  console.log(err);
})

/**
 * Handle a connection object.
 * @param c
 */
function connect(c) {

}

$(document).ready(function() {

    // ********************************
    // SHOULD THIS INITIAL CONNECTION BE
    // ENCAPSULATED IN A FUNCTION?
    // I AM JAVASCRIPT N00B!
    // ********************************

    // Connect to a peer
    // Some logic will have to be here to determine
    // what peer to connect to. Will add this later.
    var requestedPeer;

    if(!connectedPeers[requestedPeer]) {

        // Create a connection
        // We can add metadata as a second argument
        // Where the second argument is a dict.
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

    // ********************
    // N00B FUNCTION END!!!
    // ********************


    // Close a connection.
    $('#close').click(function() {
        eachActiveConnection(function(c) {
            c.close();
        });
    });

    // Send a label.
    $('#send').submit(function(e) {
        // Have to add logic here.
        // This is where the c.send
        // comes into play. The message
        // can be whatever we want.
    });

    /**
     * I actually don't know wtf this
     * function is suppossed to do but
     * apparently its needed in communicating
     * with each active connection. I guess
     * it takes as argument a function and then
     * applies it to each active connection.
     */
    function eachActiveConnection(fn) {

    }

});


// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};