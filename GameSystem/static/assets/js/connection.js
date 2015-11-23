/*      file:       connection.js
        authors:    alex williams, williams callaghan
        description:

        this file defines the specification for communication between two players in a game.
        it also defines event-handlers for UI elements (e.g. voting buttons)
 */

$(document).ready(function() {
    /* setup default variables for the voting scheme */
    var peer_vote = -1;
    var my_vote = -1;

    /*  setup the Peer object */
    var peer = new Peer($("#my-id").val(), {
        // API Key -- sign up for one with PeerJS
        key: 'ngb8qk19ri3eg66r',//key: 'x7fwx2kavpy6tj4i',
        // Debug level
        debug: 3,
        // Logging function
        logFunction: function() {
            var copy = Array.prototype.slice.call(arguments).join(' ');
            $('.log').append(copy + '<br>');
        }
    });

    /* setup the JavaScript Object of curren connections */
    var connectedPeers = {};

    /**
     * Define an event-handler for whenever the Peer object is ready to communicate.
     */
    peer.on('open', function(id){
        console.log("PeerID: "+peer.id);

        /* can we show the voting buttons? */
        if($('.partner-label-container').children().length > 4 && $('.label-container').children().length > 4){
            $("#voting-controls").show();
        }

        // We can print some connection successful message or whatever.
    });

    /**
     * Define an event-handler for whenever the peer connection is established.
     */
    peer.on('connection', connect);

    /**
     * Define an event-handler for whenever the peer connection encounters an error.
     */
    peer.on('error', function(err) {
      console.log(err);
    });

    /**
     * Callback for whenever a connection is made between two peers.
     * @param c (a connection object)
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
            if(data.indexOf("vote") == -1) {
                $(".partner-label-container").append('<div class="user-label">' + data + '</div>');

                /* can we show the voting buttons? */
                if ($('.partner-label-container').children().length > 4 && $('.label-container').children().length > 4) {
                    $("#voting-controls").show();
                }
            } else{
                peer_vote = data.split(":")[1];

                if(my_vote != -1) {
                    /* hide the dialog modal */
                    waitingForVoteDialog.hide();

                    /* show the summary modal */
                    $('#summary-modal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });

                    if(peer_vote == my_vote){
                        $("#round-summary-body").append("You both guessed the same.")
                    } else{
                        $("#round-summary-body").append("You both guessed differently.")
                    }
                }
            }
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

    /* connect to the peer if we haven't already */
    var requestedPeer = $("#peer-id").val();
    if(!connectedPeers[requestedPeer]) {
        // Create a connection
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

    /**
     * Define Django's CSRF token-generating function.
     * @param name
     * @returns {*}
     */
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    /**
     * Define an event-handler for same/diff voting buttons.
     */
    $(".vote-buttons").on('click', function(e){
        var vote;
        if(e.currentTarget.id == "same-button"){
            vote = 1;
        } else{
            vote = 0;
        }

        /* send the new label to the server */
        $.ajax({
            url : '/game/add_vote/',
            type : 'POST',
            data : {
                'csrfmiddlewaretoken': csrftoken,
                'game_id' : $("#game_id").val(),
                'user_id' : $("#user_id").val(),
                'round'   : $("#round").val(),
                'vote'    : vote
            },
            dataType:'json',
            success : function(data) {
                if(data == 0){
                    /* show the waiting dialog */
                    waitingForVoteDialog.show();
                    my_vote = vote;

                    /* send the vote to the peer */
                    /* send to the game partner */
                    eachActiveConnection(function(c, $c) {
                        c.send("vote:"+vote);
                    });

                } else {
                    my_vote = vote;
                    $('#summary-modal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });

                    console.log("Peer_vote: "+peer_vote);
                    console.log("My vote: "+my_vote);
                    if(peer_vote == my_vote){
                        $("#round-summary-body").append("You both guessed the same.")
                    } else{
                        $("#round-summary-body").append("You both guessed differently.")
                    }

                }
            },
            error : function(request,error){console.log(request);}
        });

    });

    /**
     * Define an event-handler for the "Enter" key when giving a label.
     */
    $(".label-input").keyup(function(e) {
        /* verify enter key */
        if (e.keyCode == 13) {
            var label = $('.label-input').val();

            /* restrict null / invalid input */
            if(label == "" || label == null) return;

            /* send the new label to the server */
            $.ajax({
                url : '/game/add_label/',
                type : 'POST',
                data : {
                    'csrfmiddlewaretoken': csrftoken,
                    'game_id' : $("#game_id").val(),
                    'user_id' : $("#user_id").val(),
                    'round'   : $("#round").val(),
                    'label'   : label
                },
                dataType:'json',
                success : function(data) {},
                error : function(request,error){console.log(request);}
            });

            /* send to the game partner */
            eachActiveConnection(function(c, $c) {
                c.send(label);
            });

            /* append the html */
            $(".label-container").append('<div class="user-label">'+label+'</div>');

            /* reset the input field */
            $('.label-input').val('');

            /* can we show the voting buttons? */
            if($('.partner-label-container').children().length > 4 && $('.label-container').children().length > 4){
                $("#voting-controls").show();
            }
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