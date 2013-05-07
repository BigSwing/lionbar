( function( $ ){
	$.fn.lionbar = function( options ){
		var settings = $.extend( {
			always_show_scrollbars: false,
			scrollspeed: 30
		}, options );
		var methods = {
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
			}
		};
		return this.each( function(){
			var $this = $( this );

			// setup container
			$this.addClass( 'lionbar' ).css( {
				position: 'relative',
				overflow: 'hidden'
			} ).wrapInner( '<div class="lionbar-inner"></div>' )
			.append( '<div class="lionbar-scroller"></div>' );

			// setup content
			var $inner = $this.children( '.lionbar-inner' );
			$inner.css( {
				position: 'absolute',
				left: 0,
				top: 0,
				paddingRight: '3px'
			} );

			// setup scroll bar
			var scroller_height = $this.height() > $inner.height() ? 0 : ( $this.height() / $inner.height() ) * $this.height();
			var $scroller = $this.children( '.lionbar-scroller' );
			$scroller.css( {
				position: 'absolute',
				top: 0,
				right: 0,
				height: scroller_height,
				backgroundColor: '#000',
				opacity: 0.5,
				width: '3px'
			} ).attr( 'style', $scroller.attr( 'style' ) + ' border-radius: 3px;' );

			if( !settings.always_show_scrollbars ){
				$scroller.fadeOut();
			}

			// events
			$this.hover( function(){
				if( !settings.always_show_scrollbars ){
					$scroller.fadeTo( 'slow', 0.5 );
				}
				$this.bind( 'mousewheel DOMMouseScroll', methods.handle_mousewheel );
				$this.bind( 'touchstart', methods.handle_touch_start );
				$this.bind( 'touchmove', methods.handle_touch_move );
				$this.bind( 'touchend', methods.handle_touch_end );
			}, function(){
				if( !settings.always_show_scrollbars ){
					$scroller.fadeOut( 'slow' );
				}
				$this.unbind( 'mousewheel touchstart touchmove touchend' );
			} );

			$inner.bind( 'touchstart', methods.handle_touch_start );
			$inner.bind( 'touchmove', methods.handle_touch_move );
			$inner.bind( 'touchend', methods.handle_touch_end );
		});
	};
} )( jQuery );