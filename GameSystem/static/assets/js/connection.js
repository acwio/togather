/*      file:       connection.js
        authors:    alex williams, williams callaghan
        description:

        this file defines the specification for communication between two players in a game.
        it also defines event-handlers for UI elements (e.g. voting buttons)
 */
var connectedPeers;
$(document).ready(function() {
    /* setup default variables for the voting scheme */
    var peer_vote = -1;
    var my_vote = -1;
    var subjectCommunicated = false;

    /*  setup the Peer object */
    var peer = new Peer($("#my-id").val(), {
        // API Key -- sign up for one with PeerJS
        key: 'okb9u0neilxiggb9',//key: 'x7fwx2kavpy6tj4i',
        // Debug level
        debug: 3,
        // Logging function
        logFunction: function() {
            var copy = Array.prototype.slice.call(arguments).join(' ');
            $('.log').append(copy + '<br>');
        }
    });

    /* setup the JavaScript Object of curren connections */
    connectedPeers = {};

    /**
     * Define an event-handler for whenever the Peer object is ready to communicate.
     */
    peer.on('open', function(id){
        console.log("My ID: "+peer.id);

        /* can we show the voting buttons? */
        if($('.partner-label-container').children().length > 4 && $('.label-container').children().length > 4){
            $("#voting-controls").show();
        }

        /* do we know the peer-id yet? */
        if($("#peer-id").val() === "togather-1"){
            /* make a call to the server for the id */
            getPeerIDFromServerAndConnect();
        }
        else{   /* we already know the peer ID, so just connect */
            connectToPeer();
        }
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

        /* send the subject_id to the game partner */
        eachActiveConnection(function(c, $c) {
            console.log("Sending subject id ...");
            c.send("subject:"+$("#round").val()+":"+$("#subject_id").val());
        });

        var labels = [];
        /* define how data is handled when received */
        c.on('data', function (data) {
            console.log("data recvd: "+data);

            /*  is the data a label? */
            if(data.indexOf("vote:") == -1 && data.indexOf("subject:") == -1) {
                /* check that the label hasn't been given already */
                if(labels.indexOf(data) == -1) {
                    $(".partner-label-container").append('<div class="user-label">' + data + '</div>');
                    labels.push(data);
                }

                /* can we show the voting buttons? */
                if ($('.partner-label-container').children().length > 4 && $('.label-container').children().length > 4) {
                    $("#voting-controls").show();
                }
            } else if (data.indexOf("vote:") == -1){ /* subject_id is being recieved */

                var round_index = data.split(":")[1];
                var peer_subject = data.split(":")[2];

                if(round_index == $("#round").val()) {  /* verify we recieved data from the right round */
                    /* send the subject_id to the game partner */
                    if (!subjectCommunicated) {
                        eachActiveConnection(function (c, $c) {
                            c.send("subject:" + $("#round").val() + ":" + $("#subject_id").val());
                        });

                        subjectCommunicated = true;
                    } else {
                        subjectCommunicated = false;
                    }
                }


            } else{ /*  vote is being recieved */
                peer_vote = data.split(":")[1];
                console.log("Peer_Vote: "+peer_vote);
                console.log("My Vote: "+my_vote);

                if(my_vote != -1) {
                    /* hide the dialog modal */
                    waitingForVoteDialog.hide();

                    /* show the summary modal */
                    $('#summary-modal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });

                    if(parseInt(peer_vote) == parseInt(correct_answer) && parseInt(my_vote) == parseInt(correct_answer)){
                        $("#round-summary-body").append("You both guessed correctly! You've earned <strong>10 points</strong>!")
                    } else{
                        $("#round-summary-body").append("One (or both) of you guessed incorrectly. Don't worry! You'll get it next time.")
                    }
                }
            }
        });

        /* define the behavior for when a user leaves randomly*/
        c.on('close', function () {

            if(!$("#summary-modal").is(":visible")) {
                /* show the modal */
                waitingDialog.show();
            }

            /* delete the connection */
            delete connectedPeers[c.peer];
        });
        connectedPeers[c.peer] = 1;

    }

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
     * Define function for connecting to a peer.
     */
    var requestedPeer;
    function connectToPeer() {
        requestedPeer = $("#peer-id").val();
        console.log("Connecting to "+requestedPeer);
        if (!connectedPeers[requestedPeer]) {
            // Create a connection
            console.log("Attempting to connect to: " + requestedPeer);
            var c = peer.connect(requestedPeer);

            // When connection to Peer Server is established.
            c.on('open', function () {
                connect(c);
            });

            // Error handling
            c.on('error', function (err) {
                // This is temp. We probably want to
                // display something on the screen.
                // We can do stuff for each type of
                // error if needed.
                console.log(err);
            });
        }
        connectedPeers[requestedPeer] = 1;
    }

    var getPeerIDFromServerAndConnect = function() {
        console.log("Trying to get peer-id from server");

        /* make the call */
        $.ajax({
            url : '/get/peerid/',
            type : 'GET',
            data : {
                'csrfmiddlewaretoken': csrftoken,
                'game_id'   : $("#game_id").val(),
                'user_id'   : $("#user_id").val()
            },
            success : function(data) {
                console.log("Response:");
                console.log(data);
                if(data === "togather-1"){
                    console.log("CONNECTION ERROR: Attempting to get PeerID from server ...");
                    /* after 3 seconds, make the call again */
                    setTimeout(getPeerIDFromServerAndConnect, 3000);

                } else {
                    /* update the element's data */
                    $("#peer-id").val(data);

                    console.log("Updated peer-id to: "+$("#peer-id").val());
                    /* connect to the peer */
                    connectToPeer();
                }

            },
            error : function(request,error){console.log(request); console.log(error);}
        });

    };

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

        /* send the vote to the server */
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
                /* send to the game partner */
                eachActiveConnection(function(c, $c) {
                    c.send("vote:"+vote);
                });

                if(data == 0){
                    /* show the waiting dialog */
                    waitingForVoteDialog.show();
                    my_vote = vote;

                } else {

                    my_vote = vote;
                    $('#summary-modal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });

                    console.log("Peer_vote: "+peer_vote);
                    console.log("My vote: "+my_vote);
                    console.log("correct answer: "+correct_answer);
                    if(peer_vote == correct_answer && my_vote == correct_answer){
                        $("#round-summary-body").append("You both guessed correctly! You've earned <strong>10 points</strong>!")
                    } else{
                        $("#round-summary-body").append("One (or both) of you guessed incorrectly. Don't worry! You'll get it next time.")
                    }

                }
            },
            error : function(request,error){console.log(request);}
        });

    });

    /**
     * Define an event-handler for the "Enter" key when giving a label.
     */
    var sent_labels = [];
    $("#label-supplier").keyup(function(e) {
        /* verify enter key */
        if (e.keyCode == 13) {
            var label = $('.label-input').val();

            /* restrict null / invalid input */
            if(label == "" || label == null){   return; }

            /* restrict duplicate label */
            if(sent_labels.indexOf(label) != -1){   return; }

            /* send the new label to the server */
            $.ajax({
                url : '/game/add_label/',
                type : 'POST',
                data : {
                    'csrfmiddlewaretoken': csrftoken,
                    'game_id'   : $("#game_id").val(),
                    'user_id'   : $("#user_id").val(),
                    'round'     : $("#round").val(),
                    'subject_id': $("#subject_id").val(),
                    'label'     : label
                },
                dataType:'json',
                success : function(data) {},
                error : function(request,error){console.log(request);}
            });

            /* send to the game partner */
            eachActiveConnection(function(c, $c) {
                console.log(c);
                c.send(label);
            });

            sent_labels.push(label);

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
            if(peerId === "togather-1"){return;}
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