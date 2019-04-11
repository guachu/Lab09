var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var room;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(room, function (eventbody) {
                
                AlertMessage(eventbody);
            });
        });

    };


    var listenerMouse = function (event) {
        var can = document.getElementById("canvas");
        can.addEventListener('click', function(event){
            var pt = getMousePosition(event);
            addPointToCanvas(pt);                
            stompClient.send(room, {}, JSON.stringify(pt));
        });
    }
    
    
    var AlertMessage = function (greeting) {
        var newpoint = JSON.parse(greeting.body); 
        addPointToCanvas(newpoint);
    }

    return {

        init: function (val) {
            room = "/topic/newpoint." + val;            
            connectAndSubscribe()
            listenerMouse(event)
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            //publicar el evento
            stompClient.send(room, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();