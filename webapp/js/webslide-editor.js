( function() {
	SlidePageEditor = View.extend( {
	} );

	SlidePageNavigator = View.extend( {
		template: 'tmpl-navigator',
		init: function( options ) {
			options.scroll = options.scroll || {
				scrollerType:"clickButtons", 
				scrollerOrientation:"vertical", 
				scrollSpeed:2, 
				scrollEasing:"easeOutCirc", 
				scrollEasingAmount:800, 
				acceleration:4, 
				scrollSpeed:800, 
				noScrollCenterSpace:10, 
				autoScrolling:0, 
				autoScrollingSpeed:2000, 
				autoScrollingEasing:"easeInOutQuad", 
				autoScrollingDelay:500 
			};
			this.scroll = options.scroll;
			this.slide = options.slide;
			options.slide.on( 'load', this.renderThumbnail, this );
		},
		renderThumbnail: function() {
			console.log( 'r2' );
			var contents =this.slide.get( 'contents' );
			var $el = this.$el.find( '.jTscroller' );
			_.each( this.slide.get( 'pages' ), function( pid ) {
				$el.append( new SlidePageThumbnail( { model: contents[pid] } ).render().$el );
				console.log( 'a' );
			} );
			console.log( $el );
			this.$el.thumbnailScroller( this.scroll );
		}
	} );
	SlidePageThumbnail = View.extend( {
		tagName: 'a',
		template: 'tmpl-thumbnail',
		init: function( options ) {
			console.log( this.model.get( 'id' ) );
			this.$el.append( this.$contents = $( '<div></div>' ) );
			this.$contents.text( this.model.get( 'id' ) );
		}
	} );

	SlideEditor = View.extend( {
		initialize: function( options ) {
			this.navigator = new SlidePageNavigator( { el: options.$navigator, slide: this.model } ).render();
			this.editor = new SlidePageEditor( { el: this.$editor } );
			this.model.on( 'load', this.render, this );
			this.model.fetch();
		},
		render: function() {
			if ( !this.model.get( 'sid' ) ) {
				if ( this.mode == 'wait' ) {
					return this;
				}
				this.spinner = new SpinnerView( { model: new SpinnerOption() } );
				this.$el.append( this.spinner.render().$el );
				this.mode = 'wait';
				return this;
			}

			this.spinner.destroy();

			return this;
		}
	} );

} ) ();
