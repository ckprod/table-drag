;
(function () {
    "use strict";
  
    // This simple and small javascript solution for dragging html tables
    // is roughly based on
    // http://akottr.github.io/dragtable/
    // and
    // http://www.danvk.org/wp/dragtable/
    function TableDrag(table, options) {
        if (table && table.tagName !== 'TABLE') {
            return '';
        }
        
        if (this.init(table, options || {})) {
            return '';
        }
        
        // private functions
        function elementStyleProperty (element, prop) {
			if (window.getComputedStyle) {
				return window.getComputedStyle(element, "").getPropertyValue(prop);
			} else { // http://stackoverflow.com/questions/21797258/getcomputedstyle-like-javascript-function-for-ie8
				var re = /(\-([a-z]){1})/g;
				if (prop == 'float') prop = 'styleFloat';
				if (re.test(prop)) {
					prop = prop.replace(re, function () {
						return arguments[2].toUpperCase();
					});
				}
				return element.currentStyle[prop]
			}
        };
        
        function numericProperty (prop) {
            return (typeof prop == 'undefined' || prop == '' || prop == null) ? 0 : parseInt(prop);
        };
		
		function browserDetection () {
			var userAg = navigator.userAgent;
			
			if (userAg.indexOf("Chrome") != -1) {
				return 'ch';
			} else if (userAg.indexOf("Firefox")!=-1) {
				return 'ff';
			} else if (userAg.indexOf("Opera")!=-1) {
				return 'op';
			} else if (userAg.indexOf("MSIE")!=-1) {
				return 'ie';
			} else if (userAg.indexOf("Safari")!=-1) {
				return 'sa';
			} else {
				return 'ub';
			}
		};
        
        // The overriden placeholder methods
        this.mouseStart = function(event) {
            var borderCollapse = elementStyleProperty(table,'border-collapse'),
                styleLeft = numericProperty(elementStyleProperty(table,'border-left-width')),
                renderLeft = table.clientLeft,
                styleTop = numericProperty(elementStyleProperty(table,'border-top-width')),
                renderTop = table.clientTop,
                // diff: false ... rendered border width equals original border width
                //       true ... rendered border width differs original border width
                diffLeft = borderCollapse=='collapse' ? (renderLeft-styleLeft) : 0,
                diffTop = borderCollapse=='collapse' ? (renderTop-styleTop) : 0,
                borderSpacing = borderCollapse=='collapse' ? 0 : numericProperty(elementStyleProperty(table,'border-spacing')),
                tableBorderLeftWidth = diffLeft ? 0 : table.clientLeft,
                tableBorderTopWidth = diffLeft ? 0 : table.clientTop,
                padding = elementStyleProperty(table,'padding'),
                backgroundColor = elementStyleProperty(table,'background-color'),
                tableStyle = table.style,
                zIndex = numericProperty(tableStyle.zIndex),
                zIndex = zIndex ? zIndex+1 : 1,
                tablePosition = getOffsetRect(table),
                tableWidth = diffLeft ? table.offsetWidth : table.clientWidth,
                initialColumn = eventTarget(event).cellIndex,
				ie = browserDetection() == 'ie' ? true : false;
            
            // last column, initial column
            this.lc = this.ic = initialColumn;            
            // permutation memory
            this.pm = new Array(this.nhc);
            // rendered vs original style
            this.diffLeft = diffLeft;
            
            // overlay - back
            var back = document.createElement("div");
            back.id = 'drag-base';
            back.style.position = 'absolute';

            if (borderCollapse=='collapse') {
				if (ie) {
					back.style.left = tablePosition.left + styleLeft + 'px';
				} else {
					back.style.left = tablePosition.left + (diffLeft ? 0 : renderLeft) + 'px';
				}
            } else {
                back.style.left = tablePosition.left + renderLeft + 'px';
            }
            
            if (borderCollapse=='collapse') {
				if (ie) {
					back.style.top = tablePosition.top + styleTop + 'px';
				} else {
					back.style.top = tablePosition.top + (diffTop ? 0 : renderTop) + 'px';
				}
            } else {
                back.style.top = getOffsetRect(table.rows[0]).top + 'px';
            }
			
			if (ie) {
				back.style.width = tableWidth - 2*styleLeft + 'px';
			} else {
				back.style.width = tableWidth + 'px';
			}
            back.style.height = table.rows[0].offsetHeight+'px';
            back.style.backgroundColor = backgroundColor;
            back.style.zIndex = zIndex;

            // overlay - front
            for (var i = 0; i < this.nc; i++) {
                this.pm[i] = i;
                
                var cell = this.hr.cells[i],
                    borderLeftWidth = numericProperty(elementStyleProperty(cell,'border-left-width')),
                    borderRightWidth = numericProperty(elementStyleProperty(cell,'border-right-width')),
                    borderTopWidth = numericProperty(elementStyleProperty(cell,'border-top-width')),
                    borderBottomWidth = numericProperty(elementStyleProperty(cell,'border-bottom-width')),
                    paddingTop = numericProperty(elementStyleProperty(cell, 'padding-top')),
                    paddingBottom = numericProperty(elementStyleProperty(cell, 'padding-bottom')),
                    cellClientLeft = cell.clientLeft,
                    cellClientTop = cell.clientTop,
                    cellPosition = getOffsetRect(cell),
                    cellHeight = numericProperty(elementStyleProperty(cell,'height')),
                    celloffsetHeight = cell.offsetHeight,
                    cellclientHeight = cell.clientHeight;
                
                var middle = document.createElement("div");
                middle.style.width = (diffLeft ? (cell.clientWidth + borderLeftWidth + borderRightWidth) : cell.offsetWidth) + 'px';
                middle.style.height = cell.offsetHeight + 'px';
                middle.style.backgroundColor = "#FFFFFF";
                middle.style.position = 'absolute';
				if (ie) {
					middle.style.left = cellPosition.left - tablePosition.left - styleLeft + 'px';
				} else {
					middle.style.left = cellPosition.left - tablePosition.left - table.clientLeft + 'px';
				}
                middle.style.top = cellPosition.top - numericProperty(back.style.top) - (diffTop ? renderTop : 0) + 'px';   
                middle.style.zIndex = zIndex + 1;

                var front = document.createElement("div");
                front.style.cssText = copyStyles(cell);
                // doesnt work properly with firefox
                //front.style.cssText = window.getComputedStyle(cell, "").cssText;
                front.style.position = 'absolute';
                front.style.left = 0 + 'px';
                if (i == initialColumn) front.style.left = middle.style.left;
				front.style.top = 0 + 'px';
                if (i == initialColumn) front.style.top = middle.style.top;
                front.style.zIndex = zIndex + 2;
                front.style.height = cell.clientHeight - paddingTop - paddingBottom + 'px';
                front.innerHTML = cell.innerHTML;

                // drag element
                if (i == initialColumn) this.de = front;
                back.appendChild(middle);
                if (i != initialColumn) middle.appendChild(front);
            }
            back.appendChild(this.de);
            document.body.appendChild(back);
            
            this.overlay = back;
            
            // replace current document cursor
            this.cur = document.body.style.cursor;
            document.body.style.cursor = 'move';
           
            return true;
        };        
        this.mouseDrag = function(event) {
            var distance = pageX(event)-pageX(this.mouseDownEvent),
				distance = pageX(event)-this.mouseDownEvent1,
                lastColumn = this.lc,
                eventColumn = getTableColumn(table, event, lastColumn),
                diffLeft = this.diffLeft;
				
            this.de.style.left = numericProperty(this.de.style.left) + distance + 'px';
 
            if (eventColumn != lastColumn) { // bubble

                var borderCollapse = elementStyleProperty(table,'border-collapse'),
                    borderSpacing = borderCollapse=='collapse' ? 0 : numericProperty(elementStyleProperty(table,'border-spacing')),
                    direction = sign(eventColumn - lastColumn);
                
				for (var i = lastColumn; i != eventColumn; i+=direction) {
                    var start = i,
                        end = start + direction,
                        permutationMemory = this.pm,
                        layer = this.overlay.childNodes[permutationMemory[end]],
                        movinglayer = this.overlay.childNodes[permutationMemory[start]],
						ie = browserDetection() == 'ie' ? true : false;
                    
                    if (direction<0) { // to the left
                        var borderLeftWidth = numericProperty(elementStyleProperty(layer.childNodes[0],'border-left-width')),
                            borderLeftWidth = borderCollapse=='separate' ? 0 : borderLeftWidth,
                            left = numericProperty(layer.style.left),
                            width = numericProperty(movinglayer.style.width);
                        
                        movinglayer.style.left = left+'px';
						if (ie) {
							layer.style.left = left+width+borderSpacing +'px';
						} else {
							layer.style.left = left+width+borderSpacing - (diffLeft ? borderLeftWidth : 0) +'px';
						}
                    } else { // to the right
                        var borderLeftWidth = numericProperty(elementStyleProperty(this.de,'border-left-width')),
                            borderLeftWidth = borderCollapse=='separate' ? 0 : borderLeftWidth,
                            left = numericProperty(movinglayer.style.left),
                            width = numericProperty(layer.style.width);
                        
                        layer.style.left = left+'px';
						if (ie) {
							movinglayer.style.left = left+width+borderSpacing +'px';
						} else {
							movinglayer.style.left = left+width+borderSpacing - (diffLeft ? borderLeftWidth : 0) +'px';
						}
                    } 
            
                    // shift
                    this.pm.move(start, end);
                    // set new column
                    this.lc = end;
				}
            }

            this.mouseDownEvent = event;
			this.mouseDownEvent1 = pageX(event);
        };
        this.mouseStop = function(event) {
            // remove overlay
            document.body.removeChild(this.overlay);
            
            // move column if neccessary
            var col = getTableColumn(table, event, this.lc);
            if (col != this.ic)
                moveTableColumn(table,this.ic,col);
            
            // restore mouse cursor
            document.body.style.cursor = this.cur;
        };

    }

    TableDrag.prototype = {
        options: {
            distance: 0
        },

        init: function (table, options) {
            // check empty table
            if (!(table && table.rows && table.rows.length > 0)) {
                return true;
            }

            // header row
            this.hr = table.rows[0];
            // number of cells
            this.nc = this.hr.cells.length;
            // to keep context
            var that = this;

            // attach handlers to each cell of the header row.
            for (var i = 0; i < this.nc; i++) {
                var cell = this.hr.cells[i];
                // add move cursor
                cell.style.cursor = 'move';

                addEvent(cell, 'mousedown', function (event) {
                    that.mouseDown(event);
                });
            }

            return false;
        },
        
        // This simple javascript code is based on 
        // https://github.com/jquery/jquery-ui/blob/master/ui/mouse.js
        mouseDown: function (event) {
			// cross browser support
			event = event || window.event;

            // we may have missed mouseup (out of window) - clean start, reset all
            (this.mouseStarted && this.mouseUp(event));

            // to compute the first (and the following) resize move correctly
            this.mouseDownEvent = event;
			this.mouseDownEvent1 = pageX(event);

            // only left mouse button down is of interest
			if (eventWhich(event)!==1) {
				return true;
			}
			
            // lets start
            if (this.mouseDistanceMet(event)) {
                this.mouseStarted = (this.mouseStart(event) !== false);
                if (!this.mouseStarted) {
					if (event.preventDefault) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					
                    return true;
                }
            }
			
            // to keep context
            var that = this;
            this.mouseMoveDelegate = function(event) {
                return that.mouseMove(event);
            };
            this.mouseUpDelegate = function(event) {
                return that.mouseUp(event);
            };
            
            addEvent(document.body, 'mousemove', this.mouseMoveDelegate);
            addEvent(document.body, 'mouseup', this.mouseUpDelegate);
    
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
    
            return true;
        },
        
        // This simple javascript code is based on 
        // https://github.com/jquery/jquery-ui/blob/master/ui/mouse.js
        mouseMove: function(event) {
			// cross browser support
			event = event || window.event;

		
            // Iframe mouseup check - mouseup occurred in another document
            if ( !eventWhich(event) ) {
                return this.mouseUp( event );
            }
    
            // drag functionality
            if (this.mouseStarted) {
                this.mouseDrag(event);
				if (event.preventDefault) {
					return event.preventDefault();
				} else {
					event.returnValue = false;
				}
    
                return false;
            }
    
            // within no action circle
            if (this.mouseDistanceMet(event)) {
                this.mouseStarted = (this.mouseStart(this.mouseDownEvent,event) !== false);

                (this.mouseStarted ? this.mouseDrag(event) : this.mouseUp(event));
            }
            
            return !this.mouseStarted;
        },
        
        // This simple javascript code is based on
        // https://github.com/jquery/jquery-ui/blob/master/ui/mouse.js
        mouseUp: function(event) {
			// cross browser support
			event = event || window.event;

            removeEvent(document.body, 'mousemove', this.mouseMoveDelegate);
            removeEvent(document.body, 'mouseup', this.mouseUpDelegate);
    
            if (this.mouseStarted) {
                this.mouseStarted = false;
    
                this.mouseStop(event);
            }
    
            return false;
        },

        // This simple javascript code is roughly based on 
        // https://github.com/jquery/jquery-ui/blob/master/ui/mouse.js
        mouseDistanceMet: function(event) {
            var x = Math.abs(pageX(this.mouseDownEvent) - pageX(event)),
                y = Math.abs(pageY(this.mouseDownEvent) - pageY(event));
				
            return (Math.sqrt(x*x + y*y)) >= this.options.distance;
        },

        // These are placeholder methods, to be overriden by extentions
        mouseStart: function() {},
        mouseDrag: function() {},
        mouseStop: function() {},
    };
    
    function getTableColumn(table, event, defaultColumn) {
        var cells = table.rows[0].cells,
            ex = pageX(event);
        for (var i = 0; i < cells.length; i++) {
            var tx = getOffsetRect(cells[i]).left;
            if (tx <= ex && ex <= tx + cells[i].offsetWidth) {
                return i;
            }
        }
        
        return (typeof defaultColumn === 'undefined' ? -1 : defaultColumn); 
    }
    
    function copyStyles(el) {
        var cs = window.getComputedStyle?window.getComputedStyle(el,null):el.currentStyle,
            css = '';
        for (var i=0; i<cs.length; i++) {
            var style = cs[i];
            css += style + ': ' + cs.getPropertyValue(style) + ';';
        }
        return css;
    }

    // http://stackoverflow.com/questions/2440700/reordering-arrays
    Array.prototype.move = function(from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    };
    
    // http://ejohn.org/apps/jselect/event.html
    function addEvent( obj, type, fn ) {
      if ( obj.attachEvent ) {
        obj['e'+type+fn] = fn;
        obj[type+fn] = function () {
            obj['e'+type+fn]( window.event );
        };
        obj.attachEvent( 'on'+type, obj[type+fn] );
      } else
        obj.addEventListener( type, fn, false );
    }
    function removeEvent( obj, type, fn ) {
      if ( obj.detachEvent ) {
        obj.detachEvent( 'on'+type, obj[type+fn] );
        obj[type+fn] = null;
      } else
        obj.removeEventListener( type, fn, false );
    }
	
	// Cross browser event data based on
	// jquery implementation
	function eventWhich(event) {
		var which = event.which;
		
		return (typeof which == 'undefined') ? event.button : which;
	}
	function pageX (event) {
		var pageX = event.pageX;
		
		if (typeof pageX == 'undefined') {
			pageX = event.clientX + ( document.documentElement && document.documentElement.scrollLeft || document.body && document.body.scrollLeft || 0 ) - ( document.documentElement && document.documentElement.clientLeft || document.body && document.body.clientLeft || 0 );
		}
	
		return pageX;
	}
	function pageY (event) {
		var pageY = event.pageY;
		
		if (typeof pageY == 'undefined') {
			pageY = event.clientX + ( document.documentElement && document.documentElement.scrollTop || document.body && document.body.scrollTop || 0 ) - ( document.documentElement && document.documentElement.clientTop || document.body && document.body.clientTop || 0 );
		}
		
		return pageY;
	}
	
	function eventTarget (event) {
		return event.target || event.srcElement;
	}

    // http://javascript.info/tutorial/coordinates
    function getOffsetRect(elem) {
        // (1)
        var box = elem.getBoundingClientRect();
         
        var body = document.body;
        var docElem = document.documentElement;
         
        // (2)
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
         
        // (3)
        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
         
        // (4)
        var top  = box.top +  scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
         
        return { top: Math.round(top), left: Math.round(left) };
    }
    
    // based on
    // https://groups.google.com/forum/#!msg/comp.lang.javascript/durZ17iSD0I/rnH2FqrvkooJ
    function moveTableColumn(table, start, end) {
        var row,
            i = table.rows.length;
        while (i--) {
          row = table.rows[i];
          var x = row.removeChild(row.cells[start]);
          row.insertBefore(x, row.cells[end]);
        }
    }

	// http://stackoverflow.com/questions/7624920/number-sign-in-javascript
	function sign (x) {
        return typeof x == 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    }

    // based on
    // https://github.com/tristen/tablesort/blob/gh-pages/src/tablesort.js
    // line 297 - 301
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TableDrag;
    } else {
        window.TableDrag = TableDrag;
    }
})();