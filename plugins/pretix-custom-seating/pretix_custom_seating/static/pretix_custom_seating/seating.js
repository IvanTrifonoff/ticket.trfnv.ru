(function() {
    var debug = document.getElementById('seating-debug');
    function log(msg) {
        if (debug) {
            debug.innerHTML += msg + '<br>';
        }
        console.log(msg);
    }

    function addToCart(seat) {
        log("Attempting to add seat " + seat.seat_number + " to cart...");
        if (!seat.item_id || !seat.seat_guid) {
            log("Error: Seat missing item_id (" + seat.item_id + ") or seat_guid (" + seat.seat_guid + ")");
            alert("Error: Invalid seat configuration.");
            return;
        }

        var csrfTokenInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (!csrfTokenInput) {
            log("Error: CSRF token not found");
            alert("Error: CSRF token missing.");
            return;
        }
        var csrfToken = csrfTokenInput.value;

        var formData = new FormData();
        formData.append('csrfmiddlewaretoken', csrfToken);
        // Correct parameter for adding a seated item in Pretix
        formData.append('seat_' + seat.item_id, seat.seat_guid); 
        
        var cartUrl = window.location.pathname.replace(/\/$/, "") + '/cart/add';
        
        log("Posting to: " + cartUrl);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', cartUrl, true);
        
        xhr.onload = function () {
            log("Response status: " + xhr.status);
            if (xhr.status >= 200 && xhr.status < 400) {
                log("Success. Reloading...");
                window.location.reload(); 
            } else {
                log("Error adding to cart. Status: " + xhr.status);
                alert("Failed to add to cart.");
            }
        };
        xhr.onerror = function () {
            log("Network Error");
            alert("Network error.");
        };
        xhr.send(formData);
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
        
        log("JS Loaded. Data parsed.");

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

        if (data.zones) {
            data.zones.forEach(function(zone) {
                var zX = zone.position ? zone.position.x : 0;
                var zY = zone.position ? zone.position.y : 0;
                
                if (zone.rows) {
                    zone.rows.forEach(function(row) {
                        var rX = row.position ? row.position.x : 0;
                        var rY = row.position ? row.position.y : 0;
                        
                        if (row.seats) {
                            row.seats.forEach(function(seat) {
                                var circle = document.createElementNS(ns, "circle");
                                
                                var sX = (seat.position ? seat.position.x : (seat.x || 0));
                                var sY = (seat.position ? seat.position.y : (seat.y || 0));
                                
                                var x = zX + rX + sX;
                                var y = zY + rY + sY;
                                
                                var cx = x + 15;
                                var cy = y + 15;

                                circle.setAttribute("cx", cx); 
                                circle.setAttribute("cy", cy);
                                circle.setAttribute("r", 12);
                                
                                var color = categoryColors[seat.category] || '#999';
                                circle.setAttribute("fill", color);
                                circle.setAttribute("stroke", "#333");
                                circle.setAttribute("stroke-width", "1");
                                // Use class instead of inline style
                                circle.setAttribute("class", "seat-circle");
                                
                                var title = document.createElementNS(ns, "title");
                                title.textContent = "Seat " + seat.seat_number;
                                circle.appendChild(title);

                                circle.addEventListener("click", function() {
                                    addToCart(seat);
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

    } catch (e) {
        log("ERROR: " + e.message);
    }
})();
