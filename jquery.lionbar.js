( function( $ ){
	$.fn.lionbar = function( options ){
		var settings = $.extend( {
			always_show_scrollbars: false,
			scrollspeed: 30,
			draggable_scroller: true
		}, options );
		var methods = {
			init: function( $this ){
				// setup container
				$this.addClass('lionbar').css({
					position: 'relative',
					overflow: 'hidden',
					height: $this.height()
				});

				if(!$this.children('.lionbar-inner').length){
					$this.wrapInner('<div class="lionbar-inner"></div>');
				}

				if(!$this.children('.lionbar-scroller').length){
					$this.append('<div class="lionbar-scroller"></div>');
				}

				// setup content
				var $inner = $this.children('.lionbar-inner');
				$inner.css({
					position: 'absolute',
					left: 0,
					top: 0,
					paddingRight: '26px'
				});

				// setup scroll bar
				var $scroller = $this.children('.lionbar-scroller');
				var attach_events = ($inner.height() > $this.height());
				var scroller_height = attach_events ? ($this.height() / $inner.height()) * $this.height() : 0;

				$scroller.css({
					position: 'absolute',
					top: 0,
					right: 0,
					height: scroller_height,
					backgroundColor: '#006987',
					opacity: 0.75,
					width: '16px'
				});

				if (!settings.always_show_scrollbars) {
					$scroller.fadeOut();
				}

				if(attach_events){
					$inner.bind('touchstart', methods.handle_touch_start);
					$inner.bind('touchmove', methods.handle_touch_move);
					$inner.bind('touchend', methods.handle_touch_end);
				}

				if(attach_events && settings.draggable_scroller)
					methods.draggable_scroller.init($this, $scroller, $inner);

				return attach_events;
			},

			normalize_scroll: function( event ){
				var normalized = {
					delta: 0,
					deltaX: 0,
					deltaY: 0
				};
				if( event.originalEvent !== undefined ){
					event = event.originalEvent;
				}

				// Old school scrollwheel delta
				if( event.wheelDelta ){
					normalized.delta = event.wheelDelta / 120;
				}
				if( event.detail ){
					normalized.delta = -event.detail / 3;
				}

				// New school multidimensional scroll (touchpads) deltas
				normalized.deltaY = normalized.delta;

				// Gecko
				if( event.axis !== undefined && event.axis === event.HORIZONTAL_AXIS ){
					normalized.deltaY = 0;
					normalized.deltaX = -1 * delta;
				}

				// Webkit
				if( event.wheelDeltaY !== undefined ){
					normalized.deltaY = event.wheelDeltaY / 120;
				}
				if( event.wheelDeltaX !== undefined ){
					normalized.deltaX = -1 * event.wheelDeltaX / 120;
				}
				return normalized;
			},

			handle_mousewheel: function( event ){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $( this );
				var $inner = $this.children( '.lionbar-inner' );
				var $scroller = $this.children( '.lionbar-scroller' );
				var deltas = methods.normalize_scroll( event );
				var move = deltas.deltaY * settings.scrollspeed;
				var top = parseInt( $inner.css('top'), 10 ) + move;

				if( top > 0 ){
					top = 0;
				}else if( $this.height() + Math.abs( top ) > $inner.height() ){
					top = -( $inner.height() - $this.height() );
				}

				$inner.css( {
					top: top
				} );

				// move scroller
				var perc = Math.abs( top ) / ( $inner.height() - $this.height() );
				var stop = ( $this.height() - $scroller.height() ) * perc;
				$scroller.css( {
					top: stop
				} );

			},

			handle_touch_start: function( event ){
				event.preventDefault();
				var $this = $( this );
				var touchdata = {
					innerY: 0,
					innerX: 0,
					doing_drag: true
				};
				if( !settings.always_show_scrollbars ){
					$this.siblings( '.lionbar-scroller' ).fadeTo( 'slow', 0.5 );
				}
				var poffset = $this.parent( '.lionbar' ).offset();
				var touch = event.originalEvent.touches[0];
				touchdata.innerY = Math.abs( parseInt( $this.css('top'), 10 ) ) + ( touch.pageY - poffset.top );
				touchdata.innerX = Math.abs( parseInt( $this.css('left'), 10 ) ) + ( touch.pageX - poffset.left );
				$this.data( 'lionbar', touchdata );
			},

			handle_touch_move: function( event ){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $( this );
				var touchdata = $this.data( 'lionbar' );
				var touchdiff = {
					innerY: 0,
					innerX: 0
				};
				if( touchdata.doing_drag ){
					touchdata.doing_drag = true;
					var $parent = $this.parent( '.lionbar' );
					var top = parseInt( $this.css('top'), 10 );
					var poffset = $parent.offset();
					var touch = event.originalEvent.touches[0];
					touchdiff.innerY = Math.abs( parseInt( $this.css('top'), 10 ) ) + ( touch.pageY - poffset.top );
					touchdiff.innerX = Math.abs( parseInt( $this.css('left'), 10 ) ) + ( touch.pageX - poffset.left );
					top += ( touchdiff.innerY - touchdata.innerY );
					if( top > 0 ){
						top = 0;
					}else if( $parent.height() + Math.abs( top ) > $this.height() ){
						top = -( $this.height() - $parent.height() );
					}

					$this.css( {
						top: top
					} );
					// move scroller
					var $scroller = $this.siblings( '.lionbar-scroller' );
					var perc = Math.abs( top ) / ( $this.height() - $parent.height() );
					var stop = ( $parent.height() - $scroller.height() ) * perc;
					$scroller.css( {
						top: stop
					} );
				}
				$this.data( 'lionbar', touchdata );
			},

			handle_touch_end: function( event ){
				event.preventDefault();
				var $this = $( this );
				if( !settings.always_show_scrollbars ){
					$this.siblings( '.lionbar-scroller' ).fadeOut( 'slow' );
				}
				$this.data( 'lionbar', {
					innerY: 0,
					innerX: 0,
					doing_drag: false
				} );
			},

			draggable_scroller: {
				init: function($container_instance, $scroller_instance, $inner_instance){
					var draggable = this;
					var $container = $container_instance;
					var $scroller = $scroller_instance;
					var $inner = $inner_instance;
					$scroller.mousedown(function(event){
						event.preventDefault();
						event.stopImmediatePropagation();
						$scroller.data('start_y', (event.clientY - $scroller.offset().top));
						$scroller.data('mousedown', true);
						$(document).on('mousemove.lionbar_draggable_scroller', {scroller: $scroller}, draggable.mousemove);
						$(document).on('mouseup.lionbar_draggable_scroller', function(event){
							$(document).off('.lionbar_draggable_scroller');
							$scroller.data('start_y', undefined);
							$scroller.data('mousedown', false);
						});
					});

				},

				mousemove: function(event){
					var $scroller = event.data.scroller;
					if(!$scroller.data('mousedown'))
						return;
					event.stopImmediatePropagation();
					event.preventDefault();
					var $container = $scroller.closest('.lionbar');
					var $inner = $scroller.siblings('.lionbar-inner');
					var scroller_height = $scroller.height();
					var container_height = $container.height();
					var normalized_height = container_height - scroller_height;
					var content_height = $inner.height() - container_height;
					var start_y = $scroller.data('start_y');

					var mouse_container_offset = event.clientY - $container.offset().top;
					var mouse_scroller_offset = event.clientY - $scroller.offset().top;
					if(mouse_container_offset <= 0){
						$scroller.css({top: 0});
						$inner.css({top: 0});
						return;
					}else if(mouse_container_offset > $container.height() ){
						$scroller.css({top: normalized_height});
						$inner.css({top: (content_height - container_height)});
					}

					// move scroller
					var new_scroller_pos = mouse_container_offset - start_y;
					if(new_scroller_pos <= 0){
						new_scroller_pos = 0;
					}else if(normalized_height < new_scroller_pos){
						new_scroller_pos = normalized_height;
					}
					$scroller.css({top: new_scroller_pos});

					// move content
					var percent = new_scroller_pos / normalized_height;
					$inner.css({top: -(content_height * percent)});


				}
			}
		};
		return this.each(function() {
			var $this = $(this);
			var mouseover = false;
			var attach_events = methods.init($this);

			var $inner = $this.children( '.lionbar-inner' );
			var $scroller = $this.children( '.lionbar-scroller' );

			// watch for resize
			$inner.data( 'lionbar-resize', {
				w: $inner.width(),
				h: $inner.height()
			} );

			// events
			$this.hover(function() {
				mouseover = true;
				if ( !settings.always_show_scrollbars ) {
					$scroller.fadeTo( 'slow', 0.75 );
				}
				if(attach_events){
					$this.bind( 'mousewheel DOMMouseScroll', methods.handle_mousewheel );
					$this.bind( 'touchstart', methods.handle_touch_start );
					$this.bind( 'touchmove', methods.handle_touch_move );
					$this.bind( 'touchend', methods.handle_touch_end );
				}
			}, function() {
				mouseover = false;
				if ( !settings.always_show_scrollbars ) {
					$scroller.fadeOut( 'slow' );
				}
				$this.unbind( 'mousewheel touchstart touchmove touchend' );
			});

			setInterval( function(){
				var orig_size = $inner.data( 'lionbar-resize' );

				if( orig_size.h != $inner.height() ){
					attach_events = methods.init( $this );
					$inner.data( 'lionbar-resize', {
						w: $inner.width(),
						h: $inner.height()
					} );
					if( attach_events && mouseover ){
						if ( !settings.always_show_scrollbars ) {
							$scroller.fadeTo( 'slow', 0.75 );
						}
						$this.bind( 'mousewheel DOMMouseScroll', methods.handle_mousewheel );
						$this.bind( 'touchstart', methods.handle_touch_start );
						$this.bind( 'touchmove', methods.handle_touch_move );
						$this.bind( 'touchend', methods.handle_touch_end );
					}
				}
			}, 1000 );

		});
	};
} )( jQuery );