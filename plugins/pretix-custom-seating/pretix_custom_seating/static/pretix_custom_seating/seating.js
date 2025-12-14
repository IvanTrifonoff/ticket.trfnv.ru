(function() {
    var debug = document.getElementById('seating-debug');
    function log(msg) {
        if (debug) {
            debug.innerHTML += msg + '<br>';
        }
        console.log(msg);
    }

    try {
        var rawDataElement = document.getElementById('seating-data');
        if (!rawDataElement) {
            console.error('Seating data element not found');
            return;
        }
        var rawData = rawDataElement.textContent;
        var data = JSON.parse(rawData);
        var svg = document.getElementById('seating-svg');
        var ns = "http://www.w3.org/2000/svg";
        
        log("JS Loaded. Data parsed. Size: " + (data.size ? data.size.width + 'x' + data.size.height : 'N/A'));

        if (data.size) {
            svg.setAttribute('width', data.size.width);
            svg.setAttribute('height', data.size.height);
            svg.setAttribute('viewBox', '0 0 ' + data.size.width + ' ' + data.size.height);
        }

        var categoryColors = {};
        if (data.categories) {
            data.categories.forEach(function(cat) {
                categoryColors[cat.name] = cat.color;
            });
        }

        var seatsCount = 0;

        if (data.zones) {
            log("Zones: " + data.zones.length);
            data.zones.forEach(function(zone, zIndex) {
                var zX = zone.position ? zone.position.x : 0;
                var zY = zone.position ? zone.position.y : 0;
                
                if (zone.rows) {
                    zone.rows.forEach(function(row, rIndex) {
                        var rX = row.position ? row.position.x : 0;
                        var rY = row.position ? row.position.y : 0;
                        
                        if (row.seats) {
                            row.seats.forEach(function(seat, sIndex) {
                                seatsCount++;
                                var circle = document.createElementNS(ns, "circle");
                                
                                var sX = (seat.position ? seat.position.x : (seat.x || 0));
                                var sY = (seat.position ? seat.position.y : (seat.y || 0));
                                
                                var x = zX + rX + sX;
                                var y = zY + rY + sY;
                                
                                // Center adjustment
                                var cx = x + 15;
                                var cy = y + 15;

                                circle.setAttribute("cx", cx); 
                                circle.setAttribute("cy", cy);
                                circle.setAttribute("r", 12);
                                
                                var color = categoryColors[seat.category] || '#999';
                                circle.setAttribute("fill", color);
                                circle.setAttribute("stroke", "#333");
                                circle.setAttribute("stroke-width", "1");
                                circle.setAttribute("style", "cursor: pointer;");
                                
                                var title = document.createElementNS(ns, "title");
                                title.textContent = "Seat " + seat.seat_number;
                                circle.appendChild(title);

                                circle.addEventListener("click", function() {
                                    alert("Seat " + seat.seat_number);
                                });

                                svg.appendChild(circle);
                                
                                var text = document.createElementNS(ns, "text");
                                text.setAttribute("x", cx);
                                text.setAttribute("y", cy + 4);
                                text.setAttribute("text-anchor", "middle");
                                text.setAttribute("font-size", "10");
                                text.setAttribute("fill", "#fff");
                                text.textContent = seat.seat_number;
                                text.setAttribute("pointer-events", "none"); 
                                svg.appendChild(text);
                            });
                        }
                    });
                }
            });
        }
        
        log("Total drawn seats: " + seatsCount);

    } catch (e) {
        log("ERROR: " + e.message);
    }
})();
