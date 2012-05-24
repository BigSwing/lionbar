(function($){
	$.fn.lionbar = function(options){
		var settings = $.extend({}, options);
		var methods = {
			normalize_scroll: function(event){
				var normalized = {
					delta: 0,
					deltaX: 0,
					deltaY: 0
				}
				if(event.originalEvent != undefined){
					event = event.originalEvent;
				}

				// Old school scrollwheel delta
				if(event.wheelDelta){
					normalized.delta = event.wheelDelta/120;
				}
				if(event.detail){
					normalized.delta = -event.detail/3;
				}

				// New school multidimensional scroll (touchpads) deltas
				normalized.deltaY = normalized.delta;

				// Gecko
				if(event.axis !== undefined && event.axis === event.HORIZONTAL_AXIS){
					normalized.deltaY = 0;
					normalized.deltaX = -1*delta;
				}

				// Webkit
				if(event.wheelDeltaY !== undefined){
					normalized.deltaY = event.wheelDeltaY/120;
				}
				if(event.wheelDeltaX !== undefined){
					normalized.deltaX = -1*event.wheelDeltaX/120;
				}
				return normalized;
			},

			handle_mousewheel: function(event){
				event.preventDefault();
				event.stopImmediatePropagation();

				var deltas = methods.normalize_scroll(event);
				var move = deltas.deltaY * 30;
				console.log(move);
				var top = parseInt($(this).children('.lionbar-inner').css('top')) + move;

				if(top > 0){
					top = 0;
				}else if($(this).height() + Math.abs(top) > $(this).children('.lionbar-inner').height()){
					top = -($(this).children('.lionbar-inner').height() - $(this).height());
				}

				$(this).children('.lionbar-inner').css({top: top});

				// move scroller
				var perc = Math.abs(top) / ($(this).children('.lionbar-inner').height() - $(this).height());
				var stop = ($(this).height() - $(this).children('.lionbar-scroller').height()) * perc;
				$(this).children('.lionbar-scroller').css({top: stop});

			},

			handle_touch_start: function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var touchdata = {
					innerY: 0,
					innerX: 0,
					doing_drag: true
				};
				var poffset = $(this).parent('.lionbar').offset();
				var touch = event.originalEvent.touches[0];
				touchdata.innerY = Math.abs(parseInt($(this).css('top'))) + (touch.pageY - poffset.top);
				touchdata.innerX = Math.abs(parseInt($(this).css('left'))) + (touch.pageX - poffset.left);
				$(this).data('lionbar', touchdata);
			},

			handle_touch_move: function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var touchdata = $(this).data('lionbar');
				var touchdiff = {
					innerY: 0,
					innerX: 0,
				};
				if(touchdata.doing_drag){
					touchdata.doing_drag = true;
					var top = parseInt($(this).css('top'));
					var poffset = $(this).parent('.lionbar').offset();
					var touch = event.originalEvent.touches[0];
					touchdiff.innerY = Math.abs(parseInt($(this).css('top'))) + (touch.pageY - poffset.top);
					touchdiff.innerX = Math.abs(parseInt($(this).css('left'))) + (touch.pageX - poffset.left);
					top += (touchdiff.innerY - touchdata.innerY);
					if(top > 0){
						top = 0;
					}else if($(this).parent('.lionbar').height() + Math.abs(top) > $(this).height()){
						top = -($(this).height() - $(this).parent('.lionbar').height());
					}

					$(this).css({top: top});
					// move scroller
					var perc = Math.abs(top) / ($(this).height() - $(this).parent('.lionbar').height());
					var stop = ($(this).parent('.lionbar').height() - $(this).siblings('.lionbar-scroller').height()) * perc;
					console.log(stop);
					$(this).siblings('.lionbar-scroller').css({top: stop});
				}
				$(this).data('lionbar', touchdata);
			},

			handle_touch_end: function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				$(this).data('lionbar', {
					innerY: 0,
					innerX: 0,
					doing_drag: false
				});
			}
		};
		return this.each(function(){
			$this = $(this);

			// setup container
			$this.addClass('lionbar').css({position: 'relative', overflow: 'hidden'}).wrapInner('<div class="lionbar-inner"></div>').append('<div class="lionbar-scroller"></div>');

			// setup content
			$this.children('.lionbar-inner').css({position: 'absolute', left: 0, top: 0, paddingRight: '3px'});

			// setup scroll bar
			var scroller_height = $this.height() > $this.find('.lionbar-inner').height() ? 0 : ($this.height() / $this.find('.lionbar-inner').height()) * $this.height();
			$this.children('.lionbar-scroller').css({position: 'absolute', top: 0, right: 0, height: scroller_height, backgroundColor: '#000', opacity: 0.5, width: '3px'}).attr('style', $this.children('.lionbar-scroller').attr('style')+'border-radius: 3px;');

			// events
			$this.hover(function(){
				$(this).children('.lionbar-scroller').fadeTo('slow', 0.5);
				$(this).bind('mousewheel DOMMouseScroll', methods.handle_mousewheel);
				$(this).bind('touchstart', methods.handle_touch_start);
				$(this).bind('touchmove', methods.handle_touch_move);
				$(this).bind('touchend', methods.handle_touch_end);
			}, function(){
				$(this).children('.lionbar-scroller').fadeOut('slow');
				$(this).unbind('mousewheel touchstart touchmove touchend');
			});

			$(this).children('.lionbar-inner').bind('touchstart', methods.handle_touch_start);
			$(this).children('.lionbar-inner').bind('touchmove', methods.handle_touch_move);
			$(this).children('.lionbar-inner').bind('touchend', methods.handle_touch_end);
		});
	}
})(jQuery);