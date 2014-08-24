(function () {
    "use strict";
  
    // This simple and small javascript solution for dragging html tables
    // is roughly based on
    // http://akottr.github.io/dragtable/
    // and
    // http://www.danvk.org/wp/dragtable/
    function TableDrag(table, options) {
        if (table && table.tagName !== 'TABLE') {
            console.log('ERROR: DOM element/input is not a table!');
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
		
        function tridentDetection () {
            return (navigator.userAgent.indexOf("Trident")!=-1) ? true : false;
        };
        
        function borderCollapseDetection () {
            return elementStyleProperty(table,'border-collapse')=='collapse' ? true : false;
        }
        
        // The overriden placeholder methods
        this.mouseStart = function(event) {
			var trident = tridentDetection(),
				borderCollapse = borderCollapseDetection(),
				tablePosition = getOffsetRect(table),
				row = table.rows[0],
				rowPosition = getOffsetRect(row),
				rowOffsetHeight = row.offsetHeight,
				tableClientLeft = trident ? (rowPosition.left-tablePosition.left) : table.clientLeft,
				tableClientTop = trident ? (rowPosition.top-tablePosition.top) : table.clientTop;
            
            var backLeft = borderCollapse ? tablePosition.left : (tablePosition.left + tableClientLeft),
                backTop = borderCollapse ? tablePosition.top : (rowPosition.top),
                backWidth = borderCollapse ? table.offsetWidth : table.offsetWidth - 2*tableClientLeft,
                backHeight = table.rows[0].offsetHeight;
            
            var zIndex = numericProperty(table.style.zIndex),
                zIndex = zIndex ? zIndex+1 : 1,
                initialColumn = eventTarget(event).cellIndex,
                backgroundColor = elementStyleProperty(table,'background-color');

            // last column, initial column
            this.lc = this.ic = initialColumn;            
            
            // overlay - back
            var back = document.createElement("div");
			back.style.position = 'absolute';
			back.style.left = backLeft + 'px';
			back.style.top = backTop + 'px';
			back.style.width = backWidth + 'px';
			back.style.height = backHeight + 'px';
			back.style.backgroundColor = backgroundColor;
            back.style.zIndex = zIndex;

            // overlay - front
            for (var i = 0; i < this.nc; i++) {
				var cell = row.cells[i],
					cellPosition = getOffsetRect(cell),
					offsetWidth = cell.offsetWidth,
					offsetHeight = cell.offsetHeight,
					clientWidth = cell.clientWidth,
					clientHeight = cell.clientHeight,
					clientLeft = cell.clientLeft,
					clientTop = cell.clientTop,
					clientRight = offsetWidth-clientWidth-clientLeft,
					clientBottom = offsetHeight-clientHeight-clientTop,
					paddingTop = numericProperty(elementStyleProperty(cell,'padding-top')),
					paddingBottom = numericProperty(elementStyleProperty(cell,'padding-bottom')),
					computedCellHeight = cell.getBoundingClientRect().height-clientTop-clientBottom-paddingTop-paddingBottom;

				var border = borderCollapse ? (clientRight + clientLeft) : clientLeft;

				var elementBaseLeft = borderCollapse ? (cellPosition.left - backLeft - tableClientLeft) : cellPosition.left - backLeft,
					elementBaseTop = borderCollapse ? (cellPosition.top - backTop - tableClientTop) : cellPosition.top - backTop,
					elementBaseWidth = clientWidth + 2*border,
					elementBaseHeight = rowOffsetHeight;
		 
				var element = document.createElement("div");
				element.style.cssText = copyStyles(cell);
				element.style.position = 'absolute';
				element.style.left = 0;
				element.style.top = 0;
				element.style.height = computedCellHeight + 'px';
				element.style.borderLeftWidth = border+'px';
				//element.style.borderColor = 'rgb(120,120,120)';
				element.style.borderTopWidth = border+'px';
				element.style.borderRightWidth = border+'px';
				element.style.borderBottomWidth = border+'px';
				element.innerHTML = cell.innerHTML;
				element.style.zIndex = zIndex + 2;
					
				if (i == initialColumn) element.style.left = elementBaseLeft + 'px';
				if (i == initialColumn) element.style.top = elementBaseTop + 'px'; 

				var elementBase = document.createElement("div");
				elementBase.style.position = 'absolute';
				elementBase.style.left = elementBaseLeft + 'px';
				elementBase.style.top = elementBaseTop + 'px';
				elementBase.style.height = elementBaseHeight + 'px';
				elementBase.style.width = elementBaseWidth + 'px';
				elementBase.style.backgroundColor = 'white';
				elementBase.style.zIndex = zIndex + 1;
                // drag element
                if (i == initialColumn) this.de = element;
                back.appendChild(elementBase);
                if (i != initialColumn) elementBase.appendChild(element);
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
                eventColumn = getTableColumn(table, event, lastColumn);
				
            this.de.style.left = numericProperty(this.de.style.left) + distance + 'px';
 
            if (eventColumn != lastColumn) { // bubble

                var trident = tridentDetection(),
                    borderCollapse = borderCollapseDetection(),
                    borderSpacing = borderCollapse ? 0 : numericProperty(elementStyleProperty(table,'border-spacing')),
                    direction = sign(eventColumn - lastColumn);

				for (var i = lastColumn; i != eventColumn; i+=direction) {
                    var start = i,
                        end = start + direction,
                        shift = 0,
                        shift = (direction<0 && start>this.ic) ? 1 : ((direction>0 && start<this.ic) ? -1 : 0),
                        permutationMemory = this.pm,
                        layer = this.overlay.childNodes[end+shift],
                        movinglayer = this.overlay.childNodes[this.ic]; // bleibt eigentlich immer gleich, sinnlos so, beim mouseDown ausgewählt ändert sich das Element nicht mehr

                    if (direction<0) { // to the left
                        var borderLeftWidth = numericProperty(elementStyleProperty(layer.childNodes[0],'border-left-width')),
                            borderLeftWidth = borderCollapse ? borderLeftWidth : 0,
                            left = numericProperty(layer.style.left),
                            width = numericProperty(movinglayer.style.width);
                        
                        movinglayer.style.left = left+'px';
						layer.style.left = left+width+borderSpacing - borderLeftWidth +'px';
                    } else { // to the right
                        var borderLeftWidth = numericProperty(elementStyleProperty(this.de,'border-left-width')),
                            borderLeftWidth = borderCollapse ? borderLeftWidth : 0,
                            left = numericProperty(movinglayer.style.left),
                            width = numericProperty(layer.style.width);
                        
                        layer.style.left = left+'px';
						movinglayer.style.left = left+width+borderSpacing - borderLeftWidth +'px';
                    } 
            
                    // shift
                    this.pm.move(start, end);
                    DEBUG && log(this.pm);
                    // set new column
                    this.lc = end;
				}
                
                saveState(table, this.pm);
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
            // permutation memory
            this.pm = restoreState(table);

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
    
    // storage functions
    // load state and returns the array
    function loadState () {
        var state = localStorage.getItem('table-drag');

        if (state != null) {
            try {
                state = JSON.parse(state);
            } catch (e) {
                DEBUG && log(e);
                console.log(e);
            }
        } else {
            state = new Array();
        }
		
        return state;
    }
    function saveState(table, permutationMemory) {
        var state = loadState (),
            id = table.getAttribute('id'),
            element = {tableId: id, permutationMemory: permutationMemory};
        
        //find element
        var findIndex = state.findIndex(function (element, index, array) {
            var tableId = element['tableId'];
            if (tableId != id) {
                return false; 
            } else {
                return true;
            }
        });
        
        // place element
        if (findIndex < 0) {
            state.push(element);
        } else {
            state.splice(findIndex, 1, element);
        }
        
        localStorage.setItem('table-drag', JSON.stringify(state));
    }
    
    function restoreState (table) {
        var state = loadState (),
            id = table.getAttribute('id');
        
        //find element
        var findIndex = state.findIndex(function (element, index, array) {
            var tableId = element['tableId'];
            if (tableId != id) {
                return false; 
            } else {
                return true;
            }
        });
        
        // initial permutation memory
        var nc = table.rows[0].cells.length,
            pm = new Array(nc);
        for (var i=0; i<nc; i++) {
            pm[i] = i;
        }
        
        // place element
        if (findIndex < 0) {
            return pm;
        } else {
            var element = state[findIndex],
                permutationMemory = element['permutationMemory'],
                length = permutationMemory.length;
            
            //check length
            if (nc == length) {
                for (var i=0; i<permutationMemory.length; i++) {
                    var start = permutationMemory[i],
                        end = i;
                    pm.move(start, end);
                    if (pm[i] != start) moveTableColumn(table, start, end);
                }
                
                return permutationMemory;
            } else {
                return pm;
            }
        }
    }
        
        
        
    // based on
    // https://github.com/tristen/tablesort/blob/gh-pages/src/tablesort.js
    // line 297 - 301
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TableDrag;
    } else {
        window.TableDrag = TableDrag;
    }
    
    if (!Array.prototype.findIndex) {
      Object.defineProperty(Array.prototype, 'findIndex', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(predicate) {
          if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
          }
          if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
          }
          var list = Object(this);
          var length = list.length >>> 0;
          var thisArg = arguments[1];
          var value;
    
          for (var i = 0; i < length; i++) {
            if (i in list) {
              value = list[i];
              if (predicate.call(thisArg, value, i, list)) {
                return i;
              }
            }
          }
          return -1;
        }
      });
    }
})();